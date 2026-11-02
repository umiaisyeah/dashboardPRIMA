import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DocumentPackage } from '../types';

export const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  'https://fiowsnbkottymnparejs.supabase.co';

export const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpb3dzbmJrb3R0eW1ucGFyZWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2MDExNTYsImV4cCI6MjEwOTE3NzE1Nn0.eCk8SGQVfILp7a0i_ymtCHlY_69H3YsuedwLVdV9W2E';

export const SUPABASE_SETUP_SQL = `-- Skema Tabel Dokumen BAPL untuk Supabase Cloud
CREATE TABLE IF NOT EXISTS public.document_packages (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    project_code TEXT,
    project_name TEXT,
    bapl_files JSONB DEFAULT '[]'::jsonb,
    excel_file_name TEXT,
    supporting_files JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'COMPLETED',
    result JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.document_packages ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Baca, Tambah, Edit, dan Hapus Publik (Anon Key)
CREATE POLICY "Allow anon select" ON public.document_packages FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON public.document_packages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update" ON public.document_packages FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete" ON public.document_packages FOR DELETE USING (true);
`;

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!clientInstance) {
    clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return clientInstance;
}

export interface SupabaseHealth {
  connected: boolean;
  latencyMs: number;
  tableReady: boolean;
  error?: string;
  url: string;
  projectId: string;
  rowCount?: number;
}

/**
 * Check connectivity and table status in Supabase.
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealth> {
  const startTime = Date.now();
  const urlParts = SUPABASE_URL.split('//')[1]?.split('.')[0] || 'fiowsnbkottymnparejs';

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('document_packages')
      .select('id', { count: 'exact', head: true });

    const latencyMs = Date.now() - startTime;

    if (error) {
      // If table doesn't exist yet (404/PGRST204)
      if (
        error.code === 'PGRST204' ||
        error.message?.includes('schema cache') ||
        error.message?.includes('does not exist')
      ) {
        return {
          connected: true,
          latencyMs,
          tableReady: false,
          error: "Tabel 'document_packages' belum dibuat di Supabase.",
          url: SUPABASE_URL,
          projectId: urlParts,
          rowCount: 0,
        };
      }

      return {
        connected: false,
        latencyMs,
        tableReady: false,
        error: error.message,
        url: SUPABASE_URL,
        projectId: urlParts,
      };
    }

    return {
      connected: true,
      latencyMs,
      tableReady: true,
      url: SUPABASE_URL,
      projectId: urlParts,
      rowCount: typeof data === 'number' ? data : 0,
    };
  } catch (err: any) {
    return {
      connected: false,
      latencyMs: Date.now() - startTime,
      tableReady: false,
      error: err.message || 'Koneksi ke Supabase gagal.',
      url: SUPABASE_URL,
      projectId: urlParts,
    };
  }
}

/**
 * Fetch all document packages from Supabase Cloud.
 */
export async function fetchPackagesFromSupabase(): Promise<{
  success: boolean;
  packages: DocumentPackage[];
  error?: string;
}> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('document_packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, packages: [], error: error.message };
    }

    const mapped: DocumentPackage[] = (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      projectCode: row.project_code || '',
      projectName: row.project_name || '',
      baplFiles: row.bapl_files || [],
      excelFileName: row.excel_file_name || '',
      supportingFiles: row.supporting_files || [],
      createdAt: row.created_at || new Date().toISOString(),
      status: row.status || 'COMPLETED',
      result: row.result || undefined,
    }));

    return { success: true, packages: mapped };
  } catch (err: any) {
    return { success: false, packages: [], error: err.message };
  }
}

/**
 * Save or update a single package in Supabase.
 */
export async function saveSinglePackageToSupabase(pkg: DocumentPackage): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = getSupabaseClient();
    const row = {
      id: pkg.id,
      title: pkg.title,
      project_code: pkg.projectCode || '',
      project_name: pkg.projectName || '',
      bapl_files: pkg.baplFiles || [],
      excel_file_name: pkg.excelFileName || '',
      supporting_files: pkg.supportingFiles || [],
      created_at: pkg.createdAt,
      status: pkg.status,
      result: pkg.result || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('document_packages').upsert(row);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Upload all local packages to Supabase.
 */
export async function syncAllPackagesToSupabase(packages: DocumentPackage[]): Promise<{
  success: boolean;
  count: number;
  error?: string;
}> {
  try {
    const supabase = getSupabaseClient();
    const rows = packages.map((pkg) => ({
      id: pkg.id,
      title: pkg.title,
      project_code: pkg.projectCode || '',
      project_name: pkg.projectName || '',
      bapl_files: pkg.baplFiles || [],
      excel_file_name: pkg.excelFileName || '',
      supporting_files: pkg.supportingFiles || [],
      created_at: pkg.createdAt,
      status: pkg.status,
      result: pkg.result || null,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('document_packages').upsert(rows);

    if (error) {
      return { success: false, count: 0, error: error.message };
    }
    return { success: true, count: rows.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message };
  }
}

/**
 * Delete a package from Supabase.
 */
export async function deletePackageFromSupabase(pkgId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('document_packages').delete().eq('id', pkgId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
