import { Router } from 'express';
import { db } from '../db';
import { admins } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// DEV ONLY: Auto-login as admin for testing
router.get('/dev-login', async (req, res) => {
  try {
    // Find first active admin from database
    const [admin] = await db.select().from(admins).where(eq(admins.isActive, true)).limit(1);
    
    if (!admin) {
      res.status(404).json({ error: 'No active admin found in database' });
      return;
    }
    
    // Set session
    req.session.adminId = admin.id;
    req.session.adminRole = admin.role;
    
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ 
      success: true, 
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      },
      message: 'Dev login successful - session created' 
    });
  } catch (error) {
    console.error('Dev login error:', error);
    res.status(500).json({ error: 'Dev login failed', details: String(error) });
  }
});

export default router;
