import { db } from "../db";
import { scheduledPosts } from "../../shared/schema";
import { eq, and, lt, isNull, or } from "drizzle-orm";
import { fetchPostAnalytics } from "./analytics";

let analyticsSchedulerInterval: NodeJS.Timeout | null = null;
let isRunning = false;

export interface AnalyticsSchedulerStats {
  isActive: boolean;
  lastRun: string | null;
  totalFetched: number;
  successCount: number;
  errorCount: number;
  nextRun: string | null;
}

const stats: AnalyticsSchedulerStats = {
  isActive: false,
  lastRun: null,
  totalFetched: 0,
  successCount: 0,
  errorCount: 0,
  nextRun: null,
};

const FETCH_INTERVAL = 60 * 60 * 1000;
const MIN_FETCH_DELAY = 30 * 60 * 1000;

export function startAnalyticsScheduler(intervalMs: number = FETCH_INTERVAL): void {
  if (analyticsSchedulerInterval) {
    console.log("⚠️ Analytics scheduler already running");
    return;
  }

  console.log(`🚀 Starting analytics scheduler (interval: ${intervalMs / 1000}s)`);

  stats.isActive = true;
  stats.nextRun = new Date(Date.now() + intervalMs).toISOString();

  runAnalyticsCollection();

  analyticsSchedulerInterval = setInterval(() => {
    runAnalyticsCollection();
  }, intervalMs);
}

export function stopAnalyticsScheduler(): void {
  if (analyticsSchedulerInterval) {
    clearInterval(analyticsSchedulerInterval);
    analyticsSchedulerInterval = null;
    stats.isActive = false;
    stats.nextRun = null;
    console.log("🛑 Analytics scheduler stopped");
  }
}

export function getAnalyticsSchedulerStats(): AnalyticsSchedulerStats {
  return { ...stats };
}

async function runAnalyticsCollection(): Promise<void> {
  if (isRunning) {
    console.log("⏭️ Analytics collection already in progress, skipping...");
    return;
  }

  isRunning = true;
  stats.lastRun = new Date().toISOString();

  try {
    console.log("📊 Starting analytics collection run...");

    const minFetchTime = new Date(Date.now() - MIN_FETCH_DELAY).toISOString();

    const postsToFetch = await db.query.scheduledPosts.findMany({
      where: and(
        eq(scheduledPosts.status, "posted"),
        or(
          isNull(scheduledPosts.analytics),
          lt(
            scheduledPosts.updatedAt,
            new Date(minFetchTime)
          )
        )
      ),
      limit: 50,
      orderBy: (posts, { asc }) => [asc(posts.publishedAt)],
    });

    console.log(`📈 Found ${postsToFetch.length} posts to fetch analytics for`);

    let successCount = 0;
    let errorCount = 0;

    for (const post of postsToFetch) {
      try {
        await fetchPostAnalytics(post.id);
        successCount++;
        stats.successCount++;
        stats.totalFetched++;

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error: any) {
        errorCount++;
        stats.errorCount++;
        console.error(
          `❌ Failed to fetch analytics for post ${post.id}:`,
          error.message
        );
      }
    }

    console.log(
      `✅ Analytics collection complete: ${successCount} success, ${errorCount} errors`
    );

    if (analyticsSchedulerInterval) {
      stats.nextRun = new Date(Date.now() + FETCH_INTERVAL).toISOString();
    }
  } catch (error: any) {
    console.error("❌ Analytics collection run failed:", error.message);
  } finally {
    isRunning = false;
  }
}

export async function manualAnalyticsCollection(): Promise<{
  success: boolean;
  message: string;
  stats: { successCount: number; errorCount: number; totalProcessed: number };
}> {
  if (isRunning) {
    return {
      success: false,
      message: "Analytics collection already in progress",
      stats: { successCount: 0, errorCount: 0, totalProcessed: 0 },
    };
  }

  isRunning = true;

  try {
    console.log("🔄 Manual analytics collection triggered");

    const postsToFetch = await db.query.scheduledPosts.findMany({
      where: eq(scheduledPosts.status, "posted"),
      limit: 100,
      orderBy: (posts, { desc }) => [desc(posts.publishedAt)],
    });

    let successCount = 0;
    let errorCount = 0;

    for (const post of postsToFetch) {
      try {
        await fetchPostAnalytics(post.id);
        successCount++;

        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error: any) {
        errorCount++;
        console.error(
          `❌ Failed to fetch analytics for post ${post.id}:`,
          error.message
        );
      }
    }

    return {
      success: true,
      message: `Analytics collection complete`,
      stats: {
        successCount,
        errorCount,
        totalProcessed: postsToFetch.length,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Analytics collection failed: ${error.message}`,
      stats: { successCount: 0, errorCount: 0, totalProcessed: 0 },
    };
  } finally {
    isRunning = false;
  }
}
