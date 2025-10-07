import { Router } from 'express';
import { db } from '../db';
import { oauthConnections } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

/**
 * GET /auth/connections
 * Get all OAuth connections for the currently logged-in customer
 */
router.get('/connections', async (req, res) => {
  const customerId = req.session.userId;
  if (!customerId) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }
  
  try {
    // Query oauth_connections table
    const connections = await db
      .select()
      .from(oauthConnections)
      .where(eq(oauthConnections.customerId, customerId));
    
    // Format and return
    res.json({
      customerId,
      connections: connections.map(conn => ({
        id: conn.id,
        provider: conn.provider,
        email: conn.email,
        isPrimary: conn.isPrimary,
        profileData: conn.profileData,
        connectedAt: conn.createdAt
      })),
      primaryProvider: connections.find(c => c.isPrimary)?.provider || null
    });
  } catch (error) {
    console.error('❌ Error fetching OAuth connections:', error);
    res.status(500).json({ 
      error: 'Không thể tải danh sách kết nối',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /auth/unlink/:provider
 * Unlink a specific OAuth provider from customer account
 */
router.post('/unlink/:provider', async (req, res) => {
  const customerId = req.session.userId;
  if (!customerId) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }
  
  const { provider } = req.params;
  
  // Validate provider type
  const validProviders = ['google', 'facebook', 'zalo', 'replit'] as const;
  if (!validProviders.includes(provider as any)) {
    return res.status(400).json({ error: 'Provider không hợp lệ' });
  }
  const typedProvider = provider as typeof validProviders[number];
  
  try {
    // Check total connections count
    const connections = await db
      .select()
      .from(oauthConnections)
      .where(eq(oauthConnections.customerId, customerId));
    
    if (connections.length <= 1) {
      return res.status(400).json({ 
        error: 'Không thể xóa phương thức đăng nhập duy nhất. Vui lòng liên kết thêm phương thức khác trước.' 
      });
    }
    
    // Find connection to unlink
    const connection = connections.find(c => c.provider === typedProvider);
    if (!connection) {
      return res.status(404).json({ error: 'Không tìm thấy kết nối này' });
    }
    
    // If primary, cannot unlink
    if (connection.isPrimary && connections.length > 1) {
      return res.status(400).json({ 
        error: 'Không thể xóa phương thức đăng nhập chính. Vui lòng đặt phương thức khác làm chính trước.' 
      });
    }
    
    // Delete connection
    await db.delete(oauthConnections)
      .where(and(
        eq(oauthConnections.customerId, customerId),
        eq(oauthConnections.provider, typedProvider)
      ));
    
    res.json({
      success: true,
      message: `Đã hủy liên kết ${provider}`,
      remainingConnections: connections.length - 1
    });
  } catch (error) {
    console.error('❌ Error unlinking OAuth provider:', error);
    res.status(500).json({ 
      error: 'Không thể hủy liên kết',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /auth/set-primary/:provider
 * Set a specific provider as the primary login method
 */
router.post('/set-primary/:provider', async (req, res) => {
  const customerId = req.session.userId;
  if (!customerId) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }
  
  const { provider } = req.params;
  
  // Validate provider type
  const validProviders = ['google', 'facebook', 'zalo', 'replit'] as const;
  if (!validProviders.includes(provider as any)) {
    return res.status(400).json({ error: 'Provider không hợp lệ' });
  }
  const typedProvider = provider as typeof validProviders[number];
  
  try {
    // Set all to non-primary first
    await db.update(oauthConnections)
      .set({ isPrimary: false })
      .where(eq(oauthConnections.customerId, customerId));
    
    // Set selected provider as primary
    const result = await db.update(oauthConnections)
      .set({ isPrimary: true, updatedAt: new Date() })
      .where(and(
        eq(oauthConnections.customerId, customerId),
        eq(oauthConnections.provider, typedProvider)
      ))
      .returning();
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy kết nối này' });
    }
    
    res.json({
      success: true,
      message: `Đã đặt ${provider} làm phương thức đăng nhập chính`,
      primaryProvider: provider
    });
  } catch (error) {
    console.error('❌ Error setting primary provider:', error);
    res.status(500).json({ 
      error: 'Không thể đặt phương thức đăng nhập chính',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
