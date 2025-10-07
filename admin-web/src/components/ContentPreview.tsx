import { useState, useEffect, useRef, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Info, Facebook, Instagram, Music } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MediaAsset {
  type: 'image' | 'video';
  url: string;
  width?: number;
  height?: number;
  duration?: number;
}

interface PreviewResult {
  platform: 'facebook' | 'instagram' | 'tiktok';
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

interface ContentPreviewProps {
  text: string;
  media?: MediaAsset[];
  onUpdate?: (previews: Record<string, PreviewResult>) => void;
}

const platformIcons = {
  facebook: <Facebook className="w-4 h-4" />,
  instagram: <Instagram className="w-4 h-4" />,
  tiktok: <Music className="w-4 h-4" />
};

const platformColors = {
  facebook: 'bg-blue-500',
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  tiktok: 'bg-black'
};

export function ContentPreview({ text, media, onUpdate }: ContentPreviewProps) {
  const [previews, setPreviews] = useState<Record<string, PreviewResult> | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const requestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stableMedia = useMemo(() => media || [], [media]);

  useEffect(() => {
    if (text.trim().length === 0) {
      setPreviews(null);
      return;
    }

    generatePreviews();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [text, stableMedia]);

  const generatePreviews = async () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    
    try {
      const response = await fetch('/api/content-preview/multi-platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, media: stableMedia }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('Failed to generate previews');
      }

      const data = await response.json();
      
      if (currentRequestId === requestIdRef.current) {
        setPreviews(data.previews);
        onUpdate?.(data.previews);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }
      
      if (currentRequestId === requestIdRef.current) {
        toast({
          title: 'Preview Error',
          description: 'Failed to generate platform previews',
          variant: 'destructive'
        });
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  if (!previews) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          {loading ? 'Generating previews...' : 'Enter text to see platform previews'}
        </div>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="facebook" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="facebook" className="flex items-center gap-2">
          {platformIcons.facebook}
          Facebook
        </TabsTrigger>
        <TabsTrigger value="instagram" className="flex items-center gap-2">
          {platformIcons.instagram}
          Instagram
        </TabsTrigger>
        <TabsTrigger value="tiktok" className="flex items-center gap-2">
          {platformIcons.tiktok}
          TikTok
        </TabsTrigger>
      </TabsList>

      {Object.entries(previews).map(([platform, preview]) => (
        <TabsContent key={platform} value={platform} className="space-y-4">
          <Card className="overflow-hidden">
            <div className={`${platformColors[platform as keyof typeof platformColors]} text-white p-3`}>
              <div className="flex items-center gap-2">
                {platformIcons[platform as keyof typeof platformIcons]}
                <span className="font-semibold capitalize">{platform} Preview</span>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="whitespace-pre-wrap text-sm">{preview.text.formatted}</div>
                
                {preview.text.truncated && (
                  <Badge variant="outline" className="mt-2 text-orange-600 border-orange-600">
                    Text truncated
                  </Badge>
                )}
              </div>

              {preview.media.assets.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Media ({preview.media.assets.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {preview.media.assets.map((asset, index) => (
                      <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        {asset.type === 'image' ? (
                          <img src={asset.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {asset.width && asset.height && `${asset.width}x${asset.height}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{preview.text.length}</div>
                  <div className="text-xs text-gray-500">Characters</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{preview.text.hashtags.length}</div>
                  <div className="text-xs text-gray-500">Hashtags</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{preview.text.mentions.length}</div>
                  <div className="text-xs text-gray-500">Mentions</div>
                </div>
              </div>

              {preview.text.hashtags.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs text-gray-500 mb-1">Hashtags:</div>
                  <div className="flex flex-wrap gap-1">
                    {preview.text.hashtags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {preview.text.mentions.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs text-gray-500 mb-1">Mentions:</div>
                  <div className="flex flex-wrap gap-1">
                    {preview.text.mentions.map((mention, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {mention}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {preview.validation.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600 font-medium text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Validation Errors
                  </div>
                  {preview.validation.errors.map((error, i) => (
                    <div key={i} className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                      {error}
                    </div>
                  ))}
                </div>
              )}

              {preview.validation.warnings.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-orange-600 font-medium text-sm">
                    <Info className="w-4 h-4" />
                    Warnings
                  </div>
                  {preview.validation.warnings.map((warning, i) => (
                    <div key={i} className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
                      {warning}
                    </div>
                  ))}
                </div>
              )}

              {preview.validation.isValid && preview.validation.warnings.length === 0 && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-lg p-3">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Ready to post on {platform}</span>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}
