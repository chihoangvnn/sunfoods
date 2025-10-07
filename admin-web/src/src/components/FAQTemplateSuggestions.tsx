import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Lightbulb, ChevronDown, ChevronUp, Copy, Eye, 
  Sparkles, Target, Clock, ArrowRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryFAQTemplate {
  id: string;
  categoryId: string;
  categoryName: string;
  faqId: string;
  faqQuestion: string;
  faqAnswer: string;
  faqPriority: 'high' | 'medium' | 'low';
  sortOrder: number;
  isActive: boolean;
  autoInherit: boolean;
  templateNote?: string;
  createdAt: string;
  updatedAt: string;
}

interface FAQTemplateSuggestionsProps {
  categoryId: string | null | undefined;
  onApplyTemplate: (question: string, answer: string) => void;
  className?: string;
}

export function FAQTemplateSuggestions({ 
  categoryId, 
  onApplyTemplate, 
  className = "" 
}: FAQTemplateSuggestionsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Fetch templates for category with auto-inherit enabled
  const { data: templates = [], isLoading, error } = useQuery<CategoryFAQTemplate[]>({
    queryKey: [`/api/category-faq-templates`, { categoryId, autoInherit: true }],
    queryFn: async () => {
      if (!categoryId) return [];
      
      const response = await fetch(
        `/api/category-faq-templates?categoryId=${categoryId}&autoInherit=true&isActive=true&sortBy=sort_order&sortOrder=asc`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch template suggestions');
      }
      
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!categoryId
  });

  const handleApplyTemplate = (template: CategoryFAQTemplate) => {
    onApplyTemplate(template.faqQuestion, template.faqAnswer);
    setSelectedTemplate(template.id);
    
    // Visual feedback - reset after 2 seconds
    setTimeout(() => setSelectedTemplate(null), 2000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Target className="h-3 w-3" />;
      case 'medium': return <Clock className="h-3 w-3" />;
      case 'low': return <Eye className="h-3 w-3" />;
      default: return <Lightbulb className="h-3 w-3" />;
    }
  };

  // Don't show if no category or no templates
  if (!categoryId || templates.length === 0) {
    return null;
  }

  return (
    <Card className={cn("border-dashed border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50", className)}>
      <CardHeader 
        className="pb-3 cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-purple-800">
              Smart Templates ({templates.length})
            </span>
            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
              Auto-Inherit
            </Badge>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-purple-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-purple-600" />
          )}
        </CardTitle>
        {!isExpanded && (
          <p className="text-xs text-purple-600 mt-1">
            📚 {templates.length} template suggestions từ danh mục này
          </p>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="text-xs text-purple-700 bg-purple-100 rounded-lg p-3 border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="h-3 w-3" />
                <span className="font-medium">Gợi ý thông minh</span>
              </div>
              <p>
                Những templates này được thiết kế cho danh mục <strong>{templates[0]?.categoryName}</strong>. 
                Click <strong>"Áp dụng"</strong> để điền tự động vào form.
              </p>
            </div>

            {isLoading && (
              <div className="text-center py-4 text-purple-600">
                <div className="animate-spin inline-block w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                <span className="ml-2 text-sm">Đang tải templates...</span>
              </div>
            )}

            {error && (
              <div className="text-center py-4 text-red-600 bg-red-50 rounded-lg border border-red-200">
                <span className="text-sm">⚠️ Không thể tải templates</span>
              </div>
            )}

            {templates.map((template, index) => (
              <div key={template.id} className="space-y-2">
                <Card className={cn(
                  "transition-all duration-200 hover:shadow-md border",
                  selectedTemplate === template.id 
                    ? "border-green-300 bg-green-50 shadow-lg" 
                    : "border-gray-200 hover:border-purple-300"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        {/* Priority Badge */}
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getPriorityColor(template.faqPriority))}
                          >
                            {getPriorityIcon(template.faqPriority)}
                            <span className="ml-1 capitalize">{template.faqPriority}</span>
                          </Badge>
                          {template.templateNote && (
                            <span className="text-xs text-gray-500 italic">
                              💡 {template.templateNote}
                            </span>
                          )}
                        </div>

                        {/* Question */}
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            Câu hỏi:
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {template.faqQuestion}
                          </p>
                        </div>

                        {/* Answer Preview */}
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            Trả lời:
                          </p>
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {template.faqAnswer.length > 150 
                              ? `${template.faqAnswer.substring(0, 150)}...`
                              : template.faqAnswer
                            }
                          </p>
                        </div>
                      </div>

                      {/* Apply Button */}
                      <div className="flex-shrink-0">
                        <Button
                          onClick={() => handleApplyTemplate(template)}
                          disabled={selectedTemplate === template.id}
                          size="sm"
                          className={cn(
                            "gap-2 text-xs transition-all duration-200",
                            selectedTemplate === template.id
                              ? "bg-green-600 hover:bg-green-600 text-white"
                              : "bg-purple-600 hover:bg-purple-700 text-white"
                          )}
                        >
                          {selectedTemplate === template.id ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Đã áp dụng
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Áp dụng
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Separator between templates */}
                {index < templates.length - 1 && (
                  <Separator className="bg-purple-200" />
                )}
              </div>
            ))}

            {templates.length > 0 && (
              <div className="text-center pt-2">
                <p className="text-xs text-purple-600 bg-purple-50 rounded-lg p-2 border border-purple-200">
                  💡 <strong>Pro tip:</strong> Bạn có thể chỉnh sửa nội dung sau khi áp dụng template
                </p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}