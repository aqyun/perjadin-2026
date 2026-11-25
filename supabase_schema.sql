-- =====================================================================
-- PERDINKU 2026 - SKEMA DATABASE SUPABASE & ROW LEVEL SECURITY (RLS)
-- Jalankan seluruh query ini di SQL Editor Supabase Anda:
-- Dashboard > SQL Editor > New Query > Paste & Run
-- =====================================================================

-- 0. HAK AKSES DASAR POSTGRESQL (Mencegah error 'permission denied for table')
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated;

-- 1. TABEL PROFILES (Data pengguna & Hak Akses: Admin, Role Khusus/Operator, Viewer)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  nama_lengkap TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'operator', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pastikan kolom updated_at ada & constraint role mendukung admin, operator, viewer jika tabel sudah terbuat sebelumnya
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%role%'
  ) LOOP
    EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
  END LOOP;
END $$;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'operator', 'viewer'));

-- Indeks tabel profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

-- Aktifkan RLS untuk tabel profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.profiles TO anon, authenticated;

-- Helper Function: Mengecek apakah pengguna saat ini berstatus 'admin'
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) IN ('aqyunrm@gmail.com', 'aqyun.maulidin@pkp.go.id')
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Function: Mengecek apakah pengguna dapat membuat & mengedit berkas (Admin atau Role Khusus/Operator)
CREATE OR REPLACE FUNCTION public.can_edit()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'operator')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC Function: Ubah peran pengguna secara langsung & aman (Security Definer)
CREATE OR REPLACE FUNCTION public.admin_set_user_role(target_user_id UUID, new_role TEXT)
RETURNS JSONB AS $$
DECLARE
  caller_email TEXT;
  caller_is_admin BOOLEAN;
  updated_row RECORD;
