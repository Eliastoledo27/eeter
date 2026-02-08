-- Fix products bucket permissions
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Ensure public access to view images
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'products' );

-- Allow ANYONE to upload images (for demo/development simplicity)
-- In production, you should restrict this to authenticated users
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
CREATE POLICY "Public Upload"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'products' );

-- Fix Row Level Security (RLS) for Products table
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
DROP POLICY IF EXISTS "Enable read access for all users" ON productos;
CREATE POLICY "Enable read access for all users"
ON productos FOR SELECT
USING (true);

-- Allow authenticated users (or everyone for now) to insert/update products
DROP POLICY IF EXISTS "Enable insert for all users" ON productos;
CREATE POLICY "Enable insert for all users"
ON productos FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON productos;
CREATE POLICY "Enable update for all users"
ON productos FOR UPDATE
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON productos;
CREATE POLICY "Enable delete for all users"
ON productos FOR DELETE
USING (true);
