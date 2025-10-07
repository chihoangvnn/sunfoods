import { db } from "../db";
import { scheduledPosts, socialAccounts } from "../../shared/schema";
import { eq } from "drizzle-orm";

interface FacebookInsightsResponse {
  data: Array<{
    name: string;
    values: Array<{
      value: number;
    }>;
  }>;
}

interface FacebookPostResponse {
  reactions?: {
    data: any[];
    summary: {
      total_count: number;
      viewer_reaction?: string;
    };
  };
  comments?: {
    summary: {
      total_count: number;
    };
  };
  shares?: {
    count: number;
  };
}

interface FacebookReactionsBreakdown {
  data: Array<{
    id: string;
    name?: string;
    type: string;
  }>;
  summary: {
    total_count: number;
  };
}

export async function fetchFacebookAnalytics(postId: string): Promise<void> {
  const post = await db.query.scheduledPosts.findFirst({
    where: eq(scheduledPosts.id, postId),
  });

  if (!post || !post.platformPostId || post.platform !== "facebook") {
    throw new Error("Invalid post or not a Facebook post");
  }

  const account = await db.query.socialAccounts.findFirst({
    where: eq(socialAccounts.id, post.socialAccountId),
  });

  if (!account || !account.accessToken) {
    throw new Error("Social account not found or missing access token");
  }

  try {
    const fbPostId = post.platformPostId;
    const accessToken = account.accessToken;

    const [postData, insights] = await Promise.all([
      fetchFacebookPostData(fbPostId, accessToken),
      fetchFacebookInsights(fbPostId, accessToken),
    ]);

    const reactionsBreakdown = await fetchFacebookReactionsBreakdown(
      fbPostId,
      accessToken
    );

    const analytics = {
      likes: postData.reactions?.summary?.total_count || 0,
      comments: postData.comments?.summary?.total_count || 0,
      shares: postData.shares?.count || 0,
      reach: insights.reach || 0,
      impressions: insights.impressions || 0,

      engagementRate:
        insights.reach > 0
          ? ((postData.reactions?.summary?.total_count || 0) +
              (postData.comments?.summary?.total_count || 0) +
              (postData.shares?.count || 0)) /
            insights.reach
          : 0,

      facebook: {
        reactions: reactionsBreakdown,
        videoViews: insights.videoViews,
        postClicks: insights.postClicks,
      },

      lastFetched: new Date().toISOString(),
      fetchCount: (post.analytics?.fetchCount || 0) + 1,
      errors: [],
    };

    await db
      .update(scheduledPosts)
      .set({
        analytics,
        updatedAt: new Date(),
      })
      .where(eq(scheduledPosts.id, postId));

    console.log(`✅ Fetched analytics for Facebook post ${postId}`);
  } catch (error: any) {
    console.error(`❌ Error fetching Facebook analytics for ${postId}:`, error.message);

    const existingAnalytics = post.analytics || {};
    const errors = existingAnalytics.errors || [];
    errors.push(`${new Date().toISOString()}: ${error.message}`);

    await db
      .update(scheduledPosts)
      .set({
        analytics: {
          ...existingAnalytics,
          errors,
          lastFetched: new Date().toISOString(),
        },
        updatedAt: new Date(),
      })
      .where(eq(scheduledPosts.id, postId));

    throw error;
  }
}

