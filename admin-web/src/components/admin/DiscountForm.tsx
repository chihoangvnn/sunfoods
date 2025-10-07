import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Percent, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const discountFormSchema = z.object({
  code: z.string().min(3, "Mã giảm giá phải có ít nhất 3 ký tự").max(20, "Mã giảm giá không được quá 20 ký tự"),
  name: z.string().min(5, "Tên mã giảm giá phải có ít nhất 5 ký tự"),
  description: z.string().optional(),
  type: z.enum(["percentage", "fixed", "hybrid"]),
  discountValue: z.coerce.number().min(0.01, "Giá trị giảm phải lớn hơn 0"),
  maxDiscountAmount: z.coerce.number().optional(),
  maxUsage: z.coerce.number().min(1, "Số lần sử dụng tối đa phải ít nhất 1"),
  maxUsagePerCustomer: z.coerce.number().min(1, "Số lần sử dụng tối đa mỗi khách hàng phải ít nhất 1"),
  minOrderAmount: z.coerce.number().min(0, "Giá trị đơn hàng tối thiểu không thể âm"),
  validFrom: z.date(),
  validUntil: z.date(),
  channelRestrictions: z.object({
    allowedChannels: z.array(z.string()).optional()
  }).optional(),
  status: z.enum(["draft", "active", "inactive"]).default("draft")
});

type DiscountFormData = z.infer<typeof discountFormSchema>;

interface DiscountFormProps {
  onSuccess?: () => void;
  editData?: any;
}

