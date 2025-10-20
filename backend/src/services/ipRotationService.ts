import { DatabaseStorage } from '../storage';
import { IpPools as IpPool } from '../../shared/schema';

export interface RotationOptions {
  poolId: string;
  trigger: 'manual' | 'batch_threshold' | 'time_interval' | 'error_recovery' | 'health_degradation';
  reason?: string;
  force?: boolean;
}

export interface RotationResult {
  success: boolean;
  poolId: string;
  oldIp: string | null;
  newIp: string | null;
  rotatedAt: Date;
  error?: string;
}

export class IpRotationService {
  private storage: DatabaseStorage;
  private readonly BATCH_THRESHOLD = 15; // Rotate after 15 posts
  private readonly TIME_THRESHOLD_HOURS = 2; // Rotate after 2 hours
  private readonly MAX_CONSECUTIVE_FAILURES = 3; // Rotate after 3 failures

  constructor(storage: DatabaseStorage) {
    this.storage = storage;
  }

  /**
   * Execute IP rotation for a pool
   */
  async rotateIp(options: RotationOptions): Promise<RotationResult> {
    const pool = await this.storage.getIpPool(options.poolId);
    
    if (!pool) {
      return {
        success: false,
        poolId: options.poolId,
        oldIp: null,
        newIp: null,
        rotatedAt: new Date(),
        error: 'IP Pool not found',
      };
    }

    // Check if rotation is needed (unless forced)
    if (!options.force) {
      const needsRotation = await this.checkIfRotationNeeded(pool, options.trigger);
      if (!needsRotation) {
        console.log(`⏭️ Rotation skipped for Pool #${pool.id} - not needed yet`);
        return {
          success: true,
          poolId: String(pool.id),
          oldIp: pool.currentIp,
          newIp: pool.currentIp,
          rotatedAt: new Date(),
        };
      }
    }

    const oldIp = pool.currentIp;
    
    try {
      // Execute rotation based on pool type
      const newIp = await this.executeRotationByType(pool);
      
      // Update pool with new IP
      await this.storage.updateIpPool(String(pool.id), {
        currentIp: newIp,
        lastRotatedAt: new Date(),
      });

      // Log rotation
      await this.storage.createIpRotationLog({
        ipPoolId: String(pool.id),
        oldIp,
        newIp,
        rotationTrigger: options.trigger,
        reason: options.reason || this.getDefaultReason(options.trigger),
        success: true,
        rotatedAt: new Date(),
      });

      console.log(`🔄 IP Rotated for Pool #${pool.id} (${pool.name}): ${oldIp} → ${newIp}`);

      return {
        success: true,
        poolId: String(pool.id),
        oldIp,
        newIp,
        rotatedAt: new Date(),
      };
    } catch (error) {
      // Log failed rotation
      await this.storage.createIpRotationLog({
        ipPoolId: String(pool.id),
        oldIp,
        newIp: null,
        rotationTrigger: options.trigger,
        reason: options.reason || this.getDefaultReason(options.trigger),
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        rotatedAt: new Date(),
      });

      return {
        success: false,
        poolId: String(pool.id),
        oldIp,
        newIp: null,
        rotatedAt: new Date(),
        error: error instanceof Error ? error.message : 'Rotation failed',
      };
    }
  }

  /**
   * Check if rotation is needed for a pool
   */
  private async checkIfRotationNeeded(pool: IpPool, trigger: string): Promise<boolean> {
    switch (trigger) {
      case 'batch_threshold':
        return await this.checkBatchThreshold(pool);
      case 'time_interval':
        return this.checkTimeInterval(pool);
      case 'error_recovery':
      case 'health_degradation':
        return true; // Always rotate for errors or health issues
      case 'manual':
        return true; // Manual triggers are always allowed
      default:
        return false;
    }
  }

  /**
   * Check if batch threshold reached (posts per IP)
   */
  private async checkBatchThreshold(pool: IpPool): Promise<boolean> {
    // Get active session for this pool
    const sessions = await this.storage.getIpPoolSessionsByPoolId(String(pool.id));
    
    if (sessions.length === 0) {
      return false; // No session yet
    }

    const activeSession = sessions.find((s: any) => !s.sessionEnd);
    if (!activeSession) {
      return false; // No active session
    }

    const totalPosts = (Number((activeSession as any).postsCount) || 0) + (Number((activeSession as any).failCount) || 0);
    return totalPosts >= this.BATCH_THRESHOLD;
  }

  /**
   * Check if time interval reached
   */
  private checkTimeInterval(pool: IpPool): boolean {
    if (!pool.lastRotatedAt) {
      return true; // Never rotated, needs rotation
    }

    const hoursSinceRotation = (Date.now() - new Date(pool.lastRotatedAt).getTime()) / (1000 * 60 * 60);
    return hoursSinceRotation >= this.TIME_THRESHOLD_HOURS;
  }

  /**
   * Execute rotation based on pool type
   */
  private async executeRotationByType(pool: IpPool): Promise<string> {
    switch (pool.type) {
      case 'usb_4g':
        return await this.rotateUsb4g(pool);
      case 'proxy_api':
        return await this.rotateProxyApi(pool);
      case 'cloud_worker':
        return await this.rotateCloudWorker(pool);
      default:
        throw new Error(`Unsupported pool type: ${pool.type}`);
    }
  }

