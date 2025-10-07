import { Worker } from 'bullmq';
import { getRedisClient } from '../lib/redis';
import { ScheduledPostJobData } from '../lib/queues/scheduledPost';
import { db } from '../server/db';
import { affiliateShareLogs, affiliates } from '../shared/schema';
import { eq, and, gte, count, desc } from 'drizzle-orm';
import crypto from 'crypto';

const connection = getRedisClient();

const worker = new Worker<ScheduledPostJobData>(
  'scheduled-posts',
  async (job) => {
    const { affiliateId, productId, productName, productSlug, imageIndex, caption, platform } = job.data;

    console.log(`Processing scheduled post for affiliate ${affiliateId}, product ${productId}`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [shareCountResult] = await db
      .select({ count: count() })
      .from(affiliateShareLogs)
      .where(
        and(
          eq(affiliateShareLogs.affiliateId, affiliateId),
          eq(affiliateShareLogs.platform, platform),
          gte(affiliateShareLogs.sharedAt, today)
        )
      );

    const todayShareCount = shareCountResult?.count || 0;

    if (todayShareCount >= 4) {
      throw new Error(`Rate limit exceeded: Already shared ${todayShareCount} times on ${platform} today`);
    }

    const recentShares = await db
      .select()
      .from(affiliateShareLogs)
      .where(
        and(
          eq(affiliateShareLogs.affiliateId, affiliateId),
          eq(affiliateShareLogs.platform, platform)
        )
      )
      .orderBy(desc(affiliateShareLogs.sharedAt))
      .limit(1);

    if (recentShares.length > 0) {
      const lastShareTime = new Date(recentShares[0].sharedAt);
      const hoursSinceLastShare = (Date.now() - lastShareTime.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastShare < 2) {
        throw new Error(`Rate limit: Must wait 2 hours between shares. Last share was ${hoursSinceLastShare.toFixed(1)} hours ago`);
      }
    }

    const shortCode = crypto.randomBytes(6).toString('base64url');

    await db.insert(affiliateShareLogs).values({
      id: crypto.randomUUID(),
      affiliateId,
      productId,
      productSlug,
      productName,
      platform,
      imageIndex,
      captionTemplate: null,
      customCaption: caption,
      shortCode,
      clickCount: 0,
      sharedAt: new Date(),
    });

    console.log(`✅ Scheduled post processed successfully. Short code: ${shortCode}`);

    return {
      success: true,
      shortCode,
      message: 'Post shared successfully via scheduled worker',
    };
  },
  {
    connection,
    concurrency: 5,
  }
);

worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});

console.log('📡 Scheduled post worker started and listening for jobs...');

process.on('SIGTERM', async () => {
  console.log('Shutting down worker...');
  await worker.close();
  process.exit(0);
});
