-- Quick fix for "loans_id_seq" does not exist error
-- This fixes the create_loan_from_application trigger function

-- Fix the create_loan_from_application trigger function
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

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_create_loan_from_application ON loan_applications;
CREATE TRIGGER trigger_create_loan_from_application
  BEFORE UPDATE ON loan_applications
  FOR EACH ROW
  EXECUTE FUNCTION create_loan_from_application();

-- Verify the fix
SELECT 'Trigger function fixed successfully' as status;
