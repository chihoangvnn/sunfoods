import React, { useState, useEffect } from "react";
import { Bot, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { SocialAccount, FanpageBotConfig } from "@shared/schema";

interface FanpageBotConfigDialogProps {
  account: SocialAccount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FanpageBotConfigDialog({ account, open, onOpenChange }: FanpageBotConfigDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch bot config for this fanpage
  const { data: botConfig, isLoading } = useQuery<FanpageBotConfig>({
    queryKey: [`/api/social-accounts/${account.id}/bot-config`],
    enabled: open,
  });

  // Local form state
  const [formData, setFormData] = useState<FanpageBotConfig>({});

  // Reset and update form when account changes or data loads
  useEffect(() => {
    if (open && account.id) {
      // Reset to loaded config or empty object for new account
      setFormData(botConfig || {});
    }
  }, [account.id, botConfig, open]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (config: FanpageBotConfig) => {
      const response = await fetch(`/api/social-accounts/${account.id}/bot-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(config),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save bot config');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Đã lưu cấu hình",
        description: "Cấu hình bot cho fanpage đã được cập nhật thành công",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/social-accounts/${account.id}/bot-config`] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Bot className="w-6 h-6 text-[hsl(var(--activity-purple))]" />
            Cấu hình Bot - {account.name}
          </DialogTitle>
          <DialogDescription>
            Tùy chỉnh cấu hình RASA bot riêng cho fanpage này. Các giá trị để trống sẽ sử dụng cài đặt mặc định.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--activity-purple))]"></div>
            <p className="mt-4 text-muted-foreground">Đang tải cấu hình...</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Enable Bot Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="space-y-1">
                <Label htmlFor="enabled" className="text-base font-semibold">Kích hoạt Bot</Label>
                <p className="text-sm text-muted-foreground">
                  Bật/tắt bot cho fanpage này (ghi đè cài đặt toàn cục)
                </p>
              </div>
              <Switch
                id="enabled"
                checked={formData.enabled ?? false}
                onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
              />
            </div>

            {/* Auto Reply Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="space-y-1">
                <Label htmlFor="autoReply" className="text-base font-semibold">Tự động trả lời</Label>
                <p className="text-sm text-muted-foreground">
                  Bot tự động trả lời tin nhắn Facebook Messenger
                </p>
              </div>
              <Switch
                id="autoReply"
                checked={formData.autoReply ?? false}
                onCheckedChange={(checked) => setFormData({ ...formData, autoReply: checked })}
              />
            </div>

            {/* RASA URL */}
            <div className="space-y-2">
              <Label htmlFor="rasaUrl">RASA URL (tùy chọn)</Label>
              <Input
                id="rasaUrl"
                type="url"
                placeholder="https://your-rasa-server.com/webhooks/rest/webhook"
                value={formData.rasaUrl ?? ''}
                onChange={(e) => setFormData({ ...formData, rasaUrl: e.target.value || undefined })}
              />
              <p className="text-xs text-muted-foreground">
                URL RASA endpoint riêng cho fanpage này
              </p>
            </div>

            {/* Welcome Message */}
            <div className="space-y-2">
              <Label htmlFor="welcomeMessage">Tin nhắn chào mừng (tùy chọn)</Label>
              <Textarea
                id="welcomeMessage"
                placeholder="Xin chào! Tôi là trợ lý ảo..."
                value={formData.welcomeMessage ?? ''}
                onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value || undefined })}
                rows={3}
              />
            </div>

            {/* Business Context */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Ngành hàng (tùy chọn)</Label>
                <Input
                  id="industry"
                  placeholder="e-commerce, food, healthcare..."
                  value={formData.industry ?? ''}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value || undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessName">Tên doanh nghiệp (tùy chọn)</Label>
                <Input
                  id="businessName"
                  placeholder="Tên công ty/cửa hàng"
                  value={formData.businessName ?? ''}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value || undefined })}
                />
              </div>
            </div>

            {/* Delivery Areas */}
            <div className="space-y-2">
              <Label htmlFor="deliveryAreas">Khu vực giao hàng (tùy chọn)</Label>
              <Input
                id="deliveryAreas"
                placeholder="Hà Nội, TP.HCM, Đà Nẵng (phân cách bằng dấu phẩy)"
                value={formData.deliveryAreas?.join(', ') ?? ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  deliveryAreas: e.target.value ? e.target.value.split(',').map(s => s.trim()) : undefined 
                })}
              />
            </div>

            {/* Payment Methods */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethods">Phương thức thanh toán (tùy chọn)</Label>
              <Input
                id="paymentMethods"
                placeholder="COD, Chuyển khoản, Momo (phân cách bằng dấu phẩy)"
                value={formData.paymentMethods?.join(', ') ?? ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  paymentMethods: e.target.value ? e.target.value.split(',').map(s => s.trim()) : undefined 
                })}
              />
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency">Đơn vị tiền tệ (tùy chọn)</Label>
              <Input
                id="currency"
                placeholder="VND, USD..."
                value={formData.currency ?? ''}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value || undefined })}
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saveMutation.isPending}
          >
            <X className="w-4 h-4 mr-2" />
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="bg-gradient-to-r from-[hsl(var(--activity-purple))] to-[hsl(var(--activity-pink))] text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? 'Đang lưu...' : 'Lưu cấu hình'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
