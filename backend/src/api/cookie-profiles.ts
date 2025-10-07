import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import type { CookieProfile, UpsertCookieProfile, UpdateCookieProfile } from '../../shared/schema';

const router = Router();

// Input validation schemas
const createCookieProfileSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  socialNetwork: z.string().min(1, "Social network is required"),
  groupTag: z.string().min(1, "Group tag is required"),
  accountName: z.string().min(1, "Account name is required"),
  encryptedData: z.string().min(1, "Encrypted data is required"),
  metadata: z.object({
    browser: z.string().optional(),
    userAgent: z.string().optional(),
    domain: z.string().optional(),
    cookieCount: z.number().optional(),
    captureMethod: z.enum(['manual', 'extension']).optional(),
    notes: z.string().optional(),
  }).optional(),
});

const updateCookieProfileSchema = createCookieProfileSchema.partial();

const querySchema = z.object({
  search: z.string().optional(),
  userId: z.string().optional(),
  socialNetwork: z.string().optional(),
  groupTag: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
});

// 🔍 GET /api/cookie-profiles - Get all cookie profiles with filtering
router.get('/', async (req, res) => {
  try {
    const query = querySchema.parse(req.query);
    
    const filters = {
      search: query.search,
      userId: query.userId,
      socialNetwork: query.socialNetwork,
      groupTag: query.groupTag,
      isActive: query.isActive ? query.isActive === 'true' : undefined,
    };

    const pagination = {
      limit: query.limit ? parseInt(query.limit) : 50,
      offset: query.offset ? parseInt(query.offset) : 0,
    };

    const profiles = await storage.getCookieProfiles(filters, pagination);
    
    res.json(profiles);
  } catch (error: any) {
    console.error('❌ Error fetching cookie profiles:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid query parameters',
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to fetch cookie profiles' });
  }
});

// 📊 GET /api/cookie-profiles/stats/summary - Get cookie profiles statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await storage.getCookieProfileStats();
    
    res.json(stats);
  } catch (error: any) {
    console.error('❌ Error fetching cookie profile stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Search schema with scoring
const searchCookieProfileSchema = z.object({
  q: z.string().min(1, "Search query is required"),
  userId: z.string().optional(),
  platform: z.string().optional(), // Current platform for boosting
  limit: z.number().max(50).default(10),
});

// 🔍 GET /api/cookie-profiles/search - Smart search with scoring
router.get('/search', async (req, res) => {
  try {
    const { q, userId, platform, limit } = searchCookieProfileSchema.parse({
      q: req.query.q,
      userId: req.query.userId,
      platform: req.query.platform,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
    });

    // Fetch all profiles for the user (with reasonable limit)
    const filters: any = {};
    if (userId) filters.userId = userId;
    
    const allProfiles = await storage.getCookieProfiles(filters, { limit: 1000, offset: 0 });

    // Score each profile
    const searchLower = q.toLowerCase();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const scoredProfiles = allProfiles.map(profile => {
      let score = 0;
      const accountLower = profile.accountName.toLowerCase();

      // Exact match: +100
      if (accountLower === searchLower) {
        score += 100;
      }
      // Starts with: +50
      else if (accountLower.startsWith(searchLower)) {
        score += 50;
      }
      // Contains: +25
      else if (accountLower.includes(searchLower)) {
        score += 25;
      }

      // Same platform: +30
      if (platform && profile.socialNetwork.toLowerCase() === platform.toLowerCase()) {
        score += 30;
      }

      // Recently used (within 1 hour): +20
      if (profile.lastUsed && new Date(profile.lastUsed) > oneHourAgo) {
        score += 20;
      }

      return {
        ...profile,
        _score: score,
      };
    });

    // Filter profiles with score > 0 and sort by score descending
    const results = scoredProfiles
      .filter(p => p._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, limit);

    res.json({
      results: results.map(({ _score, ...profile }) => ({
        ...profile,
        score: _score,
      })),
      totalMatches: results.length,
      query: q,
    });
  } catch (error: any) {
    console.error('❌ Error in smart search:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid search parameters',
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to search cookie profiles' });
  }
});

// 🔍 GET /api/cookie-profiles/:id - Get specific cookie profile  
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const profile = await storage.getCookieProfileById(id);
    
    if (!profile) {
      return res.status(404).json({ error: 'Cookie profile not found' });
    }
    
    res.json(profile);
  } catch (error: any) {
    console.error('❌ Error fetching cookie profile:', error);
    res.status(500).json({ error: 'Failed to fetch cookie profile' });
  }
});