async function fetchFacebookPostData(
  postId: string,
  accessToken: string
): Promise<FacebookPostResponse> {
  const fields = "reactions.summary(true),comments.summary(true),shares";
  const url = `https://graph.facebook.com/v18.0/${postId}?fields=${fields}&access_token=${accessToken}`;

  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Facebook API error: ${error.error?.message || "Unknown error"}`
    );
  }

  return response.json();
}

async function fetchFacebookInsights(
  postId: string,
  accessToken: string
): Promise<{
  reach: number;
  impressions: number;
  videoViews?: number;
  postClicks?: number;
}> {
  const metrics = [
    "post_impressions",
    "post_impressions_unique",
    "post_clicks",
    "post_video_views",
  ].join(",");

  const url = `https://graph.facebook.com/v18.0/${postId}/insights?metric=${metrics}&access_token=${accessToken}`;

  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Facebook Insights API error: ${error.error?.message || "Unknown error"}`
    );
  }

  const data: FacebookInsightsResponse = await response.json();

  const result = {
    reach: 0,
    impressions: 0,
    videoViews: undefined as number | undefined,
    postClicks: undefined as number | undefined,
  };

  for (const metric of data.data) {
    const value = metric.values[0]?.value || 0;

    switch (metric.name) {
      case "post_impressions":
        result.impressions = value;
        break;
      case "post_impressions_unique":
        result.reach = value;
        break;
      case "post_clicks":
        result.postClicks = value;
        break;
      case "post_video_views":
        result.videoViews = value;
        break;
    }
  }

  return result;
}

async function fetchFacebookReactionsBreakdown(
  postId: string,
  accessToken: string
): Promise<{
  like: number;
  love: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
}> {
  const reactionTypes = ["LIKE", "LOVE", "HAHA", "WOW", "SAD", "ANGRY"];
  const breakdown: any = {
    like: 0,
    love: 0,
    haha: 0,
    wow: 0,
    sad: 0,
    angry: 0,
  };

  try {
    await Promise.all(
      reactionTypes.map(async (type) => {
        const url = `https://graph.facebook.com/v18.0/${postId}/reactions?type=${type}&summary=total_count&access_token=${accessToken}`;
        const response = await fetch(url);

        if (response.ok) {
          const data: FacebookReactionsBreakdown = await response.json();
          breakdown[type.toLowerCase()] = data.summary.total_count;
        }
      })
    );
  } catch (error) {
    console.warn("Failed to fetch reactions breakdown:", error);
  }

  return breakdown;
}