export function DiscountForm({ onSuccess, editData }: DiscountFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [validFromOpen, setValidFromOpen] = useState(false);
  const [validUntilOpen, setValidUntilOpen] = useState(false);

  const form = useForm<DiscountFormData>({
    resolver: zodResolver(discountFormSchema),
    defaultValues: {
      code: editData?.code || "",
      name: editData?.name || "",
      description: editData?.description || "",
      type: editData?.type || "percentage",
      discountValue: editData?.discountValue ? parseFloat(editData.discountValue) : 10,
      maxDiscountAmount: editData?.maxDiscountAmount ? parseFloat(editData.maxDiscountAmount) : undefined,
      maxUsage: editData?.maxUsage || 100,
      maxUsagePerCustomer: editData?.maxUsagePerCustomer || 1,
      minOrderAmount: editData?.minOrderAmount ? parseFloat(editData.minOrderAmount) : 0,
      validFrom: editData?.validFrom ? new Date(editData.validFrom) : new Date(),
      validUntil: editData?.validUntil ? new Date(editData.validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      channelRestrictions: editData?.channelRestrictions || { allowedChannels: ["online", "pos"] },
      status: editData?.status || "draft"
    }
  });

  const createDiscountMutation = useMutation({
    mutationFn: async (data: DiscountFormData) => {
      const response = await fetch("/api/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          localizedMessages: {
            vi: {
              title: data.name,
              description: data.description || `Giảm ${data.type === 'percentage' ? data.discountValue + '%' : data.discountValue.toLocaleString('vi-VN') + 'đ'}`
            }
          }
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Không thể tạo mã giảm giá");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công!",
        description: "Mã giảm giá đã được tạo thành công",
      });
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      form.reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi!",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: DiscountFormData) => {
    createDiscountMutation.mutate(data);
  };

  const watchType = form.watch("type");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Thông tin cơ bản
            </CardTitle>
            <CardDescription>
              Thiết lập thông tin chính cho mã giảm giá
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Mã giảm giá *</Label>
              <Input
                id="code"
                placeholder="VD: NHANG2025"
                {...form.register("code")}
                className="uppercase"
                onChange={(e) => form.setValue("code", e.target.value.toUpperCase())}
              />
              {form.formState.errors.code && (
                <p className="text-sm text-red-500">{form.formState.errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Tên mã giảm giá *</Label>
              <Input
                id="name"
                placeholder="VD: Khuyến mãi nhang sạch 2025"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết về chương trình khuyến mãi..."
                {...form.register("description")}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select 
                value={form.watch("status")} 
                onValueChange={(value) => form.setValue("status", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Nháp</SelectItem>
                  <SelectItem value="active">Kích hoạt</SelectItem>
                  <SelectItem value="inactive">Tạm ngưng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Discount Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cấu hình giảm giá
            </CardTitle>
            <CardDescription>
              Thiết lập loại và mức độ giảm giá
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Loại giảm giá *</Label>
              <Select 
                value={form.watch("type")} 
                onValueChange={(value) => form.setValue("type", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Giảm theo phần trăm (%)</SelectItem>
                  <SelectItem value="fixed">Giảm số tiền cố định (đ)</SelectItem>
                  <SelectItem value="hybrid">Kết hợp (%) với giới hạn tối đa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountValue">
                {watchType === "percentage" ? "Phần trăm giảm giá (%)" : "Số tiền giảm (đ)"} *
              </Label>
              <Input
                id="discountValue"
                type="number"
                min="0"
                step={watchType === "percentage" ? "0.1" : "1000"}
                placeholder={watchType === "percentage" ? "VD: 20" : "VD: 50000"}
                {...form.register("discountValue")}
              />
              {form.formState.errors.discountValue && (
                <p className="text-sm text-red-500">{form.formState.errors.discountValue.message}</p>
              )}
            </div>

            {(watchType === "percentage" || watchType === "hybrid") && (
              <div className="space-y-2">
                <Label htmlFor="maxDiscountAmount">Số tiền giảm tối đa (đ)</Label>
                <Input
                  id="maxDiscountAmount"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="VD: 100000"
                  {...form.register("maxDiscountAmount")}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="minOrderAmount">Giá trị đơn hàng tối thiểu (đ)</Label>
              <Input
                id="minOrderAmount"
                type="number"
                min="0"
                step="1000"
                placeholder="VD: 200000"
                {...form.register("minOrderAmount")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Usage Limits */}
        <Card>
          <CardHeader>
            <CardTitle>Giới hạn sử dụng</CardTitle>
            <CardDescription>
              Thiết lập số lần sử dụng và ràng buộc
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxUsage">Số lần sử dụng tối đa *</Label>
              <Input
                id="maxUsage"
                type="number"
                min="1"
                placeholder="VD: 100"
                {...form.register("maxUsage")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUsagePerCustomer">Số lần sử dụng tối đa mỗi khách hàng *</Label>
              <Input
                id="maxUsagePerCustomer"
                type="number"
                min="1"
                placeholder="VD: 1"
                {...form.register("maxUsagePerCustomer")}
              />
            </div>

            <div className="space-y-3">
              <Label>Kênh bán hàng được phép</Label>
              <div className="space-y-2">
                {[
                  { value: "online", label: "Bán hàng online" },
                  { value: "pos", label: "Bán hàng tại cửa hàng (POS)" },
                  { value: "shopee", label: "Shopee" },
                  { value: "tiktok", label: "TikTok Shop" }
                ].map((channel) => (
                  <div key={channel.value} className="flex items-center space-x-2">
                    <Switch
                      id={channel.value}
                      checked={form.watch("channelRestrictions")?.allowedChannels?.includes(channel.value) || false}
                      onCheckedChange={(checked) => {
                        const current = form.watch("channelRestrictions")?.allowedChannels || [];
                        const updated = checked 
                          ? [...current, channel.value]
                          : current.filter(c => c !== channel.value);
                        form.setValue("channelRestrictions", { allowedChannels: updated });
                      }}
                    />
                    <Label htmlFor={channel.value}>{channel.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validity Period */}
        <Card>
          <CardHeader>
            <CardTitle>Thời gian hiệu lực</CardTitle>
            <CardDescription>
              Thiết lập thời gian bắt đầu và kết thúc
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ngày bắt đầu *</Label>
              <Popover open={validFromOpen} onOpenChange={setValidFromOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("validFrom") ? (
                      format(form.watch("validFrom"), "dd/MM/yyyy", { locale: vi })
                    ) : (
                      "Chọn ngày bắt đầu"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch("validFrom")}
                    onSelect={(date) => {
                      if (date) {
                        form.setValue("validFrom", date);
                        setValidFromOpen(false);
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Ngày kết thúc *</Label>
              <Popover open={validUntilOpen} onOpenChange={setValidUntilOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("validUntil") ? (
                      format(form.watch("validUntil"), "dd/MM/yyyy", { locale: vi })
                    ) : (
                      "Chọn ngày kết thúc"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch("validUntil")}
                    onSelect={(date) => {
                      if (date) {
                        form.setValue("validUntil", date);
                        setValidUntilOpen(false);
                      }
                    }}
                    disabled={(date) => date < form.watch("validFrom")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Hủy bỏ
        </Button>
        <Button type="submit" disabled={createDiscountMutation.isPending}>
          {createDiscountMutation.isPending ? "Đang tạo..." : "Tạo mã giảm giá"}
        </Button>
      </div>
    </form>
  );
}