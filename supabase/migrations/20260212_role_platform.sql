-- ============================================================
-- MIGRATION: Role-based Platform — Orders, Inventory, Notifications, Ranking
-- Run this in Supabase SQL Editor or via CLI
-- ============================================================

-- 1. ORDERS TABLE — Full order lifecycle tracking
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reseller_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text,
  customer_email text,
  items jsonb NOT NULL DEFAULT '[]',
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(10,2) DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','returned')),
  payment_method text DEFAULT 'cash',
  shipping_address text,
  tracking_number text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_reseller ON public.orders(reseller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- 2. INVENTORY_LOGS — Stock movement history
CREATE TABLE IF NOT EXISTS public.inventory_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  size text,
  quantity_change integer NOT NULL,
  reason text NOT NULL DEFAULT 'manual',
  previous_stock integer,
  new_stock integer,
  performed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inv_logs_product ON public.inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_inv_logs_created ON public.inventory_logs(created_at DESC);

-- 3. NOTIFICATIONS — Per-user notification system
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text,
  type text DEFAULT 'info'
    CHECK (type IN ('info','success','warning','error','order','stock','message')),
  is_read boolean DEFAULT false,
  action_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notif_created ON public.notifications(created_at DESC);

-- 4. RANKING_ENTRIES — Monthly sales performance
CREATE TABLE IF NOT EXISTS public.ranking_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  period text NOT NULL,
  total_sales numeric(10,2) DEFAULT 0,
  total_orders integer DEFAULT 0,
  total_profit numeric(10,2) DEFAULT 0,
  position integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, period)
);

CREATE INDEX IF NOT EXISTS idx_ranking_period ON public.ranking_entries(period, position);
CREATE INDEX IF NOT EXISTS idx_ranking_user ON public.ranking_entries(user_id);

-- 5. RLS POLICIES

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR auth.uid() = reseller_id);
CREATE POLICY "Staff see all orders" ON public.orders FOR SELECT USING (public.is_admin_or_support());
CREATE POLICY "Staff manage orders" ON public.orders FOR ALL USING (public.is_admin_or_support());
CREATE POLICY "Resellers create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = reseller_id);
CREATE POLICY "Resellers update own orders" ON public.orders FOR UPDATE USING (auth.uid() = reseller_id AND status IN ('pending','confirmed'));

ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff view inventory logs" ON public.inventory_logs FOR SELECT USING (public.is_admin_or_support());
CREATE POLICY "Staff manage inventory" ON public.inventory_logs FOR ALL USING (public.is_admin_or_support());

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

ALTER TABLE public.ranking_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read ranking" ON public.ranking_entries FOR SELECT USING (true);
CREATE POLICY "Staff manage ranking" ON public.ranking_entries FOR ALL USING (public.is_admin_or_support());

-- 6. TRIGGERS — Auto-update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'orders_updated_at') THEN
    CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'ranking_updated_at') THEN
    CREATE TRIGGER ranking_updated_at BEFORE UPDATE ON public.ranking_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;

-- 7. ENABLE REALTIME
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
