-- ==============================================================================
-- PRIMA DASHBOARD: SUPABASE OCR CACHE & PIPELINE PROGRESS SCHEMA
-- Jalankan skrip SQL ini di Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. TABEL OCR CACHE (Menyimpan hasil ekstraksi per halaman & hash SHA-256)
create table if not exists public.ocr_cache (
  id uuid primary key default gen_random_uuid(),
  file_hash text not null,
  page_number int not null,
  extracted_text text not null,
  extraction_source text not null check (extraction_source in ('text_layer', 'cloud_ai', 'tesseract', 'cache')),
  confidence numeric default 0.98,
  detected_inks text[] default array['Tinta Biru', 'Tinta Hitam']::text[],
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint uq_ocr_cache_hash_page unique (file_hash, page_number)
);

-- Indeks untuk pencarian instan berdasarkan file_hash
create index if not exists idx_ocr_cache_file_hash on public.ocr_cache (file_hash);
create index if not exists idx_ocr_cache_hash_page on public.ocr_cache (file_hash, page_number);

-- 2. TABEL PIPELINE PROGRESS (Menyimpan checkpoint agar proses dapat dilanjutkan saat terputus)
create table if not exists public.pipeline_progress (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  file_hash text not null,
  file_name text not null,
  total_pages int not null,
  completed_pages int not null default 0,
  status text not null check (status in ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  last_error text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indeks untuk pipeline_progress
create index if not exists idx_pipeline_progress_hash on public.pipeline_progress (file_hash);
create index if not exists idx_pipeline_progress_status on public.pipeline_progress (status);

-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS) & POLICIES
-- ==============================================================================

-- Aktifkan RLS pada kedua tabel
alter table public.ocr_cache enable row level security;
alter table public.pipeline_progress enable row level security;

-- Kebijakan OCR Cache:
-- Izinkan pembacaan cache untuk semua pengguna (anon & authenticated) agar verifikasi dokumen cepat
drop policy if exists "Allow select ocr_cache" on public.ocr_cache;
create policy "Allow select ocr_cache"
  on public.ocr_cache
  for select
  using (true);

-- Izinkan penyimpanan hasil OCR untuk pengguna
drop policy if exists "Allow insert/update ocr_cache" on public.ocr_cache;
create policy "Allow insert/update ocr_cache"
  on public.ocr_cache
  for all
  using (true)
  with check (true);

-- Kebijakan Pipeline Progress:
drop policy if exists "Allow all pipeline_progress" on public.pipeline_progress;
create policy "Allow all pipeline_progress"
  on public.pipeline_progress
  for all
  using (true)
  with check (true);

-- ==============================================================================
-- OPSIONAL: KEBIJAKAN KHUSUS HANYA UNTUK PENGGUNA YANG LOGIN (AUTHENTICATED ONLY)
-- Aktifkan blok di bawah jika ingin membatasi ketat hanya untuk user login Supabase Auth:
-- ==============================================================================
/*
drop policy if exists "Allow authenticated only ocr_cache" on public.ocr_cache;
create policy "Allow authenticated only ocr_cache"
  on public.ocr_cache
  for all
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
*/
