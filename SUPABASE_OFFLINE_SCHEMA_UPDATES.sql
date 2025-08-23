-- =====================================================
-- SUPABASE OFFLINE FUNCTIONALITY SCHEMA UPDATES
-- Farmers Loan Facilitator System
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
ADD COLUMN IF NOT EXISTS sync_error TEXT,
ADD COLUMN IF NOT EXISTS sync_version INTEGER DEFAULT 1;

-- Add sync-related columns to loan_applications table
ALTER TABLE loan_applications 
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'failed')),
ADD COLUMN IF NOT EXISTS local_id TEXT,
ADD COLUMN IF NOT EXISTS last_sync_attempt TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sync_error TEXT,
ADD COLUMN IF NOT EXISTS sync_version INTEGER DEFAULT 1;

-- Add sync-related columns to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'failed')),
ADD COLUMN IF NOT EXISTS local_id TEXT,
ADD COLUMN IF NOT EXISTS last_sync_attempt TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sync_error TEXT,
ADD COLUMN IF NOT EXISTS sync_version INTEGER DEFAULT 1;

-- =====================================================
-- 2. CREATE NEW TABLES FOR OFFLINE FUNCTIONALITY
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Offline sessions table to track offline work sessions
CREATE TABLE IF NOT EXISTS offline_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    data_collector_id UUID REFERENCES data_collectors(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_deleted INTEGER DEFAULT 0,
    sync_errors INTEGER DEFAULT 0,
    location_data JSONB, -- Store GPS coordinates if available
    device_info JSONB, -- Store device information
    notes TEXT
);

-- Sync conflicts table to track and resolve data conflicts
CREATE TABLE IF NOT EXISTS sync_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    local_version JSONB NOT NULL,
    server_version JSONB NOT NULL,
    conflict_type TEXT NOT NULL CHECK (conflict_type IN ('update_conflict', 'delete_conflict', 'merge_conflict')),
    resolution TEXT CHECK (resolution IN ('local_wins', 'server_wins', 'manual_merge')),
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
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
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for sync queue
CREATE INDEX IF NOT EXISTS idx_sync_queue_user_id ON sync_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_created_at ON sync_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_sync_queue_retry_count ON sync_queue(retry_count);
CREATE INDEX IF NOT EXISTS idx_sync_queue_table_name ON sync_queue(table_name);

-- Indexes for offline sessions
CREATE INDEX IF NOT EXISTS idx_offline_sessions_user_id ON offline_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_sessions_data_collector_id ON offline_sessions(data_collector_id);
CREATE INDEX IF NOT EXISTS idx_offline_sessions_started_at ON offline_sessions(started_at);

