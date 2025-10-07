import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RichTextEditor } from './RichTextEditor';
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  MessageSquare, 
  Languages, 
  Tags, 
  Monitor, 
  Image, 
  ShoppingCart, 
  Settings,
  Hash,
  MapPin
} from 'lucide-react';

interface RichFAQFormData {
  // Basic fields
  question: string;
  answer: string;
  category: string;
  subcategory: string;
  isActive: boolean;
  
  // Rich FAQ fields
  questionVariations: {
    primary: string;
    alternatives: string[];
    dialects: {
      north: string[];
      central: string[];
      south: string[];
    };
  };
  channels: {
    website: string;
    mobile: string;
    social: {
      facebook: string;
      instagram: string;
      tiktok: string;
    };
    voice_assistant: {
      question_audio: string;
      answer_audio: string;
    };
  };
  multimediaContent: {
    images: Array<{
      url: string;
      alt: string;
      type: 'product' | 'guide' | 'usage' | 'comparison';
      order: number;
    }>;
    videos: Array<{
      url: string;
      duration?: number;
      type: 'demo' | 'tutorial' | 'testimonial' | 'unboxing';
      description: string;
      thumbnail_url?: string;
    }>;
  };
  keywordWeights: {
    [keyword: string]: number;
  };
  automation: {
    trigger_conditions: Array<{
      type: 'keyword_match' | 'context_similarity' | 'user_intent';
      threshold: number;
      keywords: string[];
    }>;
  };
  upsellSuggestions: {
    related_products: Array<{
      product_id: string;
      relevance: number;
      display_text: string;
    }>;
  };
  tags: string[];
  relatedQuestionIds: string[];
}

