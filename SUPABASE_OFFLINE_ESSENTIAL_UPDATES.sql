-- =====================================================
-- ESSENTIAL SUPABASE OFFLINE SCHEMA UPDATES
-- Farmers Loan Facilitator System - Minimal Version
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. UPDATE EXISTING TABLES FOR OFFLINE SUPPORT
-- =====================================================

-- Add sync-related columns to farmers table
ALTER TABLE farmers 
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'failed')),
ADD COLUMN IF NOT EXISTS local_id TEXT,
ADD COLUMN IF NOT EXISTS last_sync_attempt TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sync_error TEXT;

-- Add sync-related columns to loan_applications table
ALTER TABLE loan_applications 
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'failed')),
ADD COLUMN IF NOT EXISTS local_id TEXT,
ADD COLUMN IF NOT EXISTS last_sync_attempt TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sync_error TEXT;

-- Add sync-related columns to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'failed')),
ADD COLUMN IF NOT EXISTS local_id TEXT,
ADD COLUMN IF NOT EXISTS last_sync_attempt TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sync_error TEXT;

-- =====================================================
-- 2. CREATE ESSENTIAL OFFLINE TABLES
-- =====================================================

-- Sync queue table to track pending operations
CREATE TABLE IF NOT EXISTS sync_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    local_id TEXT,
    data JSONB NOT NULL,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Offline status tracking table
CREATE TABLE IF NOT EXISTS offline_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_online BOOLEAN DEFAULT true,
    last_online_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pending_sync_count INTEGER DEFAULT 0,
    last_sync_attempt TIMESTAMP WITH TIME ZONE,
    sync_errors JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CREATE ESSENTIAL INDEXES
-- =====================================================

-- Indexes for sync queue
CREATE INDEX IF NOT EXISTS idx_sync_queue_user_id ON sync_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_created_at ON sync_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_sync_queue_processed_at ON sync_queue(processed_at);

-- Indexes for offline status
CREATE INDEX IF NOT EXISTS idx_offline_status_user_id ON offline_status(user_id);

-- Indexes for sync-related columns in existing tables
CREATE INDEX IF NOT EXISTS idx_farmers_sync_status ON farmers(sync_status);
CREATE INDEX IF NOT EXISTS idx_farmers_local_id ON farmers(local_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_sync_status ON loan_applications(sync_status);
CREATE INDEX IF NOT EXISTS idx_loan_applications_local_id ON loan_applications(local_id);
CREATE INDEX IF NOT EXISTS idx_payments_sync_status ON payments(sync_status);
CREATE INDEX IF NOT EXISTS idx_payments_local_id ON payments(local_id);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_status ENABLE ROW LEVEL SECURITY;

-- Sync queue policies
CREATE POLICY "Users can view their own sync queue" ON sync_queue
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync queue items" ON sync_queue
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sync queue items" ON sync_queue
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sync queue items" ON sync_queue
    FOR DELETE USING (auth.uid() = user_id);

-- Offline status policies
CREATE POLICY "Users can view their own offline status" ON offline_status
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own offline status" ON offline_status
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own offline status" ON offline_status
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON sync_queue TO authenticated;
GRANT SELECT, INSERT, UPDATE ON offline_status TO authenticated;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Essential offline functionality schema updates completed!';
    RAISE NOTICE 'Updated tables: farmers, loan_applications, payments';
    RAISE NOTICE 'New tables: sync_queue, offline_status';
    RAISE NOTICE 'Indexes and RLS policies applied';
END $$;
