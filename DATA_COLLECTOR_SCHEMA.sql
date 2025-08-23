-- =====================================================
-- DATA COLLECTOR SCHEMA UPDATES
-- Farmers Loan Facilitator System
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. DATA COLLECTORS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS data_collectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    region VARCHAR(100) NOT NULL,
    zone VARCHAR(100),
    woreda VARCHAR(100),
    kebele VARCHAR(100),
    assigned_farmers_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. ENHANCE FARMERS TABLE
-- =====================================================

-- Add data_collector_id to farmers table
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS data_collector_id UUID REFERENCES data_collectors(id) ON DELETE SET NULL;

-- Add verification fields to farmers table
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected'));
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS verification_notes TEXT;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);

-- Add additional farmer fields for comprehensive data collection
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS id_number VARCHAR(50) UNIQUE;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS gender VARCHAR(10) CHECK (gender IN ('male', 'female'));
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS zone VARCHAR(100);
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS woreda VARCHAR(100);
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS kebele VARCHAR(100);
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS village VARCHAR(100);
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS marital_status VARCHAR(20) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed'));
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS family_size INTEGER;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS education_level VARCHAR(20) CHECK (education_level IN ('none', 'primary', 'secondary', 'tertiary'));
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS primary_occupation VARCHAR(20) CHECK (primary_occupation IN ('farming', 'mixed', 'other'));
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS farm_size_hectares DECIMAL(10,2);
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS primary_crop VARCHAR(100);
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS secondary_crops TEXT[]; -- Array of crop names
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS livestock_count INTEGER DEFAULT 0;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS has_bank_account BOOLEAN DEFAULT false;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS account_number VARCHAR(50);
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255);
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20);
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(50);

-- =====================================================
-- 3. INDEXES FOR PERFORMANCE
-- =====================================================

-- Data collectors indexes
CREATE INDEX IF NOT EXISTS idx_data_collectors_user_id ON data_collectors(user_id);
CREATE INDEX IF NOT EXISTS idx_data_collectors_region ON data_collectors(region);
CREATE INDEX IF NOT EXISTS idx_data_collectors_phone ON data_collectors(phone_number);
CREATE INDEX IF NOT EXISTS idx_data_collectors_active ON data_collectors(is_active);

-- Farmers indexes for data collector queries
CREATE INDEX IF NOT EXISTS idx_farmers_data_collector_id ON farmers(data_collector_id);
CREATE INDEX IF NOT EXISTS idx_farmers_verification_status ON farmers(verification_status);
CREATE INDEX IF NOT EXISTS idx_farmers_region ON farmers(region);
CREATE INDEX IF NOT EXISTS idx_farmers_created_at ON farmers(created_at);
CREATE INDEX IF NOT EXISTS idx_farmers_id_number ON farmers(id_number);
CREATE INDEX IF NOT EXISTS idx_farmers_phone ON farmers(phone_number);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_farmers_collector_status ON farmers(data_collector_id, verification_status);
CREATE INDEX IF NOT EXISTS idx_farmers_collector_region ON farmers(data_collector_id, region);

-- =====================================================
-- 4. TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for data_collectors table
CREATE TRIGGER update_data_collectors_updated_at 
    BEFORE UPDATE ON data_collectors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for farmers table (if not already exists)
DROP TRIGGER IF EXISTS update_farmers_updated_at ON farmers;
CREATE TRIGGER update_farmers_updated_at 
    BEFORE UPDATE ON farmers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. FUNCTION TO UPDATE ASSIGNED FARMERS COUNT
-- =====================================================

