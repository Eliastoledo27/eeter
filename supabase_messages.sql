-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    receiver_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    name text,
    email text,
    subject text,
    message text NOT NULL,
    status text DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
    is_admin_reply boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages(status);

-- Helper function to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_messages_updated ON public.messages;
CREATE TRIGGER on_messages_updated
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- POLICIES

-- 1. Admins/Support can do everything
DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;
CREATE POLICY "Admins can view all messages"
    ON public.messages
    FOR SELECT
    USING (public.is_admin_or_support());

DROP POLICY IF EXISTS "Admins can insert messages" ON public.messages;
CREATE POLICY "Admins can insert messages"
    ON public.messages
    FOR INSERT
    WITH CHECK (public.is_admin_or_support());

DROP POLICY IF EXISTS "Admins can update messages" ON public.messages;
CREATE POLICY "Admins can update messages"
    ON public.messages
    FOR UPDATE
    USING (public.is_admin_or_support());

DROP POLICY IF EXISTS "Admins can delete messages" ON public.messages;
CREATE POLICY "Admins can delete messages"
    ON public.messages
    FOR DELETE
    USING (public.is_admin_or_support());

-- 2. Authenticated Users can view their own messages (sent or received)
DROP POLICY IF EXISTS "Users can view own conversation" ON public.messages;
CREATE POLICY "Users can view own conversation"
    ON public.messages
    FOR SELECT
    USING (
        auth.uid() = sender_id OR 
        auth.uid() = receiver_id
    );

-- 3. Users can send messages (as sender)
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages"
    ON public.messages
    FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
    );

-- 4. Users can update messages they received (e.g. mark as read)
DROP POLICY IF EXISTS "Users can update own received messages" ON public.messages;
CREATE POLICY "Users can update own received messages"
    ON public.messages
    FOR UPDATE
    USING (auth.uid() = receiver_id);

-- 5. Public/Anonymous can send messages (Contact Form)
DROP POLICY IF EXISTS "Public can send messages" ON public.messages;
CREATE POLICY "Public can send messages"
    ON public.messages
    FOR INSERT
    WITH CHECK (
        sender_id IS NULL
    );
