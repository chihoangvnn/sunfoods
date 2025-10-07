export type Platform = 'facebook' | 'instagram' | 'tiktok';

export interface MediaAsset {
  type: 'image' | 'video';
  url: string;
  width?: number;
  height?: number;
  duration?: number;
}

export interface PreviewOptions {
  text: string;
  media?: MediaAsset[];
  platform: Platform;
}

export interface PlatformLimits {
  maxTextLength: number;
  maxHashtags: number;
  maxMentions: number;
  supportedMediaTypes: ('image' | 'video')[];
  maxMediaCount: number;
  recommendedAspectRatios: {
    min: number;
    max: number;
    optimal?: number;
  };
}

export interface PreviewResult {
  platform: Platform;
  text: {
    original: string;
    formatted: string;
    length: number;
    hashtags: string[];
    mentions: string[];
    truncated: boolean;
  };
  media: {
    assets: MediaAsset[];
    warnings: string[];
  };
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export class ContentPreviewService {
  private platformLimits: Record<Platform, PlatformLimits> = {
    facebook: {
      maxTextLength: 63206,
      maxHashtags: 30,
      maxMentions: 30,
      supportedMediaTypes: ['image', 'video'],
      maxMediaCount: 10,
      recommendedAspectRatios: {
        min: 0.8,
        max: 1.91,
        optimal: 1.91
      }
    },
    instagram: {
      maxTextLength: 2200,
      maxHashtags: 30,
      maxMentions: 20,
      supportedMediaTypes: ['image', 'video'],
      maxMediaCount: 10,
      recommendedAspectRatios: {
        min: 0.8,
        max: 1.91,
        optimal: 1.0
      }
    },
    tiktok: {
      maxTextLength: 2200,
      maxHashtags: 20,
      maxMentions: 20,
      supportedMediaTypes: ['video', 'image'],
      maxMediaCount: 35,
      recommendedAspectRatios: {
        min: 0.5625,
        max: 1.0,
        optimal: 0.5625
      }
    }
  };

  async generatePreview(options: PreviewOptions): Promise<PreviewResult> {
    const { text, media = [], platform } = options;
    const limits = this.platformLimits[platform];

    const hashtags = this.extractHashtags(text);
    const mentions = this.extractMentions(text);
    
    const formattedText = this.formatText(text, platform);
    const truncated = formattedText.length < text.length;

    const mediaWarnings: string[] = [];
    const validationErrors: string[] = [];
    const validationWarnings: string[] = [];

    if (text.length > limits.maxTextLength) {
      validationWarnings.push(
        `Text exceeds ${limits.maxTextLength} characters (${text.length} chars). It will be truncated.`
      );
    }

    if (hashtags.length > limits.maxHashtags) {
      validationWarnings.push(
        `Too many hashtags (${hashtags.length}). Maximum is ${limits.maxHashtags}.`
      );
    }

    if (mentions.length > limits.maxMentions) {
      validationWarnings.push(
        `Too many mentions (${mentions.length}). Maximum is ${limits.maxMentions}.`
      );
    }

    if (media.length > limits.maxMediaCount) {
      validationErrors.push(
        `Too many media items (${media.length}). Maximum is ${limits.maxMediaCount}.`
      );
    }

    media.forEach((asset, index) => {
      if (!limits.supportedMediaTypes.includes(asset.type)) {
        validationErrors.push(
          `Media item ${index + 1}: ${asset.type} is not supported on ${platform}`
        );
      }

      if (asset.width && asset.height) {
        const aspectRatio = asset.width / asset.height;
        
        if (aspectRatio < limits.recommendedAspectRatios.min) {
          mediaWarnings.push(
            `Media item ${index + 1}: Aspect ratio ${aspectRatio.toFixed(2)} is too narrow. Minimum recommended is ${limits.recommendedAspectRatios.min}.`
          );
        }
        
        if (aspectRatio > limits.recommendedAspectRatios.max) {
          mediaWarnings.push(
            `Media item ${index + 1}: Aspect ratio ${aspectRatio.toFixed(2)} is too wide. Maximum recommended is ${limits.recommendedAspectRatios.max}.`
          );
        }

        if (limits.recommendedAspectRatios.optimal) {
          const optimalRatio = limits.recommendedAspectRatios.optimal;
          if (Math.abs(aspectRatio - optimalRatio) > 0.2) {
            mediaWarnings.push(
              `Media item ${index + 1}: Optimal aspect ratio for ${platform} is ${optimalRatio}. Current: ${aspectRatio.toFixed(2)}.`
            );
          }
        }
      }

      if (asset.type === 'video') {
        if (platform === 'instagram' && asset.duration && asset.duration > 60) {
          validationWarnings.push(
            `Video ${index + 1}: Duration ${asset.duration}s exceeds Instagram feed limit of 60s.`
          );
        }
        if (platform === 'tiktok' && asset.duration && asset.duration > 180) {
          validationWarnings.push(
            `Video ${index + 1}: Duration ${asset.duration}s exceeds TikTok limit of 180s.`
          );
        }
      }
    });

    return {
      platform,
      text: {
        original: text,
        formatted: formattedText,
        length: formattedText.length,
        hashtags,
        mentions,
        truncated
      },
      media: {
        assets: media,
        warnings: mediaWarnings
      },
      validation: {
        isValid: validationErrors.length === 0,
        errors: validationErrors,
        warnings: [...validationWarnings, ...mediaWarnings]
      }
    };
  }

  async generateMultiPlatformPreview(
    text: string,
    media?: MediaAsset[]
  ): Promise<Record<Platform, PreviewResult>> {
    const platforms: Platform[] = ['facebook', 'instagram', 'tiktok'];
    
    const previews = await Promise.all(
      platforms.map(platform =>
        this.generatePreview({ text, media, platform })
      )
    );

    return {
      facebook: previews[0],
      instagram: previews[1],
      tiktok: previews[2]
    };
  }

  private extractHashtags(text: string): string[] {
    const hashtagRegex = /#[\w\u0080-\uFFFF]+/g;
    const matches = text.match(hashtagRegex);
    return matches ? Array.from(new Set(matches)) : [];
  }

  private extractMentions(text: string): string[] {
    const mentionRegex = /@[\w\u0080-\uFFFF]+/g;
    const matches = text.match(mentionRegex);
    return matches ? Array.from(new Set(matches)) : [];
  }

  private formatText(text: string, platform: Platform): string {
    const limits = this.platformLimits[platform];
    
    let formatted = text.trim();

    if (formatted.length > limits.maxTextLength) {
      formatted = formatted.substring(0, limits.maxTextLength - 3) + '...';
    }

    formatted = this.normalizeLineBreaks(formatted);
    
    if (platform === 'instagram') {
      formatted = this.formatInstagramHashtags(formatted);
    }

    return formatted;
  }

  private normalizeLineBreaks(text: string): string {
    return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }

  private formatInstagramHashtags(text: string): string {
    const hashtagRegex = /#[\w\u0080-\uFFFF]+/g;
    const hashtags = text.match(hashtagRegex);
    
    if (hashtags && hashtags.length > 0) {
      const textWithoutHashtags = text.replace(hashtagRegex, '').trim();
      return `${textWithoutHashtags}\n\n${hashtags.join(' ')}`;
    }
    
    return text;
  }

  getPlatformLimits(platform: Platform): PlatformLimits {
    return this.platformLimits[platform];
  }

  getAllPlatformLimits(): Record<Platform, PlatformLimits> {
    return this.platformLimits;
  }
}
