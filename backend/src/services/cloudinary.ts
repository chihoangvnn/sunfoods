import { v2 as cloudinary } from 'cloudinary';
// Removed CloudinaryImage, CloudinaryVideo imports - not exported from schema

// Configure Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME === 'Untitled' ? 'dnqfvqnsg' : process.env.CLOUDINARY_CLOUD_NAME;

cloudinary.config({
  cloud_name: cloudName,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadOptions {
  folder?: string;
  public_id?: string;
  tags?: string[];
  alt?: string;
  resource_type?: 'auto' | 'image' | 'video';
}

export interface CloudinaryUploadResult {
  public_id: string;
  asset_id?: string;
  secure_url: string;
  resource_type: 'image' | 'video';
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
  folder?: string;
  version: number;
  created_at: string;
  tags?: string[];
}

/**
 * Upload file buffer to Cloudinary
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  mimetype: string,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  try {
    // Convert buffer to base64
    const fileBase64 = fileBuffer.toString('base64');
    const fileUri = `data:${mimetype};base64,${fileBase64}`;

    // Determine resource type from mimetype
    let resourceType: 'image' | 'video' | 'auto' = options.resource_type || 'auto';
    if (mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else if (mimetype.startsWith('video/')) {
      resourceType = 'video';
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(fileUri, {
      folder: options.folder || 'products',
      public_id: options.public_id,
      tags: options.tags,
      resource_type: resourceType,
      quality: 'auto',
      fetch_format: 'auto',
    });

    return {
      public_id: result.public_id,
      asset_id: result.asset_id,
      secure_url: result.secure_url,
      resource_type: result.resource_type as 'image' | 'video',
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      duration: result.duration,
      folder: result.folder,
      version: result.version,
      created_at: result.created_at,
      tags: result.tags,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete from Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert Cloudinary upload result to typed schema format
 */
export function convertToCloudinaryMedia(result: CloudinaryUploadResult, alt?: string): any {
  const base = {
    public_id: result.public_id,
    asset_id: result.asset_id,
    secure_url: result.secure_url,
    resource_type: result.resource_type,
    format: result.format,
    bytes: result.bytes,
    folder: result.folder,
    version: result.version,
    created_at: result.created_at,
    tags: result.tags,
    alt,
  };

  if (result.resource_type === 'image') {
    return {
      ...base,
      resource_type: 'image',
      width: result.width || 0,
      height: result.height || 0,
    } as any;
  } else {
    return {
      ...base,
      resource_type: 'video',
      duration: result.duration || 0,
      width: result.width,
      height: result.height,
      thumbnail_url: result.secure_url.replace(/\.[^/.]+$/, '.jpg'), // Generate thumbnail URL
    } as any;
  }
}

/**
 * Generate optimized URL with transformations
 */
export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'crop';
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): string {
  return cloudinary.url(publicId, {
    width: options.width,
    height: options.height,
    crop: options.crop || 'fill',
    quality: options.quality || 'auto',
    fetch_format: options.format || 'auto',
  });
}

/**
 * Upload file from URL to Cloudinary
 */
export async function uploadFromUrl(
  url: string,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  try {
    // Determine resource type from URL extension if not provided
    let resourceType: 'image' | 'video' | 'auto' = options.resource_type || 'auto';
    const ext = url.split('.').pop()?.toLowerCase();
    
    if (ext && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      resourceType = 'image';
    } else if (ext && ['mp4', 'mov', 'avi', 'webm'].includes(ext)) {
      resourceType = 'video';
    }

    // Upload to Cloudinary from URL
    const result = await cloudinary.uploader.upload(url, {
      folder: options.folder || 'content-library',
      public_id: options.public_id,
      tags: options.tags,
      resource_type: resourceType,
      quality: 'auto',
      fetch_format: 'auto',
    });

    return {
      public_id: result.public_id,
      asset_id: result.asset_id,
      secure_url: result.secure_url,
      resource_type: result.resource_type as 'image' | 'video',
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      duration: result.duration,
      folder: result.folder,
      version: result.version,
      created_at: result.created_at,
      tags: result.tags,
    };
  } catch (error) {
    console.error('Cloudinary URL upload error:', error);
    throw new Error(`Failed to upload from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Batch upload from URLs with parallel processing
 */
export interface BatchUploadItem {
  url: string;
  filename: string;
  altText?: string;
  caption?: string;
  tags?: string[];
  categoryId?: number;
}

export interface BatchUploadResult {
  success: boolean;
  total: number;
  uploaded: number;
  failed: number;
  results: Array<{
    url: string;
    filename: string;
    success: boolean;
    error?: string;
    cloudinaryResult?: CloudinaryUploadResult;
  }>;
}

export async function batchUploadFromUrls(
  items: BatchUploadItem[],
  options: { batchSize?: number; folder?: string } = {}
): Promise<BatchUploadResult> {
  const { batchSize = 5, folder = 'content-library' } = options;
  
  const results: BatchUploadResult['results'] = [];
  let uploaded = 0;
  let failed = 0;

  // Process in batches to avoid overwhelming Cloudinary
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (item) => {
      try {
        const cloudinaryResult = await uploadFromUrl(item.url, {
          folder,
          tags: item.tags,
        });

        uploaded++;
        return {
          url: item.url,
          filename: item.filename,
          success: true,
          cloudinaryResult,
        };
      } catch (error) {
        failed++;
        return {
          url: item.url,
          filename: item.filename,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return {
    success: failed === 0,
    total: items.length,
    uploaded,
    failed,
    results,
  };
}

export { cloudinary };