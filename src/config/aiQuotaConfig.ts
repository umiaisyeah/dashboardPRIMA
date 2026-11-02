/**
 * Configuration for AI Cloud Quota & OCR Optimization
 * Mengatur laju pemanggilan AI Cloud, ambang batas teks digital, dan parameter kompresi.
 */

export const AI_QUOTA_CONFIG = {
  /**
   * Batas maksimal pemanggilan paralel ke AI Cloud secara bersamaan.
   * Nilai ini mudah diubah di satu konstanta untuk menyesuaikan batas kuota API.
   */
  MAX_CONCURRENT_AI_CALLS: 2,

  /**
   * Parameter retry dengan exponential backoff dan jitter.
   */
  RETRY: {
    maxRetries: 3,
    initialDelayMs: 1500,
    backoffMultiplier: 2,
    jitterMinMs: 200,
    jitterMaxMs: 800,
    /**
     * Pola error yang menandakan limit kuota (rate limit atau server sibuk)
     */
    retryableStatusCodes: [429, 500, 502, 503, 504],
    retryableErrorKeywords: [
      'rate limit',
      'quota',
      '429',
      'resource_exhausted',
      'too many requests',
      'overloaded',
      'temporarily unavailable',
    ],
  },

  /**
   * Optimasi dimensi canvas dan kompresi JPEG sebelum dikirim ke AI Cloud.
   * Resolusi 1600px sudah sangat tajam untuk membaca teks tabel dan tulisan tangan,
   * sekaligus menghemat 70-80% ukuran transfer data dan token gambar.
   */
  IMAGE_OPTIMIZATION: {
    maxDimension: 1600,
    jpegQuality: 0.82,
  },

  /**
   * Kriteria kelayakan text layer digital (pdf.js).
   * Jika teks halaman melebihi ambang batas ini dan terbaca wajar,
   * AI Cloud dan Tesseract sama sekali tidak akan dipanggil.
   */
  TEXT_LAYER_CRITERIA: {
    minCharacters: 80,
    minWords: 10,
    minReadabilityRatio: 0.65,
  },

  /**
   * Bahasa untuk Tesseract OCR lokal cadangan (Indonesia + Inggris).
   */
  TESSERACT_LANGUAGES: 'ind+eng',
};
