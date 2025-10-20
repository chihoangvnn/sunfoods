import { db } from '../db';
import { scheduledPosts } from '../../shared/schema';
import { sql } from 'drizzle-orm';
import { formatInTimeZone } from 'date-fns-tz';

export interface TimeSlotAnalytics {
  hour: number;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  platform: string;
  postCount: number;
  avgLikes: number;
  avgComments: number;
  avgShares: number;
  avgReach: number;
  avgEngagementRate: number;
  totalEngagement: number;
}

export interface BestTimeRecommendation {
  platform: string;
  hour: number;
  dayOfWeek: number;
  dayName: string;
  timeLabel: string;
  engagementScore: number;
  avgEngagementRate: number;
  sampleSize: number;
  confidence: 'high' | 'medium' | 'low';
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Analyze historical post performance by time slots
 */
export async function analyzePostingPatterns(
  platform?: string,
  minPosts: number = 3,
  daysBack: number = 90,
  timezone: string = 'UTC'
): Promise<TimeSlotAnalytics[]> {
  // Validate timezone
  try {
    formatInTimeZone(new Date(), timezone, 'H');
  } catch (error) {
    throw new Error(`Invalid timezone identifier: ${timezone}`);
  }

  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - daysBack);

  const posts = await db
    .select({
      id: scheduledPosts.id,
      platform: scheduledPosts.platform,
      publishedAt: scheduledPosts.publishedAt,
      analytics: scheduledPosts.analytics,
    })
    .from(scheduledPosts)
    .where(
      sql`${scheduledPosts.status} = 'posted' 
          AND ${scheduledPosts.publishedAt} >= ${dateThreshold.toISOString()}
          ${platform ? sql`AND ${scheduledPosts.platform} = ${platform}` : sql``}`
    );

  // Group by hour, day of week, and platform
  const timeSlotMap = new Map<string, {
    posts: any[];
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalReach: number;
    totalEngagement: number;
    totalEngagementRate: number;
  }>();

  posts.forEach(post => {
    if (!post.publishedAt) return;

    // Convert UTC timestamp to user's timezone and extract hour/day
    const utcDate = new Date(post.publishedAt);
    const hour = parseInt(formatInTimeZone(utcDate, timezone, 'H'));
    const dayOfWeek = parseInt(formatInTimeZone(utcDate, timezone, 'i')) % 7; // i=day of week 1-7, convert to 0-6
    const key = `${post.platform}-${hour}-${dayOfWeek}`;

    if (!timeSlotMap.has(key)) {
      timeSlotMap.set(key, {
        posts: [],
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalReach: 0,
        totalEngagement: 0,
        totalEngagementRate: 0,
      });
    }

    const slot = timeSlotMap.get(key)!;
    slot.posts.push(post);

    const analytics = (post.analytics as any) || {};
    const likes = analytics.likes || 0;
    const comments = analytics.comments || 0;
    const shares = analytics.shares || 0;
    const reach = analytics.reach || 0;
    const engagement = likes + comments + shares;
    const engagementRate = analytics.engagementRate || (reach > 0 ? engagement / reach : 0);

    slot.totalLikes += likes;
    slot.totalComments += comments;
    slot.totalShares += shares;
    slot.totalReach += reach;
    slot.totalEngagement += engagement;
    slot.totalEngagementRate += engagementRate;
  });

  // Calculate averages and filter by minimum post count
  const results: TimeSlotAnalytics[] = [];

  timeSlotMap.forEach((slot, key) => {
    const [platformStr, hourStr, dayStr] = key.split('-');
    const postCount = slot.posts.length;

    if (postCount >= minPosts) {
      results.push({
        hour: parseInt(hourStr),
        dayOfWeek: parseInt(dayStr),
        platform: platformStr,
        postCount,
        avgLikes: slot.totalLikes / postCount,
        avgComments: slot.totalComments / postCount,
        avgShares: slot.totalShares / postCount,
        avgReach: slot.totalReach / postCount,
        avgEngagementRate: slot.totalEngagementRate / postCount,
        totalEngagement: slot.totalEngagement,
      });
    }
  });

