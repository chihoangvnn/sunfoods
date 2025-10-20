import { DatabaseStorage } from '../storage';
import { IpPools as IpPool, ScheduledPosts as ScheduledPost } from '../../shared/schema';

export interface AssignmentOptions {
  platform: string;
  priority?: 'high' | 'normal' | 'low';
  excludePoolIds?: string[];
}

export interface AssignmentResult {
  pool: IpPool | null;
  reason: string;
  alternatives?: IpPool[];
}

export interface PoolScore {
  pool: IpPool;
  score: number;
  factors: {
    health: number;
    load: number;
    cost: number;
    performance: number;
  };
}

export class IpAssignmentService {
  private storage: DatabaseStorage;
  
  // Scoring weights (total = 100)
  private readonly WEIGHT_HEALTH = 40;
  private readonly WEIGHT_LOAD = 30;
  private readonly WEIGHT_COST = 15;
  private readonly WEIGHT_PERFORMANCE = 15;

  // Health threshold: pools below this score are considered unhealthy and excluded
  private readonly MINIMUM_HEALTH_THRESHOLD = 30;

  constructor(storage: DatabaseStorage) {
    this.storage = storage;
  }

  /**
   * Assign best IP pool to a scheduled post
   */
  async assignIpPool(postId: string, options: AssignmentOptions): Promise<AssignmentResult> {
    // Get all active and enabled pools
    const pools = await this.storage.getIpPools({ 
      isEnabled: true,
      status: 'active',
    });

    if (pools.length === 0) {
      return {
        pool: null,
        reason: 'No active IP pools available',
      };
    }

    // Filter out excluded pools
    const availablePools = options.excludePoolIds && options.excludePoolIds.length > 0
      ? pools.filter(p => !options.excludePoolIds!.includes(String(p.id)))
      : pools;

    if (availablePools.length === 0) {
      return {
        pool: null,
        reason: 'All pools are excluded or unavailable',
        alternatives: pools.slice(0, 3), // Suggest alternatives
      };
    }

    // Filter out unhealthy pools (below minimum health threshold)
    const healthyPools = availablePools.filter(p => {
      const healthScore = p.healthScore ?? 50; // Default to 50 if not set
      return healthScore >= this.MINIMUM_HEALTH_THRESHOLD;
    });

    if (healthyPools.length === 0) {
      console.warn(`⚠️ No healthy IP pools available (all below threshold ${this.MINIMUM_HEALTH_THRESHOLD}). Post #${postId} will proceed without IP pool.`);
      return {
        pool: null,
        reason: `All pools are unhealthy (health score < ${this.MINIMUM_HEALTH_THRESHOLD})`,
        alternatives: availablePools.slice(0, 3), // Show unhealthy pools as alternatives for manual review
      };
    }

    // Score all healthy pools
    const scoredPools = await this.scoreAllPools(healthyPools);
    
    // Sort by score (highest first)
    scoredPools.sort((a, b) => b.score - a.score);

    // Select best pool
    const bestPool = scoredPools[0];

    console.log(`🎯 IP Assignment for Post #${postId}: Selected Pool #${bestPool.pool.id} (${bestPool.pool.name}) - Score: ${bestPool.score.toFixed(2)}`);

    return {
      pool: bestPool.pool,
      reason: `Best match with score ${bestPool.score.toFixed(2)} (Health: ${bestPool.factors.health}, Load: ${bestPool.factors.load})`,
      alternatives: scoredPools.slice(1, 4).map(sp => sp.pool), // Top 3 alternatives
    };
  }

  /**
   * Score all pools based on multiple factors
   */
  private async scoreAllPools(pools: IpPool[]): Promise<PoolScore[]> {
    const scoredPools: PoolScore[] = [];

    for (const pool of pools) {
      const score = await this.calculatePoolScore(pool);
      scoredPools.push(score);
    }

    return scoredPools;
  }

  /**
   * Calculate comprehensive score for a pool
   */
  private async calculatePoolScore(pool: IpPool): Promise<PoolScore> {
    const healthScore = this.calculateHealthScore(pool);
    const loadScore = await this.calculateLoadScore(pool);
    const costScore = this.calculateCostScore(pool);
    const performanceScore = await this.calculatePerformanceScore(pool);

    // Weighted total score
    const totalScore = (
      (healthScore * this.WEIGHT_HEALTH) +
      (loadScore * this.WEIGHT_LOAD) +
      (costScore * this.WEIGHT_COST) +
      (performanceScore * this.WEIGHT_PERFORMANCE)
    ) / 100;

    return {
      pool,
      score: totalScore,
      factors: {
        health: healthScore,
        load: loadScore,
        cost: costScore,
        performance: performanceScore,
      },
    };
  }

  /**
   * Score based on pool health (0-100)
   */
  private calculateHealthScore(pool: IpPool): number {
    // Use pool's health score directly (already 0-100)
    return pool.healthScore || 50; // Default to 50 if not set
  }

  /**
   * Score based on current load (0-100)
   * Higher score = lower load (better)
   */
  private async calculateLoadScore(pool: IpPool): Promise<number> {
    // Get active session
    const sessions = await this.storage.getIpPoolSessionsByPoolId(String(pool.id));
    const activeSession = sessions.find((s: any) => !s.sessionEnd);

    if (!activeSession) {
      return 100; // No load, perfect score
    }

    // Calculate load based on posts in current session
    const totalPosts = (Number((activeSession as any).postsCount) || 0) + (Number((activeSession as any).failCount) || 0);
    const loadPercentage = (totalPosts / 15) * 100; // 15 posts = 100% load
    
    // Invert: lower load = higher score
    return Math.max(0, 100 - loadPercentage);
  }

