/**
 * Hash Service: Menghitung SHA-256 hash untuk file dan halaman dokumen
 * Menggunakan Web Crypto API bawaan browser untuk kecepatan maksimal (non-blocking).
 */

export async function computeSha256(data: ArrayBuffer | Uint8Array | string): Promise<string> {
  try {
    let buffer: ArrayBuffer;

    if (typeof data === 'string') {
      const encoder = new TextEncoder();
      buffer = encoder.encode(data).buffer as ArrayBuffer;
    } else if (data instanceof Uint8Array) {
      buffer = data.buffer as ArrayBuffer;
    } else {
      buffer = data as ArrayBuffer;
    }

    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    // Fallback simple fast hash if crypto.subtle is unavailable (rare)
    return fallbackHash(buffer);
  } catch (err) {
    console.warn('Error computing SHA-256 hash, using fallback:', err);
    return fallbackHash(data);
  }
}

/**
 * Menghitung SHA-256 dari objek File
 */
export async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return computeSha256(buffer);
}

/**
 * Menghasilkan hash unik per halaman: fileHash + pageNumber
 */
export function getPageHashKey(fileHash: string, pageNumber: number): string {
  return `${fileHash}_p${pageNumber}`;
}

function fallbackHash(data: any): string {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'fb_' + Math.abs(hash).toString(16) + '_' + str.length;
}
