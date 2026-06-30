interface RateLimitConfig {
  requestsPerSecond: number;
  burstSize?: number;
}

interface QueuedRequest {
  resolve: () => void;
  reject: (error: Error) => void;
}

export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number;
  private queue: QueuedRequest[] = [];
  private processing = false;

  constructor(config: RateLimitConfig) {
    this.refillRate = config.requestsPerSecond;
    this.maxTokens = config.burstSize || Math.max(1, Math.ceil(config.requestsPerSecond));
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }

  private refillTokens(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const tokensToAdd = elapsed * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  async acquire(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      this.refillTokens();

      if (this.tokens >= 1) {
        this.tokens -= 1;
        const request = this.queue.shift();
        request?.resolve();
      } else {
        // Calculate wait time until next token is available
        const waitTime = ((1 - this.tokens) / this.refillRate) * 1000;
        await this.sleep(Math.ceil(waitTime));
      }
    }

    this.processing = false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// SP-API rate limits by endpoint category
// See: https://developer-docs.amazon.com/sp-api/docs/usage-plans-and-rate-limits
export const SP_API_RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Orders API
  orders: { requestsPerSecond: 0.0167, burstSize: 20 }, // 1 request per minute with burst
  orderItems: { requestsPerSecond: 0.5, burstSize: 30 },

  // Reports API
  createReport: { requestsPerSecond: 0.0167, burstSize: 15 },
  getReports: { requestsPerSecond: 0.0222, burstSize: 10 },
  getReport: { requestsPerSecond: 2, burstSize: 15 },
  getReportDocument: { requestsPerSecond: 0.0222, burstSize: 15 },

  // Sales API
  sales: { requestsPerSecond: 0.5, burstSize: 15 },

  // Inventory API (FBA)
  inventory: { requestsPerSecond: 2, burstSize: 2 },

  // Catalog API
  catalog: { requestsPerSecond: 2, burstSize: 2 },

  // Finances API
  finances: { requestsPerSecond: 0.5, burstSize: 30 },

  // Default fallback
  default: { requestsPerSecond: 1, burstSize: 5 },
};

// Rate limiter instances by category
const rateLimiters: Map<string, RateLimiter> = new Map();

export function getRateLimiter(category: string): RateLimiter {
  if (!rateLimiters.has(category)) {
    const config = SP_API_RATE_LIMITS[category] || SP_API_RATE_LIMITS.default;
    rateLimiters.set(category, new RateLimiter(config));
  }
  return rateLimiters.get(category)!;
}
