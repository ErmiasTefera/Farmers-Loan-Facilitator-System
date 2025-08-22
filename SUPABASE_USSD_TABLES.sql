-- Farmers Table
CREATE TABLE IF NOT EXISTS farmers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farmer_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  village TEXT,
  district TEXT,
  region TEXT,
  farm_size_hectares DECIMAL(8,2),
  primary_crop TEXT,
  secondary_crops TEXT[],
  annual_income DECIMAL(12,2),
  credit_score INTEGER DEFAULT 300,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  assigned_collector_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loans Table
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

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_method TEXT,
  reference_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USSD Requests Table
CREATE TABLE IF NOT EXISTS ussd_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  menu_level TEXT NOT NULL,
  user_input TEXT,
  response_text TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('menu_navigation', 'input_submission', 'result_display')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loan Applications Table
CREATE TABLE IF NOT EXISTS loan_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  purpose TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  application_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_farmers_user_id ON farmers(user_id);
CREATE INDEX IF NOT EXISTS idx_farmers_farmer_id ON farmers(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farmers_assigned_collector ON farmers(assigned_collector_id);
CREATE INDEX IF NOT EXISTS idx_farmers_verification_status ON farmers(verification_status);

CREATE INDEX IF NOT EXISTS idx_loans_farmer_id ON loans(farmer_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_approved_by ON loans(approved_by);
CREATE INDEX IF NOT EXISTS idx_loans_created_at ON loans(created_at);

CREATE INDEX IF NOT EXISTS idx_payments_loan_id ON payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_payments_farmer_id ON payments(farmer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

CREATE INDEX IF NOT EXISTS idx_ussd_requests_farmer_id ON ussd_requests(farmer_id);
CREATE INDEX IF NOT EXISTS idx_ussd_requests_session_id ON ussd_requests(session_id);
CREATE INDEX IF NOT EXISTS idx_ussd_requests_created_at ON ussd_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_loan_applications_farmer_id ON loan_applications(farmer_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(status);
CREATE INDEX IF NOT EXISTS idx_loan_applications_created_at ON loan_applications(created_at);

-- Row Level Security (RLS) Policies

-- Farmers RLS
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own farmer profile" ON farmers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own farmer profile" ON farmers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Data collectors can view assigned farmers" ON farmers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'data-collector'
      AND farmers.assigned_collector_id = auth.uid()
    )
  );

CREATE POLICY "Data collectors can update assigned farmers" ON farmers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'data-collector'
      AND farmers.assigned_collector_id = auth.uid()
    )
  );

-- Loans RLS
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own loans" ON loans
  FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "Loan officers can view all loans" ON loans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('loan-officer', 'admin')
    )
  );

CREATE POLICY "Loan officers can update loans" ON loans
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('loan-officer', 'admin')
    )
  );

-- Payments RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "Users can insert their own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Loan officers can view all payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('loan-officer', 'admin')
    )
  );

-- USSD Requests RLS
ALTER TABLE ussd_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own USSD requests" ON ussd_requests
  FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "Users can insert their own USSD requests" ON ussd_requests
  FOR INSERT WITH CHECK (auth.uid() = farmer_id);

-- Loan Applications RLS
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

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

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_farmers_updated_at 
  BEFORE UPDATE ON farmers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at 
  BEFORE UPDATE ON loans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
  BEFORE UPDATE ON payments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ussd_requests_updated_at 
  BEFORE UPDATE ON ussd_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loan_applications_updated_at 
  BEFORE UPDATE ON loan_applications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
-- Note: Replace 'your-farmer-user-id' with actual user IDs from your users table

-- Sample farmer profile
INSERT INTO farmers (user_id, farmer_id, full_name, phone, village, district, region, farm_size_hectares, primary_crop, annual_income, credit_score, verification_status) VALUES
  ('your-farmer-user-id', 'FARM001', 'Abebe Kebede', '+251911123456', 'Adama', 'Adama', 'Oromia', 2.5, 'Maize', 50000.00, 750, 'verified');

-- Sample loan
INSERT INTO loans (farmer_id, loan_amount, interest_rate, term_months, purpose, status, approved_by, approved_at) VALUES
  ('your-farmer-user-id', 25000.00, 12.00, 12, 'Seeds and Fertilizer', 'active', 'your-loan-officer-id', NOW());

-- Sample payments
INSERT INTO payments (loan_id, farmer_id, amount, payment_date, payment_method, reference_number, status) VALUES
  ('loan-id-from-above', 'your-farmer-user-id', 5000.00, NOW() - INTERVAL '1 month', 'ussd', 'TXN123456', 'completed'),
  ('loan-id-from-above', 'your-farmer-user-id', 5000.00, NOW(), 'ussd', 'TXN789012', 'completed');

-- Sample USSD requests
INSERT INTO ussd_requests (farmer_id, session_id, menu_level, user_input, response_text, action_type) VALUES
  ('your-farmer-user-id', 'test-session-1', 'main', '1', 'Check Loan Eligibility', 'menu_navigation'),
  ('your-farmer-user-id', 'test-session-1', 'eligibility-result', NULL, 'Congratulations! You are eligible for a loan.', 'result_display');

-- Sample loan applications
INSERT INTO loan_applications (farmer_id, amount, purpose, status, notes) VALUES
  ('your-farmer-user-id', 25000.00, 'seeds', 'pending', 'USSD application'),
  ('your-farmer-user-id', 15000.00, 'fertilizer', 'approved', 'Approved by loan officer');

-- Instructions for sample data:
-- 1. Replace 'your-farmer-user-id' with an actual user ID from your users table
-- 2. Replace 'your-loan-officer-id' with an actual loan officer user ID
-- 3. Replace 'loan-id-from-above' with the actual loan ID generated from the loans insert
-- 4. Run the inserts in order: farmers -> loans -> payments -> ussd_requests -> loan_applications
