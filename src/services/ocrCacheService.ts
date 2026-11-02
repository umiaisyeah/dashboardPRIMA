import { getSupabaseClient } from './supabaseService';

export interface CachedOcrRecord {
  file_hash: string;
  page_number: number;
  extracted_text: string;
  extraction_source: 'text_layer' | 'cloud_ai' | 'tesseract' | 'cache';
  confidence: number;
  detected_inks?: string[];
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface PipelineProgressRecord {
  session_id: string;
  file_hash: string;
  file_name: string;
  total_pages: number;
  completed_pages: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  last_error?: string;
}

const LOCAL_OCR_CACHE_PREFIX = 'prima_ocr_cache_';
const LOCAL_PIPELINE_PROGRESS_PREFIX = 'prima_pipe_prog_';

/**
 * Retrieve cached OCR page from Supabase or local storage
 */
export async function getCachedOcrPage(
  fileHash: string,
  pageNumber: number
): Promise<CachedOcrRecord | null> {
  // 1. Try Supabase cloud cache first
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('ocr_cache')
      .select('*')
      .eq('file_hash', fileHash)
      .eq('page_number', pageNumber)
      .maybeSingle();

    if (!error && data) {
      return {
        file_hash: data.file_hash,
        page_number: data.page_number,
        extracted_text: data.extracted_text,
        extraction_source: 'cache',
        confidence: Number(data.confidence) || 0.98,
        detected_inks: data.detected_inks || [],
        metadata: data.metadata || {},
        created_at: data.created_at,
      };
    }
  } catch (err) {
    // Non-blocking: Supabase might be offline or table pending
  }

  // 2. Fallback to browser cache (localStorage / memory)
  try {
    const localKey = `${LOCAL_OCR_CACHE_PREFIX}${fileHash}_p${pageNumber}`;
    const raw = localStorage.getItem(localKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        extraction_source: 'cache',
      };
    }
  } catch (e) {}

  return null;
}

/**
 * Save OCR result into cache (Supabase and local fallback)
 */
export async function saveCachedOcrPage(record: CachedOcrRecord): Promise<void> {
  // 1. Save to local storage for instant offline access
  try {
    const localKey = `${LOCAL_OCR_CACHE_PREFIX}${record.file_hash}_p${record.page_number}`;
    localStorage.setItem(
      localKey,
      JSON.stringify({
        ...record,
        created_at: new Date().toISOString(),
      })
    );
  } catch (e) {}

  // 2. Save to Supabase cloud table
  try {
    const supabase = getSupabaseClient();
    await supabase.from('ocr_cache').upsert(
      {
        file_hash: record.file_hash,
        page_number: record.page_number,
        extracted_text: record.extracted_text,
        extraction_source: record.extraction_source === 'cache' ? 'cloud_ai' : record.extraction_source,
        confidence: record.confidence,
        detected_inks: record.detected_inks || [],
        metadata: record.metadata || {},
        created_at: new Date().toISOString(),
      },
      { onConflict: 'file_hash,page_number' }
    );
  } catch (err) {
    // Non-blocking
  }
}

/**
 * Retrieve all cached pages for a specific file hash
 */
export async function getAllCachedPagesForFile(fileHash: string): Promise<CachedOcrRecord[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('ocr_cache')
      .select('*')
      .eq('file_hash', fileHash)
      .order('page_number', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map((d: any) => ({
        file_hash: d.file_hash,
        page_number: d.page_number,
        extracted_text: d.extracted_text,
        extraction_source: 'cache',
        confidence: Number(d.confidence) || 0.98,
        detected_inks: d.detected_inks || [],
        metadata: d.metadata || {},
      }));
    }
  } catch (err) {}

  return [];
}

/**
 * Save / Update pipeline progress checkpoint
 */
export async function savePipelineProgress(progress: PipelineProgressRecord): Promise<void> {
  try {
    const localKey = `${LOCAL_PIPELINE_PROGRESS_PREFIX}${progress.file_hash}`;
    localStorage.setItem(localKey, JSON.stringify(progress));
  } catch (e) {}

  try {
    const supabase = getSupabaseClient();
    await supabase.from('pipeline_progress').upsert(
      {
        session_id: progress.session_id,
        file_hash: progress.file_hash,
        file_name: progress.file_name,
        total_pages: progress.total_pages,
        completed_pages: progress.completed_pages,
        status: progress.status,
        last_error: progress.last_error || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'session_id' }
    );
  } catch (err) {}
}

/**
 * Get pipeline progress checkpoint for resumable recovery
 */
export async function getPipelineProgress(fileHash: string): Promise<PipelineProgressRecord | null> {
  try {
    const localKey = `${LOCAL_PIPELINE_PROGRESS_PREFIX}${fileHash}`;
    const raw = localStorage.getItem(localKey);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('pipeline_progress')
      .select('*')
      .eq('file_hash', fileHash)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      return data as PipelineProgressRecord;
    }
  } catch (err) {}

  return null;
}

