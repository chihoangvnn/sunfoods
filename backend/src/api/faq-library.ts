// @ts-nocheck
import { Router } from 'express';
import { db } from '../db';
import { faqLibrary, insertFaqLibrarySchema, updateFaqLibrarySchema } from '../../shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

const router = Router();

router.get('/faqs', async (req, res) => {
  try {
    const { category, isActive, search } = req.query;
    
    const conditions = [];
    
    if (category) {
      conditions.push(eq(faqLibrary.category, category as string));
    }
    
    if (isActive !== undefined) {
      conditions.push(eq(faqLibrary.isActive, isActive === 'true'));
    }
    
    let query = db.select().from(faqLibrary);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    const faqs = await query.orderBy(desc(faqLibrary.sortOrder), desc(faqLibrary.createdAt));
    
    res.json(faqs);
  } catch (error: any) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/faqs', async (req, res) => {
  try {
    const validatedData = insertFaqLibrarySchema.parse(req.body);
    
    const [newFaq] = await db
      .insert(faqLibrary)
      .values(validatedData as any)
      .returning();
    
    res.status(201).json(newFaq);
  } catch (error: any) {
    console.error('Error creating FAQ:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.issues 
      });
    }
    
    res.status(500).json({ error: error.message });
  }
});

router.put('/faqs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateFaqLibrarySchema.parse(req.body);
    
    const { question, answer, tagIds, priority, category, isActive, sortOrder, keywords } = validatedData;
    const safeUpdateData: any = {};
    if (question !== undefined) safeUpdateData.question = question;
    if (answer !== undefined) safeUpdateData.answer = answer;
    if (tagIds !== undefined) safeUpdateData.tagIds = tagIds;
    if (priority !== undefined) safeUpdateData.priority = priority;
    if (category !== undefined) safeUpdateData.category = category;
    if (isActive !== undefined) safeUpdateData.isActive = isActive;
    if (sortOrder !== undefined) safeUpdateData.sortOrder = sortOrder;
    if (keywords !== undefined) safeUpdateData.keywords = keywords;
    
    const [updatedFaq] = await db
      .update(faqLibrary)
      .set({
        ...safeUpdateData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(faqLibrary.id, id))
      .returning();
    
    if (!updatedFaq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    
    res.json(updatedFaq);
  } catch (error: any) {
    console.error('Error updating FAQ:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.issues 
      });
    }
    
    res.status(500).json({ error: error.message });
  }
});

router.delete('/faqs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [deletedFaq] = await db
      .delete(faqLibrary)
      .where(eq(faqLibrary.id, id))
      .returning();
    
    if (!deletedFaq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    
    res.json({ message: 'FAQ deleted successfully', faq: deletedFaq });
  } catch (error: any) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/faqs/:id/usage', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [updatedFaq] = await db
      .update(faqLibrary)
      .set({
        usageCount: sql`${faqLibrary.usageCount} + 1`,
        lastUsed: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(faqLibrary.id, id))
      .returning();
    
    if (!updatedFaq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    
    res.json(updatedFaq);
  } catch (error: any) {
    console.error('Error updating FAQ usage:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
