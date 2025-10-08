import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Save, ArrowLeft, Settings, TrendingUp, Timer, Star, DollarSign, Bot, User, Bolt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SellerConfig {
  id: string;
  sellerId: string;
  displayName: string;
  businessName: string;
  
  // Selling Style Configuration
  sellingStyle: {
    automationLevel: "full" | "partial" | "manual";
    sellerType: "automated" | "manual" | "hybrid";
    operatingHours: {
      start: string; // "09:00"
      end: string;   // "18:00"
      timezone: string;
    };
    holidayMode: boolean;
    aiAssistance: boolean;
  };
  
  // Response Time Settings
  responseTime: {
    targetHours: number; // 1-72 hours
    autoReplyEnabled: boolean;
    urgentThresholdHours: number; // Auto-escalate if no response
    weekendDelay: boolean;
  };
  
  // Quality Level Controls
  qualityLevel: {
    serviceStandard: "basic" | "standard" | "premium" | "luxury";
    bookConditionStandards: {
      minimumCondition: "acceptable" | "good" | "very_good" | "like_new";
      qualityCheckEnabled: boolean;
      returnPolicyFlexibility: "strict" | "standard" | "flexible";
    };
    customerSatisfactionTarget: number; // 0-100%
    ratingThreshold: number; // 1-5 stars minimum
  };
  
  // Marketing Budget Configuration
  marketingBudget: {
    monthlyBudgetVnd: number;
    budgetDistribution: {
      socialMedia: number; // 0-100%
      emailMarketing: number;
      promotionalDiscounts: number;
      advertisingSpend: number;
    };
    campaignPreferences: {
      targetAudience: string[];
      preferredChannels: string[];
      seasonalCampaigns: boolean;
    };
  };
  
  // Performance Targets
  performanceTargets: {
    monthlySalesTarget: number;
    conversionRateTarget: number; // 0-100%
    customerRetentionTarget: number;
    inventoryTurnoverTarget: number;
  };
  
  // Automation Rules
  automationRules: {
    autoPricing: boolean;
    autoRestock: boolean;
    autoPromotions: boolean;
    autoCustomerMessages: boolean;
  };
}

const SELLER_TYPES = [
  { value: "automated", label: "🤖 Tự động", description: "AI điều hành hoàn toàn" },
  { value: "hybrid", label: "⚡ Kết hợp", description: "AI + giám sát thủ công" },
  { value: "manual", label: "👤 Thủ công", description: "Điều hành thủ công" }
];

const AUTOMATION_LEVELS = [
  { value: "full", label: "Tự động hoàn toàn", description: "AI xử lý mọi thứ" },
  { value: "partial", label: "Tự động một phần", description: "AI + xác nhận thủ công" },
  { value: "manual", label: "Thủ công", description: "Điều khiển hoàn toàn thủ công" }
];

const SERVICE_STANDARDS = [
  { value: "basic", label: "Cơ bản", description: "Dịch vụ tiêu chuẩn", color: "bg-gray-100 text-gray-800" },
  { value: "standard", label: "Tiêu chuẩn", description: "Dịch vụ tốt", color: "bg-blue-100 text-blue-800" },
  { value: "premium", label: "Cao cấp", description: "Dịch vụ xuất sắc", color: "bg-purple-100 text-purple-800" },
  { value: "luxury", label: "Sang trọng", description: "Dịch vụ đẳng cấp", color: "bg-yellow-100 text-yellow-800" }
];