  /**
   * Rotate USB 4G dongle IP via airplane mode
   */
  private async rotateUsb4g(pool: IpPool): Promise<string> {
    const endpoint = (pool.config as any).usb_4g?.control_endpoint;
    const authToken = (pool.config as any).usb_4g?.auth_token;
    
    if (!endpoint || !authToken) {
      throw new Error('Missing endpoint or auth token for USB 4G rotation');
    }

    // Call satellite agent to trigger airplane mode cycle
    const response = await fetch(`${endpoint}/rotate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method: 'airplane_mode',
        duration: 10, // 10 seconds airplane mode
      }),
      signal: AbortSignal.timeout(30000), // 30s timeout
    });

    if (!response.ok) {
      throw new Error(`USB 4G rotation failed: HTTP ${response.status}`);
    }

    const data: any = await response.json();
    
    if (!data.newIp) {
      throw new Error('USB 4G rotation completed but no new IP returned');
    }

    return data.newIp;
  }

  /**
   * Rotate Proxy API IP by requesting new session
   */
  private async rotateProxyApi(pool: IpPool): Promise<string> {
    const apiEndpoint = (pool.config as any).proxy_api?.api_endpoint;
    const apiKey = (pool.config as any).proxy_api?.api_key;
    
    if (!apiEndpoint || !apiKey) {
      throw new Error('Missing endpoint or auth token for Proxy API rotation');
    }

    // Call proxy API to get new session
    const response = await fetch(`${apiEndpoint}/api/refresh-session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`Proxy API rotation failed: HTTP ${response.status}`);
    }

    const data: any = await response.json();
    
    if (!data.ip && !data.newIp) {
      throw new Error('Proxy API rotation completed but no new IP returned');
    }

    return data.ip || data.newIp;
  }

  /**
   * Rotate Cloud Worker IP (typically by deploying to new region/worker)
   */
  private async rotateCloudWorker(pool: IpPool): Promise<string> {
    const workerUrl = (pool.config as any).cloud_worker?.worker_url;
    const apiKey = (pool.config as any).cloud_worker?.api_key;
    
    if (!workerUrl) {
      throw new Error('Missing endpoint for Cloud Worker rotation');
    }

    // Call cloud worker to redeploy or switch region
    const response = await fetch(`${workerUrl}/rotate`, {
      method: 'POST',
      headers: apiKey ? {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      } : {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`Cloud Worker rotation failed: HTTP ${response.status}`);
    }

    const data: any = await response.json();
    
    if (!data.newIp && !data.ip) {
      throw new Error('Cloud Worker rotation completed but no new IP returned');
    }

    return data.newIp || data.ip;
  }

  /**
   * Auto-rotate pools that need rotation based on criteria
   */
  async autoRotatePools(): Promise<RotationResult[]> {
    const pools = await this.storage.getIpPools({ isEnabled: true, status: 'active' });
    const results: RotationResult[] = [];

    for (const pool of pools) {
      // Check batch threshold
      if (await this.checkBatchThreshold(pool)) {
        const result = await this.rotateIp({
          poolId: String(pool.id),
          trigger: 'batch_threshold',
          reason: `Reached batch threshold of ${this.BATCH_THRESHOLD} posts`,
        });
        results.push(result);
        continue;
      }

      // Check time interval
      if (this.checkTimeInterval(pool)) {
        const result = await this.rotateIp({
          poolId: String(pool.id),
          trigger: 'time_interval',
          reason: `Exceeded ${this.TIME_THRESHOLD_HOURS} hours since last rotation`,
        });
        results.push(result);
        continue;
      }

      // Check health degradation
      if (pool.healthScore && pool.healthScore < 30) {
        const result = await this.rotateIp({
          poolId: String(pool.id),
          trigger: 'health_degradation',
          reason: `Health score dropped to ${pool.healthScore}`,
        });
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Get default reason message for rotation trigger
   */
  private getDefaultReason(trigger: string): string {
    const reasons: Record<string, string> = {
      manual: 'Manual rotation triggered by admin',
      batch_threshold: 'Batch posting threshold reached',
      time_interval: 'Time interval threshold reached',
      error_recovery: 'Recovering from posting errors',
      health_degradation: 'IP pool health degraded',
    };
    return reasons[trigger] || 'Unknown reason';
  }

  /**
   * Handle rotation with exponential backoff on errors
   */
  async rotateWithBackoff(poolId: string, maxAttempts: number = 3): Promise<RotationResult> {
    const backoffDelays = [5000, 10000, 20000]; // 5s, 10s, 20s
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await this.rotateIp({
          poolId,
          trigger: 'error_recovery',
          reason: `Rotation attempt ${attempt + 1}/${maxAttempts}`,
        });

        if (result.success) {
          return result;
        }

        lastError = new Error(result.error || 'Rotation failed');
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
      }

      // Wait before retry (unless last attempt)
      if (attempt < maxAttempts - 1) {
        const delay = backoffDelays[attempt] || 20000;
        console.log(`⏳ Rotation failed for Pool #${poolId}, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // All attempts failed
    return {
      success: false,
      poolId,
      oldIp: null,
      newIp: null,
      rotatedAt: new Date(),
      error: lastError?.message || 'All rotation attempts failed',
    };
  }
}

// Singleton instance
let rotationServiceInstance: IpRotationService | null = null;

export function getRotationService(storage: DatabaseStorage): IpRotationService {
  if (!rotationServiceInstance) {
    rotationServiceInstance = new IpRotationService(storage);
  }
  return rotationServiceInstance;
}
