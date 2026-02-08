-- Create productos table
CREATE TABLE IF NOT EXISTS productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  price DECIMAL(10, 2),
  margin DECIMAL(5, 2) DEFAULT 30.00,
  image TEXT,
  description TEXT,
  stock INTEGER DEFAULT 0,
  stock_by_size JSONB DEFAULT '{}',
  base_price DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'activo',
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_productos_category ON productos(category);
CREATE INDEX IF NOT EXISTS idx_productos_status ON productos(status);
CREATE INDEX IF NOT EXISTS idx_productos_created_at ON productos(created_at);

-- Create pedidos table
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  total_amount DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'pendiente',
  items JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clientes table
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  total_spent DECIMAL(10, 2) DEFAULT 0.00,
  last_purchase TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active products
CREATE POLICY "Public products are viewable by everyone" 
ON productos FOR SELECT 
USING (status = 'activo');

-- Allow authenticated users (admin) full access to everything
CREATE POLICY "Admins have full access to products" 
ON productos FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to pedidos" 
ON pedidos FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to clientes" 
ON clientes FOR ALL 
USING (auth.role() = 'authenticated');
