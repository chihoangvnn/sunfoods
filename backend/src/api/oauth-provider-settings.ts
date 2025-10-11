import { Router } from 'express';
import { db } from '../db';
import { oauthProviderSettings } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { requireAdminAuth } from '../middleware/admin-auth';
import { encrypt, decrypt } from '../utils/encryption';

const router = Router();

router.get('/', requireAdminAuth, async (req, res) => {
  try {
    const providers = await db
      .select()
      .from(oauthProviderSettings)
      .orderBy(oauthProviderSettings.createdAt);

    const decryptedProviders = providers.map(provider => ({
      ...provider,
      clientId: decrypt(provider.clientId),
      clientSecret: decrypt(provider.clientSecret),
    }));

    res.json(decryptedProviders);
  } catch (error) {
    console.error('❌ Error fetching OAuth providers:', error);
    res.status(500).json({ 
      error: 'Không thể tải danh sách nhà cung cấp OAuth' 
    });
  }
});

router.post('/', requireAdminAuth, async (req, res) => {
  try {
    const { provider, displayName, clientId, clientSecret, redirectUri, scopes, isActive, metadata } = req.body;

    if (!provider || !displayName || !clientId || !clientSecret) {
      return res.status(400).json({ 
        error: 'Thiếu thông tin bắt buộc: provider, displayName, clientId, clientSecret' 
      });
    }

    const encryptedClientId = encrypt(clientId);
    const encryptedClientSecret = encrypt(clientSecret);

    const [newProvider] = await db
      .insert(oauthProviderSettings)
      .values({
        provider,
        displayName,
        clientId: encryptedClientId,
        clientSecret: encryptedClientSecret,
        redirectUri,
        scopes,
        isActive: isActive !== undefined ? isActive : true,
        metadata: metadata || {},
      })
      .returning();

    const decryptedProvider = {
      ...newProvider,
      clientId: decrypt(newProvider.clientId),
      clientSecret: decrypt(newProvider.clientSecret),
    };

    res.status(201).json(decryptedProvider);
  } catch (error: any) {
    console.error('❌ Error creating OAuth provider:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ 
        error: 'Nhà cung cấp OAuth này đã tồn tại' 
      });
    }
    
    res.status(500).json({ 
      error: 'Không thể tạo cấu hình OAuth' 
    });
  }
});

router.put('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { provider, displayName, clientId, clientSecret, redirectUri, scopes, isActive, metadata } = req.body;

    const existingProvider = await db
      .select()
      .from(oauthProviderSettings)
      .where(eq(oauthProviderSettings.id, id))
      .limit(1);

    if (existingProvider.length === 0) {
      return res.status(404).json({ 
        error: 'Không tìm thấy nhà cung cấp OAuth' 
      });
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (provider !== undefined) updateData.provider = provider;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (clientId !== undefined) updateData.clientId = encrypt(clientId);
    if (clientSecret !== undefined) updateData.clientSecret = encrypt(clientSecret);
    if (redirectUri !== undefined) updateData.redirectUri = redirectUri;
    if (scopes !== undefined) updateData.scopes = scopes;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (metadata !== undefined) updateData.metadata = metadata;

    const [updatedProvider] = await db
      .update(oauthProviderSettings)
      .set(updateData)
      .where(eq(oauthProviderSettings.id, id))
      .returning();

    const decryptedProvider = {
      ...updatedProvider,
      clientId: decrypt(updatedProvider.clientId),
      clientSecret: decrypt(updatedProvider.clientSecret),
    };

    res.json(decryptedProvider);
  } catch (error: any) {
    console.error('❌ Error updating OAuth provider:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ 
        error: 'Tên nhà cung cấp đã tồn tại' 
      });
    }
    
    res.status(500).json({ 
      error: 'Không thể cập nhật cấu hình OAuth' 
    });
  }
});

router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const existingProvider = await db
      .select()
      .from(oauthProviderSettings)
      .where(eq(oauthProviderSettings.id, id))
      .limit(1);

    if (existingProvider.length === 0) {
      return res.status(404).json({ 
        error: 'Không tìm thấy nhà cung cấp OAuth' 
      });
    }

    await db
      .delete(oauthProviderSettings)
      .where(eq(oauthProviderSettings.id, id));

    res.json({ 
      message: 'Đã xóa cấu hình OAuth thành công' 
    });
  } catch (error) {
    console.error('❌ Error deleting OAuth provider:', error);
    res.status(500).json({ 
      error: 'Không thể xóa cấu hình OAuth' 
    });
  }
});

export default router;
