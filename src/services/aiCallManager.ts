import { AI_QUOTA_CONFIG } from '../config/aiQuotaConfig';

/**
 * Concurrency Queue to throttle simultaneous calls to AI Cloud
 */
class ConcurrencyQueue {
  private activeCount = 0;
  private queue: Array<() => void> = [];
  private maxConcurrent: number;

  constructor(maxConcurrent: number) {
    this.maxConcurrent = maxConcurrent;
  }

  public setMaxConcurrent(max: number) {
    this.maxConcurrent = Math.max(1, max);
  }

  public async acquire(): Promise<void> {
    if (this.activeCount < this.maxConcurrent) {
      this.activeCount++;
      return;
    }

    return new Promise<void>((resolve) => {
      this.queue.push(() => {
        this.activeCount++;
        resolve();
      });
    });
  }

  public release(): void {
    this.activeCount--;
    if (this.queue.length > 0 && this.activeCount < this.maxConcurrent) {
      const next = this.queue.shift();
      if (next) next();
    }
  }
}

const aiQueue = new ConcurrencyQueue(AI_QUOTA_CONFIG.MAX_CONCURRENT_AI_CALLS);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(status: number, message: string): boolean {
  if (AI_QUOTA_CONFIG.RETRY.retryableStatusCodes.includes(status)) {
    return true;
  }
  const lowerMsg = (message || '').toLowerCase();
  return AI_QUOTA_CONFIG.RETRY.retryableErrorKeywords.some((kw) => lowerMsg.includes(kw));
}

export interface AiExtractRequestPayload {
  imageBase64?: string;
  mimeType?: string;
  documentText?: string;
  prompt?: string;
  taskType?: string;
  comparisonItems?: any[];
}

export interface AiExtractResponse {
  success: boolean;
  data?: any;
  analysis?: any;
  extracted?: any;
  warning?: string;
  error?: string;
  modelUsed?: string;
}

/**
 * Execute AI extraction with Concurrency Throttling, Exponential Backoff & Jitter
 */
export async function executeAiExtractWithRetry(
  payload: AiExtractRequestPayload,
  endpoint: string = '/api/ai-extract',
  onRetryNotice?: (attempt: number, delayMs: number) => void
): Promise<AiExtractResponse> {
  await aiQueue.acquire();

  try {
    const { maxRetries, initialDelayMs, backoffMultiplier, jitterMinMs, jitterMaxMs } =
      AI_QUOTA_CONFIG.RETRY;

    let lastError: any = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const status = response.status;
        const json = await response.json().catch(() => ({}));

        if (response.ok && json.success !== false) {
          return json;
        }

        const errMsg = json.error || json.warning || response.statusText || 'AI request failed';

        // Check if error is due to rate limit or temporary server overload
        if (attempt < maxRetries && isRetryableError(status, errMsg)) {
          const jitter = Math.floor(Math.random() * (jitterMaxMs - jitterMinMs + 1)) + jitterMinMs;
          const delay = Math.round(initialDelayMs * Math.pow(backoffMultiplier, attempt) + jitter);

          onRetryNotice?.(attempt + 1, delay);
          console.warn(
            `[AI Cloud Quota Limit] Percobaan ${attempt + 1}/${maxRetries} terkena batas limit (HTTP ${status}). Menunggu ${delay}ms sebelum mencoba ulang...`
          );

          await sleep(delay);
          continue;
        }

        lastError = new Error(errMsg);
      } catch (networkErr: any) {
        lastError = networkErr;
        if (attempt < maxRetries) {
          const jitter = Math.floor(Math.random() * (jitterMaxMs - jitterMinMs + 1)) + jitterMinMs;
          const delay = Math.round(initialDelayMs * Math.pow(backoffMultiplier, attempt) + jitter);

          onRetryNotice?.(attempt + 1, delay);
          await sleep(delay);
          continue;
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Batas kuota AI Cloud tercapai setelah seluruh percobaan retry.',
    };
  } finally {
    aiQueue.release();
  }
}
