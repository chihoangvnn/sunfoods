import { db } from '../db';
import { socialAccounts, contentLibrary, unifiedTags } from '../../shared/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';

export interface FanpageMatch {
  accountId: string;
  accountName: string;
  platform: string;
  score: number;
  matchedTags: string[];
  matchReason: 'exact' | 'preferred' | 'partial' | 'general';
  pageUrl?: string;
  avatar?: string;
}

export interface MatchingCriteria {
  contentTagIds: string[];
  platform?: string;
  minScore?: number;
  limit?: number;
}

class FanpageMatchingService {
  /**
   * Calculate compatibility score between content tags and fanpage
   * Scoring algorithm:
   * - Exact match (all tags match): 100 points
   * - Preferred tag match: 50 points per tag
   * - Regular tag match: 30 points per tag
   * - Excluded tag penalty: -100 points (auto-reject)
   */
  private calculateMatchScore(
    contentTagIds: string[],
    fanpageTagIds: string[],
    preferredTags: string[] = [],
    excludedTags: string[] = []
  ): { score: number; matchedTags: string[]; matchReason: FanpageMatch['matchReason'] } {
    // Check for excluded tags - instant rejection
    const hasExcludedTag = contentTagIds.some(tag => excludedTags.includes(tag));
    if (hasExcludedTag) {
      return { score: -100, matchedTags: [], matchReason: 'general' };
    }

    const matchedTags = contentTagIds.filter(tag => fanpageTagIds.includes(tag));
    const preferredMatchedTags = contentTagIds.filter(tag => preferredTags.includes(tag));

    // No matches at all
    if (matchedTags.length === 0 && preferredMatchedTags.length === 0) {
      return { score: 0, matchedTags: [], matchReason: 'general' };
    }

    let score = 0;
    let matchReason: FanpageMatch['matchReason'] = 'general';

    // Preferred tags boost
    if (preferredMatchedTags.length > 0) {
      score += preferredMatchedTags.length * 50;
      matchReason = 'preferred';
    }

    // Regular tag matching
    score += matchedTags.length * 30;

    // Exact match bonus (all content tags are in fanpage tags)
    if (matchedTags.length === contentTagIds.length && contentTagIds.length > 0) {
      score += 100;
      matchReason = 'exact';
    } else if (matchedTags.length > 0 && matchReason !== 'preferred') {
      matchReason = 'partial';
    }

    // Relevance factor (percentage of fanpage tags that match)
    const relevanceRatio = fanpageTagIds.length > 0 
      ? matchedTags.length / fanpageTagIds.length 
      : 0;
    score += relevanceRatio * 20;

    return { 
      score: Math.round(score), 
      matchedTags: Array.from(new Set([...matchedTags, ...preferredMatchedTags])),
      matchReason 
    };
  }

  /**
   * Find matching fanpages for given content
   */
  async findMatchingFanpages(criteria: MatchingCriteria): Promise<FanpageMatch[]> {
    const { 
      contentTagIds, 
      platform, 
      minScore = 0, 
      limit 
    } = criteria;
    
    // Default limit only if not explicitly set (including undefined for unlimited)
    const effectiveLimit = limit !== undefined ? limit : 50;

    // Build query conditions
    const conditions = [
      eq(socialAccounts.connected, true),
      eq(socialAccounts.isActive, true)
    ];

    if (platform) {
      conditions.push(eq(socialAccounts.platform, platform as any));
    }

    // Fetch all active fanpages
    const fanpages = await db
      .select({
        id: socialAccounts.id,
        accountName: socialAccounts.name,
        platform: socialAccounts.platform,
        tagIds: socialAccounts.tagIds,
        contentPreferences: socialAccounts.contentPreferences,
      })
      .from(socialAccounts)
      .where(and(...conditions));

    // Calculate scores for each fanpage
    const matches: FanpageMatch[] = [];

    for (const fanpage of fanpages) {
      const fanpageTagIds = (fanpage.tagIds as string[]) || [];
      const preferences = fanpage.contentPreferences as any || {};
      const preferredTags = preferences.preferredTags || [];
      const excludedTags = preferences.excludedTags || [];

      const { score, matchedTags, matchReason } = this.calculateMatchScore(
        contentTagIds,
        fanpageTagIds,
        preferredTags,
        excludedTags
      );

      // Filter by minimum score
      if (score >= minScore) {
        matches.push({
          accountId: fanpage.id,
          accountName: fanpage.accountName || '',
          platform: fanpage.platform as string,
          score,
          matchedTags,
          matchReason,
        });
      }
    }

    // Sort by score (highest first)
    const sorted = matches.sort((a, b) => b.score - a.score);
    
    // Apply limit if specified (effectiveLimit could be 50 or explicit value)
    return effectiveLimit ? sorted.slice(0, effectiveLimit) : sorted;
  }