// ➕ POST /api/cookie-profiles - Create new cookie profile
router.post('/', async (req, res) => {
  try {
    const profileData = createCookieProfileSchema.parse(req.body);
    
    // NOTE: Skip user validation - cookie profiles can be for external users
    // const userExists = await storage.getUserById(profileData.userId);
    // if (!userExists) {
    //   return res.status(400).json({ error: 'User not found' });
    // }

    const profile = await storage.createCookieProfile(profileData);
    
    res.status(201).json(profile);
  } catch (error: any) {
    console.error('❌ Error creating cookie profile:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to create cookie profile' });
  }
});

// ✏️ PUT /api/cookie-profiles/:id - Update cookie profile
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = updateCookieProfileSchema.parse(req.body);
    
    // Check if profile exists
    const existingProfile = await storage.getCookieProfileById(id);
    if (!existingProfile) {
      return res.status(404).json({ error: 'Cookie profile not found' });
    }

    // If userId is being updated, verify new user exists
    if (updates.userId) {
      const userExists = await storage.getUser(updates.userId);
      if (!userExists) {
        return res.status(400).json({ error: 'User not found' });
      }
    }

    const updatedProfile = await storage.updateCookieProfile(id, {
      ...updates,
      updatedAt: new Date(),
    });
    
    res.json(updatedProfile);
  } catch (error: any) {
    console.error('❌ Error updating cookie profile:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to update cookie profile' });
  }
});

// 🗑️ DELETE /api/cookie-profiles/:id - Delete cookie profile
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingProfile = await storage.getCookieProfileById(id);
    if (!existingProfile) {
      return res.status(404).json({ error: 'Cookie profile not found' });
    }

    await storage.deleteCookieProfile(id);
    
    res.json({ message: 'Cookie profile deleted successfully' });
  } catch (error: any) {
    console.error('❌ Error deleting cookie profile:', error);
    res.status(500).json({ error: 'Failed to delete cookie profile' });
  }
});

// =================================================================
// 🔄 SMART ENDPOINTS FOR CHROME EXTENSION
// =================================================================

// Upsert schema for smart create/update
const upsertCookieProfileSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  socialNetwork: z.string().min(1, "Social network is required"),
  groupTag: z.string().min(1, "Group tag is required"),
  accountName: z.string().min(1, "Account name is required"),
  encryptedData: z.string().min(1, "Encrypted data is required"),
  metadata: z.object({
    browser: z.string().optional(),
    userAgent: z.string().optional(),
    domain: z.string().optional(),
    cookieCount: z.number().optional(),
    captureMethod: z.enum(['manual', 'extension']).optional(),
    notes: z.string().optional(),
  }).optional(),
  clientVersion: z.number().min(0, "Client version is required"), // Mandatory for conflict detection
});

// 🔄 POST /api/cookie-profiles/upsert - Smart upsert (auto create/update)
router.post('/upsert', async (req, res) => {
  try {
    const profileData = upsertCookieProfileSchema.parse(req.body);
    
    // NOTE: Skip user validation - cookie profiles can be for external users
    // const userExists = await storage.getUserById(profileData.userId);
    // if (!userExists) {
    //   return res.status(400).json({ error: 'User not found' });
    // }

    // Check for existing profile by identity key (userId + socialNetwork + accountName)
    // NOTE: groupTag is NOT part of identity - user can change group without creating duplicate
    const existingProfile = await storage.getCookieProfileByIdentity(
      profileData.userId,
      profileData.socialNetwork,
      profileData.accountName
    );

    if (existingProfile) {
      // UPDATE existing profile with atomic version control
      const serverVersion = existingProfile.version || 1;
      const clientVersion = profileData.clientVersion;

      // Strict version check: client version must match server version
      if (clientVersion !== serverVersion) {
        return res.status(409).json({
          error: 'Conflict detected',
          message: 'Cookie version mismatch - data has been updated elsewhere',
          serverProfile: existingProfile,
          clientVersion,
          serverVersion,
        });
      }

      // Atomic update with version check in WHERE clause
      const updateResult = await storage.updateCookieProfileWithVersion(
        existingProfile.id,
        serverVersion, // Expected version
        {
          encryptedData: profileData.encryptedData,
          groupTag: profileData.groupTag,
          metadata: profileData.metadata,
          lastUsed: new Date(),
          version: serverVersion + 1,
        }
      );

      if (!updateResult.success) {
        // Concurrent update detected
        return res.status(409).json({
          error: 'Conflict detected',
          message: 'Cookie was updated by another request',
          currentVersion: updateResult.currentVersion,
          expectedVersion: serverVersion,
        });
      }

      return res.json({
        success: true,
        action: 'updated',
        profile: updateResult.profile,
        message: 'Cookie profile updated successfully',
      });
    } else {
      // CREATE new profile
      try {
        // Strip clientVersion before DB insert (not a database column)
        const { clientVersion: _, ...dbProfileData } = profileData;
        
        const newProfile = await storage.createCookieProfile({
          ...dbProfileData,
          version: 1,
          lastUsed: new Date(),
        });

        return res.status(201).json({
          success: true,
          action: 'created',
          profile: newProfile,
          message: 'Cookie profile created successfully',
        });
      } catch (createError: any) {
        // Handle unique constraint violation from concurrent requests
        if (createError.code === '23505' || createError.message?.includes('unique constraint')) {
          // Profile was created by another request, fetch by precise identity
          const retryProfile = await storage.getCookieProfileByIdentity(
            profileData.userId,
            profileData.socialNetwork,
            profileData.accountName
          );
          
          if (retryProfile) {
            return res.status(200).json({
              success: true,
              action: 'found_existing',
              profile: retryProfile,
              message: 'Cookie profile already exists',
            });
          }
        }
        throw createError; // Re-throw if not a duplicate error
      }
    }
  } catch (error: any) {
    console.error('❌ Error in upsert cookie profile:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to upsert cookie profile' });
  }
});

