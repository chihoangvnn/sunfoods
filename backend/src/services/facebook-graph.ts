/**
 * Facebook Graph API Service
 * 
 * Integrates with Facebook Graph API to verify shared posts and get engagement metrics.
 * Used for social sharing verification and engagement tracking.
 * Also provides Messenger Platform API integration for user profile fetching.
 */

import axios from 'axios';

export interface FacebookPost {
  id: string;
  message?: string;
  created_time: string;
  permalink_url?: string;
}

export interface PostVerificationResult {
  exists: boolean;
  postId?: string;
  post?: FacebookPost;
  deleted: boolean;
  error?: string;
}

export interface PostEngagement {
  likes: number;
  shares: number;
  comments: number;
}

export interface EngagementResult {
  success: boolean;
  engagement?: PostEngagement;
  error?: string;
}

export interface VerifyShareResult {
  exists: boolean;
  deleted: boolean;
  postId?: string;
  engagement?: PostEngagement;
  meetsThresholds: boolean;
  thresholdsChecked?: {
    likes: { required: number; actual: number; passed: boolean };
    shares: { required: number; actual: number; passed: boolean };
    comments: { required: number; actual: number; passed: boolean };
  };
  error?: string;
  rawResponse?: any;
}

const GRAPH_API_BASE = 'https://graph.facebook.com/v18.0';

/**
 * Get Facebook Access Token for Graph API calls
 * Requires FACEBOOK_ACCESS_TOKEN environment variable (long-lived user or page token)
 * 
 * To generate a long-lived token:
 * 1. Go to Graph API Explorer: https://developers.facebook.com/tools/explorer/
 * 2. Select your app
 * 3. Generate User Token with permissions: public_profile, email, pages_read_engagement
 * 4. Use Graph API to exchange for long-lived token (60 days):
 *    GET /oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={short-lived-token}
 * 
 * @returns Long-lived access token
 * @throws Error if FACEBOOK_ACCESS_TOKEN is not configured
 */
export function getAccessToken(): string {
  const token = process.env.FACEBOOK_ACCESS_TOKEN;
  
  if (!token) {
    throw new Error('FACEBOOK_ACCESS_TOKEN not configured. Please set a long-lived access token.');
  }
  
  return token;
}

/**
 * Try to fetch post with token, fallback to public access if token fails
 * @param postId - Facebook post ID
 * @param fields - Graph API fields to request
 * @returns Fetch response
 */
async function fetchPostWithFallback(postId: string, fields: string): Promise<Response> {
  try {
    const token = getAccessToken();
    const url = `${GRAPH_API_BASE}/${postId}?fields=${fields}&access_token=${token}`;
    return await fetch(url);
  } catch (tokenError) {
    // Fallback: try public access (works for public posts)
    const url = `${GRAPH_API_BASE}/${postId}?fields=${fields}`;
    return await fetch(url);
  }
}

/**
 * Check rate limit headers and log warnings if approaching limits
 * @param headers Response headers from Facebook API
 */
function checkRateLimit(headers: Headers): void {
  const rateLimitHeader = headers.get('X-App-Usage');
  
  if (rateLimitHeader) {
    try {
      const usage = JSON.parse(rateLimitHeader);
      
      // Log warning if call count exceeds 80%
      if (usage.call_count && usage.call_count > 80) {
        console.warn(`⚠️ Facebook API rate limit warning: ${usage.call_count}% of calls used`);
      }
      
      // Log warning if total time exceeds 80%
      if (usage.total_time && usage.total_time > 80) {
        console.warn(`⚠️ Facebook API rate limit warning: ${usage.total_time}% of time used`);
      }
      
      // Log warning if CPU time exceeds 80%
      if (usage.total_cputime && usage.total_cputime > 80) {
        console.warn(`⚠️ Facebook API rate limit warning: ${usage.total_cputime}% of CPU time used`);
      }
    } catch (error) {
      console.error('Failed to parse rate limit header:', error);
    }
  }
}

/**
 * Verify if a Facebook post exists using Graph API
 * @param postId - Facebook post ID (extracted from share URL)
 * @returns Verification result with post data
 */
