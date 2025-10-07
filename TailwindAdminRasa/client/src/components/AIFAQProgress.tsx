import React, { useState, useEffect } from 'react';
import { Bot, Loader2, CheckCircle, AlertCircle, FileQuestion, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GeneratedFAQ {
  question: string;
  answer: string;
  priority: 'cao' | 'trung_binh' | 'thap';
  keywords: string[];
}

interface AIFAQProgressProps {
  productId: string;
  productName: string;
  onGenerationComplete?: (result: any) => void;
  onGenerationStart?: () => void;
  autoGenerate?: boolean;
  allowForceRegenerate?: boolean;
  className?: string;
}

type GenerationStatus = 'idle' | 'analyzing' | 'generating' | 'saving' | 'completed' | 'error';

const statusMessages = {
  idle: '💭 Sẵn sàng tạo FAQ',
  analyzing: '🔍 AI đang phân tích sản phẩm...',
  generating: '🤖 AI đang tạo câu hỏi và trả lời...',
  saving: '💾 Đang lưu FAQ vào database...',
  completed: '✅ Hoàn thành tạo FAQ!',
  error: '❌ Có lỗi xảy ra'
};

const statusProgress = {
  idle: 0,
  analyzing: 25,
  generating: 60,
  saving: 85,
  completed: 100,
  error: 0
};

export const AIFAQProgress: React.FC<AIFAQProgressProps> = ({
  productId,
  productName,
  onGenerationComplete,
  onGenerationStart,
  autoGenerate = false,
  allowForceRegenerate = true,
  className = ''
}) => {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [generatedFAQs, setGeneratedFAQs] = useState<GeneratedFAQ[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-generate on mount if enabled
  useEffect(() => {
    if (autoGenerate && productId) {
      generateFAQs();
    }
  }, [autoGenerate, productId]);

  const generateFAQs = async (forceRegenerate: boolean = false) => {
    if (isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedFAQs([]);
    onGenerationStart?.();

    const startTime = Date.now();

    try {
      console.log(`🤖 Starting AI FAQ generation for product: ${productId}`);

      // Step 1: Analyzing
      setStatus('analyzing');

      // Step 2: Generating
      setStatus('generating');
      
      const response = await fetch('/api/ai-faq-generation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          force: forceRegenerate
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate FAQs');
      }

      // Check if generation was skipped
      if (result.skipped) {
        setStatus('completed');
        setError(null);
        console.log('FAQ generation skipped - product already has FAQs');
        return;
      }

      // Step 3: Saving (already done by backend)
      setStatus('saving');
      
      // Step 4: Completed
      setStatus('completed');
      setGeneratedFAQs(result.data.generatedFAQs);
      setGenerationTime(Date.now() - startTime);

      console.log(`✅ AI FAQ generation completed: ${result.data.totalGenerated} FAQs generated`);
      
      onGenerationComplete?.(result);

    } catch (err) {
      console.error('❌ AI FAQ generation failed:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const getPriorityBadge = (priority: 'cao' | 'trung_binh' | 'thap') => {
    const variants = {
      cao: { label: 'Cao', variant: 'destructive' as const },
      trung_binh: { label: 'Trung bình', variant: 'secondary' as const },
      thap: { label: 'Thấp', variant: 'outline' as const }
    };
    
    const { label, variant } = variants[priority];
    return <Badge variant={variant} className="text-xs">{label}</Badge>;
  };

  const renderStatusIcon = () => {
    switch (status) {
      case 'analyzing':
      case 'generating':
      case 'saving':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bot className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {renderStatusIcon()}
          <span>AI FAQ Generation</span>
          {generationTime > 0 && (
            <Badge variant="outline" className="text-xs">
              {(generationTime / 1000).toFixed(1)}s
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{statusMessages[status]}</span>
            <span className="text-xs text-muted-foreground">
              {statusProgress[status]}%
            </span>
          </div>
          <Progress 
            value={statusProgress[status]} 
            className="h-2"
          />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Generate Buttons */}
        {status === 'idle' && (
          <div className="space-y-2">
            <Button 
              onClick={() => generateFAQs(false)}
              disabled={isGenerating}
              className="w-full"
            >
              <Bot className="h-4 w-4 mr-2" />
              Tạo FAQ tự động cho "{productName}"
            </Button>
            
            {allowForceRegenerate && (
              <Button 
                onClick={() => generateFAQs(true)}
                disabled={isGenerating}
                variant="outline"
                className="w-full"
              >
                <Bot className="h-4 w-4 mr-2" />
                Tạo lại FAQ (Ghi đè lên FAQ hiện tại)
              </Button>
            )}
          </div>
        )}

        {/* Skip Message */}
        {status === 'completed' && generatedFAQs.length === 0 && !error && (
          <div className="space-y-2">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Sản phẩm đã có FAQ. Sử dụng "Tạo lại FAQ" nếu muốn cập nhật.
              </AlertDescription>
            </Alert>
            
            {allowForceRegenerate && (
              <Button 
                onClick={() => generateFAQs(true)}
                disabled={isGenerating}
                variant="outline"
                className="w-full"
              >
                <Bot className="h-4 w-4 mr-2" />
                Tạo lại FAQ (Ghi đè lên FAQ hiện tại)
              </Button>
            )}
          </div>
        )}

        {/* Generated FAQs Preview */}
        {generatedFAQs.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileQuestion className="h-4 w-4 text-green-500" />
              <span className="font-medium text-sm">
                Đã tạo {generatedFAQs.length} FAQ mới
              </span>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {generatedFAQs.map((faq, index) => (
                <div 
                  key={index}
                  className="p-3 border rounded-lg bg-muted/30 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm line-clamp-2">
                      {faq.question}
                    </h4>
                    {getPriorityBadge(faq.priority)}
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {faq.answer}
                  </p>
                  
                  {faq.keywords.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <Lightbulb className="h-3 w-3 text-amber-500" />
                      {faq.keywords.slice(0, 3).map((keyword, kidx) => (
                        <Badge 
                          key={kidx}
                          variant="outline" 
                          className="text-xs px-1 py-0"
                        >
                          {keyword}
                        </Badge>
                      ))}
                      {faq.keywords.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{faq.keywords.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Retry Button */}
        {status === 'error' && (
          <Button 
            onClick={generateFAQs}
            disabled={isGenerating}
            variant="outline"
            className="w-full"
          >
            <Bot className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        )}
      </CardContent>
    </Card>
  );
};