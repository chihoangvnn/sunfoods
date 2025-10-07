import { Router } from 'express';
import { z } from 'zod';
import { fanpageMatchingService } from '../services/fanpage-matching';

const router = Router();

// Find matching fanpages for content tags
router.post('/match', async (req, res) => {
  try {
    const schema = z.object({
      contentTagIds: z.array(z.string()).min(1, 'Cần ít nhất 1 tag'),
      platform: z.enum(['facebook', 'instagram', 'tiktok', 'tiktok-business', 'tiktok-shop', 'twitter']).optional(),
      minScore: z.number().min(0).max(1000).optional(),
      limit: z.number().min(1).max(100).optional(),
    });

    const { contentTagIds, platform, minScore, limit } = schema.parse(req.body);

    const matches = await fanpageMatchingService.findMatchingFanpages({
      contentTagIds,
      platform,
      minScore,
      limit,
    });

    // Get tag details for display
    const allTagIds = Array.from(new Set(matches.flatMap(m => m.matchedTags)));
    const tagDetails = await fanpageMatchingService.getTagsByIds(allTagIds);

    // Enrich matches with tag names
    const enrichedMatches = matches.map(match => ({
      ...match,
      matchedTagDetails: match.matchedTags.map(tagId => ({
        id: tagId,
        name: tagDetails.get(tagId)?.name || tagId,
        color: tagDetails.get(tagId)?.color,
      })),
    }));

    res.json({
      matches: enrichedMatches,
      total: enrichedMatches.length,
    });
  } catch (error) {
    console.error('Error finding matching fanpages:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to find matching fanpages' });
  }
});

// Get matches for specific content library item
router.get('/content/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    const { platform } = req.query;

    const matches = await fanpageMatchingService.getMatchesForContent(
      contentId,
      platform as string | undefined
    );

    // Get tag details
    const allTagIds = Array.from(new Set(matches.flatMap(m => m.matchedTags)));
    const tagDetails = await fanpageMatchingService.getTagsByIds(allTagIds);

    const enrichedMatches = matches.map(match => ({
      ...match,
      matchedTagDetails: match.matchedTags.map(tagId => ({
        id: tagId,
        name: tagDetails.get(tagId)?.name || tagId,
        color: tagDetails.get(tagId)?.color,
      })),
    }));

    res.json({
      matches: enrichedMatches,
      total: enrichedMatches.length,
    });
  } catch (error) {
    console.error('Error getting content matches:', error);
    res.status(500).json({ error: 'Failed to get content matches' });
  }
});

// Get matching summary statistics
router.post('/summary', async (req, res) => {
  try {
    const schema = z.object({
      contentTagIds: z.array(z.string()).min(1, 'Cần ít nhất 1 tag'),
    });

    const { contentTagIds } = schema.parse(req.body);

    const summary = await fanpageMatchingService.getMatchingSummary(contentTagIds);

    res.json(summary);
  } catch (error) {
    console.error('Error getting matching summary:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to get matching summary' });
  }
});

// Get tag details by IDs
router.post('/tags/details', async (req, res) => {
  try {
    const schema = z.object({
      tagIds: z.array(z.string()),
    });

    const { tagIds } = schema.parse(req.body);

    const tagMap = await fanpageMatchingService.getTagsByIds(tagIds);
    const tags = Array.from(tagMap.entries()).map(([id, details]) => ({
      id,
      ...details,
    }));

    res.json({ tags });
  } catch (error) {
    console.error('Error getting tag details:', error);
    res.status(500).json({ error: 'Failed to get tag details' });
  }
});

export default router;
