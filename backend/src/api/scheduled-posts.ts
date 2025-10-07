import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { and, gte, lte, eq, sql, inArray } from "drizzle-orm";
import { db } from "../db";
import { scheduledPosts, socialAccounts, contentAssets } from "@shared/schema";

const router = Router();

// 🔐 Admin Auth Middleware
const requireAdminAuth: RequestHandler = (req, res, next) => {
  const adminId = req.session.adminId;
  
  if (!adminId) {
    return res.status(401).json({ error: 'Chưa đăng nhập. Vui lòng đăng nhập với tài khoản admin.' });
  }
  
  next();
};

// Batch create scheduled posts (for scheduling to multiple fanpages)
router.post('/', requireAdminAuth, async (req, res) => {
  try {
    const schema = z.object({
      posts: z.array(z.object({
        caption: z.string().min(1, 'Nội dung là bắt buộc'),
        hashtags: z.array(z.string()).optional().default([]),
        assetIds: z.array(z.string()).optional().default([]),
        socialAccountId: z.string().uuid('Social account ID không hợp lệ'),
        platform: z.enum(['facebook', 'instagram', 'twitter', 'tiktok']),
        scheduledTime: z.string().transform(str => new Date(str)),
        timezone: z.string().optional().default('Asia/Ho_Chi_Minh'),
        status: z.enum(['draft', 'scheduled']).optional().default('scheduled'),
      })).min(1, 'Cần ít nhất 1 bài đăng'),
    });

    const { posts: postsData } = schema.parse(req.body);

    // Validate: All scheduled times must be in the future
    const now = new Date();
    const pastPosts = postsData.filter(p => p.scheduledTime <= now);
    if (pastPosts.length > 0) {
      return res.status(400).json({ 
        error: 'Không thể lên lịch cho thời điểm trong quá khứ',
        details: `${pastPosts.length} bài đăng có thời gian trong quá khứ`
      });
    }

    // Validate all social accounts exist and are active
    const accountIds = postsData.map(p => p.socialAccountId);
    const accounts = await db.select()
      .from(socialAccounts)
      .where(
        and(
          inArray(socialAccounts.id, accountIds),
          eq(socialAccounts.connected, true),
          eq(socialAccounts.isActive, true)
        )
      );

    if (accounts.length !== new Set(accountIds).size) {
      return res.status(400).json({ 
        error: 'Một số fanpage không tồn tại hoặc không hoạt động' 
      });
    }

    // Create all posts in parallel
    const createdPosts = await Promise.all(
      postsData.map(post => storage.createScheduledPost(post))
    );

    res.json({
      success: true,
      posts: createdPosts,
      count: createdPosts.length,
    });
  } catch (error: any) {
    console.error('Error creating scheduled posts:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Dữ liệu không hợp lệ', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: error.message || 'Lỗi tạo lịch đăng bài' });
  }
});