  /**
   * Get tag details for display
   */
  async getTagsByIds(tagIds: string[]): Promise<Map<string, { name: string; color?: string }>> {
    if (tagIds.length === 0) {
      return new Map();
    }

    const tags = await db
      .select({
        id: unifiedTags.id,
        name: unifiedTags.name,
        color: unifiedTags.color,
      })
      .from(unifiedTags)
      .where(inArray(unifiedTags.id, tagIds));

    const tagMap = new Map();
    for (const tag of tags) {
      tagMap.set(tag.id, { name: tag.name, color: tag.color });
    }
    return tagMap;
  }

  /**
   * Get matching fanpages for specific content library item
   */
  async getMatchesForContent(contentId: string, platform?: string): Promise<FanpageMatch[]> {
    const [content] = await db
      .select({
        tagIds: contentLibrary.tagIds,
        platforms: contentLibrary.platforms,
      })
      .from(contentLibrary)
      .where(eq(contentLibrary.id, contentId));

    if (!content) {
      throw new Error('Content not found');
    }

    const contentTagIds = (content.tagIds as string[]) || [];
    const suggestedPlatforms = (content.platforms as string[]) || [];

    // If no platform specified, use content's suggested platforms
    const targetPlatform = platform || (suggestedPlatforms.length === 1 ? suggestedPlatforms[0] : undefined);

    return this.findMatchingFanpages({
      contentTagIds,
      platform: targetPlatform,
      minScore: 10, // Minimum threshold for relevance
      limit: 50,
    });
  }

  /**
   * Get matching summary statistics
   */
  async getMatchingSummary(contentTagIds: string[]): Promise<{
    totalFanpages: number;
    matchedFanpages: number;
    exactMatches: number;
    preferredMatches: number;
    partialMatches: number;
    platforms: { platform: string; count: number }[];
  }> {
    // Get total count of all active fanpages
    const totalFanpages = await db
      .select({ count: sql<number>`count(*)` })
      .from(socialAccounts)
      .where(
        and(
          eq(socialAccounts.connected, true),
          eq(socialAccounts.isActive, true)
        )
      );

    const total = totalFanpages[0]?.count || 0;

    // Get ALL matches (explicitly pass 0 to disable limit) for accurate summary
    const matches = await this.findMatchingFanpages({
      contentTagIds,
      minScore: 10,
      limit: 0, // 0 = unlimited - get ALL matches for summary
    });

    const platformCounts = new Map<string, number>();
    let exactMatches = 0;
    let preferredMatches = 0;
    let partialMatches = 0;

    for (const match of matches) {
      platformCounts.set(match.platform, (platformCounts.get(match.platform) || 0) + 1);
      
      if (match.matchReason === 'exact') exactMatches++;
      else if (match.matchReason === 'preferred') preferredMatches++;
      else if (match.matchReason === 'partial') partialMatches++;
    }

    const platforms = Array.from(platformCounts.entries()).map(([platform, count]) => ({
      platform,
      count,
    }));

    return {
      totalFanpages: Number(total),
      matchedFanpages: matches.length,
      exactMatches,
      preferredMatches,
      partialMatches,
      platforms,
    };
  }
}

export const fanpageMatchingService = new FanpageMatchingService();
