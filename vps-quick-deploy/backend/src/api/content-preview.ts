import { Router } from 'express';
import { z } from 'zod';
import { ContentPreviewService } from '../services/content-preview-service';
import type { MediaAsset, Platform } from '../services/content-preview-service';

const router = Router();
const previewService = new ContentPreviewService();

const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ 
      error: "Unauthorized. Please log in to access preview.",
      code: "AUTH_REQUIRED"
    });
  }
  next();
};

const mediaAssetSchema = z.object({
  type: z.enum(['image', 'video']),
  url: z.string().url(),
  width: z.number().optional(),
  height: z.number().optional(),
  duration: z.number().optional()
});

const previewRequestSchema = z.object({
  text: z.string(),
  media: z.array(mediaAssetSchema).optional(),
  platform: z.enum(['facebook', 'instagram', 'tiktok'])
});

const multiPlatformPreviewSchema = z.object({
  text: z.string(),
  media: z.array(mediaAssetSchema).optional()
});

router.post('/generate', requireAuth, async (req, res) => {
  try {
    const validated = previewRequestSchema.parse(req.body);
    
    const preview = await previewService.generatePreview({
      text: validated.text,
      media: validated.media as MediaAsset[] | undefined,
      platform: validated.platform as Platform
    });

    res.json({
      success: true,
      preview
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    }

    console.error('Preview generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate preview'
    });
  }
});

router.post('/multi-platform', requireAuth, async (req, res) => {
  try {
    const validated = multiPlatformPreviewSchema.parse(req.body);
    
    const previews = await previewService.generateMultiPlatformPreview(
      validated.text,
      validated.media as MediaAsset[] | undefined
    );

    res.json({
      success: true,
      previews
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    }

    console.error('Multi-platform preview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate multi-platform preview'
    });
  }
});

router.get('/limits/:platform', requireAuth, async (req, res) => {
  try {
    const platform = req.params.platform as Platform;
    
    if (!['facebook', 'instagram', 'tiktok'].includes(platform)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid platform. Must be facebook, instagram, or tiktok'
      });
    }

    const limits = previewService.getPlatformLimits(platform);

    res.json({
      success: true,
      platform,
      limits
    });
  } catch (error) {
    console.error('Get limits error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get platform limits'
    });
  }
});

router.get('/limits', requireAuth, async (req, res) => {
  try {
    const allLimits = previewService.getAllPlatformLimits();

    res.json({
      success: true,
      limits: allLimits
    });
  } catch (error) {
    console.error('Get all limits error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get platform limits'
    });
  }
});

export default router;
