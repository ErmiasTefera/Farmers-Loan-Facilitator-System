-- Fix Loan Relationships
-- This script establishes proper relationships between loan_applications, loans, and payments

-- 1. Add loan_id column to loan_applications to link to loans table
ALTER TABLE loan_applications 
ADD COLUMN IF NOT EXISTS loan_id UUID REFERENCES loans(id);

-- 2. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_loan_applications_loan_id ON loan_applications(loan_id);

-- 3. Update existing loan_applications to link with loans
-- This assumes that approved loan_applications should be linked to corresponding loans
UPDATE loan_applications 
SET loan_id = (
  SELECT l.id 
  FROM loans l 
  WHERE l.farmer_id = loan_applications.farmer_id 
    AND l.loan_amount = loan_applications.amount
    AND l.status = 'active'
  LIMIT 1
)
WHERE loan_applications.status = 'approved' 
  AND loan_applications.loan_id IS NULL;

-- 4. Add loan_application_id to payments table for direct linking
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS loan_application_id UUID REFERENCES loan_applications(id);

-- 5. Create index for payments loan_application_id
CREATE INDEX IF NOT EXISTS idx_payments_loan_application_id ON payments(loan_application_id);

-- 6. Update existing payments to link with loan_applications
-- This links payments to loan_applications based on farmer_id and loan_id relationship
UPDATE payments 
SET loan_application_id = (
  SELECT la.id 
  FROM loan_applications la
  JOIN loans l ON la.loan_id = l.id
  WHERE l.id = payments.loan_id 
    AND la.farmer_id = payments.farmer_id
  LIMIT 1
)
WHERE payments.loan_application_id IS NULL;

-- 7. Add RLS policies for the new relationships
-- Allow users to view payments for their loan applications
CREATE POLICY IF NOT EXISTS "Users can view payments for their loan applications" ON payments
FOR SELECT USING (
  loan_application_id IN (
    SELECT id FROM loan_applications WHERE farmer_id = auth.uid()
  )
);

-- Allow users to insert payments for their loan applications
CREATE POLICY IF NOT EXISTS "Users can insert payments for their loan applications" ON payments
FOR INSERT WITH CHECK (
  loan_application_id IN (
    SELECT id FROM loan_applications WHERE farmer_id = auth.uid()
  )
);

-- 8. Update loan_applications RLS to include loan_id relationship
DROP POLICY IF EXISTS "Users can view their own loan applications" ON loan_applications;
CREATE POLICY "Users can view their own loan applications" ON loan_applications
FOR SELECT USING (farmer_id = auth.uid());

-- 9. Add a trigger to automatically create a loan when loan_application is approved
CREATE OR REPLACE FUNCTION create_loan_from_application()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create loan when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    INSERT INTO loans (
      farmer_id,
      loan_amount,
      interest_rate,
      term_months,
      purpose,
      status,
      approved_by,
      approved_at
    ) VALUES (
      NEW.farmer_id,
      NEW.amount,
      12.0, -- Default interest rate 12%
      12,   -- Default term 12 months
      NEW.purpose,
      'active',
      auth.uid(),
      NOW()
    );
    
    -- Update the loan_application with the created loan_id
    NEW.loan_id = currval('loans_id_seq');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_create_loan_from_application ON loan_applications;
CREATE TRIGGER trigger_create_loan_from_application
  BEFORE UPDATE ON loan_applications
  FOR EACH ROW
  EXECUTE FUNCTION create_loan_from_application();

-- 10. Add a trigger to automatically link payments to loan_applications
CREATE OR REPLACE FUNCTION link_payment_to_application()
RETURNS TRIGGER AS $$
BEGIN
  -- Link payment to loan_application if not already linked
  IF NEW.loan_application_id IS NULL AND NEW.loan_id IS NOT NULL THEN
    SELECT la.id INTO NEW.loan_application_id
    FROM loan_applications la
    WHERE la.loan_id = NEW.loan_id
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_link_payment_to_application ON payments;
CREATE TRIGGER trigger_link_payment_to_application
  BEFORE INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION link_payment_to_application();

-- 11. Verify the relationships
SELECT 
  'loan_applications' as table_name,
  COUNT(*) as total_records,
  COUNT(loan_id) as linked_to_loans
FROM loan_applications
UNION ALL
SELECT 
  'payments' as table_name,
  COUNT(*) as total_records,
  COUNT(loan_application_id) as linked_to_applications
FROM payments;
