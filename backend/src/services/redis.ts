import Redis from 'ioredis';

/**
 * Redis Client Singleton for Queue Management
 * Used for distributed job queue across multiple serverless workers
 * With graceful degradation when Redis is not available
 */
class RedisService {
  private static instance: Redis | null = null;
  private static isConnected = false;
  private static isAvailable = false;
  private static hasWarned = false;

  /**
   * Get Redis client instance (singleton pattern)
   * Returns null if Redis is not configured (graceful degradation)
   */
  static getInstance(): Redis | null {
    if (!this.instance) {
      const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;
      
      if (!redisUrl) {
        if (!this.hasWarned) {
          console.warn('⚠️ Redis not configured - running without cache/queue support');
          this.hasWarned = true;
        }
        this.isAvailable = false;
        return null;
      }

      try {
        this.instance = new Redis(redisUrl, {
          enableReadyCheck: false,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          keepAlive: 30000,
          connectionName: 'satellite-brain',
          retryStrategy(times) {
            if (times > 3) {
              console.warn('⚠️ Redis connection failed after 3 retries - running without cache');
              return null;
            }
            return Math.min(times * 1000, 3000);
          }
        });

        this.instance.on('connect', () => {
          console.log('✅ Redis connected');
          this.isConnected = true;
          this.isAvailable = true;
        });
        
        this.instance.on('error', (err) => {
          if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
            if (!this.hasWarned) {
              console.warn('⚠️ Redis unavailable - running without cache/queue support');
              this.hasWarned = true;
            }
          } else {
            console.error('❌ Redis error:', err.message);
          }
          this.isConnected = false;
        });
        
        this.instance.on('close', () => {
          if (this.isConnected) {
            console.log('🔒 Redis connection closed');
          }
          this.isConnected = false;
        });
        
        this.isAvailable = true;
      } catch (error) {
        console.warn('⚠️ Failed to initialize Redis - running without cache:', error instanceof Error ? error.message : 'Unknown error');
        this.instance = null;
        this.isAvailable = false;
      }
    }

    return this.instance;
  }

  /**
   * Check if Redis is connected and healthy
   */
  static async isHealthy(): Promise<boolean> {
    try {
      const redis = this.getInstance();
      if (!redis) return false;
      await redis.ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if Redis is available (configured)
   */
  static isRedisAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Get connection status
   */
  static getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Graceful shutdown
   */
  static async disconnect(): Promise<void> {
    if (this.instance) {
      await this.instance.quit();
      this.instance = null;
      this.isConnected = false;
      console.log('🔒 Redis disconnected gracefully');
    }
  }

  /**
   * Get Redis info for monitoring
   */
  static async getInfo(): Promise<Record<string, any>> {
    try {
      const redis = this.getInstance();
      if (!redis) {
        return {
          connected: false,
          available: false,
          message: 'Redis not configured'
        };
      }
      
      const info = await redis.info();
      const memoryInfo = await redis.info('memory');
      
      return {
        connected: this.isConnected,
        available: this.isAvailable,
        uptime: this.extractInfoValue(info, 'uptime_in_seconds'),
        usedMemory: this.extractInfoValue(memoryInfo, 'used_memory_human'),
        connectedClients: this.extractInfoValue(info, 'connected_clients'),
        version: this.extractInfoValue(info, 'redis_version')
      };
    } catch (error) {
      return {
        connected: false,
        available: this.isAvailable,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static extractInfoValue(info: string, key: string): string | null {
    const match = info.match(new RegExp(`${key}:(.+)`));
    return match ? match[1].trim() : null;
  }
}

export default RedisService;