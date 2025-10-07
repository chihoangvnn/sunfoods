import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Copy, Eye, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DuplicateMatch {
  id: string;
  title: string;
  baseContent: string;
  similarity: number;
  createdAt: string;
}

interface DuplicateWarningProps {
  text: string;
  excludeId?: string;
  onDismiss?: () => void;
}

export function DuplicateWarning({ text, excludeId, onDismiss }: DuplicateWarningProps) {
  const [matches, setMatches] = useState<DuplicateMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [exactMatch, setExactMatch] = useState(false);
  const [highestSimilarity, setHighestSimilarity] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (text.trim().length < 50) {
      setMatches([]);
      return;
    }

    const checkDuplicates = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/duplicate-detection/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, excludeId })
        });

        if (!response.ok) {
          throw new Error('Failed to check duplicates');
        }

        const result = await response.json();
        
        if (result.success && result.data.isDuplicate) {
          setMatches(result.data.matches);
          setExactMatch(result.data.exactMatch);
          setHighestSimilarity(result.data.highestSimilarity);
        } else {
          setMatches([]);
        }
      } catch (error) {
        console.error('Duplicate check error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(checkDuplicates, 1000);
    return () => clearTimeout(debounceTimer);
  }, [text, excludeId]);

  if (loading || matches.length === 0) {
    return null;
  }

  const getSeverityColor = (similarity: number) => {
    if (similarity >= 0.95) return 'destructive';
    if (similarity >= 0.85) return 'default';
    return 'secondary';
  };

  const getSeverityLabel = (similarity: number) => {
    if (similarity >= 0.95) return 'Exact Match';
    if (similarity >= 0.85) return 'High Similarity';
    return 'Similar Content';
  };

  return (
    <Alert variant={exactMatch ? 'destructive' : 'default'} className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold mb-2">
              {exactMatch ? '⚠️ Duplicate Content Detected!' : '⚠️ Similar Content Found'}
            </h4>
            <p className="text-sm mb-3">
              {exactMatch 
                ? 'This content appears to be an exact match with existing content. Consider editing or removing the duplicate.'
                : `Found ${matches.length} similar content item${matches.length > 1 ? 's' : ''} (${Math.round(highestSimilarity * 100)}% similarity)`
              }
            </p>

            <div className="space-y-2">
              {matches.slice(0, 3).map((match) => (
                <Card key={match.id} className="bg-white/50">
                  <CardHeader className="p-3 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{match.title}</CardTitle>
                      <Badge variant={getSeverityColor(match.similarity)}>
                        {Math.round(match.similarity * 100)}% {getSeverityLabel(match.similarity)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {match.baseContent}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 text-xs"
                        onClick={() => {
                          window.open(`/admin/content-library?id=${match.id}`, '_blank');
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 text-xs"
                        onClick={() => {
                          navigator.clipboard.writeText(match.baseContent);
                          toast({
                            title: 'Copied!',
                            description: 'Content copied to clipboard'
                          });
                        }}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {matches.length > 3 && (
              <p className="text-xs text-gray-500 mt-2">
                +{matches.length - 3} more similar items
              </p>
            )}
          </div>

          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 ml-2"
              onClick={onDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
