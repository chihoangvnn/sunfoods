import { Router } from 'express';
import {
  getBestPostingTimes,
  getEngagementHeatmap,
  getPlatformStatistics,
  analyzePostingPatterns,
} from '../services/posting-recommendations';

const router = Router();

// 🔒 Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ 
      error: "Unauthorized. Please log in.",
      code: "AUTH_REQUIRED"
    });
  }
  next();
};

/**
 * GET /api/recommendations/best-times
 * Get best posting times based on historical engagement data
 * 
 * Query params:
 * - platform: facebook | instagram | twitter (optional)
 * - topN: number of recommendations (default: 5)
 * - daysBack: days of history to analyze (default: 90)
 */
router.get('/best-times', requireAuth, async (req, res) => {
  try {
    const { platform, topN = '5', daysBack = '90', timezone = 'UTC' } = req.query;

    const recommendations = await getBestPostingTimes(
      platform as string | undefined,
      parseInt(topN as string, 10),
      parseInt(daysBack as string, 10),
      timezone as string
    );

    res.json({
      recommendations,
      analyzed: {
        platform: platform || 'all',
        daysBack: parseInt(daysBack as string, 10),
        timezone: timezone as string,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching best posting times:', error);
    if (error.message?.includes('Invalid timezone identifier')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

/**
 * GET /api/recommendations/heatmap
 * Get engagement heatmap data for visualization
 * 
 * Query params:
 * - platform: facebook | instagram | twitter (optional)
 * - daysBack: days of history to analyze (default: 90)
 */
router.get('/heatmap', requireAuth, async (req, res) => {
  try {
    const { platform, daysBack = '90', timezone = 'UTC' } = req.query;

    const heatmap = await getEngagementHeatmap(
      platform as string | undefined,
      parseInt(daysBack as string, 10),
      timezone as string
    );

    // Transform to matrix format for easier frontend consumption
    const matrix: number[][] = Array(7).fill(0).map(() => Array(24).fill(0));
    const countMatrix: number[][] = Array(7).fill(0).map(() => Array(24).fill(0));

    heatmap.forEach(cell => {
      matrix[cell.dayOfWeek][cell.hour] = cell.score;
      countMatrix[cell.dayOfWeek][cell.hour] = cell.postCount;
    });

    res.json({
      heatmap: {
        matrix,
        countMatrix,
        raw: heatmap,
      },
      analyzed: {
        platform: platform || 'all',
        daysBack: parseInt(daysBack as string, 10),
        timezone: timezone as string,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching engagement heatmap:', error);
    if (error.message?.includes('Invalid timezone identifier')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to generate heatmap' });
  }
});

/**
 * GET /api/recommendations/platform-stats
 * Get platform-specific performance statistics
 * 
 * Query params:
 * - daysBack: days of history to analyze (default: 90)
 */
router.get('/platform-stats', requireAuth, async (req, res) => {
  try {
    const { daysBack = '90' } = req.query;

    const stats = await getPlatformStatistics(parseInt(daysBack as string, 10));

    res.json({
      stats,
      analyzed: {
        daysBack: parseInt(daysBack as string, 10),
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({ error: 'Failed to fetch platform statistics' });
  }
});

/**
 * GET /api/recommendations/patterns
 * Get detailed posting patterns (for advanced analysis)
 * 
 * Query params:
 * - platform: facebook | instagram | twitter (optional)
 * - minPosts: minimum posts per time slot (default: 3)
 * - daysBack: days of history to analyze (default: 90)
 */
router.get('/patterns', requireAuth, async (req, res) => {
  try {
    const { platform, minPosts = '3', daysBack = '90', timezone = 'UTC' } = req.query;

    const patterns = await analyzePostingPatterns(
      platform as string | undefined,
      parseInt(minPosts as string, 10),
      parseInt(daysBack as string, 10),
      timezone as string
    );

    res.json({
      patterns,
      analyzed: {
        platform: platform || 'all',
        minPosts: parseInt(minPosts as string, 10),
        daysBack: parseInt(daysBack as string, 10),
        timezone: timezone as string,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching posting patterns:', error);
    if (error.message?.includes('Invalid timezone identifier')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to analyze posting patterns' });
  }
});

/**
 * POST /api/recommendations/suggest-time
 * Suggest optimal time for a new post based on platform and preferences
 * 
 * Body:
 * - platform: facebook | instagram | twitter
 * - preferredDays: array of day indices (optional)
 * - timezone: user timezone (optional, default: UTC)
 */
router.post('/suggest-time', requireAuth, async (req, res) => {
  try {
    const { platform, preferredDays, timezone = 'UTC' } = req.body;

    if (!platform) {
      return res.status(400).json({ error: 'Platform is required' });
    }

    const recommendations = await getBestPostingTimes(platform, 10, 90, timezone);

    // Filter by preferred days if specified
    let filtered = recommendations;
    if (preferredDays && Array.isArray(preferredDays)) {
      filtered = recommendations.filter(rec => 
        preferredDays.includes(rec.dayOfWeek)
      );
    }

    if (filtered.length === 0) {
      return res.json({
        suggested: null,
        message: 'No recommendations available for the specified criteria',
      });
    }

    // Get top recommendation
    const best = filtered[0];

    res.json({
      suggested: {
        platform: best.platform,
        dayOfWeek: best.dayOfWeek,
        dayName: best.dayName,
        hour: best.hour,
        timeLabel: best.timeLabel,
        timezone,
        confidence: best.confidence,
        expectedEngagement: Math.round(best.engagementScore),
        basedOnPosts: best.sampleSize,
      },
      alternatives: filtered.slice(1, 4).map(rec => ({
        dayName: rec.dayName,
        timeLabel: rec.timeLabel,
        confidence: rec.confidence,
        expectedEngagement: Math.round(rec.engagementScore),
      })),
    });
  } catch (error: any) {
    console.error('Error suggesting post time:', error);
    if (error.message?.includes('Invalid timezone identifier')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to suggest optimal time' });
  }
});

export default router;
