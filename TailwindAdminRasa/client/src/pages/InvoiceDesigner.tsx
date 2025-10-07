import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Copy, Trash2, Check, Eye, Upload, X } from "lucide-react";
import { InvoiceTemplateConfig } from "@shared/schema";

interface InvoiceTemplate {
  id: string;
  name: string;
  config: InvoiceTemplateConfig;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_CONFIG: InvoiceTemplateConfig = {
  colors: {
    primary: '#6B8E23',
    secondary: '#556B2F',
    text: '#556B2F',
    background: '#F5F5DC',
    border: '#6B8E23',
  },
  fonts: {
    family: 'sans-serif',
    size: {
      heading: '21px',
      body: '9px',
      small: '8px',
    },
  },
  qr_settings: {
    enabled: true,
    position: 'bottom-right',
    size: 133,
  },
  layout: {
    orientation: 'portrait',
    paperSize: 'a4',
    margins: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
  },
  header: {
    show_business_name: true,
    show_logo: true,
    show_contact_info: true,
  },
  footer: {
    show_terms: false,
    show_thank_you: true,
    custom_text: 'Cảm ơn bạn đã ủng hộ sản phẩm hữu cơ!',
  },
  fields: {
    show_customer_info: true,
    show_payment_method: true,
    show_notes: true,
    show_tax: true,
  },
};

export default function InvoiceDesigner() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<InvoiceTemplateConfig>(DEFAULT_CONFIG);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  const debouncedConfig = useDebounce(config, 500);
  const debouncedOrderId = useDebounce(selectedOrderId, 500);

  const { data: templatesData } = useQuery({
    queryKey: ["/api/invoice-templates"],
    queryFn: async () => {
      const res = await fetch("/api/invoice-templates");
      if (!res.ok) throw new Error("Failed to fetch templates");
      return res.json();
    },
  });