BEGIN
  caller_email := LOWER(COALESCE(auth.jwt() ->> 'email', ''));
  caller_is_admin := (
    caller_email IN ('aqyunrm@gmail.com', 'aqyun.maulidin@pkp.go.id')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

  IF NOT caller_is_admin THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya Administrator yang berhak mengubah peran pengguna.';
  END IF;

  IF new_role NOT IN ('admin', 'operator', 'viewer') THEN
    RAISE EXCEPTION 'Peran tidak valid: %. Pilihan peran: admin, operator, viewer', new_role;
  END IF;

  UPDATE public.profiles
  SET role = new_role
  WHERE id = target_user_id
  RETURNING * INTO updated_row;

  IF updated_row.id IS NULL THEN
    INSERT INTO public.profiles (id, email, role)
    VALUES (target_user_id, (SELECT email FROM auth.users WHERE id = target_user_id), new_role)
    RETURNING * INTO updated_row;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'id', updated_row.id,
    'email', updated_row.email,
    'role', updated_row.role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.admin_set_user_role(UUID, TEXT) TO authenticated, anon;

-- Policy Profiles: Semua pengguna login dapat membaca daftar profil (untuk user list & riwayat)
DROP POLICY IF EXISTS "Profiles dapat dilihat oleh pengguna terotentikasi" ON public.profiles;
CREATE POLICY "Profiles dapat dilihat oleh pengguna terotentikasi"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Policy Profiles: Hanya Admin yang dapat mengubah role pengguna lain, atau user mengupdate nama sendiri
DROP POLICY IF EXISTS "Admin dapat mengupdate profil dan role pengguna" ON public.profiles;
DROP POLICY IF EXISTS "Pengguna dapat mengupdate profil sendiri" ON public.profiles;
CREATE POLICY "Admin atau pemilik akun dapat mengupdate profil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin() OR auth.uid() = id)
  WITH CHECK (
    -- Jika bukan admin, peran (role) tidak boleh diubah sendiri
    public.is_admin() OR (
      role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    )
  );

-- 2. TRIGGER OTOMATIS: Tambahkan entri di 'profiles' saat pengguna baru mendaftar
-- Aturan Peran:
-- - aqyunrm@gmail.com / aqyun.maulidin@pkp.go.id OTOMATIS menjadi ADMIN utama
-- - Semua pendaftar lain OTOMATIS menjadi VIEWER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  assigned_role TEXT;
BEGIN
  user_email := LOWER(NEW.email);
  
  -- Root Admin utama: aqyunrm@gmail.com / aqyun.maulidin@pkp.go.id
  IF user_email IN ('aqyunrm@gmail.com', 'aqyun.maulidin@pkp.go.id') THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := 'viewer';
  END IF;

  INSERT INTO public.profiles (id, email, nama_lengkap, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    nama_lengkap = COALESCE(EXCLUDED.nama_lengkap, profiles.nama_lengkap),
    role = CASE
      WHEN LOWER(EXCLUDED.email) IN ('aqyunrm@gmail.com', 'aqyun.maulidin@pkp.go.id') THEN 'admin'
      ELSE profiles.role
    END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 3. TABEL RIWAYAT_PERJADIN (Menyimpan seluruh berkas perjalanan dinas)
CREATE TABLE IF NOT EXISTS public.riwayat_perjadin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_st TEXT,
  tujuan TEXT,
  agenda TEXT,
  tgl_berangkat TEXT,
  tgl_kembali TEXT,
  total_biaya NUMERIC DEFAULT 0,
  status_berkas TEXT DEFAULT 'diproses', -- 'diproses' (ke satker) atau 'dicairkan'
  payload_json JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pastikan kolom status_berkas dan csv_data ada jika tabel sudah pernah dibuat sebelumnya
ALTER TABLE public.riwayat_perjadin ADD COLUMN IF NOT EXISTS status_berkas TEXT DEFAULT 'diproses';
ALTER TABLE public.riwayat_perjadin ADD COLUMN IF NOT EXISTS csv_data TEXT;

-- Indeks untuk pencarian cepat
CREATE INDEX IF NOT EXISTS idx_riwayat_created_at ON public.riwayat_perjadin (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_riwayat_nomor_st ON public.riwayat_perjadin (nomor_st);
CREATE INDEX IF NOT EXISTS idx_riwayat_status_berkas ON public.riwayat_perjadin (status_berkas);

-- Aktifkan RLS untuk riwayat_perjadin
ALTER TABLE public.riwayat_perjadin ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.riwayat_perjadin TO anon, authenticated;

-- Policy 1: Semua pengguna terotentikasi & publik bisa melihat (SELECT) riwayat
DROP POLICY IF EXISTS "Semua pengguna login dapat melihat riwayat" ON public.riwayat_perjadin;
DROP POLICY IF EXISTS "Publik dapat melihat riwayat" ON public.riwayat_perjadin;
CREATE POLICY "Semua pengguna login dapat melihat riwayat"
  ON public.riwayat_perjadin FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policy 2: Seluruh pengguna terotentikasi & aplikasi dapat menambah (INSERT) riwayat perjadin
DROP POLICY IF EXISTS "Hanya Admin yang dapat menambah riwayat" ON public.riwayat_perjadin;
DROP POLICY IF EXISTS "Admin dan Operator dapat menambah riwayat" ON public.riwayat_perjadin;
DROP POLICY IF EXISTS "Pengguna dapat menambah riwayat" ON public.riwayat_perjadin;
CREATE POLICY "Pengguna dapat menambah riwayat"
  ON public.riwayat_perjadin FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Policy 3: Seluruh pengguna terotentikasi & aplikasi dapat memperbarui (UPDATE) isi & progres berkas
DROP POLICY IF EXISTS "Hanya Admin yang dapat memperbarui riwayat" ON public.riwayat_perjadin;
DROP POLICY IF EXISTS "Admin dan Operator dapat memperbarui riwayat" ON public.riwayat_perjadin;
DROP POLICY IF EXISTS "Pengguna dapat memperbarui riwayat" ON public.riwayat_perjadin;
CREATE POLICY "Pengguna dapat memperbarui riwayat"
  ON public.riwayat_perjadin FOR UPDATE
  TO authenticated, anon
  USING (true);

-- Policy 4: Hanya Admin yang dapat menghapus (DELETE) riwayat
DROP POLICY IF EXISTS "Hanya Admin yang dapat menghapus riwayat" ON public.riwayat_perjadin;
CREATE POLICY "Hanya Admin yang dapat menghapus riwayat"
  ON public.riwayat_perjadin FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Pastikan akun Admin utama berstatus admin jika sudah terdaftar di auth.users
UPDATE public.profiles
SET role = 'admin'
WHERE LOWER(email) IN ('aqyunrm@gmail.com', 'aqyun.maulidin@pkp.go.id');

-- Konfirmasi email langsung tanpa perlu membuka tautan verifikasi email
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE LOWER(email) IN ('aqyunrm@gmail.com', 'aqyun.maulidin@pkp.go.id')
  AND email_confirmed_at IS NULL;