// Verification schema
const verifyCookieProfileSchema = z.object({
  accessToken: z.string().min(1, "Access token is required"),
});

// 🔐 POST /api/cookie-profiles/:id/verify - Verify Facebook cookie and fetch ad accounts
router.post('/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { accessToken } = verifyCookieProfileSchema.parse(req.body);
    
    // Get profile
    const profile = await storage.getCookieProfileById(id);
    if (!profile) {
      return res.status(404).json({ error: 'Cookie profile not found' });
    }

    // Verify it's a Facebook profile
    if (profile.socialNetwork.toLowerCase() !== 'facebook') {
      return res.status(400).json({ 
        error: 'Only Facebook profiles can be verified for ad accounts' 
      });
    }

    try {
      // Call Facebook Graph API to get ad accounts
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,account_id,name,account_status,spend_cap,amount_spent,currency,disable_reason&access_token=${accessToken}`
      );

      if (!response.ok) {
        const error = await response.json();
        return res.status(400).json({
          error: 'Facebook API error',
          message: error.error?.message || 'Failed to fetch ad accounts',
          isVerified: false,
          verificationStatus: 'error',
        });
      }

      const data = await response.json();
      const adAccounts = (data.data || []).map((account: any) => ({
        accountId: account.account_id || account.id,
        accountName: account.name,
        accountStatus: account.account_status,
        spendCap: account.spend_cap ? parseFloat(account.spend_cap) : undefined,
        amountSpent: account.amount_spent ? parseFloat(account.amount_spent) : undefined,
        currency: account.currency,
        disableReason: account.disable_reason,
        lastChecked: new Date().toISOString(),
      }));

      // Update profile with verification data
      const updatedProfile = await storage.updateCookieProfile(id, {
        isVerified: true,
        verificationStatus: 'valid',
        lastVerifiedAt: new Date(),
        hasAdsAccess: adAccounts.length > 0,
        adAccounts: adAccounts,
        updatedAt: new Date(),
      });

      res.json({
        success: true,
        isVerified: true,
        verificationStatus: 'valid',
        adAccountsCount: adAccounts.length,
        adAccounts,
        profile: updatedProfile,
        message: `Found ${adAccounts.length} ad account(s)`,
      });
    } catch (apiError: any) {
      console.error('❌ Facebook API error:', apiError);
      
      // Update profile with error status
      await storage.updateCookieProfile(id, {
        isVerified: false,
        verificationStatus: 'error',
        lastVerifiedAt: new Date(),
        updatedAt: new Date(),
      });

      res.status(500).json({
        error: 'Failed to verify Facebook cookie',
        message: apiError.message,
        isVerified: false,
        verificationStatus: 'error',
      });
    }
  } catch (error: any) {
    console.error('❌ Error in verify cookie profile:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to verify cookie profile' });
  }
});

// =================================================================
// 🔄 SYNC ENDPOINTS FOR CHROME EXTENSION
// =================================================================

// Bulk upload schema for Chrome extension
const bulkUploadSchema = z.object({
  profiles: z.array(createCookieProfileSchema.extend({
    clientId: z.string().optional(), // Unique client-side ID for conflict resolution
    lastModified: z.string().datetime().optional(), // ISO timestamp from client
  })),
  conflictResolution: z.enum(['server_wins', 'client_wins', 'latest_wins']).default('latest_wins'),
  chunkIndex: z.number().optional(), // For chunked uploads
  totalChunks: z.number().optional(),
});

// Delta sync schema
const deltaSyncSchema = z.object({
  lastSyncTimestamp: z.string().datetime(),
  userId: z.string().optional(),
  socialNetwork: z.string().optional(),
  limit: z.number().max(100).default(50),
  cursor: z.string().optional(), // Format: "timestamp:id" for proper pagination
});

// 📤 POST /api/cookie-profiles/sync/upload - Bulk upload profiles
router.post('/sync/upload', async (req, res) => {
  try {
    const { profiles, conflictResolution, chunkIndex, totalChunks } = bulkUploadSchema.parse(req.body);
    
    console.log(`🔄 Processing bulk upload: ${profiles.length} profiles (chunk ${chunkIndex || 1}/${totalChunks || 1})`);
    
    const results = {
      uploaded: 0,
      updated: 0,
      skipped: 0,
      errors: [] as Array<{ profile: any; error: string }>,
    };

    // Batch validate users first
    const userIds = Array.from(new Set(profiles.map(p => p.userId)));
    const validUsers = await storage.validateUsersBatch(userIds);
    
    // Batch check for existing profiles
    const compositeKeys = profiles.map(p => ({
      userId: p.userId,
      socialNetwork: p.socialNetwork,
      groupTag: p.groupTag,
      accountName: p.accountName,
    }));
    const existingProfilesMap = await storage.getCookieProfilesByCompositeKeys(compositeKeys);

    // Process each profile with optimized conflict resolution
    for (const profileData of profiles) {
      try {
        // Check if user exists (from batch validation)
        if (!validUsers.has(profileData.userId)) {
          results.errors.push({ profile: profileData, error: 'User not found' });
          continue;
        }

        // Check for existing profile using composite key
        const compositeKey = `${profileData.userId}:${profileData.socialNetwork}:${profileData.groupTag}:${profileData.accountName}`;
        const existingProfile = existingProfilesMap.get(compositeKey);

        if (existingProfile) {
          // Handle conflict resolution
          let shouldUpdate = false;
          
          switch (conflictResolution) {
            case 'client_wins':
              shouldUpdate = true;
              break;
            case 'server_wins':
              shouldUpdate = false;
              break;
            case 'latest_wins':
              const clientTime = profileData.lastModified ? new Date(profileData.lastModified) : new Date();
              const serverTime = existingProfile.updatedAt ? new Date(existingProfile.updatedAt) : new Date(0);
              shouldUpdate = clientTime > serverTime;
              break;
          }

          if (shouldUpdate) {
            await storage.updateCookieProfile(existingProfile.id, {
              encryptedData: profileData.encryptedData,
              metadata: profileData.metadata,
              updatedAt: new Date(),
            });
            results.updated++;
          } else {
            results.skipped++;
          }
        } else {
          // Create new profile
          await storage.createCookieProfile(profileData);
          results.uploaded++;
        }
      } catch (error: any) {
        console.error('❌ Error processing profile:', error);
        results.errors.push({ 
          profile: profileData, 
          error: error.message || 'Unknown error' 
        });
      }
    }

    console.log(`✅ Bulk upload completed: ${results.uploaded} uploaded, ${results.updated} updated, ${results.skipped} skipped, ${results.errors.length} errors`);
    
    res.json({
      success: true,
      results,
      chunkIndex,
      totalChunks,
      message: `Processed ${profiles.length} profiles successfully`
    });
  } catch (error: any) {
    console.error('❌ Error in bulk upload:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to process bulk upload' });
  }
});

// 📥 GET /api/cookie-profiles/sync/download - Bulk download with filters
router.get('/sync/download', async (req, res) => {
  try {
    const query = querySchema.extend({
      includeMetadata: z.enum(['true', 'false']).default('true'),
      format: z.enum(['full', 'minimal']).default('full'),
      chunkSize: z.string().regex(/^\d+$/).optional(),
      chunkIndex: z.string().regex(/^\d+$/).optional(),
    }).parse(req.query);
    
    const filters = {
      search: query.search,
      userId: query.userId,
      socialNetwork: query.socialNetwork,
      groupTag: query.groupTag,
      isActive: query.isActive ? query.isActive === 'true' : undefined,
    };

    // Calculate chunking for large datasets with enforced limits
    const requestedChunkSize = query.chunkSize ? parseInt(query.chunkSize) : 100;
    const chunkSize = Math.min(requestedChunkSize, 100); // Enforce max chunk size
    const chunkIndex = query.chunkIndex ? parseInt(query.chunkIndex) : 0;
    
    console.log(`📥 Download request: requested=${requestedChunkSize}, enforced=${chunkSize}`);
    
    const pagination = {
      limit: chunkSize,
      offset: chunkIndex * chunkSize,
    };

    console.log(`📥 Downloading profiles: chunk ${chunkIndex} (${chunkSize} items)`);
    
    const profiles = await storage.getCookieProfiles(filters, pagination);
    
    // Format response based on requirements
    const formattedProfiles = profiles.map(profile => {
      if (query.format === 'minimal') {
        return {
          id: profile.id,
          userId: profile.userId,
          socialNetwork: profile.socialNetwork,
          groupTag: profile.groupTag,
          accountName: profile.accountName,
          encryptedData: profile.encryptedData,
          updatedAt: profile.updatedAt,
        };
      }
      
      return query.includeMetadata === 'true' ? profile : {
        ...profile,
        metadata: undefined,
      };
    });

    // Get total count for pagination info
    const totalProfiles = await storage.getCookieProfilesCount(filters);
    const totalChunks = Math.ceil(totalProfiles / chunkSize);
    
    res.json({
      profiles: formattedProfiles,
      pagination: {
        chunkIndex,
        chunkSize, // This is now the enforced size
        requestedChunkSize: requestedChunkSize !== chunkSize ? requestedChunkSize : undefined,
        totalChunks,
        totalProfiles,
        hasMore: chunkIndex < totalChunks - 1,
      },
      downloadedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Error in bulk download:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid query parameters',
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to download profiles' });
  }
});

// 🔄 POST /api/cookie-profiles/sync/delta - Delta sync for recent changes
router.post('/sync/delta', async (req, res) => {
  try {
    const { lastSyncTimestamp, userId, socialNetwork, limit, cursor } = deltaSyncSchema.parse(req.body);
    
    console.log(`🔄 Delta sync from ${lastSyncTimestamp}, cursor: ${cursor || 'none'}`);
    
    // Parse composite cursor (format: "timestamp:id")
    let cursorTimestamp: Date | undefined;
    let cursorId: string | undefined;
    if (cursor) {
      const cursorParts = cursor.split(':');
      if (cursorParts.length === 2) {
        cursorTimestamp = new Date(cursorParts[0]);
        cursorId = cursorParts[1];
      } else {
        // Fallback for old cursor format (just timestamp)
        cursorTimestamp = new Date(cursor);
      }
    }

    // Get profiles modified after the last sync timestamp with cursor support
    const filters = {
      userId,
      socialNetwork,
      modifiedAfter: new Date(lastSyncTimestamp),
      cursorTimestamp,
      cursorId,
    };
    
    const pagination = { limit: limit + 1, offset: 0 }; // Get one extra to check if more exist
    const recentProfiles = await storage.getCookieProfilesModifiedAfter(lastSyncTimestamp, filters, pagination);
    
    // Check if there are more results
    const hasMore = recentProfiles.length > limit;
    const profiles = hasMore ? recentProfiles.slice(0, limit) : recentProfiles;
    
    // Generate next cursor from the last profile's updatedAt and id (format: "timestamp:id")
    const lastProfile = profiles[profiles.length - 1];
    const nextCursor = hasMore && profiles.length > 0 && lastProfile?.updatedAt
      ? `${lastProfile.updatedAt.toISOString()}:${lastProfile.id}`
      : null;
    
    const syncData = {
      profiles,
      syncTimestamp: new Date().toISOString(),
      lastSyncTimestamp,
      profilesCount: profiles.length,
      hasMore,
      nextCursor,
    };
    
    console.log(`✅ Delta sync completed: ${profiles.length} profiles changed, hasMore: ${hasMore}`);
    
    res.json(syncData);
  } catch (error: any) {
    console.error('❌ Error in delta sync:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to perform delta sync' });
  }
});

// 🔍 GET /api/cookie-profiles/sync/status - Get sync status and metadata
router.get('/sync/status', async (req, res) => {
  try {
    const { userId } = req.query;
    
    const stats = await storage.getCookieProfileStats();
    const lastSync = await storage.getLastSyncTimestamp(userId as string);
    
    res.json({
      totalProfiles: stats.totalProfiles,
      lastSyncTimestamp: lastSync,
      serverTimestamp: new Date().toISOString(),
      syncEndpoints: {
        upload: '/api/cookie-profiles/sync/upload',
        download: '/api/cookie-profiles/sync/download',
        delta: '/api/cookie-profiles/sync/delta',
      },
      recommendedChunkSize: 50,
      maxChunkSize: 100,
    });
  } catch (error: any) {
    console.error('❌ Error getting sync status:', error);
    res.status(500).json({ error: 'Failed to get sync status' });
  }
});

export default router;