CREATE OR REPLACE FUNCTION update_assigned_farmers_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE data_collectors 
        SET assigned_farmers_count = assigned_farmers_count + 1
        WHERE id = NEW.data_collector_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE data_collectors 
        SET assigned_farmers_count = assigned_farmers_count - 1
        WHERE id = OLD.data_collector_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- If data_collector_id changed
        IF OLD.data_collector_id IS DISTINCT FROM NEW.data_collector_id THEN
            -- Decrease count for old collector
            IF OLD.data_collector_id IS NOT NULL THEN
                UPDATE data_collectors 
                SET assigned_farmers_count = assigned_farmers_count - 1
                WHERE id = OLD.data_collector_id;
            END IF;
            -- Increase count for new collector
            IF NEW.data_collector_id IS NOT NULL THEN
                UPDATE data_collectors 
                SET assigned_farmers_count = assigned_farmers_count + 1
                WHERE id = NEW.data_collector_id;
            END IF;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger for farmers table to update assigned count
DROP TRIGGER IF EXISTS update_farmers_assigned_count ON farmers;
CREATE TRIGGER update_farmers_assigned_count
    AFTER INSERT OR DELETE OR UPDATE OF data_collector_id ON farmers
    FOR EACH ROW EXECUTE FUNCTION update_assigned_farmers_count();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on data_collectors table
ALTER TABLE data_collectors ENABLE ROW LEVEL SECURITY;

-- Data collectors can view their own profile
CREATE POLICY "Data collectors can view own profile" ON data_collectors
    FOR SELECT USING (auth.uid() = user_id);

-- Data collectors can update their own profile
CREATE POLICY "Data collectors can update own profile" ON data_collectors
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all data collectors
CREATE POLICY "Admins can view all data collectors" ON data_collectors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.role = 'admin'
        )
    );

-- Enable RLS on farmers table (if not already enabled)
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;

-- Data collectors can view farmers assigned to them
CREATE POLICY "Data collectors can view assigned farmers" ON farmers
    FOR SELECT USING (
        data_collector_id IN (
            SELECT id FROM data_collectors WHERE user_id = auth.uid()
        )
    );

-- Data collectors can insert farmers assigned to them
CREATE POLICY "Data collectors can insert farmers" ON farmers
    FOR INSERT WITH CHECK (
        data_collector_id IN (
            SELECT id FROM data_collectors WHERE user_id = auth.uid()
        )
    );

-- Data collectors can update farmers assigned to them
CREATE POLICY "Data collectors can update assigned farmers" ON farmers
    FOR UPDATE USING (
        data_collector_id IN (
            SELECT id FROM data_collectors WHERE user_id = auth.uid()
        )
    );

-- Admins can view all farmers
CREATE POLICY "Admins can view all farmers" ON farmers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.role = 'admin'
        )
    );

-- =====================================================
-- 7. SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample data collectors (replace with actual user IDs)
INSERT INTO data_collectors (user_id, full_name, phone_number, region, zone, woreda, kebele) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Abebe Kebede', '+251911234567', 'Oromia', 'East Shewa', 'Adama', 'Adama Town'),
    ('00000000-0000-0000-0000-000000000002', 'Tigist Haile', '+251922345678', 'Amhara', 'South Gondar', 'Debre Tabor', 'Debre Tabor Town'),
    ('00000000-0000-0000-0000-000000000003', 'Dawit Mengistu', '+251933456789', 'SNNPR', 'Sidama', 'Hawassa', 'Hawassa City')
ON CONFLICT (phone_number) DO NOTHING;