-- Indexes for sync conflicts
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_user_id ON sync_conflicts(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_table_name ON sync_conflicts(table_name);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_resolution ON sync_conflicts(resolution);

-- Indexes for offline status
CREATE INDEX IF NOT EXISTS idx_offline_status_user_id ON offline_status(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_status_is_online ON offline_status(is_online);

-- Indexes for sync-related columns in existing tables
CREATE INDEX IF NOT EXISTS idx_farmers_sync_status ON farmers(sync_status);
CREATE INDEX IF NOT EXISTS idx_farmers_local_id ON farmers(local_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_sync_status ON loan_applications(sync_status);
CREATE INDEX IF NOT EXISTS idx_loan_applications_local_id ON loan_applications(local_id);
CREATE INDEX IF NOT EXISTS idx_payments_sync_status ON payments(sync_status);
CREATE INDEX IF NOT EXISTS idx_payments_local_id ON payments(local_id);

-- =====================================================
-- 4. CREATE FUNCTIONS FOR OFFLINE FUNCTIONALITY
-- =====================================================

-- Function to update sync status
CREATE OR REPLACE FUNCTION update_sync_status(
    p_table_name TEXT,
    p_record_id TEXT,
    p_sync_status TEXT,
    p_sync_error TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    EXECUTE format('
        UPDATE %I 
        SET sync_status = $1, 
            last_sync_attempt = NOW(),
            sync_error = $2,
            updated_at = NOW()
        WHERE id = $3
    ', p_table_name)
    USING p_sync_status, p_sync_error, p_record_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get pending sync count for a user
CREATE OR REPLACE FUNCTION get_pending_sync_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_count INTEGER;
BEGIN
    SELECT COALESCE(SUM(
        CASE 
            WHEN table_name = 'farmers' THEN 1
            WHEN table_name = 'loan_applications' THEN 1
            WHEN table_name = 'payments' THEN 1
            ELSE 0
        END
    ), 0) INTO total_count
    FROM sync_queue 
    WHERE user_id = p_user_id 
    AND processed_at IS NULL;
    
    RETURN total_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old sync queue entries
CREATE OR REPLACE FUNCTION cleanup_sync_queue(p_days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sync_queue 
    WHERE created_at < NOW() - INTERVAL '1 day' * p_days_old
    AND (processed_at IS NOT NULL OR retry_count >= max_retries);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to new tables
CREATE TRIGGER update_sync_queue_updated_at 
    BEFORE UPDATE ON sync_queue 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offline_status_updated_at 
    BEFORE UPDATE ON offline_status 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_conflicts ENABLE ROW LEVEL SECURITY;
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

-- Offline sessions policies
CREATE POLICY "Users can view their own offline sessions" ON offline_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own offline sessions" ON offline_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own offline sessions" ON offline_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Data collectors can view offline sessions for their assigned farmers
CREATE POLICY "Data collectors can view offline sessions for their farmers" ON offline_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM data_collectors 
            WHERE id = offline_sessions.data_collector_id 
            AND user_id = auth.uid()
        )
    );

-- Sync conflicts policies
CREATE POLICY "Users can view their own sync conflicts" ON sync_conflicts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync conflicts" ON sync_conflicts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sync conflicts" ON sync_conflicts
    FOR UPDATE USING (auth.uid() = user_id);

-- Offline status policies
CREATE POLICY "Users can view their own offline status" ON offline_status
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own offline status" ON offline_status
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own offline status" ON offline_status
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 7. CREATE VIEWS FOR EASY QUERYING
-- =====================================================

-- View for sync statistics
CREATE OR REPLACE VIEW sync_statistics AS
SELECT 
    user_id,
    COUNT(*) as total_pending,
    COUNT(CASE WHEN retry_count > 0 THEN 1 END) as failed_attempts,
    COUNT(CASE WHEN retry_count >= max_retries THEN 1 END) as permanently_failed,
    MIN(created_at) as oldest_pending,
    MAX(created_at) as newest_pending
FROM sync_queue 
WHERE processed_at IS NULL
GROUP BY user_id;

-- View for offline session summary
CREATE OR REPLACE VIEW offline_session_summary AS
SELECT 
    os.user_id,
    os.data_collector_id,
    dc.full_name as collector_name,
    os.started_at,
    os.ended_at,
    os.records_created,
    os.records_updated,
    os.records_deleted,
    os.sync_errors,
    CASE 
        WHEN os.ended_at IS NULL THEN 'active'
        ELSE 'completed'
    END as session_status
FROM offline_sessions os
LEFT JOIN data_collectors dc ON os.data_collector_id = dc.id;

-- =====================================================
-- 8. SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample offline status records (optional)
-- INSERT INTO offline_status (user_id, is_online, pending_sync_count) 
-- SELECT id, true, 0 FROM auth.users WHERE role = 'data-collector';

-- =====================================================
-- 9. CLEANUP AND MAINTENANCE
-- =====================================================

-- Create a function to run periodic cleanup
CREATE OR REPLACE FUNCTION run_offline_maintenance()
RETURNS VOID AS $$
BEGIN
    -- Clean up old sync queue entries
    PERFORM cleanup_sync_queue(30);
    
    -- Clean up old offline sessions (older than 90 days)
    DELETE FROM offline_sessions 
    WHERE ended_at IS NOT NULL 
    AND ended_at < NOW() - INTERVAL '90 days';
    
    -- Clean up resolved sync conflicts (older than 30 days)
    DELETE FROM sync_conflicts 
    WHERE resolved_at IS NOT NULL 
    AND resolved_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON sync_queue TO authenticated;
GRANT SELECT, INSERT, UPDATE ON offline_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON sync_conflicts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON offline_status TO authenticated;

-- Grant permissions to views
GRANT SELECT ON sync_statistics TO authenticated;
GRANT SELECT ON offline_session_summary TO authenticated;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Offline functionality schema updates completed successfully!';
    RAISE NOTICE 'New tables created: sync_queue, offline_sessions, sync_conflicts, offline_status';
    RAISE NOTICE 'Existing tables updated with sync columns: farmers, loan_applications, payments';
    RAISE NOTICE 'Indexes and RLS policies applied for security and performance';
END $$;
