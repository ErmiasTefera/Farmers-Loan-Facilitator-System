-- Fix for "loans_id_seq" does not exist error
-- This script fixes the database schema inconsistencies

-- 1. First, let's check if the loans table exists and fix any sequence issues
DO $$
BEGIN
    -- Check if loans table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'loans') THEN
        -- Create loans table with proper sequence
        CREATE TABLE IF NOT EXISTS loans (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            loan_amount DECIMAL(12,2) NOT NULL CHECK (loan_amount > 0),
            interest_rate DECIMAL(5,2) NOT NULL DEFAULT 12.00,
            term_months INTEGER NOT NULL DEFAULT 12,
            purpose TEXT,
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'completed', 'defaulted')),
            approved_by UUID REFERENCES users(id),
            approved_at TIMESTAMP WITH TIME ZONE,
            disbursed_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- 2. Add missing columns to loan_applications table if they don't exist
DO $$
BEGIN
    -- Add application_id column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'loan_applications' AND column_name = 'application_id') THEN
        ALTER TABLE loan_applications ADD COLUMN application_id TEXT UNIQUE;
    END IF;
    
    -- Add loan_id column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'loan_applications' AND column_name = 'loan_id') THEN
        ALTER TABLE loan_applications ADD COLUMN loan_id UUID REFERENCES loans(id);
    END IF;
END $$;

-- 3. Update loan_applications table to ensure proper structure
ALTER TABLE loan_applications 
    ALTER COLUMN id SET DEFAULT gen_random_uuid(),
    ALTER COLUMN id SET DATA TYPE UUID USING id::UUID;

-- 4. Update payments table to reference loan_applications instead of loans
DO $$
BEGIN
    -- Add loan_application_id column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'loan_application_id') THEN
        ALTER TABLE payments ADD COLUMN loan_application_id UUID REFERENCES loan_applications(id);
    END IF;
END $$;

-- 5. Create sequence for application_id if needed
CREATE SEQUENCE IF NOT EXISTS application_id_seq START 1;

-- 6. Update existing loan_applications to have application_id if they don't have one
UPDATE loan_applications 
SET application_id = 'APP' || LPAD(nextval('application_id_seq')::text, 6, '0')
WHERE application_id IS NULL;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_loan_applications_application_id ON loan_applications(application_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_loan_id ON loan_applications(loan_id);
CREATE INDEX IF NOT EXISTS idx_payments_loan_application_id ON payments(loan_application_id);

-- 8. Update RLS policies for loan_applications
DROP POLICY IF EXISTS "Users can view their own loan applications" ON loan_applications;
DROP POLICY IF EXISTS "Users can insert their own loan applications" ON loan_applications;
DROP POLICY IF EXISTS "Loan officers can view all loan applications" ON loan_applications;
DROP POLICY IF EXISTS "Loan officers can update loan applications" ON loan_applications;

CREATE POLICY "Users can view their own loan applications" ON loan_applications
  FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "Users can insert their own loan applications" ON loan_applications
  FOR INSERT WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Loan officers can view all loan applications" ON loan_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('loan-officer', 'admin')
    )
  );

CREATE POLICY "Loan officers can update loan applications" ON loan_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('loan-officer', 'admin')
    )
  );

-- 9. Create trigger to auto-generate application_id for new applications
CREATE OR REPLACE FUNCTION generate_application_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.application_id IS NULL THEN
        NEW.application_id := 'APP' || LPAD(nextval('application_id_seq')::text, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_application_id ON loan_applications;
CREATE TRIGGER trigger_generate_application_id
    BEFORE INSERT ON loan_applications
    FOR EACH ROW
    EXECUTE FUNCTION generate_application_id();

-- 10. Update the updated_at trigger for loan_applications
DROP TRIGGER IF EXISTS update_loan_applications_updated_at ON loan_applications;
CREATE TRIGGER update_loan_applications_updated_at 
  BEFORE UPDATE ON loan_applications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Fix the create_loan_from_application trigger function
CREATE OR REPLACE FUNCTION create_loan_from_application()
RETURNS TRIGGER AS $$
DECLARE
  new_loan_id UUID;
BEGIN
  -- Only create loan when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Insert the loan and get the generated ID
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
    ) RETURNING id INTO new_loan_id;
    
    -- Update the loan_application with the created loan_id
    NEW.loan_id = new_loan_id;
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

-- 12. Verify the fix
SELECT 
    'loan_applications' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'loan_applications' 
ORDER BY ordinal_position;

-- 13. Check if any sequences exist
SELECT sequence_name 
FROM information_schema.sequences 
WHERE sequence_name LIKE '%loan%' OR sequence_name LIKE '%application%';
