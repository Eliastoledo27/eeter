-- Migration: Add enhanced customer fields to pedidos table
-- This migration adds comprehensive customer data fields for better order management

-- Add new customer detail columns
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS customer_dni TEXT,
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS province TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS delivery_date DATE,
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('efectivo', 'transferencia', 'mercado_pago', 'tarjeta')),
ADD COLUMN IF NOT EXISTS reseller_id UUID REFERENCES profiles(id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pedidos_reseller_id ON pedidos(reseller_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_payment_method ON pedidos(payment_method);
CREATE INDEX IF NOT EXISTS idx_pedidos_delivery_date ON pedidos(delivery_date);

-- Add RLS policies for reseller access
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- Policy: Resellers can see orders associated with them
CREATE POLICY "Resellers can view their orders" ON pedidos
FOR SELECT USING (
    auth.uid() = reseller_id OR 
    auth.uid() = customer_id OR
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Policy: Resellers can insert orders (will be associated automatically)
CREATE POLICY "Resellers can insert orders" ON pedidos
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL OR
    auth.uid() = reseller_id
);

-- Policy: Admins can update all orders, resellers only their own
CREATE POLICY "Admins and resellers can update orders" ON pedidos
FOR UPDATE USING (
    auth.uid() = reseller_id OR
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Add trigger to automatically associate orders with current reseller
CREATE OR REPLACE FUNCTION set_reseller_id()
RETURNS TRIGGER AS $$
BEGIN
    -- If no reseller_id is set and user is authenticated, set it to current user
    IF NEW.reseller_id IS NULL AND auth.uid() IS NOT NULL THEN
        NEW.reseller_id := auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set reseller_id
DROP TRIGGER IF EXISTS on_insert_set_reseller_id ON pedidos;
CREATE TRIGGER on_insert_set_reseller_id
BEFORE INSERT ON pedidos
FOR EACH ROW EXECUTE FUNCTION set_reseller_id();

COMMENT ON COLUMN pedidos.customer_dni IS 'Customer DNI/identification number';
COMMENT ON COLUMN pedidos.delivery_address IS 'Complete delivery address';
COMMENT ON COLUMN pedidos.city IS 'Delivery city';
COMMENT ON COLUMN pedidos.province IS 'Delivery province/state';
COMMENT ON COLUMN pedidos.postal_code IS 'Postal/ZIP code';
COMMENT ON COLUMN pedidos.delivery_date IS 'Requested delivery date';
COMMENT ON COLUMN pedidos.payment_method IS 'Payment method: efectivo, transferencia, mercado_pago, tarjeta';
COMMENT ON COLUMN pedidos.reseller_id IS 'Associated reseller who made the sale';
