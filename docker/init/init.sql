-- Running Club - Local Dev Database Init
-- This runs on first PostgreSQL startup only

-- ===== Orders Table =====
CREATE TABLE IF NOT EXISTS public.orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total_quantity INTEGER NOT NULL DEFAULT 0,
  total_price INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'รับออเดอร์',
  slip_url TEXT,
  slip_uploaded_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== RLS Policies =====
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.orders
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.orders
  FOR UPDATE USING (true) WITH CHECK (true);

-- ===== Permissions =====
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.orders TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ===== Storage Bucket =====
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('slips', 'slips', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Allow public upload slips" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'slips');
CREATE POLICY "Allow public read slips" ON storage.objects
  FOR SELECT USING (bucket_id = 'slips');
CREATE POLICY "Allow public update slips" ON storage.objects
  FOR UPDATE USING (bucket_id = 'slips') WITH CHECK (bucket_id = 'slips');

-- ===== Seed Data (sample orders for testing) =====
INSERT INTO public.orders (name, phone, items, total_quantity, total_price, status) VALUES
(
  'ทดสอบ สมชาย', '0812345678',
  '[{"color":"น้ำเงิน","collar_type":"คอวี","sleeve_type":"แขนสั้น","size":"L","quantity":1},{"color":"ขาว","collar_type":"คอวี","sleeve_type":"กล้าม","size":"M","quantity":2}]',
  3, 900, 'รับออเดอร์'
),
(
  'ทดสอบ สมหญิง', '0898765432',
  '[{"color":"ขาว","collar_type":"คอกลม","sleeve_type":"แขนกุด","size":"2XL","quantity":1}]',
  1, 350, 'แจ้งชำระค่าเสื้อ'
);
