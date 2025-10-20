import { DatabaseStorage } from '../storage';
import { IpPools as IpPool } from '../../shared/schema';

export interface HealthCheckResult {
  poolId: string;
  success: boolean;
  responseTime: number; // milliseconds
  ipAddress: string | null;
  error?: string;
  timestamp: Date;
}

export interface HealthMetrics {
  avgResponseTime: number;
  successRate: number;
  totalChecks: number;
  failedChecks: number;
  lastCheckTime: Date;
}

export class IpPoolHealthService {
  private storage: DatabaseStorage;

  constructor(storage: DatabaseStorage) {
    this.storage = storage;
  }

  /**
   * Test connectivity for a specific IP pool
   * Returns health metrics and updates pool health score
   */
  async checkIpPoolHealth(poolId: string): Promise<HealthCheckResult> {
    const pool = await this.storage.getIpPool(poolId);
    
    if (!pool) {
      return {
        poolId,
        success: false,
        responseTime: 0,
        ipAddress: null,
        error: 'IP Pool not found',
        timestamp: new Date(),
      };
    }

    // Test connection based on pool type
    const result = await this.testConnection(pool);
    
    // Update health score based on result
    await this.updateHealthScore(pool, result);
    
    return result;
  }

  /**
   * Test connection for a pool based on its type
   */
  private async testConnection(pool: IpPool): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      let testResult: { success: boolean; ipAddress: string | null; error?: string };

      switch (pool.type) {
        case 'usb_4g':
          testResult = await this.testUsb4gConnection(pool);
          break;
        case 'proxy_api':
          testResult = await this.testProxyApiConnection(pool);
          break;
        case 'cloud_worker':
          testResult = await this.testCloudWorkerConnection(pool);
          break;
        default:
          testResult = { success: false, ipAddress: null, error: 'Unknown pool type' };
      }

      const responseTime = Date.now() - startTime;

