import Redis from "ioredis";

// Memory cache fallback for local development or when Redis is offline
class MemoryCache {
  private store = new Map<string, { value: string; expiresAt: number }>();

  get(key: string): string | null {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  set(key: string, value: string, ttlSeconds = 300): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  del(key: string): void {
    this.store.delete(key);
  }

  delPattern(pattern: string): void {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  increment(key: string, ttlSeconds = 60): number {
    const current = this.get(key);
    const count = current ? parseInt(current, 10) + 1 : 1;
    this.set(key, count.toString(), ttlSeconds);
    return count;
  }
}

const memoryFallback = new MemoryCache();
let redisClient: Redis | null = null;

if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      lazyConnect: true,
    });

    redisClient.on("error", (err) => {
      console.warn("Redis client error, continuing with in-memory fallback:", err.message);
    });
  } catch {
    console.warn("Redis initialization failed, continuing with in-memory fallback");
    redisClient = null;
  }
}

export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    try {
      if (redisClient && redisClient.status === "ready") {
        const raw = await redisClient.get(key);
        return raw ? (JSON.parse(raw) as T) : null;
      }
    } catch {
      // Fallback on error
    }

    const raw = memoryFallback.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  },

  async set(key: string, data: unknown, ttlSeconds = 300): Promise<void> {
    const payload = JSON.stringify(data);
    try {
      if (redisClient && redisClient.status === "ready") {
        await redisClient.set(key, payload, "EX", ttlSeconds);
        return;
      }
    } catch {
      // Fallback on error
    }

    memoryFallback.set(key, payload, ttlSeconds);
  },

  async del(key: string): Promise<void> {
    try {
      if (redisClient && redisClient.status === "ready") {
        await redisClient.del(key);
      }
    } catch {
      // Fallback
    }
    memoryFallback.del(key);
  },

  async invalidatePrefix(prefix: string): Promise<void> {
    try {
      if (redisClient && redisClient.status === "ready") {
        const keys = await redisClient.keys(`${prefix}*`);
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
      }
    } catch {
      // Fallback
    }
    memoryFallback.delPattern(`${prefix}*`);
  },

  /**
   * Rate limiter helper: checks requests count within a window
   */
  async checkRateLimit(
    identifier: string,
    limit: number,
    windowSeconds = 60
  ): Promise<{ allowed: boolean; remaining: number }> {
    const key = `ratelimit:${identifier}`;
    let count = 1;

    try {
      if (redisClient && redisClient.status === "ready") {
        const current = await redisClient.incr(key);
        if (current === 1) {
          await redisClient.expire(key, windowSeconds);
        }
        count = current;
      } else {
        count = memoryFallback.increment(key, windowSeconds);
      }
    } catch {
      count = memoryFallback.increment(key, windowSeconds);
    }

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
    };
  },
};

export default cacheService;
