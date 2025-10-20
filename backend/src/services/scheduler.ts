// @ts-nocheck
import { db } from "../db";
import { scheduledPosts, socialAccounts, contentAssets } from "@shared/schema";
import { eq, and, lte, inArray } from "drizzle-orm";

interface SchedulerStats {
  lastRun: Date;
  postsProcessed: number;
  postsSucceeded: number;
  postsFailed: number;
  isRunning: boolean;
  uptime: number; // Milliseconds since last run
}

class PostScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private stats: SchedulerStats = {
    lastRun: new Date(),
    postsProcessed: 0,
    postsSucceeded: 0,
    postsFailed: 0,
    isRunning: false,
    uptime: 0,
  };

  // Poll interval in milliseconds (60 seconds)
  private readonly POLL_INTERVAL = 60000;
  
  // Retry configuration
  private readonly MAX_RETRY_COUNT = 3;
  private readonly RETRY_BACKOFF_MINUTES = 5; // Base retry delay in minutes

  start() {
    if (this.intervalId) {
      console.log("⏰ Scheduler already running");
      return;
    }

    console.log("🚀 Starting post scheduler...");
    this.stats.isRunning = true;

    // Run immediately on start
    this.processDuePosts();

    // Then run every minute
    this.intervalId = setInterval(() => {
      this.processDuePosts();
    }, this.POLL_INTERVAL);

    console.log(`✅ Scheduler started - polling every ${this.POLL_INTERVAL / 1000}s`);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.stats.isRunning = false;
      console.log("⏸️  Scheduler stopped");
    }
  }

  async processDuePosts() {
    if (this.isProcessing) {
      console.log("⏭️  Skipping - already processing");
      return;
    }

    this.isProcessing = true;
    this.stats.lastRun = new Date();

    try {
      const now = new Date();
      
      // 1. Find scheduled posts that are due
      const duePosts = await db
        .select()
        .from(scheduledPosts)
        .where(
          and(
            eq(scheduledPosts.status, "scheduled"),
            lte(scheduledPosts.scheduledTime, now)
          )
        )
        .orderBy(scheduledPosts.scheduledTime);

      // 2. Find failed posts eligible for retry (exponential backoff)
      const retryablePosts = await db
        .select()
        .from(scheduledPosts)
        .where(
          and(
            eq(scheduledPosts.status, "failed"),
            lte(scheduledPosts.retryCount, this.MAX_RETRY_COUNT - 1)
          )
        );

      // Filter retryable posts by backoff time
      const readyForRetry = retryablePosts.filter((post) => {
        if (!post.lastRetryAt) return true; // First retry
        
        const retryCount = post.retryCount || 0;
        // Exponential backoff: 5min * 2^(retryCount-1) = 5, 10, 20 minutes for retry 1, 2, 3
        const backoffMinutes = this.RETRY_BACKOFF_MINUTES * Math.pow(2, retryCount - 1);
        const nextRetryTime = new Date(post.lastRetryAt.getTime() + backoffMinutes * 60 * 1000);
        
        return now >= nextRetryTime;
      });

      const allPosts = [...duePosts, ...readyForRetry];

      if (allPosts.length === 0) {
        console.log(`📭 No due posts at ${now.toISOString()}`);
        return;
      }

      console.log(`📬 Found ${duePosts.length} scheduled + ${readyForRetry.length} retry posts to process`);

      // Process each post
      for (const post of allPosts) {
        await this.processPost(post);
      }
    } catch (error) {
      console.error("❌ Error processing due posts:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processPost(post: any) {
    console.log(`📤 Processing post ${post.id} - Platform: ${post.platform}`);

    try {
      // Update status to 'posting' to prevent duplicate processing
      await db
        .update(scheduledPosts)
        .set({ status: "posting" })
        .where(eq(scheduledPosts.id, post.id));

      // 1. Fetch social account credentials
      if (!post.socialAccountId) {
        throw new Error("No social account ID specified");
      }

      const [account] = await db
        .select()
        .from(socialAccounts)
        .where(eq(socialAccounts.id, post.socialAccountId));

      if (!account) {
        throw new Error(`Social account ${post.socialAccountId} not found`);
      }

      if (!account.accessToken) {
        throw new Error(`No access token for account ${account.name}`);
      }

      // 2. Fetch media assets (if any)
      let assetUrls: string[] = [];
      if (post.assetIds && post.assetIds.length > 0) {
        const assets = await db
          .select()
          .from(contentAssets)
          .where(inArray(contentAssets.id, post.assetIds));

        assetUrls = assets.map((a) => a.cloudinarySecureUrl);
      }

      // 3. Post to platform
      let result;
      switch (post.platform) {
        case "facebook":
          result = await this.postToFacebook(account, post, assetUrls);
          break;
        case "instagram":
          result = await this.postToInstagram(account, post, assetUrls);
          break;
        case "twitter":
          result = await this.postToTwitter(account, post, assetUrls);
          break;
        case "tiktok-business":
          throw new Error(`Platform ${post.platform} not yet supported`);
        default:
          throw new Error(`Unknown platform: ${post.platform}`);
      }

      // 4. Update post status to 'posted'
      await db
        .update(scheduledPosts)
        .set({
          status: "posted",
          publishedAt: new Date(),
          platformPostId: result.postId,
          platformUrl: result.url,
        })
        .where(eq(scheduledPosts.id, post.id));

      console.log(`✅ Post ${post.id} published successfully - URL: ${result.url}`);
      this.stats.postsProcessed++;
      this.stats.postsSucceeded++;

    } catch (error) {
      const currentRetryCount = (post.retryCount || 0) + 1;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      console.error(`❌ Error processing post ${post.id} (attempt ${currentRetryCount}/${this.MAX_RETRY_COUNT}):`, errorMessage);
      this.stats.postsFailed++;

      // Check if we've exceeded max retries
      if (currentRetryCount >= this.MAX_RETRY_COUNT) {
        console.error(`🚫 Post ${post.id} failed permanently after ${this.MAX_RETRY_COUNT} attempts`);
      } else {
        // Calculate next retry delay: 5min * 2^(retryCount-1) = 5, 10, 20 minutes
        const nextBackoffMinutes = this.RETRY_BACKOFF_MINUTES * Math.pow(2, currentRetryCount - 1);
        console.log(`🔄 Post ${post.id} will retry in ${nextBackoffMinutes} minutes`);
      }

      // Update post status to failed
      await db
        .update(scheduledPosts)
        .set({
          status: "failed",
          errorMessage,
          retryCount: currentRetryCount,
          lastRetryAt: new Date(),
        })
        .where(eq(scheduledPosts.id, post.id));
    }
  }

  private async postToFacebook(account: any, post: any, assetUrls: string[]) {
    const pageId = account.accountId;
    const accessToken = account.accessToken;

    // Build message (caption + hashtags)
    let message = post.caption || "";
    if (post.hashtags) {
      message += "\n\n" + post.hashtags;
    }

    let endpoint: string;
    let body: any = {
      access_token: accessToken,
    };

    // Choose endpoint based on whether we have images
    if (assetUrls.length > 0) {
      // Use /photos endpoint for single image post
      endpoint = `https://graph.facebook.com/v21.0/${pageId}/photos`;
      body.url = assetUrls[0]; // Facebook downloads image from URL
      body.caption = message;
      
      if (assetUrls.length > 1) {
        console.log(`⚠️  Multiple images not fully supported yet, using first image only`);
      }
    } else {
      // Use /feed endpoint for text-only post
      endpoint = `https://graph.facebook.com/v21.0/${pageId}/feed`;
      body.message = message;
    }

    // Make API request
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json() as any;
      throw new Error(
        `Facebook API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = (await response.json()) as any;

    // Return post ID and URL
    return {
      postId: data.id,
      url: `https://www.facebook.com/${data.id}`,
    };
  }

  private async postToInstagram(account: any, post: any, assetUrls: string[]) {
    const igUserId = account.accountId;
    const accessToken = account.accessToken;

    // Build caption (caption + hashtags)
    let caption = post.caption || "";
    if (post.hashtags) {
      caption += "\n\n" + post.hashtags;
    }

    if (assetUrls.length === 0) {
      throw new Error("Instagram requires at least one image");
    }

    // Instagram Graph API workflow: 1) Create container -> 2) Publish -> 3) Get permalink
    
    // Step 1: Create media container
    const containerEndpoint = `https://graph.facebook.com/v21.0/${igUserId}/media`;
    const containerBody = {
      image_url: assetUrls[0], // Instagram downloads image from URL
      caption: caption,
      access_token: accessToken,
    };

    const containerResponse = await fetch(containerEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(containerBody),
    });

    if (!containerResponse.ok) {
      const errorData = await containerResponse.json();
      throw new Error(
        `Instagram container creation error: ${(errorData as any).error?.message || containerResponse.statusText}`
      );
    }

    const containerData = (await containerResponse.json()) as any;
    const containerId = containerData.id;

    // Step 2: Publish the container
    const publishEndpoint = `https://graph.facebook.com/v21.0/${igUserId}/media_publish`;
    const publishBody = {
      creation_id: containerId,
      access_token: accessToken,
    };

    const publishResponse = await fetch(publishEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(publishBody),
    });

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json();
      throw new Error(
        `Instagram publish error: ${(errorData as any).error?.message || publishResponse.statusText}`
      );
    }

    const publishData = (await publishResponse.json()) as any;
    const mediaId = publishData.id;

    // Step 3: Fetch the permalink (valid Instagram post URL)
    // Non-fatal - if this fails, the post is still published successfully
    let permalink = `https://www.instagram.com/`; // Fallback
    
    try {
      const permalinkEndpoint = `https://graph.facebook.com/v21.0/${mediaId}?fields=permalink&access_token=${accessToken}`;
      
      const permalinkResponse = await fetch(permalinkEndpoint, {
        method: "GET",
      });

      if (permalinkResponse.ok) {
        const permalinkData = (await permalinkResponse.json()) as any;
        permalink = permalinkData.permalink || permalink;
      } else {
        console.warn(`⚠️  Failed to fetch Instagram permalink for ${mediaId}, using fallback`);
      }
    } catch (error) {
      console.warn(`⚠️  Error fetching Instagram permalink:`, error);
    }

    // Return post ID and permalink (fallback if fetch failed)
    return {
      postId: mediaId,
      url: permalink,
    };
  }

  private async postToTwitter(account: any, post: any, assetUrls: string[]) {
    const accessToken = account.accessToken;

    // Build tweet text (caption + hashtags)
    let tweetText = post.caption || "";
    if (post.hashtags) {
      tweetText += "\n\n" + post.hashtags;
    }

    // Twitter has 280 character limit
    if (tweetText.length > 280) {
      tweetText = tweetText.substring(0, 277) + "...";
    }

    let mediaIds: string[] = [];

    // Upload media if present (Twitter requires media to be uploaded first)
    if (assetUrls.length > 0) {
      for (const assetUrl of assetUrls) {
        // Download image first
        const imageResponse = await fetch(assetUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to download image: ${assetUrl}`);
        }
        const imageBuffer = await imageResponse.arrayBuffer();
        const imageBase64 = Buffer.from(imageBuffer).toString("base64");

        // Upload to Twitter v1.1 media/upload endpoint using multipart/form-data
        const uploadEndpoint = "https://upload.twitter.com/1.1/media/upload.json";
        
        // Build form data
        const formData = new FormData();
        formData.append("media_data", imageBase64);

        const uploadResponse = await fetch(uploadEndpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(
            `Twitter media upload error: ${(errorData as any).errors?.[0]?.message || uploadResponse.statusText}`
          );
        }

        const uploadData = (await uploadResponse.json()) as any;
        mediaIds.push(uploadData.media_id_string);
      }
    }

    // Create tweet using Twitter API v2
    const tweetEndpoint = "https://api.twitter.com/2/tweets";
    const tweetBody: any = {
      text: tweetText,
    };

    if (mediaIds.length > 0) {
      tweetBody.media = {
        media_ids: mediaIds,
      };
    }

    const tweetResponse = await fetch(tweetEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tweetBody),
    });

    if (!tweetResponse.ok) {
      const errorData = await tweetResponse.json();
      throw new Error(
        `Twitter API error: ${(errorData as any).errors?.[0]?.message || (errorData as any).detail || tweetResponse.statusText}`
      );
    }

    const tweetData = (await tweetResponse.json()) as any;
    const tweetId = tweetData.data.id;
    const username = account.name; // Fallback username

    // Return post ID and URL
    return {
      postId: tweetId,
      url: `https://twitter.com/${username}/status/${tweetId}`,
    };
  }

  getStats() {
    return {
      ...this.stats,
      uptime: this.intervalId ? Date.now() - this.stats.lastRun.getTime() : 0,
    };
  }

  // Manual trigger for testing
  async triggerNow() {
    console.log("🔧 Manual trigger - processing due posts now");
    await this.processDuePosts();
  }
}

// Singleton instance
export const scheduler = new PostScheduler();
