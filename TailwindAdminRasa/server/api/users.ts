import { Router } from 'express';
import { storage } from '../storage';
import type { AuthUser } from '../../shared/schema';

const router = Router();

// 🔍 GET /api/users - Get all users
router.get('/', async (req, res) => {
  try {
    const users = await storage.getAuthUsers();
    
    // Transform to match the UI interface expectations
    const transformedUsers = users.map((user: AuthUser) => ({
      id: user.id,
      email: user.email || '',
      name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.email?.split('@')[0] || 'User',
      createdAt: user.createdAt,
      lastLoginAt: user.updatedAt || undefined, // Use updatedAt as a proxy for last activity
      isActive: true // Assume all auth users are active
    }));
    
    res.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;