export default function SellerConfigPanel() {
  const { sellerId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [config, setConfig] = useState<SellerConfig>({
    id: sellerId || "",
    sellerId: sellerId || "",
    displayName: "",
    businessName: "",
    sellingStyle: {
      automationLevel: "full",
      sellerType: "automated",
      operatingHours: {
        start: "09:00",
        end: "18:00",
        timezone: "Asia/Ho_Chi_Minh"
      },
      holidayMode: false,
      aiAssistance: true
    },
    responseTime: {
      targetHours: 24,
      autoReplyEnabled: true,
      urgentThresholdHours: 4,
      weekendDelay: false
    },
    qualityLevel: {
      serviceStandard: "standard",
      bookConditionStandards: {
        minimumCondition: "good",
        qualityCheckEnabled: true,
        returnPolicyFlexibility: "standard"
      },
      customerSatisfactionTarget: 85,
      ratingThreshold: 4.0
    },
    marketingBudget: {
      monthlyBudgetVnd: 5000000, // 5M VND
      budgetDistribution: {
        socialMedia: 40,
        emailMarketing: 25,
        promotionalDiscounts: 25,
        advertisingSpend: 10
      },
      campaignPreferences: {
        targetAudience: ["students", "book_lovers", "professionals"],
        preferredChannels: ["facebook", "email", "website"],
        seasonalCampaigns: true
      }
    },
    performanceTargets: {
      monthlySalesTarget: 50000000, // 50M VND
      conversionRateTarget: 12,
      customerRetentionTarget: 70,
      inventoryTurnoverTarget: 6
    },
    automationRules: {
      autoPricing: true,
      autoRestock: true,
      autoPromotions: true,
      autoCustomerMessages: true
    }
  });

  // Fetch seller configuration data
  const { data: sellerData, isLoading } = useQuery({
    queryKey: ['book-seller-config', sellerId],
    queryFn: () => apiRequest(`/api/book-sellers/${sellerId}/config`, {
      method: 'GET'
    }),
    enabled: !!sellerId
  });

  // Save configuration mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (configData: SellerConfig) => {
      const response = await fetch(`/api/book-sellers/${sellerId}/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configData)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cấu hình đã được lưu",
        description: "Cài đặt seller đã được cập nhật thành công",
      });
      queryClient.invalidateQueries({ queryKey: ['book-seller', sellerId] });
    },
    onError: () => {
      toast({
        title: "Lỗi lưu cấu hình",
        description: "Không thể lưu cài đặt, vui lòng thử lại",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (sellerData && typeof sellerData === 'object' && 'displayName' in sellerData) {
      // Load complete configuration from API response
      setConfig(prev => ({
        ...prev,
        ...(sellerData as SellerConfig)
      }));
    }
  }, [sellerData]);

  const handleSave = () => {
    saveConfigMutation.mutate(config);
  };

  const updateConfig = (section: keyof SellerConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const updateNestedConfig = (section: keyof SellerConfig, subSection: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [subSection]: {
          ...((prev[section] as any)[subSection] || {}),
          [field]: value
        }
      }
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return <div className="p-6">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/book-sellers")}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Cấu hình Seller
              </h1>
              <p className="text-muted-foreground mt-1">
                {config.displayName} - Cài đặt chi tiết cho seller
              </p>
            </div>
          </div>
          <Button 
            onClick={handleSave}
            disabled={saveConfigMutation.isPending}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Save className="h-4 w-4" />
            {saveConfigMutation.isPending ? "Đang lưu..." : "Lưu cấu hình"}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Selling Style Configuration */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Phong cách bán hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Seller Type */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Loại seller</Label>
                <Select 
                  value={config.sellingStyle.sellerType} 
                  onValueChange={(value) => updateConfig('sellingStyle', 'sellerType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SELLER_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex flex-col">
                          <span>{type.label}</span>
                          <span className="text-xs text-muted-foreground">{type.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Automation Level */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Mức độ tự động</Label>
                <Select 
                  value={config.sellingStyle.automationLevel} 
                  onValueChange={(value) => updateConfig('sellingStyle', 'automationLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUTOMATION_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="flex flex-col">
                          <span>{level.label}</span>
                          <span className="text-xs text-muted-foreground">{level.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Operating Hours */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Giờ hoạt động</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Bắt đầu</Label>
                    <Input
                      type="time"
                      value={config.sellingStyle.operatingHours.start}
                      onChange={(e) => updateNestedConfig('sellingStyle', 'operatingHours', 'start', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Kết thúc</Label>
                    <Input
                      type="time"
                      value={config.sellingStyle.operatingHours.end}
                      onChange={(e) => updateNestedConfig('sellingStyle', 'operatingHours', 'end', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Switches */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Chế độ nghỉ lễ</Label>
                  <Switch
                    checked={config.sellingStyle.holidayMode}
                    onCheckedChange={(checked) => updateConfig('sellingStyle', 'holidayMode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Hỗ trợ AI</Label>
                  <Switch
                    checked={config.sellingStyle.aiAssistance}
                    onCheckedChange={(checked) => updateConfig('sellingStyle', 'aiAssistance', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Time Settings */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-green-600" />
                Thời gian phản hồi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Target Response Hours */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Thời gian phản hồi mục tiêu</Label>
                  <Badge variant="outline">{config.responseTime.targetHours} giờ</Badge>
                </div>
                <Slider
                  value={[config.responseTime.targetHours]}
                  onValueChange={([value]) => updateConfig('responseTime', 'targetHours', value)}
                  max={72}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 giờ</span>
                  <span>72 giờ</span>
                </div>
              </div>

              {/* Urgent Threshold */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Ngưỡng khẩn cấp</Label>
                  <Badge variant="destructive">{config.responseTime.urgentThresholdHours} giờ</Badge>
                </div>
                <Slider
                  value={[config.responseTime.urgentThresholdHours]}
                  onValueChange={([value]) => updateConfig('responseTime', 'urgentThresholdHours', value)}
                  max={24}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Response Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Trả lời tự động</Label>
                  <Switch
                    checked={config.responseTime.autoReplyEnabled}
                    onCheckedChange={(checked) => updateConfig('responseTime', 'autoReplyEnabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Trễ cuối tuần</Label>
                  <Switch
                    checked={config.responseTime.weekendDelay}
                    onCheckedChange={(checked) => updateConfig('responseTime', 'weekendDelay', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Level Controls */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-600" />
                Chuẩn chất lượng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Service Standard */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tiêu chuẩn dịch vụ</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICE_STANDARDS.map((standard) => (
                    <Button
                      key={standard.value}
                      variant={config.qualityLevel.serviceStandard === standard.value ? "default" : "outline"}
                      className={`p-3 h-auto flex flex-col ${config.qualityLevel.serviceStandard === standard.value ? standard.color : ''}`}
                      onClick={() => updateConfig('qualityLevel', 'serviceStandard', standard.value)}
                    >
                      <span className="font-medium">{standard.label}</span>
                      <span className="text-xs">{standard.description}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Customer Satisfaction Target */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Mục tiêu hài lòng khách hàng</Label>
                  <Badge variant="outline">{config.qualityLevel.customerSatisfactionTarget}%</Badge>
                </div>
                <Slider
                  value={[config.qualityLevel.customerSatisfactionTarget]}
                  onValueChange={([value]) => updateConfig('qualityLevel', 'customerSatisfactionTarget', value)}
                  max={100}
                  min={50}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Rating Threshold */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Ngưỡng đánh giá tối thiểu</Label>
                  <Badge variant="outline">{config.qualityLevel.ratingThreshold} ⭐</Badge>
                </div>
                <Slider
                  value={[config.qualityLevel.ratingThreshold]}
                  onValueChange={([value]) => updateConfig('qualityLevel', 'ratingThreshold', value)}
                  max={5}
                  min={1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Marketing Budget Configuration */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-orange-600" />
                Ngân sách Marketing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Monthly Budget */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Ngân sách hàng tháng</Label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={config.marketingBudget.monthlyBudgetVnd}
                    onChange={(e) => updateConfig('marketingBudget', 'monthlyBudgetVnd', parseInt(e.target.value) || 0)}
                    className="text-right"
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    {formatCurrency(config.marketingBudget.monthlyBudgetVnd)}
                  </p>
                </div>
              </div>

              {/* Budget Distribution */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Phân bổ ngân sách (%)</Label>
                
                {[
                  { key: 'socialMedia', label: 'Social Media', color: 'bg-blue-500' },
                  { key: 'emailMarketing', label: 'Email Marketing', color: 'bg-green-500' },
                  { key: 'promotionalDiscounts', label: 'Khuyến mãi', color: 'bg-red-500' },
                  { key: 'advertisingSpend', label: 'Quảng cáo', color: 'bg-purple-500' }
                ].map((item) => (
                  <div key={item.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">{item.label}</Label>
                      <Badge variant="outline">
                        {config.marketingBudget.budgetDistribution[item.key as keyof typeof config.marketingBudget.budgetDistribution]}%
                      </Badge>
                    </div>
                    <Slider
                      value={[config.marketingBudget.budgetDistribution[item.key as keyof typeof config.marketingBudget.budgetDistribution]]}
                      onValueChange={([value]) => {
                        setConfig(prev => ({
                          ...prev,
                          marketingBudget: {
                            ...prev.marketingBudget,
                            budgetDistribution: {
                              ...prev.marketingBudget.budgetDistribution,
                              [item.key]: value
                            }
                          }
                        }));
                      }}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
              
              {/* Budget Check */}
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tổng phân bổ:</span>
                  <Badge 
                    variant={
                      Object.values(config.marketingBudget.budgetDistribution).reduce((a, b) => a + b, 0) === 100 
                        ? "default" 
                        : "destructive"
                    }
                  >
                    {Object.values(config.marketingBudget.budgetDistribution).reduce((a, b) => a + b, 0)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Targets & Automation Rules */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Performance Targets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                Mục tiêu hiệu suất
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Doanh số/tháng (VND)</Label>
                  <Input
                    type="number"
                    value={config.performanceTargets.monthlySalesTarget}
                    onChange={(e) => updateConfig('performanceTargets', 'monthlySalesTarget', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label className="text-sm">Tỷ lệ chuyển đổi (%)</Label>
                  <Input
                    type="number"
                    value={config.performanceTargets.conversionRateTarget}
                    onChange={(e) => updateConfig('performanceTargets', 'conversionRateTarget', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Automation Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-green-600" />
                Quy tắc tự động
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'autoPricing', label: 'Định giá tự động' },
                { key: 'autoRestock', label: 'Tự động bổ sung hàng' },
                { key: 'autoPromotions', label: 'Khuyến mãi tự động' },
                { key: 'autoCustomerMessages', label: 'Tin nhắn khách hàng tự động' }
              ].map((rule) => (
                <div key={rule.key} className="flex items-center justify-between">
                  <Label className="text-sm">{rule.label}</Label>
                  <Switch
                    checked={config.automationRules[rule.key as keyof typeof config.automationRules]}
                    onCheckedChange={(checked) => updateConfig('automationRules', rule.key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}