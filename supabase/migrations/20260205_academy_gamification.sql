
-- 1. Academy Courses
CREATE TABLE IF NOT EXISTS public.academy_courses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  slug text UNIQUE NOT NULL,
  thumbnail_url text,
  is_published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Academy Modules
CREATE TABLE IF NOT EXISTS public.academy_modules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  "order" integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Update Academy Content (Lessons)
ALTER TABLE public.academy_content 
  ADD COLUMN IF NOT EXISTS module_id uuid REFERENCES public.academy_modules(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS xp_reward integer DEFAULT 50,
  ADD COLUMN IF NOT EXISTS duration_minutes integer,
  ADD COLUMN IF NOT EXISTS is_preview boolean DEFAULT false;

-- 4. User Progress
CREATE TABLE IF NOT EXISTS public.academy_progress (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id uuid REFERENCES public.academy_content(id) ON DELETE CASCADE,
  completed_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, content_id)
);

-- 5. Gamification Levels
CREATE TABLE IF NOT EXISTS public.gamification_levels (
  level integer PRIMARY KEY,
  xp_required integer NOT NULL,
  title text NOT NULL,
  icon_url text
);

-- 6. Policies (RLS)

-- Courses
ALTER TABLE public.academy_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public courses visible" ON public.academy_courses FOR SELECT USING (is_published = true OR public.is_admin_or_support());
CREATE POLICY "Admins manage courses" ON public.academy_courses FOR ALL USING (public.is_admin_or_support());

-- Modules
ALTER TABLE public.academy_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public modules visible" ON public.academy_modules FOR SELECT USING (true);
CREATE POLICY "Admins manage modules" ON public.academy_modules FOR ALL USING (public.is_admin_or_support());

-- Progress
ALTER TABLE public.academy_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own progress" ON public.academy_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own progress" ON public.academy_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own progress" ON public.academy_progress FOR DELETE USING (auth.uid() = user_id);

-- Levels
ALTER TABLE public.gamification_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public levels visible" ON public.gamification_levels FOR SELECT USING (true);

-- 7. Seed Initial Data (Courses & Levels)

-- Levels
INSERT INTO public.gamification_levels (level, xp_required, title) VALUES
(1, 0, 'Novato'),
(2, 500, 'Aprendiz'),
(3, 1500, 'Vendedor Junior'),
(4, 3000, 'Vendedor Pro'),
(5, 5000, 'Maestro del Éter')
ON CONFLICT (level) DO NOTHING;

-- Seed Course: Fundamentos de Éter
DO $$
DECLARE
  course_id uuid;
  module_id uuid;
BEGIN
  -- Create Course
  INSERT INTO public.academy_courses (title, description, slug, thumbnail_url, is_published)
  VALUES ('Fundamentos de Éter', 'Todo lo que necesitas saber para empezar a vender con nosotros.', 'fundamentos-eter', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80', true)
  RETURNING id INTO course_id;

  -- Create Module
  INSERT INTO public.academy_modules (course_id, title, "order")
  VALUES (course_id, 'Bienvenida e Introducción', 1)
  RETURNING id INTO module_id;

  -- Create Content (linked to existing table logic, but creating new entries)
  INSERT INTO public.academy_content (title, type, url, description, is_vip, thumbnail_url, module_id, "order", xp_reward)
  VALUES 
  ('Bienvenido a la Familia', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Conoce nuestra misión y visión.', false, NULL, module_id, 1, 100),
  ('Cómo funciona el sistema', 'pdf', 'https://example.com/guide.pdf', 'Guía rápida de inicio.', false, NULL, module_id, 2, 50);

END $$;