-- Insert sample farmers with data collector assignments
INSERT INTO farmers (
    data_collector_id, full_name, phone_number, id_number, date_of_birth, gender,
    region, zone, woreda, kebele, village, marital_status, family_size,
    education_level, primary_occupation, monthly_income, farm_size_hectares,
    primary_crop, secondary_crops, livestock_count, has_bank_account,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
    verification_status
) VALUES
    (
        (SELECT id FROM data_collectors WHERE phone_number = '+251911234567'),
        'Kebede Alemu', '+251944567890', 'ET1234567890', '1985-03-15', 'male',
        'Oromia', 'East Shewa', 'Adama', 'Adama Town', 'Kebele 01', 'married', 5,
        'primary', 'farming', 8000, 2.5, 'Maize', ARRAY['Beans', 'Potatoes'], 3, true,
        'Alemayehu Kebede', '+251955678901', 'Brother', 'verified'
    ),
    (
        (SELECT id FROM data_collectors WHERE phone_number = '+251911234567'),
        'Fatima Ahmed', '+251955678902', 'ET1234567891', '1990-07-22', 'female',
        'Oromia', 'East Shewa', 'Adama', 'Adama Town', 'Kebele 02', 'married', 4,
        'secondary', 'farming', 12000, 3.0, 'Wheat', ARRAY['Barley', 'Teff'], 5, false,
        'Ahmed Mohammed', '+251966789012', 'Husband', 'pending'
    ),
    (
        (SELECT id FROM data_collectors WHERE phone_number = '+251922345678'),
        'Yohannes Tadesse', '+251966789013', 'ET1234567892', '1978-11-08', 'male',
        'Amhara', 'South Gondar', 'Debre Tabor', 'Debre Tabor Town', 'Kebele 03', 'married', 6,
        'none', 'farming', 6000, 1.8, 'Teff', ARRAY['Sorghum', 'Chickpeas'], 2, false,
        'Tadesse Yohannes', '+251977890123', 'Son', 'verified'
    ),
    (
        (SELECT id FROM data_collectors WHERE phone_number = '+251933456789'),
        'Martha Bekele', '+251977890124', 'ET1234567893', '1988-05-14', 'female',
        'SNNPR', 'Sidama', 'Hawassa', 'Hawassa City', 'Kebele 04', 'single', 2,
        'tertiary', 'mixed', 15000, 4.2, 'Coffee', ARRAY['Avocado', 'Banana'], 8, true,
        'Bekele Martha', '+251988901234', 'Father', 'rejected'
    )
ON CONFLICT (phone_number) DO NOTHING;

-- =====================================================
-- 8. VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for data collector dashboard
CREATE OR REPLACE VIEW data_collector_dashboard AS
SELECT 
    dc.id as data_collector_id,
    dc.full_name as collector_name,
    dc.region,
    COUNT(f.id) as total_farmers,
    COUNT(CASE WHEN f.verification_status = 'pending' THEN 1 END) as pending_verifications,
    COUNT(CASE WHEN f.verification_status = 'verified' THEN 1 END) as verified_farmers,
    COUNT(CASE WHEN f.verification_status = 'rejected' THEN 1 END) as rejected_farmers,
    ROUND(
        CASE 
            WHEN COUNT(f.id) > 0 THEN 
                (COUNT(CASE WHEN f.verification_status = 'verified' THEN 1 END)::DECIMAL / COUNT(f.id)) * 100
            ELSE 0 
        END, 2
    ) as verification_rate
FROM data_collectors dc
LEFT JOIN farmers f ON dc.id = f.data_collector_id
WHERE dc.is_active = true
GROUP BY dc.id, dc.full_name, dc.region;

-- View for recent farmer registrations
CREATE OR REPLACE VIEW recent_farmer_registrations AS
SELECT 
    f.id,
    f.full_name,
    f.phone_number,
    f.region,
    f.verification_status,
    f.created_at,
    dc.full_name as collector_name
FROM farmers f
JOIN data_collectors dc ON f.data_collector_id = dc.id
ORDER BY f.created_at DESC;

-- =====================================================
-- 9. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE data_collectors IS 'Data collectors who register and manage farmers in the field';
COMMENT ON COLUMN data_collectors.user_id IS 'Reference to auth.users table for authentication';
COMMENT ON COLUMN data_collectors.assigned_farmers_count IS 'Automatically updated count of assigned farmers';

COMMENT ON COLUMN farmers.data_collector_id IS 'Reference to the data collector who registered this farmer';
COMMENT ON COLUMN farmers.verification_status IS 'Status of farmer data verification: pending, verified, rejected';
COMMENT ON COLUMN farmers.verification_notes IS 'Notes from the verification process';
COMMENT ON COLUMN farmers.secondary_crops IS 'Array of secondary crops grown by the farmer';

-- =====================================================
-- SCHEMA UPDATE COMPLETE
-- =====================================================

-- Verify the schema
SELECT 'Data Collector Schema Update Complete!' as status;
