import { Worker } from 'bullmq';
import { getRedisClient } from '../lib/redis';
import { ScheduledPostJobData } from '../lib/queues/scheduledPost';
import crypto from 'crypto';

const connection = getRedisClient();

const worker = new Worker<ScheduledPostJobData>(
  'scheduled-posts',
  async (job) => {
    const { affiliateId, productId, productName, productSlug, imageIndex, caption, platform } = job.data;

    console.log(`Processing scheduled post for affiliate ${affiliateId}, product ${productId}`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check rate limits via API
    const rateLimitResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/affiliate/rate-limit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        affiliateId,
        platform,
        date: today.toISOString()
      })
    });

    if (!rateLimitResponse.ok) {
      const errorData = await rateLimitResponse.json();
      throw new Error(errorData.message || 'Rate limit check failed');
    }

    const rateLimitData = await rateLimitResponse.json();
    
    if (rateLimitData.todayShareCount >= 4) {
      throw new Error(`Rate limit exceeded: Already shared ${rateLimitData.todayShareCount} times on ${platform} today`);
    }

    if (rateLimitData.hoursSinceLastShare < 2) {
      throw new Error(`Rate limit: Must wait 2 hours between shares. Last share was ${rateLimitData.hoursSinceLastShare.toFixed(1)} hours ago`);
    }

    const shortCode = crypto.randomBytes(6).toString('base64url');

    // Create share log via API
    const shareLogResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/affiliate/share-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
        sharedAt: new Date().toISOString(),
      })
    });

    if (!shareLogResponse.ok) {
      const errorData = await shareLogResponse.json();
      throw new Error(errorData.message || 'Failed to create share log');
    }

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
