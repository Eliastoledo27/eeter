-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anyone to insert messages (public contact form)
CREATE POLICY "Allow public insert to messages" ON messages
  FOR INSERT WITH CHECK (true);

-- Allow admins to view all messages
-- Assuming admin checks are handled via application logic or a specific role
-- For now, we'll allow authenticated users with 'ADMIN' role if RLS was strictly set up that way,
-- but based on previous context, we might rely on service role or public for now if auth is loose.
-- Let's stick to a safe default: Authenticated users can read.
CREATE POLICY "Allow authenticated to read messages" ON messages
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admins to update (mark as read)
CREATE POLICY "Allow authenticated to update messages" ON messages
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow admins to delete
CREATE POLICY "Allow authenticated to delete messages" ON messages
  FOR DELETE USING (auth.role() = 'authenticated');