  const { data: ordersData } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders?limit=10");
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  const { data: previewData, isLoading: isPreviewLoading } = useQuery({
    queryKey: ["/api/invoice-templates/preview", debouncedConfig, debouncedOrderId],
    queryFn: async () => {
      if (!debouncedOrderId) return null;
      const res = await fetch("/api/invoice-templates/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: debouncedConfig, orderId: debouncedOrderId }),
      });
      if (!res.ok) throw new Error("Failed to generate preview");
      return res.json();
    },
    enabled: !!debouncedOrderId,
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: { name: string; config: InvoiceTemplateConfig; isDefault?: boolean }) => {
      const res = await fetch("/api/invoice-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create template");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoice-templates"] });
      toast({ title: "Thành công", description: "Đã lưu template mới" });
      setTemplateName("");
    },
    onError: () => {
      toast({ title: "Lỗi", description: "Không thể lưu template", variant: "destructive" });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InvoiceTemplate> }) => {
      const res = await fetch(`/api/invoice-templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update template");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoice-templates"] });
      toast({ title: "Thành công", description: "Đã cập nhật template" });
    },
    onError: () => {
      toast({ title: "Lỗi", description: "Không thể cập nhật template", variant: "destructive" });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/invoice-templates/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete template");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoice-templates"] });
      toast({ title: "Thành công", description: "Đã xóa template" });
      if (selectedTemplateId) setSelectedTemplateId(null);
    },
    onError: () => {
      toast({ title: "Lỗi", description: "Không thể xóa template", variant: "destructive" });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/invoice-templates/${id}/set-default`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to set default");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoice-templates"] });
      toast({ title: "Thành công", description: "Đã đặt làm template mặc định" });
    },
    onError: () => {
      toast({ title: "Lỗi", description: "Không thể đặt làm mặc định", variant: "destructive" });
    },
  });

  const handleLoadTemplate = (template: InvoiceTemplate) => {
    setConfig(template.config);
    setSelectedTemplateId(template.id);
    setTemplateName(template.name);
  };

  const handleCloneTemplate = (template: InvoiceTemplate) => {
    setConfig(template.config);
    setTemplateName(`${template.name} (Copy)`);
    setSelectedTemplateId(null);
  };

  const handleSaveNew = () => {
    if (!templateName.trim()) {
      toast({ title: "Lỗi", description: "Vui lòng nhập tên template", variant: "destructive" });
      return;
    }
    createTemplateMutation.mutate({ name: templateName, config });
  };

  const handleUpdate = () => {
    if (!selectedTemplateId) {
      toast({ title: "Lỗi", description: "Chưa chọn template để cập nhật", variant: "destructive" });
      return;
    }
    updateTemplateMutation.mutate({ id: selectedTemplateId, data: { name: templateName, config } });
  };

  useEffect(() => {
    if (ordersData?.length && !selectedOrderId) {
      setSelectedOrderId(ordersData[0].id);
    }
  }, [ordersData, selectedOrderId]);

  const updateConfig = (path: string[], value: any) => {
    setConfig((prev) => {
      const newConfig = { ...prev };
      let current: any = newConfig;
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newConfig;
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({ 
        title: "Lỗi", 
        description: "Chỉ chấp nhận file .png, .jpg, .jpeg, .webp", 
        variant: "destructive" 
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: "Lỗi", 
        description: "Kích thước file tối đa 5MB", 
        variant: "destructive" 
      });
      return;
    }

    setIsUploadingLogo(true);
    
    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('folder', 'invoices');
      formData.append('tags', JSON.stringify(['logo']));

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      const logoUrl = result.media[0]?.secure_url;

      if (logoUrl) {
        updateConfig(['logo_url'], logoUrl);
        toast({ 
          title: "Thành công", 
          description: "Đã tải lên logo" 
        });
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      toast({ 
        title: "Lỗi", 
        description: error instanceof Error ? error.message : "Không thể tải lên logo", 
        variant: "destructive" 
      });
    } finally {
      setIsUploadingLogo(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleRemoveLogo = () => {
    updateConfig(['logo_url'], undefined);
    toast({ 
      title: "Thành công", 
      description: "Đã xóa logo" 
    });
  };

  return (
    <div className="h-full p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Invoice Designer</h1>
        <p className="text-muted-foreground">Thiết kế và quản lý template hóa đơn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-6 h-[calc(100vh-200px)]">
        {/* Left Panel - Controls */}
        <Card className="overflow-auto">
          <CardHeader>
            <CardTitle>Cài đặt thiết kế</CardTitle>
            <CardDescription>Tùy chỉnh giao diện hóa đơn</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={["colors", "fonts", "layout"]} className="w-full">
              <AccordionItem value="colors">
                <AccordionTrigger>Màu sắc</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div>
                    <Label>Màu chính</Label>
                    <Input
                      type="color"
                      value={config.colors?.primary || "#6B8E23"}
                      onChange={(e) => updateConfig(["colors", "primary"], e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Màu phụ</Label>
                    <Input
                      type="color"
                      value={config.colors?.secondary || "#556B2F"}
                      onChange={(e) => updateConfig(["colors", "secondary"], e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Màu chữ</Label>
                    <Input
                      type="color"
                      value={config.colors?.text || "#556B2F"}
                      onChange={(e) => updateConfig(["colors", "text"], e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Màu nền</Label>
                    <Input
                      type="color"
                      value={config.colors?.background || "#F5F5DC"}
                      onChange={(e) => updateConfig(["colors", "background"], e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Màu viền</Label>
                    <Input
                      type="color"
                      value={config.colors?.border || "#6B8E23"}
                      onChange={(e) => updateConfig(["colors", "border"], e.target.value)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="fonts">
                <AccordionTrigger>Phông chữ</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div>
                    <Label>Font chữ</Label>
                    <Select
                      value={config.fonts?.family || "sans-serif"}
                      onValueChange={(val) => updateConfig(["fonts", "family"], val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sans-serif">Sans-serif</SelectItem>
                        <SelectItem value="serif">Serif</SelectItem>
                        <SelectItem value="monospace">Monospace</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Kích thước tiêu đề: {config.fonts?.size?.heading || "21px"}</Label>
                    <Slider
                      value={[parseInt(config.fonts?.size?.heading || "21")]}
                      min={12}
                      max={36}
                      step={1}
                      onValueChange={([val]) => updateConfig(["fonts", "size", "heading"], `${val}px`)}
                    />
                  </div>
                  <div>
                    <Label>Kích thước nội dung: {config.fonts?.size?.body || "9px"}</Label>
                    <Slider
                      value={[parseInt(config.fonts?.size?.body || "9")]}
                      min={6}
                      max={16}
                      step={1}
                      onValueChange={([val]) => updateConfig(["fonts", "size", "body"], `${val}px`)}
                    />
                  </div>
                  <div>
                    <Label>Kích thước chữ nhỏ: {config.fonts?.size?.small || "8px"}</Label>
                    <Slider
                      value={[parseInt(config.fonts?.size?.small || "8")]}
                      min={6}
                      max={14}
                      step={1}
                      onValueChange={([val]) => updateConfig(["fonts", "size", "small"], `${val}px`)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="layout">
                <AccordionTrigger>Bố cục</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div>
                    <Label>Hướng giấy</Label>
                    <Select
                      value={config.layout?.orientation || "portrait"}
                      onValueChange={(val) => updateConfig(["layout", "orientation"], val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Dọc</SelectItem>
                        <SelectItem value="landscape">Ngang</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Khổ giấy</Label>
                    <Select
                      value={config.layout?.paperSize || "a4"}
                      onValueChange={(val) => updateConfig(["layout", "paperSize"], val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a4">A4</SelectItem>
                        <SelectItem value="a5">A5</SelectItem>
                        <SelectItem value="letter">Letter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Lề trên: {config.layout?.margins?.top || 20}px</Label>
                    <Slider
                      value={[config.layout?.margins?.top || 20]}
                      min={0}
                      max={50}
                      step={5}
                      onValueChange={([val]) => updateConfig(["layout", "margins", "top"], val)}
                    />
                  </div>
                  <div>
                    <Label>Lề phải: {config.layout?.margins?.right || 20}px</Label>
                    <Slider
                      value={[config.layout?.margins?.right || 20]}
                      min={0}
                      max={50}
                      step={5}
                      onValueChange={([val]) => updateConfig(["layout", "margins", "right"], val)}
                    />
                  </div>
                  <div>
                    <Label>Lề dưới: {config.layout?.margins?.bottom || 20}px</Label>
                    <Slider
                      value={[config.layout?.margins?.bottom || 20]}
                      min={0}
                      max={50}
                      step={5}
                      onValueChange={([val]) => updateConfig(["layout", "margins", "bottom"], val)}
                    />
                  </div>
                  <div>
                    <Label>Lề trái: {config.layout?.margins?.left || 20}px</Label>
                    <Slider
                      value={[config.layout?.margins?.left || 20]}
                      min={0}
                      max={50}
                      step={5}
                      onValueChange={([val]) => updateConfig(["layout", "margins", "left"], val)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="qr">
                <AccordionTrigger>Mã QR</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Hiển thị QR</Label>
                    <Switch
                      checked={config.qr_settings?.enabled}
                      onCheckedChange={(val) => updateConfig(["qr_settings", "enabled"], val)}
                    />
                  </div>
                  {config.qr_settings?.enabled && (
                    <>
                      <div>
                        <Label>Vị trí</Label>
                        <Select
                          value={config.qr_settings?.position || "bottom-right"}
                          onValueChange={(val) => updateConfig(["qr_settings", "position"], val)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="top-left">Trên trái</SelectItem>
                            <SelectItem value="top-right">Trên phải</SelectItem>
                            <SelectItem value="bottom-left">Dưới trái</SelectItem>
                            <SelectItem value="bottom-right">Dưới phải</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Kích thước: {config.qr_settings?.size || 133}px</Label>
                        <Slider
                          value={[config.qr_settings?.size || 133]}
                          min={80}
                          max={200}
                          step={1}
                          onValueChange={([val]) => updateConfig(["qr_settings", "size"], val)}
                        />
                      </div>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="header">
                <AccordionTrigger>Header</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {/* Logo Settings */}
                  <div className="space-y-3 pb-4 border-b">
                    <Label className="text-sm font-semibold">Cài đặt Logo</Label>
                    
                    {/* Logo Preview */}
                    {config.logo_url ? (
                      <div className="relative w-full aspect-[3/1] bg-muted rounded-md overflow-hidden border">
                        <img
                          src={config.logo_url}
                          alt="Logo preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-[3/1] bg-muted rounded-md flex items-center justify-center border border-dashed text-sm text-muted-foreground">
                        No logo uploaded - using default emoji 🌿
                      </div>
                    )}

                    {/* Upload and Remove Buttons */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => document.getElementById('logo-upload-input')?.click()}
                        disabled={isUploadingLogo}
                      >
                        {isUploadingLogo ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Đang tải...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-1" />
                            Tải logo
                          </>
                        )}
                      </Button>
                      
                      {config.logo_url && (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={handleRemoveLogo}
                          disabled={isUploadingLogo}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Hidden File Input */}
                    <input
                      id="logo-upload-input"
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />

                    <p className="text-xs text-muted-foreground">
                      Chấp nhận: PNG, JPG, JPEG, WEBP • Tối đa 5MB
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Hiển thị logo</Label>
                    <Switch
                      checked={config.header?.show_logo}
                      onCheckedChange={(val) => updateConfig(["header", "show_logo"], val)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Tên doanh nghiệp</Label>
                    <Switch
                      checked={config.header?.show_business_name}
                      onCheckedChange={(val) => updateConfig(["header", "show_business_name"], val)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Thông tin liên hệ</Label>
                    <Switch
                      checked={config.header?.show_contact_info}
                      onCheckedChange={(val) => updateConfig(["header", "show_contact_info"], val)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="footer">
                <AccordionTrigger>Footer</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Lời cảm ơn</Label>
                    <Switch
                      checked={config.footer?.show_thank_you}
                      onCheckedChange={(val) => updateConfig(["footer", "show_thank_you"], val)}
                    />
                  </div>
                  {config.footer?.show_thank_you && (
                    <div>
                      <Label>Nội dung</Label>
                      <Input
                        value={config.footer?.custom_text || ""}
                        onChange={(e) => updateConfig(["footer", "custom_text"], e.target.value)}
                        placeholder="Cảm ơn bạn..."
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Label>Điều khoản</Label>
                    <Switch
                      checked={config.footer?.show_terms}
                      onCheckedChange={(val) => updateConfig(["footer", "show_terms"], val)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="fields">
                <AccordionTrigger>Trường hiển thị</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Thông tin khách</Label>
                    <Switch
                      checked={config.fields?.show_customer_info}
                      onCheckedChange={(val) => updateConfig(["fields", "show_customer_info"], val)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Phương thức thanh toán</Label>
                    <Switch
                      checked={config.fields?.show_payment_method}
                      onCheckedChange={(val) => updateConfig(["fields", "show_payment_method"], val)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Ghi chú</Label>
                    <Switch
                      checked={config.fields?.show_notes}
                      onCheckedChange={(val) => updateConfig(["fields", "show_notes"], val)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Thuế</Label>
                    <Switch
                      checked={config.fields?.show_tax}
                      onCheckedChange={(val) => updateConfig(["fields", "show_tax"], val)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Center Panel - Preview */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Xem trước</span>
              {isPreviewLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </CardTitle>
            <div className="flex gap-2 items-center">
              <Label>Đơn mẫu:</Label>
              <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Chọn đơn hàng" />
                </SelectTrigger>
                <SelectContent>
                  {ordersData?.map((order: any) => (
                    <SelectItem key={order.id} value={order.id}>
                      #{order.id.slice(-8)} - {order.total}đ
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center overflow-auto bg-muted/10">
            {isPreviewLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Đang tạo preview...</p>
              </div>
            ) : previewData?.imageBase64 ? (
              <img
                src={previewData.imageBase64}
                alt="Invoice Preview"
                className="max-w-full max-h-full object-contain shadow-lg"
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-2" />
                <p>Chọn đơn hàng để xem preview</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Panel - Templates */}
        <Card className="overflow-auto">
          <CardHeader>
            <CardTitle>Templates</CardTitle>
            <CardDescription>Quản lý mẫu hóa đơn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tên template</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Nhập tên template..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleSaveNew} size="sm" className="w-full">
                <Save className="h-4 w-4 mr-1" />
                Lưu mới
              </Button>
              <Button
                onClick={handleUpdate}
                size="sm"
                variant="outline"
                className="w-full"
                disabled={!selectedTemplateId}
              >
                <Save className="h-4 w-4 mr-1" />
                Cập nhật
              </Button>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-2">Danh sách templates</h4>
              <div className="space-y-2">
                {templatesData?.templates?.map((template: InvoiceTemplate) => (
                  <Card
                    key={template.id}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedTemplateId === template.id ? "border-primary" : ""
                    }`}
                    onClick={() => handleLoadTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-sm">{template.name}</h5>
                          {template.isDefault && (
                            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(template.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDefaultMutation.mutate(template.id);
                        }}
                        disabled={template.isDefault}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloneTemplate(template);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Xóa template này?")) {
                            deleteTemplateMutation.mutate(template.id);
                          }
                        }}
                        disabled={template.isDefault}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