interface RichFAQFormEditorProps {
  initialData?: Partial<RichFAQFormData>;
  onSave: (data: RichFAQFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

const defaultFormData: RichFAQFormData = {
  question: '',
  answer: '',
  category: '',
  subcategory: '',
  isActive: true,
  questionVariations: {
    primary: '',
    alternatives: [],
    dialects: {
      north: [],
      central: [],
      south: []
    }
  },
  channels: {
    website: '',
    mobile: '',
    social: {
      facebook: '',
      instagram: '',
      tiktok: ''
    },
    voice_assistant: {
      question_audio: '',
      answer_audio: ''
    }
  },
  multimediaContent: {
    images: [],
    videos: []
  },
  keywordWeights: {},
  automation: {
    trigger_conditions: []
  },
  upsellSuggestions: {
    related_products: []
  },
  tags: [],
  relatedQuestionIds: []
};

export function RichFAQFormEditor({ 
  initialData = {}, 
  onSave, 
  onCancel, 
  isLoading = false, 
  isEditing = false 
}: RichFAQFormEditorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<RichFAQFormData>({
    ...defaultFormData,
    ...initialData
  });

  // Helper function to update nested form data
  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData as any;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  // Add/remove array items
  const addArrayItem = (path: string, newItem: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData as any;
      
      for (let i = 0; i < keys.length; i++) {
        if (i === keys.length - 1) {
          if (!current[keys[i]]) current[keys[i]] = [];
          current[keys[i]] = [...current[keys[i]], newItem];
        } else {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
      }
      
      return newData;
    });
  };

  const removeArrayItem = (path: string, index: number) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData as any;
      
      for (let i = 0; i < keys.length; i++) {
        if (i === keys.length - 1) {
          current[keys[i]] = current[keys[i]].filter((_: any, i: number) => i !== index);
        } else {
          current = current[keys[i]];
        }
      }
      
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Chỉ yêu cầu question và answer là bắt buộc
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ câu hỏi và câu trả lời",
        variant: "destructive",
      });
      return;
    }

    // Chuẩn bị data với default values cho các trường optional
    const cleanedData = {
      ...formData,
      // Đảm bảo các trường Rich FAQ có default values hợp lý
      category: formData.category?.trim() || '',
      subcategory: formData.subcategory?.trim() || '',
      questionVariations: {
        primary: formData.questionVariations?.primary?.trim() || formData.question.trim(),
        alternatives: formData.questionVariations?.alternatives?.filter(alt => alt.trim()) || [],
        dialects: {
          north: formData.questionVariations?.dialects?.north?.filter(d => d.trim()) || [],
          central: formData.questionVariations?.dialects?.central?.filter(d => d.trim()) || [],
          south: formData.questionVariations?.dialects?.south?.filter(d => d.trim()) || []
        }
      },
      channels: {
        website: formData.channels?.website?.trim() || formData.answer.trim(),
        mobile: formData.channels?.mobile?.trim() || '',
        social: {
          facebook: formData.channels?.social?.facebook?.trim() || '',
          instagram: formData.channels?.social?.instagram?.trim() || '',
          tiktok: formData.channels?.social?.tiktok?.trim() || ''
        },
        voice_assistant: {
          question_audio: formData.channels?.voice_assistant?.question_audio?.trim() || '',
          answer_audio: formData.channels?.voice_assistant?.answer_audio?.trim() || ''
        }
      },
      multimediaContent: {
        images: formData.multimediaContent?.images || [],
        videos: formData.multimediaContent?.videos || []
      },
      keywordWeights: formData.keywordWeights || {},
      automation: {
        trigger_conditions: formData.automation?.trigger_conditions || []
      },
      upsellSuggestions: {
        related_products: formData.upsellSuggestions?.related_products || []
      },
      tags: formData.tags?.filter(tag => tag.trim()) || [],
      relatedQuestionIds: formData.relatedQuestionIds || []
    };

    onSave(cleanedData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {isEditing ? 'Chỉnh sửa Rich FAQ' : 'Tạo Rich FAQ mới'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7 mb-6">
              <TabsTrigger value="basic" className="flex items-center gap-1 text-xs">
                <MessageSquare className="h-3 w-3" />
                Cơ bản
              </TabsTrigger>
              <TabsTrigger value="variations" className="flex items-center gap-1 text-xs">
                <Languages className="h-3 w-3" />
                Biến thể
              </TabsTrigger>
              <TabsTrigger value="keywords" className="flex items-center gap-1 text-xs">
                <Hash className="h-3 w-3" />
                Keywords
              </TabsTrigger>
              <TabsTrigger value="channels" className="flex items-center gap-1 text-xs">
                <Monitor className="h-3 w-3" />
                Kênh
              </TabsTrigger>
              <TabsTrigger value="multimedia" className="flex items-center gap-1 text-xs">
                <Image className="h-3 w-3" />
                Media
              </TabsTrigger>
              <TabsTrigger value="business" className="flex items-center gap-1 text-xs">
                <ShoppingCart className="h-3 w-3" />
                Kinh doanh
              </TabsTrigger>
              <TabsTrigger value="automation" className="flex items-center gap-1 text-xs">
                <Settings className="h-3 w-3" />
                Tự động
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Basic Info */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Danh mục</Label>
                  <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mùi & hương">Mùi & hương</SelectItem>
                      <SelectItem value="Cách sử dụng">Cách sử dụng</SelectItem>
                      <SelectItem value="Bảo quản">Bảo quản</SelectItem>
                      <SelectItem value="Tác dụng">Tác dụng</SelectItem>
                      <SelectItem value="Chất lượng">Chất lượng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subcategory">Danh mục con</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => updateFormData('subcategory', e.target.value)}
                    placeholder="Ví dụ: Mô tả đặc trưng, cảm nhận"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="question">Câu hỏi chính *</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => updateFormData('question', e.target.value)}
                  placeholder="Nhập câu hỏi chính..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="answer">Câu trả lời chính *</Label>
                <RichTextEditor
                  id="answer"
                  value={formData.answer}
                  onChange={(value) => updateFormData('answer', value)}
                  placeholder="Nhập câu trả lời chi tiết..."
                  height="150px"
                  className="mt-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => updateFormData('isActive', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="isActive">Hiển thị FAQ này</Label>
              </div>
            </TabsContent>

            {/* Tab 2: Question Variations */}
            <TabsContent value="variations" className="space-y-4">
              <div>
                <Label>Câu hỏi chính</Label>
                <Input
                  value={formData.questionVariations.primary || formData.question}
                  onChange={(e) => updateFormData('questionVariations.primary', e.target.value)}
                  placeholder="Câu hỏi chính..."
                />
              </div>

              <div>
                <Label className="flex items-center justify-between">
                  Các cách hỏi khác
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('questionVariations.alternatives', '')}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </Label>
                <div className="space-y-2">
                  {formData.questionVariations.alternatives.map((alt, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={alt}
                        onChange={(e) => {
                          const newAlts = [...formData.questionVariations.alternatives];
                          newAlts[index] = e.target.value;
                          updateFormData('questionVariations.alternatives', newAlts);
                        }}
                        placeholder="Cách hỏi khác..."
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('questionVariations.alternatives', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dialect Variations */}
              {(['north', 'central', 'south'] as const).map((region) => (
                <div key={region}>
                  <Label className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {region === 'north' ? 'Miền Bắc' : region === 'central' ? 'Miền Trung' : 'Miền Nam'}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem(`questionVariations.dialects.${region}`, '')}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </Label>
                  <div className="space-y-2">
                    {formData.questionVariations.dialects[region].map((dialect, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={dialect}
                          onChange={(e) => {
                            const newDialects = [...formData.questionVariations.dialects[region]];
                            newDialects[index] = e.target.value;
                            updateFormData(`questionVariations.dialects.${region}`, newDialects);
                          }}
                          placeholder={`Cách nói ${region === 'north' ? 'miền Bắc' : region === 'central' ? 'miền Trung' : 'miền Nam'}...`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem(`questionVariations.dialects.${region}`, index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* Tab 3: Keywords & Tags */}
            <TabsContent value="keywords" className="space-y-4">
              <div>
                <Label className="flex items-center justify-between">
                  Keyword Weights
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const keyword = prompt('Nhập từ khóa:');
                      if (keyword) {
                        updateFormData(`keywordWeights.${keyword}`, 1.0);
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </Label>
                <div className="space-y-2">
                  {Object.entries(formData.keywordWeights).map(([keyword, weight]) => (
                    <div key={keyword} className="flex gap-2 items-center">
                      <Input value={keyword} disabled className="flex-1" />
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={weight}
                        onChange={(e) => updateFormData(`keywordWeights.${keyword}`, parseFloat(e.target.value))}
                        className="w-20"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newWeights = { ...formData.keywordWeights };
                          delete newWeights[keyword];
                          updateFormData('keywordWeights', newWeights);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="flex items-center justify-between">
                  Tags
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const tag = prompt('Nhập tag:');
                      if (tag && !formData.tags.includes(tag)) {
                        addArrayItem('tags', tag);
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeArrayItem('tags', index)}
                        className="ml-1 text-xs"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Tab 4: Multi-channel Content */}
            <TabsContent value="channels" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website-content">Website (Full)</Label>
                  <Textarea
                    id="website-content"
                    value={formData.channels.website || formData.answer}
                    onChange={(e) => updateFormData('channels.website', e.target.value)}
                    placeholder="Nội dung chi tiết cho website..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="mobile-content">Mobile (Ngắn gọn)</Label>
                  <Textarea
                    id="mobile-content"
                    value={formData.channels.mobile}
                    onChange={(e) => updateFormData('channels.mobile', e.target.value)}
                    placeholder="Nội dung ngắn gọn cho mobile..."
                    rows={4}
                  />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Social Media Content</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="facebook-content">Facebook</Label>
                    <Textarea
                      id="facebook-content"
                      value={formData.channels.social.facebook}
                      onChange={(e) => updateFormData('channels.social.facebook', e.target.value)}
                      placeholder="🌸 Content với emoji..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram-content">Instagram</Label>
                    <Textarea
                      id="instagram-content"
                      value={formData.channels.social.instagram}
                      onChange={(e) => updateFormData('channels.social.instagram', e.target.value)}
                      placeholder="✨ Content với #hashtag..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tiktok-content">TikTok</Label>
                    <Textarea
                      id="tiktok-content"
                      value={formData.channels.social.tiktok}
                      onChange={(e) => updateFormData('channels.social.tiktok', e.target.value)}
                      placeholder="Content viral style 😍..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Voice Assistant</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="voice-question">Audio Question</Label>
                    <Input
                      id="voice-question"
                      value={formData.channels.voice_assistant.question_audio}
                      onChange={(e) => updateFormData('channels.voice_assistant.question_audio', e.target.value)}
                      placeholder="Audio-friendly question..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="voice-answer">Audio Answer</Label>
                    <Textarea
                      id="voice-answer"
                      value={formData.channels.voice_assistant.answer_audio}
                      onChange={(e) => updateFormData('channels.voice_assistant.answer_audio', e.target.value)}
                      placeholder="Audio-friendly answer..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 5: Multimedia Content */}
            <TabsContent value="multimedia" className="space-y-4">
              <div>
                <Label className="flex items-center justify-between">
                  Images
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('multimediaContent.images', {
                      url: '',
                      alt: '',
                      type: 'product',
                      order: formData.multimediaContent.images.length
                    })}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </Label>
                <div className="space-y-3">
                  {formData.multimediaContent.images.map((image, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>URL</Label>
                          <Input
                            value={image.url}
                            onChange={(e) => {
                              const newImages = [...formData.multimediaContent.images];
                              newImages[index].url = e.target.value;
                              updateFormData('multimediaContent.images', newImages);
                            }}
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <Label>Alt Text</Label>
                          <Input
                            value={image.alt}
                            onChange={(e) => {
                              const newImages = [...formData.multimediaContent.images];
                              newImages[index].alt = e.target.value;
                              updateFormData('multimediaContent.images', newImages);
                            }}
                            placeholder="Mô tả ảnh..."
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <div className="flex gap-2">
                            <Select 
                              value={image.type} 
                              onValueChange={(value) => {
                                const newImages = [...formData.multimediaContent.images];
                                newImages[index].type = value as any;
                                updateFormData('multimediaContent.images', newImages);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="product">Product</SelectItem>
                                <SelectItem value="guide">Guide</SelectItem>
                                <SelectItem value="usage">Usage</SelectItem>
                                <SelectItem value="comparison">Comparison</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeArrayItem('multimediaContent.images', index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <Label className="flex items-center justify-between">
                  Videos
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('multimediaContent.videos', {
                      url: '',
                      type: 'demo',
                      description: ''
                    })}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </Label>
                <div className="space-y-3">
                  {formData.multimediaContent.videos.map((video, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label>URL</Label>
                          <Input
                            value={video.url}
                            onChange={(e) => {
                              const newVideos = [...formData.multimediaContent.videos];
                              newVideos[index].url = e.target.value;
                              updateFormData('multimediaContent.videos', newVideos);
                            }}
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Select 
                            value={video.type} 
                            onValueChange={(value) => {
                              const newVideos = [...formData.multimediaContent.videos];
                              newVideos[index].type = value as any;
                              updateFormData('multimediaContent.videos', newVideos);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="demo">Demo</SelectItem>
                              <SelectItem value="tutorial">Tutorial</SelectItem>
                              <SelectItem value="testimonial">Testimonial</SelectItem>
                              <SelectItem value="unboxing">Unboxing</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={video.description}
                            onChange={(e) => {
                              const newVideos = [...formData.multimediaContent.videos];
                              newVideos[index].description = e.target.value;
                              updateFormData('multimediaContent.videos', newVideos);
                            }}
                            placeholder="Mô tả video..."
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeArrayItem('multimediaContent.videos', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Tab 6: Business Logic */}
            <TabsContent value="business" className="space-y-4">
              <div>
                <Label className="flex items-center justify-between">
                  Related Products (Upsell)
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('upsellSuggestions.related_products', {
                      product_id: '',
                      relevance: 0.5,
                      display_text: ''
                    })}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </Label>
                <div className="space-y-3">
                  {formData.upsellSuggestions.related_products.map((product, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label>Product ID</Label>
                          <Input
                            value={product.product_id}
                            onChange={(e) => {
                              const newProducts = [...formData.upsellSuggestions.related_products];
                              newProducts[index].product_id = e.target.value;
                              updateFormData('upsellSuggestions.related_products', newProducts);
                            }}
                            placeholder="product_id..."
                          />
                        </div>
                        <div>
                          <Label>Relevance (0-1)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            value={product.relevance}
                            onChange={(e) => {
                              const newProducts = [...formData.upsellSuggestions.related_products];
                              newProducts[index].relevance = parseFloat(e.target.value);
                              updateFormData('upsellSuggestions.related_products', newProducts);
                            }}
                          />
                        </div>
                        <div>
                          <Label>Display Text</Label>
                          <Input
                            value={product.display_text}
                            onChange={(e) => {
                              const newProducts = [...formData.upsellSuggestions.related_products];
                              newProducts[index].display_text = e.target.value;
                              updateFormData('upsellSuggestions.related_products', newProducts);
                            }}
                            placeholder="Sản phẩm liên quan..."
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeArrayItem('upsellSuggestions.related_products', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <Label className="flex items-center justify-between">
                  Related FAQ IDs
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const faqId = prompt('Nhập FAQ ID:');
                      if (faqId && !formData.relatedQuestionIds.includes(faqId)) {
                        addArrayItem('relatedQuestionIds', faqId);
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {formData.relatedQuestionIds.map((id, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {id}
                      <button
                        type="button"
                        onClick={() => removeArrayItem('relatedQuestionIds', index)}
                        className="ml-1 text-xs"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Tab 7: Automation */}
            <TabsContent value="automation" className="space-y-4">
              <div>
                <Label className="flex items-center justify-between">
                  Trigger Conditions
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('automation.trigger_conditions', {
                      type: 'keyword_match',
                      threshold: 0.8,
                      keywords: []
                    })}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </Label>
                <div className="space-y-3">
                  {formData.automation.trigger_conditions.map((condition, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label>Type</Label>
                          <Select 
                            value={condition.type} 
                            onValueChange={(value) => {
                              const newConditions = [...formData.automation.trigger_conditions];
                              newConditions[index].type = value as any;
                              updateFormData('automation.trigger_conditions', newConditions);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="keyword_match">Keyword Match</SelectItem>
                              <SelectItem value="context_similarity">Context Similarity</SelectItem>
                              <SelectItem value="user_intent">User Intent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Threshold</Label>
                          <Input
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            value={condition.threshold}
                            onChange={(e) => {
                              const newConditions = [...formData.automation.trigger_conditions];
                              newConditions[index].threshold = parseFloat(e.target.value);
                              updateFormData('automation.trigger_conditions', newConditions);
                            }}
                          />
                        </div>
                        <div>
                          <Label>Keywords (comma-separated)</Label>
                          <Input
                            value={condition.keywords?.join(', ') || ''}
                            onChange={(e) => {
                              const newConditions = [...formData.automation.trigger_conditions];
                              newConditions[index].keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
                              updateFormData('automation.trigger_conditions', newConditions);
                            }}
                            placeholder="từ khóa 1, từ khóa 2..."
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeArrayItem('automation.trigger_conditions', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex gap-3 mt-6 pt-4 border-t">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Cập nhật Rich FAQ' : 'Tạo Rich FAQ'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}