export async function verifyPostExists(postId: string): Promise<PostVerificationResult> {
  try {
    const token = getAccessToken();
    const fields = 'id,message,created_time,permalink_url';
    
    const response = await fetch(
      `${GRAPH_API_BASE}/${postId}?fields=${fields}&access_token=${token}`,
      { method: 'GET' }
    );
    
    // Check rate limits
    checkRateLimit(response.headers);
    
    if (response.ok) {
      const post: FacebookPost = (await response.json()) as any;
      return {
        exists: true,
        postId: post.id,
        post,
        deleted: false,
      };
    }
    
    // Handle error responses
    const errorData = (await response.json().catch(() => null)) as any;
    
    // Post not found (deleted or never existed)
    if (response.status === 404 || errorData?.error?.code === 100) {
      return {
        exists: false,
        deleted: true,
        error: 'Post deleted or not found',
      };
    }
    
    // Permission denied (private post)
    if (response.status === 403 || errorData?.error?.code === 200) {
      return {
        exists: false,
        deleted: false,
        error: 'Permission denied - post may be private',
      };
    }
    
    // Rate limit error
    if (response.status === 429 || errorData?.error?.code === 4) {
      return {
        exists: false,
        deleted: false,
        error: 'Rate limit exceeded - please try again later',
      };
    }
    
    // Other errors
    return {
      exists: false,
      deleted: false,
      error: errorData?.error?.message || `API error: ${response.status}`,
    };
  } catch (error) {
    console.error('Error verifying post:', error);
    return {
      exists: false,
      deleted: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get engagement metrics for a Facebook post
 * @param postId - Facebook post ID
 * @returns Engagement metrics (likes, shares, comments)
 */
export async function getPostEngagement(postId: string): Promise<EngagementResult> {
  try {
    const token = getAccessToken();
    const fields = 'likes.summary(true),shares,comments.summary(true)';
    
    const response = await fetch(
      `${GRAPH_API_BASE}/${postId}?fields=${fields}&access_token=${token}`,
      { method: 'GET' }
    );
    
    // Check rate limits
    checkRateLimit(response.headers);
    
    if (!response.ok) {
      const errorData = (await response.json().catch(() => null)) as any;
      
      // Rate limit error
      if (response.status === 429 || errorData?.error?.code === 4) {
        return {
          success: false,
          error: 'Rate limit exceeded - please try again later',
        };
      }
      
      return {
        success: false,
        error: errorData?.error?.message || `API error: ${response.status}`,
      };
    }
    
    const data = (await response.json()) as any;
    
    // Parse engagement data
    const engagement: PostEngagement = {
      likes: data.likes?.summary?.total_count || 0,
      shares: data.shares?.count || 0,
      comments: data.comments?.summary?.total_count || 0,
    };
    
    return {
      success: true,
      engagement,
    };
  } catch (error) {
    console.error('Error getting post engagement:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Complete verification: check if post exists AND meets engagement thresholds
 * @param postId - Facebook post ID
 * @param thresholds - Required engagement levels
 * @returns Complete verification result
 */
export async function verifyShareWithEngagement(
  postId: string,
  thresholds: {
    minLikes: number;
    minShares: number;
    minComments: number;
  }
): Promise<VerifyShareResult> {
  try {
    // Step 1: Check if post exists
    const verificationResult = await verifyPostExists(postId);
    
    if (!verificationResult.exists) {
      return {
        exists: false,
        deleted: verificationResult.deleted,
        error: verificationResult.error,
        meetsThresholds: false,
      };
    }
    
    // Step 2: Get engagement metrics
    const engagementResult = await getPostEngagement(postId);
    
    if (!engagementResult.success || !engagementResult.engagement) {
      return {
        exists: true,
        deleted: false,
        postId: verificationResult.postId,
        error: engagementResult.error,
        meetsThresholds: false,
      };
    }
    
    const engagement = engagementResult.engagement;
    
    // Step 3: Compare against thresholds
    const thresholdsChecked = {
      likes: {
        required: thresholds.minLikes,
        actual: engagement.likes,
        passed: engagement.likes >= thresholds.minLikes,
      },
      shares: {
        required: thresholds.minShares,
        actual: engagement.shares,
        passed: engagement.shares >= thresholds.minShares,
      },
      comments: {
        required: thresholds.minComments,
        actual: engagement.comments,
        passed: engagement.comments >= thresholds.minComments,
      },
    };
    
    const meetsThresholds = 
      thresholdsChecked.likes.passed &&
      thresholdsChecked.shares.passed &&
      thresholdsChecked.comments.passed;
    
    // Step 4: Return comprehensive result
    return {
      exists: true,
      deleted: false,
      postId: verificationResult.postId,
      engagement,
      meetsThresholds,
      thresholdsChecked,
      rawResponse: {
        post: verificationResult.post,
        engagement,
      },
    };
  } catch (error) {
    console.error('Error verifying share with engagement:', error);
    return {
      exists: false,
      deleted: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      meetsThresholds: false,
    };
  }
}

/**
 * Messenger User Profile Interface
 * Represents user profile data from Facebook Messenger Platform API
 */
export interface MessengerUserProfile {
  firstName: string;
  lastName: string;
  gender: string;
  profilePic: string;
  locale: string;
  timezone: number;
}

/**
 * Fetch Messenger user profile using Facebook Graph API
 * 
 * @param psid - Page-Scoped User ID (Facebook Messenger user ID)
 * @param pageAccessToken - Page access token for authentication
 * @returns User profile data or null if the request fails
 * 
 * @example
 * ```typescript
 * const profile = await fetchMessengerUserProfile('123456789', 'EAABsbCS...');
 * if (profile) {
 *   console.log(`User: ${profile.firstName} ${profile.lastName}`);
 * }
 * ```
 */
export async function fetchMessengerUserProfile(
  psid: string,
  pageAccessToken: string
): Promise<MessengerUserProfile | null> {
  try {
    // Validate inputs
    if (!psid || !pageAccessToken) {
      console.error('fetchMessengerUserProfile: Missing required parameters');
      return null;
    }

    // Build Graph API URL with required fields
    const url = `${GRAPH_API_BASE}/${psid}`;
    const fields = 'first_name,last_name,gender,profile_pic,locale,timezone';

    // Make request using axios
    const response = await axios.get(url, {
      params: {
        fields,
        access_token: pageAccessToken,
      },
      timeout: 10000, // 10 second timeout
    });

    // Check rate limits if available
    if (response.headers['x-app-usage']) {
      try {
        const usage = JSON.parse(response.headers['x-app-usage']);
        if (usage.call_count && usage.call_count > 80) {
          console.warn(`⚠️ Facebook API rate limit warning: ${usage.call_count}% of calls used`);
        }
      } catch (error) {
        // Ignore rate limit parsing errors
      }
    }

    // Parse and validate response data
    const data = response.data;
    
    if (!data.first_name || !data.last_name) {
      console.error('fetchMessengerUserProfile: Incomplete user data received');
      return null;
    }

    // Transform API response to our interface
    const profile: MessengerUserProfile = {
      firstName: data.first_name,
      lastName: data.last_name,
      gender: data.gender || 'unknown',
      profilePic: data.profile_pic || '',
      locale: data.locale || 'en_US',
      timezone: data.timezone || 0,
    };

    return profile;
  } catch (error) {
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data;

      // Log specific error cases
      if (status === 404 || errorData?.error?.code === 100) {
        console.error(`fetchMessengerUserProfile: User not found (PSID: ${psid})`);
      } else if (status === 403 || errorData?.error?.code === 200) {
        console.error(`fetchMessengerUserProfile: Permission denied (PSID: ${psid})`);
      } else if (status === 429 || errorData?.error?.code === 4) {
        console.error('fetchMessengerUserProfile: Rate limit exceeded');
      } else {
        console.error(
          `fetchMessengerUserProfile: API error (${status}): ${errorData?.error?.message || error.message}`
        );
      }
    } else {
      console.error('fetchMessengerUserProfile: Unexpected error:', error);
    }

    return null;
  }
}
