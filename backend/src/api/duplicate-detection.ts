import express from 'express';
import { z } from 'zod';
import { duplicateDetectionService } from '../services/duplicate-detection';

const router = express.Router();

const checkDuplicateSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  excludeId: z.string().optional()
});

router.post('/check', async (req, res) => {
  try {
    const { text, excludeId } = checkDuplicateSchema.parse(req.body);
    
    const result = await duplicateDetectionService.checkForDuplicates(text, excludeId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        details: error.errors
      });
    }
    
    console.error('❌ Duplicate check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check for duplicates'
    });
  }
});

const updateFingerprintSchema = z.object({
  contentId: z.string().min(1, 'Content ID is required'),
  text: z.string().min(1, 'Text is required')
});

router.post('/update-fingerprint', async (req, res) => {
  try {
    const { contentId, text } = updateFingerprintSchema.parse(req.body);
    
    await duplicateDetectionService.updateContentFingerprint(contentId, text);
    
    res.json({
      success: true,
      message: 'Fingerprint updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        details: error.errors
      });
    }
    
    console.error('❌ Update fingerprint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update fingerprint'
    });
  }
});

const calculateSimilaritySchema = z.object({
  text1: z.string().min(1, 'First text is required'),
  text2: z.string().min(1, 'Second text is required')
});

router.post('/similarity', async (req, res) => {
  try {
    const { text1, text2 } = calculateSimilaritySchema.parse(req.body);
    
    const similarity = duplicateDetectionService.calculateSimilarity(text1, text2);
    
    res.json({
      success: true,
      data: {
        similarity: Math.round(similarity * 100) / 100,
        percentage: `${Math.round(similarity * 100)}%`
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        details: error.errors
      });
    }
    
    console.error('❌ Similarity calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate similarity'
    });
  }
});

export { router as duplicateDetectionRouter };
