# Supabase Setup Guide

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Supabase Service Role Key (for admin operations)
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Getting Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to Settings > API in your Supabase dashboard
3. Copy the Project URL and anon public key
4. Add them to your `.env` file

## Database Schema

The following tables need to be created in your Supabase database:

### Users Table (extends Supabase auth.users)
```sql
-- Create a custom users table that extends auth.users
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'data-collector', 'loan-officer', 'admin')),
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Farmers Table
```sql
CREATE TABLE public.farmers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  farmer_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  village TEXT,
  district TEXT,
  region TEXT,
  farm_size_hectares DECIMAL(10,2),
  primary_crop TEXT,
  secondary_crops TEXT[],
  annual_income DECIMAL(12,2),
  credit_score INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  assigned_collector_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Farmers can view their own data" ON public.farmers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Data collectors can view assigned farmers" ON public.farmers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'data-collector'
    ) AND assigned_collector_id = auth.uid()
  );

CREATE POLICY "Loan officers can view all farmers" ON public.farmers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'loan-officer'
    )
  );

CREATE POLICY "Admins can view all farmers" ON public.farmers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Loans Table
```sql
CREATE TABLE public.loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
  loan_amount DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  term_months INTEGER NOT NULL,
  purpose TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'completed', 'defaulted')),
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  disbursed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Farmers can view their own loans" ON public.loans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.farmers 
      WHERE id = farmer_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Loan officers can view all loans" ON public.loans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'loan-officer'
    )
  );

CREATE POLICY "Admins can view all loans" ON public.loans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Payments Table
```sql
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT,
  reference_number TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view payments for their loans" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.loans l
      JOIN public.farmers f ON l.farmer_id = f.id
      WHERE l.id = loan_id AND f.user_id = auth.uid()
    )
  );

CREATE POLICY "Loan officers can view all payments" ON public.payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'loan-officer'
    )
  );
```

## Functions and Triggers

### Update Updated At Trigger
```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farmers_updated_at BEFORE UPDATE ON public.farmers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON public.loans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Next Steps

1. ✅ Create your Supabase project
2. ✅ Add the environment variables to your `.env` file
3. ✅ Run the SQL commands in your Supabase SQL editor
4. ✅ Test the connection by running the development server

## ✅ Integration Complete!

The Supabase integration is now working successfully. You can:
- Log in with your credentials
- Test different user roles
- Access the database with proper authentication
- Use real-time features and Row Level Security