// Get scheduled posts with filters
router.get('/', requireAdminAuth, async (req, res) => {
  try {
    const schema = z.object({
      status: z.enum(['draft', 'scheduled', 'posting', 'posted', 'failed', 'cancelled']).optional(),
      platform: z.enum(['facebook', 'instagram', 'twitter', 'tiktok']).optional(),
      socialAccountId: z.string().uuid().optional(),
      startDate: z.string().transform(str => new Date(str)).optional(),
      endDate: z.string().transform(str => new Date(str)).optional(),
      limit: z.coerce.number().min(1).max(500).optional().default(100),
    });

    const filters = schema.parse(req.query);

    // Build dynamic query
    const conditions = [];
    
    if (filters.status) {
      conditions.push(eq(scheduledPosts.status, filters.status));
    }
    if (filters.platform) {
      conditions.push(eq(scheduledPosts.platform, filters.platform));
    }
    if (filters.socialAccountId) {
      conditions.push(eq(scheduledPosts.socialAccountId, filters.socialAccountId));
    }
    if (filters.startDate) {
      conditions.push(gte(scheduledPosts.scheduledTime, filters.startDate));
    }
    if (filters.endDate) {
      conditions.push(lte(scheduledPosts.scheduledTime, filters.endDate));
    }

    let query = db
      .select({
        post: scheduledPosts,
        account: {
          id: socialAccounts.id,
          name: socialAccounts.name,
          platform: socialAccounts.platform,
        },
      })
      .from(scheduledPosts)
      .leftJoin(socialAccounts, eq(scheduledPosts.socialAccountId, socialAccounts.id));

    // Apply filters if provided
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply ordering and limit
    const results = await query
      .orderBy(sql`${scheduledPosts.scheduledTime} DESC`)
      .limit(filters.limit);

    // Get asset details for posts that have them
    const postsWithAssets = await Promise.all(
      results.map(async (result) => {
        if (result.post.assetIds && result.post.assetIds.length > 0) {
          const assets = await db
            .select()
            .from(contentAssets)
            .where(inArray(contentAssets.id, result.post.assetIds));
          
          return {
            ...result.post,
            account: result.account,
            assets,
          };
        }
        
        return {
          ...result.post,
          account: result.account,
          assets: [],
        };
      })
    );

    res.json({
      posts: postsWithAssets,
      total: postsWithAssets.length,
    });
  } catch (error: any) {
    console.error('Error fetching scheduled posts:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Bộ lọc không hợp lệ', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: error.message || 'Lỗi lấy danh sách lịch đăng' });
  }
});

// Get calendar view (posts grouped by date)
router.get('/calendar', requireAdminAuth, async (req, res) => {
  try {
    const schema = z.object({
      startDate: z.string().transform(str => new Date(str)),
      endDate: z.string().transform(str => new Date(str)),
      platform: z.enum(['facebook', 'instagram', 'twitter', 'tiktok']).optional(),
      status: z.enum(['draft', 'scheduled', 'posting', 'posted', 'failed', 'cancelled']).optional(),
    });

    const filters = schema.parse(req.query);

    const conditions = [
      gte(scheduledPosts.scheduledTime, filters.startDate),
      lte(scheduledPosts.scheduledTime, filters.endDate),
    ];

    if (filters.platform) {
      conditions.push(eq(scheduledPosts.platform, filters.platform));
    }
    if (filters.status) {
      conditions.push(eq(scheduledPosts.status, filters.status));
    } else {
      // Default: exclude cancelled and posted
      conditions.push(inArray(scheduledPosts.status, ['draft', 'scheduled', 'posting']));
    }

    const posts = await db
      .select({
        post: scheduledPosts,
        account: {
          id: socialAccounts.id,
          name: socialAccounts.name,
          platform: socialAccounts.platform,
        },
      })
      .from(scheduledPosts)
      .leftJoin(socialAccounts, eq(scheduledPosts.socialAccountId, socialAccounts.id))
      .where(and(...conditions))
      .orderBy(scheduledPosts.scheduledTime);

    // Group by date
    const grouped = posts.reduce((acc, item) => {
      const date = item.post.scheduledTime!.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push({
        ...item.post,
        account: item.account,
      });
      return acc;
    }, {} as Record<string, any[]>);

    res.json({
      calendar: grouped,
      total: posts.length,
    });
  } catch (error: any) {
    console.error('Error fetching calendar view:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Tham số không hợp lệ', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: error.message || 'Lỗi lấy lịch đăng bài' });
  }
});

// Get statistics (must be before /:id route)
router.get('/stats/summary', requireAdminAuth, async (req, res) => {
  try {
    const stats = await db
      .select({
        status: scheduledPosts.status,
        platform: scheduledPosts.platform,
        count: sql<number>`count(*)`,
      })
      .from(scheduledPosts)
      .groupBy(scheduledPosts.status, scheduledPosts.platform);

    // Transform to more useful format
    const summary = {
      total: 0,
      byStatus: {} as Record<string, number>,
      byPlatform: {} as Record<string, number>,
    };

    stats.forEach(({ status, platform, count }) => {
      const countNum = Number(count);
      summary.total += countNum;
      summary.byStatus[status] = (summary.byStatus[status] || 0) + countNum;
      summary.byPlatform[platform] = (summary.byPlatform[platform] || 0) + countNum;
    });

    res.json(summary);
  } catch (error: any) {
    console.error('Error fetching scheduled posts stats:', error);
    res.status(500).json({ error: error.message || 'Lỗi lấy thống kê' });
  }
});

