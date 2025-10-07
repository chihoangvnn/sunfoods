import { Queue, Worker, QueueEvents } from 'bullmq';
import { getRedisClient } from '../redis';

export interface ScheduledPostJobData {
  affiliateId: string;
  productId: string;
  productName: string;
  productSlug: string | null;
  imageIndex: number;
  caption: string;
  platform: 'facebook' | 'zalo' | 'instagram';
  scheduledFor: string;
}

const connection = getRedisClient();

export const scheduledPostQueue = new Queue<ScheduledPostJobData>('scheduled-posts', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      age: 7 * 24 * 60 * 60,
      count: 1000,
    },
    removeOnFail: {
      age: 30 * 24 * 60 * 60,
    },
  },
});

export async function addScheduledPost(
  data: ScheduledPostJobData,
  scheduledTime: Date
): Promise<string> {
  const delay = scheduledTime.getTime() - Date.now();
  
  if (delay <= 0) {
    throw new Error('Scheduled time must be in the future');
  }

  const job = await scheduledPostQueue.add('schedule-post', data, {
    delay,
    jobId: `scheduled-${data.affiliateId}-${Date.now()}`,
  });

  return job.id || '';
}

export async function cancelScheduledPost(jobId: string): Promise<boolean> {
  const job = await scheduledPostQueue.getJob(jobId);
  
  if (job) {
    await job.remove();
    return true;
  }
  
  return false;
}

export async function getScheduledPosts(affiliateId: string) {
  const jobs = await scheduledPostQueue.getJobs(['delayed', 'waiting']);
  
  return jobs
    .filter(job => job.data.affiliateId === affiliateId)
    .map(job => ({
      id: job.id,
      ...job.data,
      scheduledAt: new Date(job.timestamp + (job.opts.delay || 0)).toISOString(),
    }));
}
