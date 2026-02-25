-- 1. Create Settings table
CREATE TABLE IF NOT EXISTS public.settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    timetable_url text,
    site_title text DEFAULT 'المنصة التعليمية',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert initial settings
INSERT INTO public.settings (site_title) VALUES ('المنصة التعليمية') ON CONFLICT DO NOTHING;

-- 2. Create Levels table (e.g. SMP 1, SMP 2)
CREATE TABLE IF NOT EXISTS public.levels (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Groups table (e.g. pc pA, pc pB...)
CREATE TABLE IF NOT EXISTS public.groups (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    level_id uuid REFERENCES public.levels(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Modules table (7 items per group)
CREATE TABLE IF NOT EXISTS public.modules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    icon text DEFAULT 'book',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Announcements table (Linked to Levels)
CREATE TABLE IF NOT EXISTS public.announcements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    level_id uuid REFERENCES public.levels(id) ON DELETE CASCADE,
    title text DEFAULT 'Annonce',
    content text,
    audio_url text, -- For voice notes/uploaded audio
    image_url text, -- For image announcements
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Module Sections table (4 sections per module)
CREATE TABLE IF NOT EXISTS public.module_sections (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id uuid REFERENCES public.modules(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Files table
CREATE TABLE IF NOT EXISTS public.files (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id uuid REFERENCES public.module_sections(id) ON DELETE CASCADE,
    title text NOT NULL,
    file_url text NOT NULL,
    file_type text, -- 'pdf', 'image', 'video'
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Read Access Policies (Public can read)
DROP POLICY IF EXISTS "Public read settings" ON public.settings;
CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read levels" ON public.levels;
CREATE POLICY "Public read levels" ON public.levels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read groups" ON public.groups;
CREATE POLICY "Public read groups" ON public.groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read modules" ON public.modules;
CREATE POLICY "Public read modules" ON public.modules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read announcements" ON public.announcements;
CREATE POLICY "Public read announcements" ON public.announcements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read module_sections" ON public.module_sections;
CREATE POLICY "Public read module_sections" ON public.module_sections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read files" ON public.files;
CREATE POLICY "Public read files" ON public.files FOR SELECT USING (true);

-- Admin Access Policies (Only authenticated users can insert/update/delete)
DROP POLICY IF EXISTS "Auth all on settings" ON public.settings;
CREATE POLICY "Auth all on settings" ON public.settings FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth all on levels" ON public.levels;
CREATE POLICY "Auth all on levels" ON public.levels FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth all on groups" ON public.groups;
CREATE POLICY "Auth all on groups" ON public.groups FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth all on modules" ON public.modules;
CREATE POLICY "Auth all on modules" ON public.modules FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth all on announcements" ON public.announcements;
CREATE POLICY "Auth all on announcements" ON public.announcements FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth all on module_sections" ON public.module_sections;
CREATE POLICY "Auth all on module_sections" ON public.module_sections FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth all on files" ON public.files;
CREATE POLICY "Auth all on files" ON public.files FOR ALL USING (auth.role() = 'authenticated');

-- Storage Configuration
INSERT INTO storage.buckets (id, name, public) VALUES ('platform-files', 'platform-files', true) ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read files bucket" ON storage.objects;
CREATE POLICY "Public read files bucket" ON storage.objects FOR SELECT USING (bucket_id = 'platform-files');

DROP POLICY IF EXISTS "Auth all on files bucket" ON storage.objects;
CREATE POLICY "Auth all on files bucket" ON storage.objects FOR ALL USING (bucket_id = 'platform-files' AND auth.role() = 'authenticated');