// Get single scheduled post
router.get('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await storage.getScheduledPost(id);

    if (!post) {
      return res.status(404).json({ error: 'Không tìm thấy bài đăng' });
    }

    // Get account and asset details
    const [account] = await db
      .select()
      .from(socialAccounts)
      .where(eq(socialAccounts.id, post.socialAccountId));

    let assets: any[] = [];
    if (post.assetIds && post.assetIds.length > 0) {
      assets = await db
        .select()
        .from(contentAssets)
        .where(inArray(contentAssets.id, post.assetIds));
    }

    res.json({
      ...post,
      account,
      assets,
    });
  } catch (error: any) {
    console.error('Error fetching scheduled post:', error);
    res.status(500).json({ error: error.message || 'Lỗi lấy thông tin bài đăng' });
  }
});

// Update scheduled post
router.put('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const schema = z.object({
      caption: z.string().min(1).optional(),
      hashtags: z.array(z.string()).optional(),
      assetIds: z.array(z.string()).optional(),
      scheduledTime: z.string().transform(str => new Date(str)).optional(),
      timezone: z.string().optional(),
      priority: z.number().min(1).max(10).optional(),
      status: z.enum(['draft', 'scheduled', 'posting', 'posted', 'failed', 'cancelled']).optional(),
    });

    const updates = schema.parse(req.body);

    // Check if post exists
    const existing = await storage.getScheduledPost(id);
    if (!existing) {
      return res.status(404).json({ error: 'Không tìm thấy bài đăng' });
    }

    // Don't allow updating posted or posting posts
    if (['posted', 'posting'].includes(existing.status)) {
      return res.status(400).json({ 
        error: 'Không thể sửa bài đang đăng hoặc đã đăng' 
      });
    }

    const updated = await storage.updateScheduledPost(id, updates);

    res.json({
      success: true,
      post: updated,
    });
  } catch (error: any) {
    console.error('Error updating scheduled post:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Dữ liệu không hợp lệ', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: error.message || 'Lỗi cập nhật bài đăng' });
  }
});

// Retry failed post
router.post('/:id/retry', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await storage.getScheduledPost(id);

    if (!existing) {
      return res.status(404).json({ error: 'Không tìm thấy bài đăng' });
    }

    if (existing.status !== 'failed') {
      return res.status(400).json({ 
        error: 'Chỉ có thể thử lại bài đăng thất bại' 
      });
    }

    // Update status to scheduled and increment retry count
    await storage.updateScheduledPost(id, {
      status: 'scheduled',
      retryCount: (existing.retryCount || 0) + 1,
      lastRetryAt: new Date().toISOString(),
      errorMessage: null,
    });

    res.json({
      success: true,
      message: 'Đã đưa bài đăng vào hàng đợi thử lại',
    });
  } catch (error: any) {
    console.error('Error retrying scheduled post:', error);
    res.status(500).json({ error: error.message || 'Lỗi thử lại bài đăng' });
  }
});

// Delete/cancel scheduled post
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if post exists
    const existing = await storage.getScheduledPost(id);
    if (!existing) {
      return res.status(404).json({ error: 'Không tìm thấy bài đăng' });
    }

    // If already posted, just mark as cancelled instead of delete
    if (existing.status === 'posted') {
      await storage.updateScheduledPost(id, { status: 'cancelled' });
      return res.json({
        success: true,
        message: 'Đã đánh dấu bài đăng là bị hủy',
      });
    }

    // Delete the post
    await storage.deleteScheduledPost(id);

    res.json({
      success: true,
      message: 'Đã xóa lịch đăng bài',
    });
  } catch (error: any) {
    console.error('Error deleting scheduled post:', error);
    res.status(500).json({ error: error.message || 'Lỗi xóa lịch đăng bài' });
  }
});

export default router;
