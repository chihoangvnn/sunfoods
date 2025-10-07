import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Bot, Loader2, CheckCircle, XCircle, Edit3 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface FAQAutogenDialogProps {
  productId: string;
  productName: string;
  categoryId: string;
  categoryName: string;
  onClose?: () => void;
}

interface GeneratedFAQ {
  question: string;
  answer: string;
  order: number;
  confidence: number;
  status: string;
}

interface AutogenResponse {
  success: boolean;
  faqs: GeneratedFAQ[];
  job: any;
  product: { id: string; name: string };
  category: { id: string; name: string };
  message: string;
}

export function FAQAutogenDialog({ 
  productId, 
  productName, 
  categoryId, 
  categoryName, 
  onClose 
}: FAQAutogenDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'review'>('form');
  const [generatedFaqs, setGeneratedFaqs] = useState<GeneratedFAQ[]>([]);
  const [selectedFaqs, setSelectedFaqs] = useState<boolean[]>([]);
  
  // Default prompt template theo yêu cầu
  const defaultPrompt = `Tạo 5 câu hỏi ngắn gọn về sản phẩm ${productName} danh mục ${categoryName}, và trả lời ngắn gọn đủ ý cho 5 câu hỏi đó`;
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [isCustomPrompt, setIsCustomPrompt] = useState(false);

  // Generate FAQs mutation
  const generateFaqsMutation = useMutation({
    mutationFn: async (data: { prompt: string; categoryId: string }) => {
      const response = await fetch(`/api/product-faqs/autogen/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate FAQs');
      }
      
      return response.json() as Promise<AutogenResponse>;
    },
    onSuccess: (data) => {
      console.log('✅ FAQs generated successfully:', data);
      setGeneratedFaqs(data.faqs);
      setSelectedFaqs(new Array(data.faqs.length).fill(true)); // Select all by default
      setStep('review');
      toast({
        title: "Thành công",
        description: `AI đã tạo ${data.faqs.length} câu hỏi FAQ`,
      });
    },
    onError: (error: Error) => {
      console.error('❌ Error generating FAQs:', error);
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Save selected FAQs mutation
  const saveFaqsMutation = useMutation({
    mutationFn: async (faqs: GeneratedFAQ[]) => {
      const promises = faqs.map(faq => 
        fetch('/api/product-faqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            question: faq.question,
            answer: faq.answer,
            isActive: true
          }),
        })
      );
      
      const responses = await Promise.all(promises);
      const results = await Promise.all(responses.map(r => r.json()));
      
      // Check for any failures
      const failures = results.filter(r => !r.success);
      if (failures.length > 0) {
        throw new Error(`Failed to save ${failures.length} FAQs`);
      }
      
      return results;
    },
    onSuccess: (results) => {
      const savedCount = results.length;
      toast({
        title: "Thành công",
        description: `Đã lưu ${savedCount} FAQ vào sản phẩm`,
      });
      
      // Refresh FAQ list
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/faqs`] });
      
      // Close dialog
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập prompt để tạo FAQ",
        variant: "destructive",
      });
      return;
    }

    generateFaqsMutation.mutate({
      prompt: prompt.trim(),
      categoryId
    });
  };

  const handleSaveSelected = () => {
    const selectedFaqsList = generatedFaqs.filter((_, index) => selectedFaqs[index]);
    
    if (selectedFaqsList.length === 0) {
      toast({
        title: "Thông báo",
        description: "Vui lòng chọn ít nhất 1 FAQ để lưu",
        variant: "destructive",
      });
      return;
    }

    saveFaqsMutation.mutate(selectedFaqsList);
  };

  const handleToggleFaq = (index: number) => {
    const newSelected = [...selectedFaqs];
    newSelected[index] = !newSelected[index];
    setSelectedFaqs(newSelected);
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep('form');
    setGeneratedFaqs([]);
    setSelectedFaqs([]);
    setPrompt(defaultPrompt);
    setIsCustomPrompt(false);
    onClose?.();
  };

  const toggleCustomPrompt = () => {
    if (!isCustomPrompt) {
      setIsCustomPrompt(true);
    } else {
      setPrompt(defaultPrompt);
      setIsCustomPrompt(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200"
        >
          <Bot className="h-4 w-4" />
          🤖 Tạo FAQ tự động
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b pb-3">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            {step === 'form' ? 'Tạo FAQ bằng AI' : 'Xem xét FAQ được tạo'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pt-3">

        {step === 'form' && (
          <div className="space-y-6">
            {/* Product & Category Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Sản phẩm</Label>
                  <p className="font-medium text-gray-900">{productName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Danh mục</Label>
                  <p className="font-medium text-gray-900">{categoryName}</p>
                </div>
              </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="prompt" className="text-sm font-medium">
                  Prompt cho AI
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleCustomPrompt}
                  className="text-blue-600 hover:text-blue-800 gap-1"
                >
                  <Edit3 className="h-3 w-3" />
                  {isCustomPrompt ? 'Dùng mặc định' : 'Tùy chỉnh prompt'}
                </Button>
              </div>
              
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] font-mono text-sm"
                placeholder="Nhập prompt để tạo FAQ..."
                disabled={!isCustomPrompt}
              />
              
              {!isCustomPrompt && (
                <p className="text-xs text-gray-500">
                  💡 Prompt mặc định được tối ưu cho việc tạo FAQ. Click "Tùy chỉnh prompt" để chỉnh sửa.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={generateFaqsMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={generateFaqsMutation.isPending || !prompt.trim()}
                className="gap-2"
              >
                {generateFaqsMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tạo FAQ...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4" />
                    🚀 Tạo FAQ
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">
                  AI đã tạo {generatedFaqs.length} câu hỏi FAQ
                </span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Chọn những câu hỏi bạn muốn thêm vào sản phẩm
              </p>
            </div>

            {/* FAQ List */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {generatedFaqs.map((faq, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 transition-all ${
                    selectedFaqs[index] 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedFaqs[index]}
                      onCheckedChange={() => handleToggleFaq(index)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Q{index + 1}:
                        </Label>
                        <p className="font-medium text-gray-900">{faq.question}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Trả lời:
                        </Label>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Độ tin cậy: {(faq.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Đã chọn: {selectedFaqs.filter(Boolean).length} / {generatedFaqs.length} FAQ
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('form')}
                  disabled={saveFaqsMutation.isPending}
                >
                  🔄 Tạo lại
                </Button>
                
                <Button
                  onClick={handleSaveSelected}
                  disabled={saveFaqsMutation.isPending || selectedFaqs.filter(Boolean).length === 0}
                  className="gap-2"
                >
                  {saveFaqsMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      ✅ Duyệt đã chọn ({selectedFaqs.filter(Boolean).length})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}