      return {
        poolId: String(pool.id),
        success: testResult.success,
        responseTime,
        ipAddress: testResult.ipAddress,
        error: testResult.error,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        poolId: String(pool.id),
        success: false,
        responseTime: Date.now() - startTime,
        ipAddress: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Test USB 4G dongle connection via local satellite agent
   */
  private async testUsb4gConnection(pool: IpPool): Promise<{ success: boolean; ipAddress: string | null; error?: string }> {
    try {
      // Call satellite agent endpoint to check USB dongle status
      const endpoint = (pool.config as any).usb_4g?.control_endpoint;
      const authToken = (pool.config as any).usb_4g?.auth_token;
      
      if (!endpoint || !authToken) {
        return { success: false, ipAddress: null, error: 'Missing endpoint or auth token' };
      }

      const response = await fetch(`${endpoint}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        signal: AbortSignal.timeout(10000), // 10s timeout
      });

      if (!response.ok) {
        return { success: false, ipAddress: null, error: `HTTP ${response.status}` };
      }

      const data: any = await response.json();
      return {
        success: data.online === true,
        ipAddress: data.currentIp || pool.currentIp,
      };
    } catch (error) {
      return {
        success: false,
        ipAddress: null,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  /**
   * Test Proxy API connection by calling provider's test/health endpoint
   */
  private async testProxyApiConnection(pool: IpPool): Promise<{ success: boolean; ipAddress: string | null; error?: string }> {
    try {
      // For proxy APIs, test the provider's health/test endpoint
      const apiEndpoint = (pool.config as any).proxy_api?.api_endpoint;
      const apiKey = (pool.config as any).proxy_api?.api_key;
      const testEndpoint = (pool.config as any).proxy_api?.test_endpoint; // Optional dedicated test endpoint
      
      if (!apiEndpoint || !apiKey) {
        return { success: false, ipAddress: null, error: 'Missing endpoint or API key' };
      }

      // Use dedicated test endpoint if provided, otherwise use main endpoint + /test or /health
      const healthUrl = testEndpoint || `${apiEndpoint}/test`;

      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-API-Key': apiKey, // Some providers use this header
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        return { success: false, ipAddress: null, error: `Provider test failed: HTTP ${response.status}` };
      }

      const data: any = await response.json();
      
      // Parse provider-specific response format
      // Common formats: { status: "ok", ip: "x.x.x.x" } or { success: true, ip_address: "x.x.x.x" }
      const isHealthy = data.status === 'ok' || data.status === 'active' || data.success === true;
      const ipAddress = data.ip || data.ip_address || data.current_ip || pool.currentIp;

      return {
        success: isHealthy,
        ipAddress,
        error: isHealthy ? undefined : 'Provider reports unhealthy status',
      };
    } catch (error) {
      return {
        success: false,
        ipAddress: null,
        error: error instanceof Error ? error.message : 'Proxy provider test failed',
      };
    }
  }

  /**
   * Test Cloud Worker connection
   */
  private async testCloudWorkerConnection(pool: IpPool): Promise<{ success: boolean; ipAddress: string | null; error?: string }> {
    try {
      // Call cloud worker health endpoint
      const workerUrl = (pool.config as any).cloud_worker?.worker_url;
      const apiKey = (pool.config as any).cloud_worker?.api_key;
      
      if (!workerUrl) {
        return { success: false, ipAddress: null, error: 'Missing endpoint' };
      }

      const response = await fetch(`${workerUrl}/health`, {
        method: 'GET',
        headers: apiKey ? {
          'Authorization': `Bearer ${apiKey}`,
        } : {},
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        return { success: false, ipAddress: null, error: `HTTP ${response.status}` };
      }

      const data: any = await response.json();
      return {
        success: data.status === 'healthy',
        ipAddress: data.ip || pool.currentIp,
      };
    } catch (error) {
      return {
        success: false,
        ipAddress: null,
        error: error instanceof Error ? error.message : 'Worker test failed',
      };
    }
  }

  /**
   * Update pool health score based on check result
   * Health score ranges from 0-100
   */
  private async updateHealthScore(pool: IpPool, result: HealthCheckResult): Promise<void> {
    const currentHealth = pool.healthScore || 50; // Default 50 if not set
    let newHealth = currentHealth;

    if (result.success) {
      // Success: Increase health, but cap at 100
      // Faster response = bigger boost
      const responseBonus = result.responseTime < 1000 ? 10 : result.responseTime < 3000 ? 5 : 2;
      newHealth = Math.min(100, currentHealth + responseBonus);
    } else {
      // Failure: Decrease health significantly
      newHealth = Math.max(0, currentHealth - 20);
    }

    // Update pool status based on health
    let status = pool.status;
    if (newHealth >= 70) {
      status = 'active';
    } else if (newHealth >= 30) {
      status = 'inactive';
    } else {
      status = 'failed';
    }

    // Update pool with new health and IP if available
    await this.storage.updateIpPool(String(pool.id), {
      healthScore: newHealth,
      status,
      currentIp: result.ipAddress || pool.currentIp,
    } as any);

    console.log(`🏥 Health Check for Pool #${pool.id} (${pool.name}): ${newHealth}/100 (${result.success ? '✅' : '❌'})`);
  }

  /**
   * Calculate health metrics for a pool based on session history
   */
  async getHealthMetrics(poolId: string): Promise<HealthMetrics> {
    const sessions = await this.storage.getIpPoolSessionsByPoolId(poolId);
    
    if (sessions.length === 0) {
      return {
        avgResponseTime: 0,
        successRate: 0,
        totalChecks: 0,
        failedChecks: 0,
        lastCheckTime: new Date(),
      };
    }

    const totalChecks = sessions.length;
    const failedChecks = sessions.filter((s: any) => (s.failCount || 0) > 0).length;
    const successRate = ((totalChecks - failedChecks) / totalChecks) * 100;

    // Calculate avg response time from successful sessions
    const successfulSessions = sessions.filter((s: any) => (s.postsCount || 0) > 0);
    const avgResponseTime = successfulSessions.length > 0
      ? successfulSessions.reduce((sum: number, s: any) => sum + (s.averagePostDuration || 0), 0) / successfulSessions.length
      : 0;

    return {
      avgResponseTime,
      successRate,
      totalChecks,
      failedChecks,
      lastCheckTime: (sessions as any)[0]?.sessionEnd || new Date(),
    };
  }

  /**
   * Check health of all active pools
   */
  async checkAllActivePools(): Promise<HealthCheckResult[]> {
    const pools = await this.storage.getIpPools({ isEnabled: true });
    const results: HealthCheckResult[] = [];

    for (const pool of pools) {
      const result = await this.checkIpPoolHealth(String(pool.id));
      results.push(result);
    }

    return results;
  }
}

// Singleton instance
let healthServiceInstance: IpPoolHealthService | null = null;

export function getHealthService(storage: DatabaseStorage): IpPoolHealthService {
  if (!healthServiceInstance) {
    healthServiceInstance = new IpPoolHealthService(storage);
  }
  return healthServiceInstance;
}
