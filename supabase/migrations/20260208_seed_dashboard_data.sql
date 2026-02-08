-- ========================================================================
-- SEED DATA PARA DASHBOARD - ÉTER STORE (COMPLETO)
-- ========================================================================
-- Descripción: Script maestro para inicializar TODAS las tablas necesarias
--              para el dashboard: Clientes, Pedidos, y Academia.
-- ========================================================================

-- 1. Tabla Clientes
CREATE TABLE IF NOT EXISTS public.clientes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre text,
    email text UNIQUE,
    telefono text,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Tabla Pedidos
CREATE TABLE IF NOT EXISTS public.pedidos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name text,
    customer_email text,
    total_amount numeric,
    status text DEFAULT 'completed', 
    items jsonb, 
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Tabla Academia (Contenido)
CREATE TABLE IF NOT EXISTS public.academy_content (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('video', 'pdf', 'audio')),
  url text,
  is_vip boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Asegurar columna is_premium en profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_premium') THEN
        ALTER TABLE public.profiles ADD COLUMN is_premium boolean DEFAULT false;
    END IF;
END $$;

-- 5. Habilitar RLS (Política permisiva para demo)
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_content ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Borrar políticas si existen para evitar conflictos
    DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.clientes;
    DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.pedidos;
    DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.academy_content;
END $$;

CREATE POLICY "Enable all for authenticated users" ON public.clientes FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON public.pedidos FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON public.academy_content FOR ALL USING (true);

-- 6. Poblar datos SI y SOLO SI las tablas están vacías
DO $$
DECLARE
    count_clientes integer;
    count_academy integer;
BEGIN
    SELECT count(*) INTO count_clientes FROM public.clientes;
    SELECT count(*) INTO count_academy FROM public.academy_content;

    -- Clientes y Pedidos
    IF count_clientes = 0 THEN
        INSERT INTO public.clientes (nombre, email, telefono, created_at) VALUES 
            ('Juan Pérez', 'juan.perez@example.com', '+5491100001111', now() - interval '10 days'),
            ('María García', 'maria.garcia@example.com', '+5491100002222', now() - interval '5 days');

        INSERT INTO public.pedidos (customer_name, customer_email, total_amount, status, items, created_at) VALUES 
            ('Juan Pérez', 'juan.perez@example.com', 150000, 'completed', '[{"id": "m1", "name": "Zapatillas", "price": 150000, "quantity": 1}]'::jsonb, now() - interval '9 days'),
            ('María García', 'maria.garcia@example.com', 85000, 'processing', '[{"id": "m2", "name": "Camiseta", "price": 40000, "quantity": 1}]'::jsonb, now() - interval '4 days');
            
        RAISE NOTICE 'Clientes y Pedidos insertados.';
    END IF;

    -- Academia
    IF count_academy = 0 THEN
        INSERT INTO public.academy_content (title, type, is_vip, description, url) VALUES
            ('Introducción al Dropshipping', 'video', false, 'Aprende los conceptos básicos para empezar tu negocio hoy mismo.', 'https://www.youtube.com/watch?v=mock1'),
            ('Mindset de Ganador', 'audio', false, 'Reprograma tu mente para el éxito financiero y personal.', 'https://example.com/audio1.mp3'),
            ('Estrategias Avanzadas de Facebook Ads', 'video', true, 'Domina el administrador de anuncios y escala tus campañas al infinito.', 'https://www.youtube.com/watch?v=mock2'),
            ('Guía Maestra de Importación', 'pdf', true, 'Manual completo con proveedores y logística internacional.', 'https://example.com/guia.pdf');
            
        RAISE NOTICE 'Contenido de Academia insertado.';
    END IF;
END $$;