  return results.sort((a, b) => b.avgEngagementRate - a.avgEngagementRate);
}

/**
 * Get best posting times for a platform
 */
export async function getBestPostingTimes(
  platform?: string,
  topN: number = 5,
  daysBack: number = 90,
  timezone: string = 'UTC'
): Promise<BestTimeRecommendation[]> {
  const patterns = await analyzePostingPatterns(platform, 3, daysBack, timezone);

  if (patterns.length === 0) {
    return [];
  }

  // Calculate confidence based on sample size
  const maxPosts = Math.max(...patterns.map(p => p.postCount));
  
  const recommendations: BestTimeRecommendation[] = patterns.map(pattern => {
    const hour = pattern.hour;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    
    let confidence: 'high' | 'medium' | 'low';
    if (pattern.postCount >= maxPosts * 0.7) {
      confidence = 'high';
    } else if (pattern.postCount >= maxPosts * 0.4) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }

    return {
      platform: pattern.platform,
      hour: pattern.hour,
      dayOfWeek: pattern.dayOfWeek,
      dayName: DAY_NAMES[pattern.dayOfWeek],
      timeLabel: `${displayHour}:00 ${period}`,
      engagementScore: pattern.totalEngagement / pattern.postCount,
      avgEngagementRate: pattern.avgEngagementRate,
      sampleSize: pattern.postCount,
      confidence,
    };
  });

  // Group by platform if analyzing multiple platforms
  if (!platform) {
    const platformMap = new Map<string, BestTimeRecommendation[]>();
    
    recommendations.forEach(rec => {
      if (!platformMap.has(rec.platform)) {
        platformMap.set(rec.platform, []);
      }
      platformMap.get(rec.platform)!.push(rec);
    });

    // Get top N for each platform
    const result: BestTimeRecommendation[] = [];
    platformMap.forEach((recs, plat) => {
      result.push(...recs.slice(0, topN));
    });

    return result.sort((a, b) => b.engagementScore - a.engagementScore);
  }

  return recommendations.slice(0, topN);
}

/**
 * Get hourly engagement heatmap for visualization
 */
export async function getEngagementHeatmap(
  platform?: string,
  daysBack: number = 90,
  timezone: string = 'UTC'
): Promise<{ hour: number; dayOfWeek: number; score: number; postCount: number }[]> {
  const patterns = await analyzePostingPatterns(platform, 1, daysBack, timezone);

  return patterns.map(p => ({
    hour: p.hour,
    dayOfWeek: p.dayOfWeek,
    score: p.avgEngagementRate,
    postCount: p.postCount,
  }));
}

/**
 * Get platform-specific statistics
 */
export async function getPlatformStatistics(daysBack: number = 90) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - daysBack);

  const posts = await db
    .select({
      platform: scheduledPosts.platform,
      analytics: scheduledPosts.analytics,
    })
    .from(scheduledPosts)
    .where(
      sql`${scheduledPosts.status} = 'posted' 
          AND ${scheduledPosts.publishedAt} >= ${dateThreshold.toISOString()}`
    );

  const platformStats = new Map<string, {
    count: number;
    totalEngagement: number;
    totalReach: number;
  }>();

  posts.forEach(post => {
    if (!platformStats.has(post.platform)) {
      platformStats.set(post.platform, {
        count: 0,
        totalEngagement: 0,
        totalReach: 0,
      });
    }

    const stats = platformStats.get(post.platform)!;
    stats.count++;

    const analytics = (post.analytics as any) || {};
    const engagement = (analytics.likes || 0) + (analytics.comments || 0) + (analytics.shares || 0);
    stats.totalEngagement += engagement;
    stats.totalReach += analytics.reach || 0;
  });

  const results = Array.from(platformStats.entries()).map(([platform, stats]) => ({
    platform,
    postCount: stats.count,
    avgEngagement: stats.totalEngagement / stats.count,
    avgReach: stats.totalReach / stats.count,
    avgEngagementRate: stats.totalReach > 0 ? stats.totalEngagement / stats.totalReach : 0,
  }));

  return results.sort((a, b) => b.avgEngagementRate - a.avgEngagementRate);
}