  /**
   * Score based on cost efficiency (0-100)
   * Lower cost per post = higher score
   */
  private calculateCostScore(pool: IpPool): number {
    if (!(pool as any).costPerMonth) {
      return 50; // Default if cost not set
    }

    // Estimate cost per post (assuming 1000 posts/month per pool)
    const estimatedPostsPerMonth = 1000;
    const costPerPost = Number((pool as any).costPerMonth) / estimatedPostsPerMonth;

    // Score ranges:
    // < 5 VND/post = 100 (USB 4G ~1M/month ÷ 1000 = 1 VND/post)
    // 5-10 VND/post = 70
    // 10-15 VND/post = 50 (Proxy APIs ~7-12M/month ÷ 1000 = 7-12 VND/post)
    // > 15 VND/post = 30

    if (costPerPost < 5) return 100;
    if (costPerPost < 10) return 70;
    if (costPerPost < 15) return 50;
    return 30;
  }

  /**
   * Score based on historical performance (0-100)
   */
  private async calculatePerformanceScore(pool: IpPool): Promise<number> {
    const sessions = await this.storage.getIpPoolSessionsByPoolId(String(pool.id));
    
    if (sessions.length === 0) {
      return 50; // Default for new pools
    }

    // Calculate success rate from all sessions
    const totalSuccess = sessions.reduce((sum: number, s: any) => sum + (s.postsCount || 0), 0);
    const totalFailure = sessions.reduce((sum: number, s: any) => sum + (s.failCount || 0), 0);
    const totalPosts = totalSuccess + totalFailure;

    if (totalPosts === 0) {
      return 50; // No data yet
    }

    const successRate = (totalSuccess / totalPosts) * 100;
    
    // Success rate directly translates to performance score
    return Math.round(successRate);
  }

  /**
   * Assign IP pools to multiple posts at once (batch assignment)
   */
  async assignBatchIpPools(postIds: string[], options: AssignmentOptions): Promise<Map<string, AssignmentResult>> {
    const assignments = new Map<string, AssignmentResult>();
    const usedPoolIds = new Set<string>();

    for (const postId of postIds) {
      // Exclude already used pools in this batch for load balancing
      const excludeIds = Array.from(usedPoolIds);
      
      const result = await this.assignIpPool(postId, {
        ...options,
        excludePoolIds: [...(options.excludePoolIds || []), ...excludeIds],
      });

      assignments.set(postId, result);

      // Track used pool for load balancing
      if (result.pool) {
        usedPoolIds.add(String(result.pool.id));
      }
    }

    return assignments;
  }

  /**
   * Create or get active session for a pool
   */
  async getOrCreateSession(poolId: string, batchId?: string): Promise<string> {
    const pool = await this.storage.getIpPool(poolId);
    
    if (!pool) {
      throw new Error(`Pool #${poolId} not found`);
    }

    // Check for active session
    const sessions = await this.storage.getIpPoolSessionsByPoolId(poolId);
    const activeSession = sessions.find((s: any) => !s.sessionEnd);

    if (activeSession) {
      return String(activeSession.id);
    }

    // Create new session
    const newSession = await this.storage.createIpPoolSession({
      ipPoolId: String(pool.id),
      ipAddress: pool.currentIp || 'Unknown',
      sessionStart: new Date(),
      postsCount: 0,
      failCount: 0,
      batchId: batchId || null,
    });

    console.log(`📊 Created new session #${newSession.id} for Pool #${poolId}`);
    
    return String(newSession.id);
  }

  /**
   * Update session stats after post execution
   */
  async updateSessionStats(sessionId: string, success: boolean, responseTime?: number): Promise<void> {
    const session = await this.storage.getIpPoolSession(sessionId);
    
    if (!session) {
      console.error(`⚠️ Session #${sessionId} not found`);
      return;
    }

    const updates: any = {};

    if (success) {
      updates.postsCount = (Number((session as any).postsCount) || 0) + 1;
    } else {
      updates.failCount = (Number((session as any).failCount) || 0) + 1;
    }

    // Update average response time
    if (responseTime !== undefined && success) {
      const currentAvg = (session as any).averagePostDuration || 0;
      const currentCount = Number((session as any).postsCount) || 0;
      const newAvg = ((currentAvg * currentCount) + responseTime) / (currentCount + 1);
      updates.averagePostDuration = Math.round(newAvg);
    }

    await this.storage.updateIpPoolSession(sessionId, updates);
  }

  /**
   * Close session when rotation occurs or manually ended
   */
  async closeSession(sessionId: string): Promise<void> {
    await this.storage.updateIpPoolSession(sessionId, {
      sessionEnd: new Date(),
    } as any);
    
    console.log(`🔚 Closed session #${sessionId}`);
  }

  /**
   * Get pool recommendation for specific platform
   */
  async getPoolRecommendation(platform: string): Promise<IpPool | null> {
    const result = await this.assignIpPool('0', { platform }); // Use dummy postId for recommendation
    return result.pool;
  }

  /**
   * Load balancing: Get pools with lowest current load
   */
  async getPoolsByLoad(limit: number = 5): Promise<PoolScore[]> {
    const pools = await this.storage.getIpPools({ 
      isEnabled: true,
      status: 'active',
    });

    const scoredPools = await this.scoreAllPools(pools);
    
    // Sort by load score (highest = lowest load)
    scoredPools.sort((a, b) => b.factors.load - a.factors.load);

    return scoredPools.slice(0, limit);
  }
}

// Singleton instance
let assignmentServiceInstance: IpAssignmentService | null = null;

export function getAssignmentService(storage: DatabaseStorage): IpAssignmentService {
  if (!assignmentServiceInstance) {
    assignmentServiceInstance = new IpAssignmentService(storage);
  }
  return assignmentServiceInstance;
}