export async function fetchInstagramAnalytics(postId: string): Promise<void> {
  const post = await db.query.scheduledPosts.findFirst({
    where: eq(scheduledPosts.id, postId),
  });

  if (!post || !post.platformPostId || post.platform !== "instagram") {
    throw new Error("Invalid post or not an Instagram post");
  }

  const account = await db.query.socialAccounts.findFirst({
    where: eq(socialAccounts.id, post.socialAccountId),
  });

  if (!account || !account.accessToken) {
    throw new Error("Social account not found or missing access token");
  }

  try {
    const igMediaId = post.platformPostId;
    const accessToken = account.accessToken;

    const metrics = [
      "like_count",
      "comments_count",
      "saved",
      "reach",
      "impressions",
      "profile_visits",
      "follows",
    ].join(",");

    const url = `https://graph.instagram.com/${igMediaId}/insights?metric=${metrics}&access_token=${accessToken}`;

    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Instagram Insights API error: ${error.error?.message || "Unknown error"}`
      );
    }

    const data = await response.json();

    const metricsMap: any = {};
    for (const metric of data.data || []) {
      metricsMap[metric.name] = metric.values?.[0]?.value || 0;
    }

    const analytics = {
      likes: metricsMap.like_count || 0,
      comments: metricsMap.comments_count || 0,
      reach: metricsMap.reach || 0,
      impressions: metricsMap.impressions || 0,

      engagementRate:
        metricsMap.reach > 0
          ? ((metricsMap.like_count || 0) + (metricsMap.comments_count || 0) + (metricsMap.saved || 0)) /
            metricsMap.reach
          : 0,

      instagram: {
        saves: metricsMap.saved || 0,
        profileVisits: metricsMap.profile_visits || 0,
        follows: metricsMap.follows || 0,
      },

      lastFetched: new Date().toISOString(),
      fetchCount: (post.analytics?.fetchCount || 0) + 1,
      errors: [],
    };

    await db
      .update(scheduledPosts)
      .set({
        analytics,
        updatedAt: new Date(),
      })
      .where(eq(scheduledPosts.id, postId));

    console.log(`✅ Fetched analytics for Instagram post ${postId}`);
  } catch (error: any) {
    console.error(`❌ Error fetching Instagram analytics for ${postId}:`, error.message);

    const existingAnalytics = post.analytics || {};
    const errors = existingAnalytics.errors || [];
    errors.push(`${new Date().toISOString()}: ${error.message}`);

    await db
      .update(scheduledPosts)
      .set({
        analytics: {
          ...existingAnalytics,
          errors,
          lastFetched: new Date().toISOString(),
        },
        updatedAt: new Date(),
      })
      .where(eq(scheduledPosts.id, postId));

    throw error;
  }
}

export async function fetchTwitterAnalytics(postId: string): Promise<void> {
  const post = await db.query.scheduledPosts.findFirst({
    where: eq(scheduledPosts.id, postId),
  });

  if (!post || !post.platformPostId || post.platform !== "twitter") {
    throw new Error("Invalid post or not a Twitter post");
  }

  const account = await db.query.socialAccounts.findFirst({
    where: eq(socialAccounts.id, post.socialAccountId),
  });

  if (!account || !account.accessToken) {
    throw new Error("Social account not found or missing access token");
  }

  try {
    const tweetId = post.platformPostId;
    const accessToken = account.accessToken;

    const fields = [
      "public_metrics",
      "non_public_metrics",
      "organic_metrics",
    ].join(",");

    const url = `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=${fields}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Twitter API error: ${error.errors?.[0]?.message || "Unknown error"}`
      );
    }

    const data = await response.json();
    const tweet = data.data;

    const publicMetrics = tweet.public_metrics || {};
    const organicMetrics = tweet.organic_metrics || {};

    const analytics = {
      likes: publicMetrics.like_count || 0,
      comments: publicMetrics.reply_count || 0,
      shares: publicMetrics.retweet_count || 0,
      impressions: organicMetrics.impression_count || 0,
      reach: organicMetrics.user_profile_clicks || 0,

      engagementRate:
        organicMetrics.impression_count > 0
          ? ((publicMetrics.like_count || 0) +
              (publicMetrics.reply_count || 0) +
              (publicMetrics.retweet_count || 0)) /
            organicMetrics.impression_count
          : 0,

      twitter: {
        retweets: publicMetrics.retweet_count || 0,
        quoteRetweets: publicMetrics.quote_count || 0,
        bookmarks: publicMetrics.bookmark_count || 0,
        replies: publicMetrics.reply_count || 0,
        urlClicks: organicMetrics.url_link_clicks || 0,
      },

      lastFetched: new Date().toISOString(),
      fetchCount: (post.analytics?.fetchCount || 0) + 1,
      errors: [],
    };

    await db
      .update(scheduledPosts)
      .set({
        analytics,
        updatedAt: new Date(),
      })
      .where(eq(scheduledPosts.id, postId));

    console.log(`✅ Fetched analytics for Twitter post ${postId}`);
  } catch (error: any) {
    console.error(`❌ Error fetching Twitter analytics for ${postId}:`, error.message);

    const existingAnalytics = post.analytics || {};
    const errors = existingAnalytics.errors || [];
    errors.push(`${new Date().toISOString()}: ${error.message}`);

    await db
      .update(scheduledPosts)
      .set({
        analytics: {
          ...existingAnalytics,
          errors,
          lastFetched: new Date().toISOString(),
        },
        updatedAt: new Date(),
      })
      .where(eq(scheduledPosts.id, postId));

    throw error;
  }
}

export async function fetchPostAnalytics(postId: string): Promise<void> {
  const post = await db.query.scheduledPosts.findFirst({
    where: eq(scheduledPosts.id, postId),
  });

  if (!post) {
    throw new Error("Post not found");
  }

  switch (post.platform) {
    case "facebook":
      await fetchFacebookAnalytics(postId);
      break;
    case "instagram":
      await fetchInstagramAnalytics(postId);
      break;
    case "twitter":
      await fetchTwitterAnalytics(postId);
      break;
    default:
      throw new Error(`Analytics not supported for platform: ${post.platform}`);
  }
}
