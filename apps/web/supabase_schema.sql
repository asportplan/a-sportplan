-- ============================================================
-- A-FITFORM: SUPABASE POSTGRESQL DATABASE SCHEMA
-- ============================================================
-- Petunjuk: Paste seluruh skrip SQL ini ke dalam Supabase Dashboard -> SQL Editor -> Run
-- Skema ini dilengkapi dengan Row Level Security (RLS) untuk keamanan data tingkat tinggi.

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 1. TABEL: PROFILES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_name TEXT DEFAULT '',
  sport_branch TEXT DEFAULT 'Kebugaran Umum',
  age INTEGER DEFAULT 25 CHECK (age >= 10 AND age <= 100),
  body_weight_kg NUMERIC(5,2) DEFAULT 70.0,
  height_cm NUMERIC(5,2) DEFAULT 170.0,
  training_age_level TEXT DEFAULT 'BEGINNER' CHECK (training_age_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
  active_program_duration_weeks INTEGER DEFAULT 8,
  selected_goals JSONB DEFAULT '["hypertrophy"]'::jsonb,
  target_1rm_increase_pct NUMERIC(5,2) DEFAULT 10.0,
  preferred_language TEXT DEFAULT 'id',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 2. TABEL: USER_EQUIPMENT
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_slug TEXT NOT NULL,
  user_1rm_kg NUMERIC(6,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_exercise UNIQUE (user_id, exercise_slug)
);

-- ------------------------------------------------------------
-- 3. TABEL: SCREENING_RESULTS (PAR-Q+)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.screening_results (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  has_heart_condition BOOLEAN DEFAULT FALSE,
  has_asthma BOOLEAN DEFAULT FALSE,
  has_chest_pain BOOLEAN DEFAULT FALSE,
  has_injury BOOLEAN DEFAULT FALSE,
  injury_area TEXT,
  takes_medication BOOLEAN DEFAULT FALSE,
  clearance_status TEXT DEFAULT 'CLEAR',
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 4. TABEL: SAVED_PROGRAMS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_programs (
  program_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration_weeks INTEGER DEFAULT 8,
  goals JSONB DEFAULT '[]'::jsonb,
  program_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 5. TABEL: SUBSCRIPTIONS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'expired')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Aktifkan RLS pada seluruh tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screening_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Pengguna dapat membaca profil sendiri" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Pengguna dapat menyisipkan profil sendiri" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pengguna dapat memperbarui profil sendiri" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- 2. User Equipment Policies
CREATE POLICY "Pengguna dapat membaca alat sendiri" ON public.user_equipment
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Pengguna dapat mengelola alat sendiri" ON public.user_equipment
  FOR ALL USING (auth.uid() = user_id);

-- 3. Screening Results Policies
CREATE POLICY "Pengguna dapat membaca screening sendiri" ON public.screening_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Pengguna dapat mengelola screening sendiri" ON public.screening_results
  FOR ALL USING (auth.uid() = user_id);

-- 4. Saved Programs Policies
CREATE POLICY "Pengguna dapat membaca program sendiri" ON public.saved_programs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Pengguna dapat mengelola program sendiri" ON public.saved_programs
  FOR ALL USING (auth.uid() = user_id);

-- 5. Subscriptions Policies
CREATE POLICY "Pengguna dapat membaca status langganan sendiri" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS: OTOMATISISASI USER SIGNUP & TIMESTAMPS
-- ============================================================

-- Fungsi otomatis buat profile & subscription saat user baru mendaftar (Google / Email)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, athlete_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''));

  INSERT INTO public.subscriptions (user_id, plan_type, status)
  VALUES (NEW.id, 'free', 'active');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pada auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger untuk update updated_at otomatis
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON public.user_equipment FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_saved_programs_updated_at BEFORE UPDATE ON public.saved_programs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
