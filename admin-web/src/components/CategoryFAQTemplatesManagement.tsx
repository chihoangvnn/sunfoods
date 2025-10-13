import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Search, Edit, Trash2, Save, X, Eye, EyeOff,
  Tag, CheckCircle, AlertTriangle, GripVertical, 
  ChevronUp, ChevronDown, Settings, FileQuestion,
  Sparkles, Copy, MoreVertical, Layers, 
  Target, ToggleLeft, ToggleRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types for Category FAQ Templates
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
  createdBy?: string;
  templateNote?: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface FAQLibraryItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  isActive: boolean;
}

interface CategoryFAQTemplatesManagementProps {
  className?: string;
}

export function CategoryFAQTemplatesManagement({ className = "" }: CategoryFAQTemplatesManagementProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // State management
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CategoryFAQTemplate | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  
  // FAQ Creation mode state
  const [isCreatingNewFAQ, setIsCreatingNewFAQ] = useState(false);
  const [newFAQData, setNewFAQData] = useState({
    question: '',
    answer: '',
    category: 'general',
    priority: 'medium' as 'high' | 'medium' | 'low'
  });

  // Form state for create/edit
  const [formData, setFormData] = useState({
    categoryId: '',
    faqId: '',
    sortOrder: 0,
    isActive: true,
    autoInherit: true,
    templateNote: ''
  });

  // Reset new FAQ form
  const resetNewFAQForm = () => {
    setNewFAQData({
      question: '',
      answer: '',
      category: 'general',
      priority: 'medium'
    });
    setIsCreatingNewFAQ(false);
  };

  // Create new FAQ mutation
  const createFAQMutation = useMutation({
    mutationFn: async (faqData: { question: string; answer: string; category: string; priority: 'high' | 'medium' | 'low' }) => {
      const response = await fetch('/api/faq-library/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...faqData,
          isActive: true
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create FAQ');
      }
      
      const result = await response.json();
      return result;
    },
    onSuccess: (newFAQ) => {
      // Invalidate FAQ library cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['faqLibrary'] });
      
      // Auto-select the newly created FAQ
      setFormData(prev => ({...prev, faqId: newFAQ.id}));
      
      // Switch back to selection mode
      setIsCreatingNewFAQ(false);
      
      // Reset new FAQ form
      resetNewFAQForm();
      
      toast({
        title: "✅ FAQ đã được tạo",
        description: `FAQ "${newFAQ.question.substring(0, 50)}..." đã được thêm vào thư viện và tự động chọn.`
      });
    },
    onError: (error) => {
      console.error('Error creating FAQ:', error);
      toast({
        title: "❌ Lỗi tạo FAQ",
        description: "Không thể tạo FAQ mới. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  });

  // Handle creating new FAQ from dialog
  const handleCreateNewFAQ = () => {
    // Validate new FAQ data
    if (!newFAQData.question.trim() || !newFAQData.answer.trim()) {
      toast({
        title: "❌ Thông tin không đầy đủ",
        description: "Vui lòng nhập câu hỏi và câu trả lời.",
        variant: "destructive"
      });
      return;
    }
    
    // Create new FAQ
    createFAQMutation.mutate({
      question: newFAQData.question.trim(),
      answer: newFAQData.answer.trim(),
      category: newFAQData.category,
      priority: newFAQData.priority
    });
  };

  // Fetch category FAQ templates
  const { 
    data: templates = [], 
    isLoading: templatesLoading 
  } = useQuery({
    queryKey: ['categoryFAQTemplates', selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('categoryId', selectedCategory);
      }
      
      const response = await fetch(`/api/category-faq-templates?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Fetch categories for dropdown (using same queryKey as CategoryManager for cache coherency)
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  // Fetch FAQ library items for assignment
  const { data: faqLibrary = [] } = useQuery({
    queryKey: ['faqLibrary', 'active'],
    queryFn: async () => {
      const response = await fetch('/api/faq-library/faqs?isActive=true&limit=100');
      if (!response.ok) throw new Error('Failed to fetch FAQ library');
      const result = await response.json();
      return Array.isArray(result) ? result : (result.data || []);
    }
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      const response = await fetch('/api/category-faq-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create template');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categoryFAQTemplates'] });
      setShowCreateModal(false);
      resetForm();
      toast({
        title: "✅ Template đã được tạo",
        description: "FAQ template đã được thêm vào danh mục thành công!"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Lỗi tạo template",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/category-faq-templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update template');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categoryFAQTemplates'] });
      setEditingTemplate(null);
      resetForm();
      toast({
        title: "✅ Template đã được cập nhật",
        description: "FAQ template đã được sửa đổi thành công!"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Lỗi cập nhật template",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await fetch(`/api/category-faq-templates/${templateId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete template');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categoryFAQTemplates'] });
      toast({
        title: "✅ Template đã được xóa",
        description: "FAQ template đã được gỡ khỏi danh mục."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Lỗi xóa template",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Bulk create templates mutation
  const bulkCreateMutation = useMutation({
    mutationFn: async (data: { categoryId: string; faqIds: string[]; autoInherit: boolean }) => {
      const response = await fetch('/api/category-faq-templates/bulk-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to bulk create templates');
      }
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['categoryFAQTemplates'] });
      toast({
        title: "✅ Templates đã được tạo hàng loạt",
        description: `Đã tạo thành công ${result.data?.length || 0} FAQ templates!`
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Lỗi tạo templates hàng loạt",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Helper functions
  const resetForm = () => {
    setFormData({
      categoryId: '',
      faqId: '',
      sortOrder: 0,
      isActive: true,
      autoInherit: true,
      templateNote: ''
    });
  };

  const handleCreateTemplate = () => {
    if (!formData.categoryId || !formData.faqId) {
      toast({
        title: "❌ Thiếu thông tin",
        description: "Vui lòng chọn danh mục và FAQ để tạo template.",
        variant: "destructive"
      });
      return;
    }

    createTemplateMutation.mutate(formData);
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate) return;
    
    updateTemplateMutation.mutate({
      id: editingTemplate.id,
      data: formData
    });
  };

  const handleEditTemplate = (template: CategoryFAQTemplate) => {
    setEditingTemplate(template);
    setFormData({
      categoryId: template.categoryId,
      faqId: template.faqId,
      sortOrder: template.sortOrder,
      isActive: template.isActive,
      autoInherit: template.autoInherit,
      templateNote: template.templateNote || ''
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa FAQ template này? Hành động này không thể hoàn tác.')) {
      deleteTemplateMutation.mutate(templateId);
    }
  };

  const handleBulkCreateTemplates = () => {
    if (!selectedCategory || selectedCategory === 'all') {
      toast({
        title: "❌ Chưa chọn danh mục",
        description: "Vui lòng chọn một danh mục cụ thể để tạo templates hàng loạt.",
        variant: "destructive"
      });
      return;
    }

    // Get available FAQs that are not yet templates for this category
    const existingFAQIds = templates.map((t: CategoryFAQTemplate) => t.faqId);
    const availableFAQs = faqLibrary.filter((faq: FAQLibraryItem) => !existingFAQIds.includes(faq.id));

    if (availableFAQs.length === 0) {
      toast({
        title: "📝 Không có FAQ mới",
        description: "Tất cả FAQs hiện tại đã được thêm vào danh mục này rồi.",
      });
      return;
    }

    if (confirm(`Tạo templates cho tất cả ${availableFAQs.length} FAQs còn lại trong danh mục này?`)) {
      bulkCreateMutation.mutate({
        categoryId: selectedCategory,
        faqIds: availableFAQs.map((faq: FAQLibraryItem) => faq.id),
        autoInherit: true
      });
    }
  };

  // Filter templates based on search
  const filteredTemplates = templates.filter((template: CategoryFAQTemplate) =>
    template.faqQuestion.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.faqAnswer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Vietnamese incense category examples for better UX
  const getVietnameseExamplesByCategory = (categoryName: string) => {
    const examples: Record<string, string[]> = {
      'Nhang Trầm Hương': [
        'Cách thắp nhang trầm hương đúng cách?',
        'Nhang trầm có tác dụng gì với phong thủy?',
        'Bao lâu thì nên thắp nhang một lần?'
      ],
      'Nhang Thảo Dược': [
        'Nhang thảo dược có lợi ích gì cho sức khỏe?',
        'Cách bảo quản nhang thảo dược?',
        'Có thể dùng nhang thảo dược hàng ngày không?'
      ],
      'Nhang Sạch': [
        'Nhang sạch khác gì với nhang thông thường?',
        'Có an toàn cho trẻ em và phụ nữ có thai không?',
        'Làm sao biết nhang thực sự sạch?'
      ]
    };
    return examples[categoryName] || [];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-green-600" />
            Category FAQ Templates
          </h2>
          <p className="text-muted-foreground">
            Quản lý FAQ templates cho từng danh mục nhang sạch - Sản phẩm mới sẽ tự động kế thừa
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleBulkCreateTemplates}
            variant="outline"
            disabled={selectedCategory === 'all' || bulkCreateMutation.isPending}
          >
            <Copy className="h-4 w-4 mr-2" />
            Tạo Hàng Loạt
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)}
            disabled={createTemplateMutation.isPending}
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Tìm kiếm FAQ</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Tìm theo câu hỏi, câu trả lời..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-64">
              <Label htmlFor="category-filter">Lọc theo danh mục</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      <div className="grid gap-4">
        {templatesLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-2">Đang tải FAQ templates...</span>
              </div>
            </CardContent>
          </Card>
        ) : filteredTemplates.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chưa có FAQ templates</h3>
                <p className="text-muted-foreground mb-4">
                  {selectedCategory === 'all' 
                    ? 'Bắt đầu tạo FAQ templates cho các danh mục nhang của bạn'
                    : 'Danh mục này chưa có FAQ templates nào'}
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo Template Đầu Tiên
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredTemplates.map((template: CategoryFAQTemplate) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {template.categoryName}
                      </Badge>
                      <Badge variant={template.faqPriority === 'high' ? 'destructive' : 
                                   template.faqPriority === 'medium' ? 'default' : 'secondary'}>
                        {template.faqPriority === 'high' ? '🔴 Cao' :
                         template.faqPriority === 'medium' ? '🟡 Trung bình' : '🟢 Thấp'}
                      </Badge>
                      {template.autoInherit && (
                        <Badge variant="default" className="bg-green-50 text-green-700">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Tự động kế thừa
                        </Badge>
                      )}
                      {!template.isActive && (
                        <Badge variant="secondary">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Không hoạt động
                        </Badge>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-lg mb-2 text-green-800">
                        ❓ {template.faqQuestion}
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        💬 {template.faqAnswer.substring(0, 200)}
                        {template.faqAnswer.length > 200 && '...'}
                      </p>
                    </div>

                    {template.templateNote && (
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                        <p className="text-sm text-amber-700">
                          <Settings className="h-4 w-4 inline mr-1" />
                          <strong>Ghi chú:</strong> {template.templateNote}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center text-xs text-muted-foreground gap-4">
                      <span>Thứ tự: #{template.sortOrder}</span>
                      <span>Tạo: {new Date(template.createdAt).toLocaleDateString('vi-VN')}</span>
                      {template.createdBy && <span>Bởi: {template.createdBy}</span>}
                    </div>
                  </div>

                  <div className="ml-4 flex items-center gap-2">
                    <Switch 
                      checked={template.isActive}
                      onCheckedChange={(checked) => {
                        updateTemplateMutation.mutate({
                          id: template.id,
                          data: { isActive: checked }
                        });
                      }}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa template
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Template Modal */}
      <Dialog open={showCreateModal || editingTemplate !== null} onOpenChange={(open) => {
        if (!open) {
          setShowCreateModal(false);
          setEditingTemplate(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b pb-3">
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              {editingTemplate ? 'Chỉnh Sửa FAQ Template' : 'Tạo FAQ Template Mới'}
            </DialogTitle>
            <DialogDescription>
              FAQ template sẽ được tự động áp dụng cho tất cả sản phẩm mới trong danh mục này
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pt-3">
            <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-category">Danh mục nhang *</Label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={(value) => setFormData({...formData, categoryId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: Category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label htmlFor="template-faq">FAQ *</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={!isCreatingNewFAQ ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsCreatingNewFAQ(false)}
                      className="text-xs"
                    >
                      <Search className="h-3 w-3 mr-1" />
                      Chọn có sẵn
                    </Button>
                    <Button
                      type="button"
                      variant={isCreatingNewFAQ ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsCreatingNewFAQ(true)}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Tạo FAQ mới
                    </Button>
                  </div>
                </div>

                {!isCreatingNewFAQ ? (
                  <Select 
                    value={formData.faqId} 
                    onValueChange={(value) => setFormData({...formData, faqId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn FAQ có sẵn" />
                    </SelectTrigger>
                    <SelectContent>
                      {faqLibrary.map((faq: FAQLibraryItem) => (
                        <SelectItem key={faq.id} value={faq.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{faq.question.substring(0, 50)}...</span>
                            <span className="text-xs text-muted-foreground">
                              {faq.category} • {faq.priority}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Plus className="h-4 w-4" />
                      <span className="font-medium">Tạo FAQ mới</span>
                    </div>
                    
                    <div>
                      <Label htmlFor="new-faq-question">Câu hỏi *</Label>
                      <Input
                        id="new-faq-question"
                        value={newFAQData.question}
                        onChange={(e) => setNewFAQData({...newFAQData, question: e.target.value})}
                        placeholder="Ví dụ: Nhang trầm có tác dụng gì?"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="new-faq-answer">Câu trả lời *</Label>
                      <Textarea
                        id="new-faq-answer"
                        value={newFAQData.answer}
                        onChange={(e) => setNewFAQData({...newFAQData, answer: e.target.value})}
                        placeholder="Nhang trầm giúp thư giãn, giảm stress và tạo không gian thiền định tốt..."
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="new-faq-category">Loại FAQ</Label>
                        <Select 
                          value={newFAQData.category} 
                          onValueChange={(value) => setNewFAQData({...newFAQData, category: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">Tổng quát</SelectItem>
                            <SelectItem value="product">Sản phẩm</SelectItem>
                            <SelectItem value="tutorial">Hướng dẫn</SelectItem>
                            <SelectItem value="policy">Chính sách</SelectItem>
                            <SelectItem value="technical">Kỹ thuật</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="new-faq-priority">Độ ưu tiên</Label>
                        <Select 
                          value={newFAQData.priority} 
                          onValueChange={(value: 'high' | 'medium' | 'low') => setNewFAQData({...newFAQData, priority: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">🔴 Cao</SelectItem>
                            <SelectItem value="medium">🟡 Trung bình</SelectItem>
                            <SelectItem value="low">🟢 Thấp</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sort-order">Thứ tự hiển thị</Label>
                <Input
                  id="sort-order"
                  type="number"
                  min="0"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="auto-inherit"
                    checked={formData.autoInherit}
                    onCheckedChange={(checked) => setFormData({...formData, autoInherit: !!checked})}
                  />
                  <Label htmlFor="auto-inherit" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Tự động kế thừa cho sản phẩm mới
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-active"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({...formData, isActive: !!checked})}
                  />
                  <Label htmlFor="is-active" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Kích hoạt template
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="template-note">Ghi chú template (tùy chọn)</Label>
              <Textarea
                id="template-note"
                value={formData.templateNote}
                onChange={(e) => setFormData({...formData, templateNote: e.target.value})}
                placeholder="Ghi chú về template này, ví dụ: Dành cho nhang trầm cao cấp..."
                rows={3}
              />
            </div>

            {/* Vietnamese Examples */}
            {formData.categoryId && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <FileQuestion className="h-4 w-4" />
                  Gợi ý FAQ phổ biến cho danh mục này:
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {getVietnameseExamplesByCategory(
                    categories.find((c: Category) => c.id === formData.categoryId)?.name || ''
                  ).map((example, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
          
          <DialogFooter className="sticky bottom-0 bg-background/95 backdrop-blur border-t pt-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowCreateModal(false);
                setEditingTemplate(null);
                resetForm();
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            <Button 
              type="button" 
              onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
              disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {editingTemplate ? 'Cập nhật' : 'Tạo Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}