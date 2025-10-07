/**
 * 🎯 CAMPAIGN VERIFICATION BACKGROUND JOB
 * 
 * BullMQ-based background worker that:
 * 1. Verifies Facebook share posts using Graph API
 * 2. Checks engagement metrics (likes, shares, comments)
 * 3. Distributes rewards (vouchers and/or points) to participants
 * 4. Runs on a scheduled interval to process pending verifications
 */

import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { db } from '../db';
import { 
  campaignParticipations, 
  shareVerifications, 
  customerVouchers, 
  customers,
  campaigns
} from '@shared/schema';
import type { Campaign, CampaignParticipation, Customer } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import { getParticipationsDueForVerification } from '../services/campaigns';
import { verifyShareWithEngagement } from '../services/facebook-graph';

// Redis connection (reuse existing or create new)
const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null
});

// Create BullMQ queue for campaign verification
export const campaignVerifierQueue = new Queue('campaign-verifier', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 60000 // 1 minute
    },
    removeOnComplete: 100,
    removeOnFail: 500
  }
});

/**
 * Main verification function - Verifies a single participation
 * 
 * @param participationId - Campaign participation ID to verify
 */
async function verifyParticipation(participationId: string): Promise<void> {
  // 1. Get participation
  const participation = await db.query.campaignParticipations.findFirst({
    where: eq(campaignParticipations.id, participationId)
  });
  
  if (!participation) {
    throw new Error(`Participation ${participationId} not found`);
  }
  
  // 2. Get campaign separately
  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, participation.campaignId)
  });
  
  if (!campaign) {
    throw new Error(`Campaign ${participation.campaignId} not found`);
  }
  
  // 3. Get customer separately
  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, participation.customerId)
  });
  
  if (!customer) {
    throw new Error(`Customer ${participation.customerId} not found`);
  }
  
  // 4. Extract Facebook post ID from metadata
  const postId = participation.metadata?.facebookPostId;
  if (!postId) {
    throw new Error('No Facebook post ID in metadata');
  }
  
  // 5. Call Facebook Graph API to verify
  const verificationResult = await verifyShareWithEngagement(postId, {
    minLikes: campaign.minEngagementLikes || 0,
    minShares: campaign.minEngagementShares || 0,
    minComments: campaign.minEngagementComments || 0
  });
  
  // 4. Record verification attempt
  const [verification] = await db.insert(shareVerifications).values({
    participationId: participation.id,
    verifiedAt: new Date(),
    attemptNumber: participation.verificationAttempts + 1,
    postExists: verificationResult.exists,
    postId: verificationResult.postId,
    postDeleted: verificationResult.deleted,
    likes: verificationResult.engagement?.likes || 0,
    shares: verificationResult.engagement?.shares || 0,
    comments: verificationResult.engagement?.comments || 0,
    passed: verificationResult.meetsThresholds,
    failureReason: verificationResult.error || null,
    rawResponse: verificationResult.rawResponse || {}
  }).returning();
  
  // 6. Update participation status
  if (verificationResult.meetsThresholds) {
    // PASSED - Generate reward
    await rewardParticipation({ participation, campaign, customer, verificationId: verification.id });
  } else {
    // FAILED - Mark as rejected
    await db.update(campaignParticipations)
      .set({
        status: 'rejected',
        rejectionReason: verificationResult.error || 'Không đạt yêu cầu',
        verificationAttempts: participation.verificationAttempts + 1,
        lastVerifiedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(campaignParticipations.id, participation.id));
  }
}

/**
 * Reward distribution function - Awards vouchers and/or points
 * 
 * @param data - Object containing participation, campaign, and customer data
 */
async function rewardParticipation(data: {
  participation: CampaignParticipation;
  campaign: Campaign;
  customer: Customer;
  verificationId: string;
}): Promise<void> {
  const { participation, campaign, customer, verificationId } = data;
  
  // Use transaction to ensure atomicity
  await db.transaction(async (tx) => {
    // 1. Generate voucher if reward type includes voucher
    let voucherId: string | undefined;
    
    if (campaign.rewardType === 'voucher' || campaign.rewardType === 'both') {
      if (!campaign.rewardVoucherCodeId) {
        throw new Error('Campaign has no reward voucher configured');
      }
      
      // Create customer voucher
      const [voucher] = await tx.insert(customerVouchers).values({
        customerId: customer.id,
        discountCodeId: campaign.rewardVoucherCodeId,
        claimedVia: 'campaign',
        campaignId: campaign.id,
        shareVerificationId: verificationId,
        status: 'active'
      }).returning();
      
      voucherId = voucher.id;
    }
    
    // 2. Award points if reward type includes points
    if (campaign.rewardType === 'points' || campaign.rewardType === 'both') {
      const pointsToAward = campaign.rewardPoints || 0;
      if (pointsToAward > 0) {
        // Update customer points balance and lifetime points earned
        await tx.update(customers)
          .set({
            pointsBalance: sql`${customers.pointsBalance} + ${pointsToAward}`,
            pointsEarned: sql`${customers.pointsEarned} + ${pointsToAward}`
          })
          .where(eq(customers.id, customer.id));
      }
    }
    
    // 3. Update participation status
    await tx.update(campaignParticipations)
      .set({
        status: 'rewarded',
        voucherId: voucherId,
        rewardedAt: new Date(),
        verificationAttempts: participation.verificationAttempts + 1,
        lastVerifiedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(campaignParticipations.id, participation.id));
  });
}

/**
 * BullMQ Worker - Processes verification jobs from the queue
 */
export const campaignVerifierWorker = new Worker(
  'campaign-verifier',
  async (job) => {
    const { participationId } = job.data;
    console.log(`🔍 Verifying participation ${participationId}...`);
    
    try {
      await verifyParticipation(participationId);
      console.log(`✅ Participation ${participationId} verified successfully`);
    } catch (error) {
      console.error(`❌ Error verifying participation ${participationId}:`, error);
      throw error; // Re-throw to trigger retry
    }
  },
  {
    connection,
    concurrency: 5 // Process 5 jobs in parallel
  }
);

/**
 * Scheduler function - Finds and queues participations due for verification
 * Called periodically to process pending verifications
 */
export async function schedulePendingVerifications(): Promise<void> {
  // Get participations due for verification
  const pendingParticipations = await getParticipationsDueForVerification();
  
  console.log(`📋 Found ${pendingParticipations.length} participations to verify`);
  
  for (const participation of pendingParticipations) {
    // Update status to verifying
    await db.update(campaignParticipations)
      .set({
        status: 'verifying',
        updatedAt: new Date()
      })
      .where(eq(campaignParticipations.id, participation.id));
    
    // Queue verification job
    await campaignVerifierQueue.add('verify', {
      participationId: participation.id
    });
    
    console.log(`📤 Queued verification for participation ${participation.id}`);
  }
}

/**
 * Start function - Initializes the campaign verifier system
 * Called from server startup to begin background verification
 */
export function startCampaignVerifier(): void {
  console.log('🚀 Starting campaign verifier worker...');
  
  // Run scheduler every 5 minutes
  setInterval(async () => {
    try {
      await schedulePendingVerifications();
    } catch (error) {
      console.error('Error in campaign verifier scheduler:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes
  
  // Run immediately on start
  schedulePendingVerifications().catch(console.error);
}
