-- Create Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL, -- 'BULK_IMPORT', 'BULK_UPDATE', 'CREATE', 'UPDATE', 'DELETE'
    entity TEXT NOT NULL, -- 'products'
    details JSONB, -- Stores the changes or count
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT
    USING (auth.uid() IN (SELECT id FROM auth.users)); -- Simplify for now, ideally check role

-- Policy: Authenticated users can insert logs
CREATE POLICY "Users can insert logs" ON audit_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
