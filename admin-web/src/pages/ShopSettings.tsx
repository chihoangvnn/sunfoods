import { useState, useEffect, lazy, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Settings,
  Store,
  Phone,
  Mail,
  MapPin,
  Globe,
  Star,
  Clock,
  Package,
  HeadphonesIcon,
  Link2,
  Smartphone,
  FileText,
  Grid3x3,
  List,
  Image as ImageIcon,
  Video,
  Plus,
  Trash2,
  Save,
  Loader2,
  X
} from "lucide-react";

// Lazy-load AddressMapPicker to avoid Leaflet bundling issues
const AddressMapPicker = lazy(() => import("@/components/AddressMapPicker").then(module => ({ default: module.AddressMapPicker })));
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FooterMenuItem {
  label: string;
  url: string;
  icon?: string;
}

interface FeatureBox {
  title: string;
  desc: string;
  icon: string;
  link: string;
}

interface QuickLink {
  label: string;
  url: string;
}

interface HeroSliderItem {
  type: 'image' | 'video';
  url: string;
  alt?: string;
  thumbnail?: string;
  link?: string;
  buttonText?: string;
  showButton?: boolean;
  targetPage?: 'home' | 'category' | 'product' | 'all';
}

interface CustomBanner {
  imageUrl: string;
  title?: string;
  description?: string;
  link?: string;
  position: 'top' | 'middle' | 'bottom';
  isActive: boolean;
}

interface ShopSettingsData {
  id?: string;
  businessName: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  zaloNumber?: string;
  rating?: string;
  totalReviews?: number;
  workingHours?: string;
  workingDays?: string;
  support247?: boolean;
  shopLatitude?: string;
  shopLongitude?: string;
  footerMenuProducts?: FooterMenuItem[];
  footerMenuSupport?: FooterMenuItem[];
  footerMenuConnect?: FooterMenuItem[];
  appStoreUrl?: string;
  googlePlayUrl?: string;
  copyrightMain?: string;
  copyrightSub?: string;
  termsUrl?: string;
  privacyUrl?: string;
  sitemapUrl?: string;
  featureBoxes?: FeatureBox[];
  quickLinks?: QuickLink[];
  heroSlider?: HeroSliderItem[];
  featuredProducts?: string[];
  customBanners?: CustomBanner[];
}

const shopSettingsSchema = z.object({
  businessName: z.string().min(1, "Tên doanh nghiệp là bắt buộc"),
  tagline: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  address: z.string().min(1, "Địa chỉ là bắt buộc"),
  phone: z.string().min(1, "Số điện thoại là bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
  website: z.string().optional(),
  zaloNumber: z.string().optional(),
  rating: z.string().optional(),
  totalReviews: z.number().optional(),
  workingHours: z.string().optional(),
  workingDays: z.string().optional(),
  support247: z.boolean().optional(),
  shopLatitude: z.string().optional(),
  shopLongitude: z.string().optional(),
  appStoreUrl: z.string().optional(),
  googlePlayUrl: z.string().optional(),
  copyrightMain: z.string().optional(),
  copyrightSub: z.string().optional(),
  termsUrl: z.string().optional(),
  privacyUrl: z.string().optional(),
  sitemapUrl: z.string().optional(),
});

type ShopSettingsForm = z.infer<typeof shopSettingsSchema>;

export default function ShopSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [footerProducts, setFooterProducts] = useState<FooterMenuItem[]>([]);
  const [footerSupport, setFooterSupport] = useState<FooterMenuItem[]>([]);
  const [footerConnect, setFooterConnect] = useState<FooterMenuItem[]>([]);
  const [featureBoxes, setFeatureBoxes] = useState<FeatureBox[]>([]);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [heroSlider, setHeroSlider] = useState<HeroSliderItem[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<string[]>([]);
  const [customBanners, setCustomBanners] = useState<CustomBanner[]>([]);

  const { data: response, isLoading } = useQuery({
    queryKey: ['/api/admin/shop-settings'],
    queryFn: async () => {
      const res = await fetch('/api/admin/shop-settings', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch shop settings');
      return res.json();
    },
  });

  const settings = response?.data;

  const { data: productsResponse } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const res = await fetch('/api/products', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  const products = productsResponse?.data || [];

  const form = useForm<ShopSettingsForm>({
    resolver: zodResolver(shopSettingsSchema),
    defaultValues: {
      businessName: "",
      tagline: "",
      description: "",
      logoUrl: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      zaloNumber: "",
      rating: "",
      totalReviews: 0,
      workingHours: "",
      workingDays: "",
      support247: false,
      shopLatitude: "",
      shopLongitude: "",
      appStoreUrl: "",
      googlePlayUrl: "",
      copyrightMain: "",
      copyrightSub: "",
      termsUrl: "",
      privacyUrl: "",
      sitemapUrl: "",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        businessName: settings.businessName || "",
        tagline: settings.tagline || "",
        description: settings.description || "",
        logoUrl: settings.logoUrl || "",
        address: settings.address || "",
        phone: settings.phone || "",
        email: settings.email || "",
        website: settings.website || "",
        zaloNumber: settings.zaloNumber || "",
        rating: settings.rating || "",
        totalReviews: settings.totalReviews || 0,
        workingHours: settings.workingHours || "",
        workingDays: settings.workingDays || "",
        support247: settings.support247 || false,
        shopLatitude: settings.shopLatitude || "",
        shopLongitude: settings.shopLongitude || "",
        appStoreUrl: settings.appStoreUrl || "",
        googlePlayUrl: settings.googlePlayUrl || "",
        copyrightMain: settings.copyrightMain || "",
        copyrightSub: settings.copyrightSub || "",
        termsUrl: settings.termsUrl || "",
        privacyUrl: settings.privacyUrl || "",
        sitemapUrl: settings.sitemapUrl || "",
      });

      setFooterProducts(Array.isArray(settings.footerMenuProducts) ? settings.footerMenuProducts : []);
      setFooterSupport(Array.isArray(settings.footerMenuSupport) ? settings.footerMenuSupport : []);
      setFooterConnect(Array.isArray(settings.footerMenuConnect) ? settings.footerMenuConnect : []);
      setFeatureBoxes(Array.isArray(settings.featureBoxes) ? settings.featureBoxes : []);
      setQuickLinks(Array.isArray(settings.quickLinks) ? settings.quickLinks : []);
      setHeroSlider(Array.isArray(settings.heroSlider) ? settings.heroSlider : []);
      setFeaturedProducts(Array.isArray(settings.featuredProducts) ? settings.featuredProducts : []);
      setCustomBanners(Array.isArray(settings.customBanners) ? settings.customBanners : []);
    }
  }, [settings, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: ShopSettingsData) => {
      // Clean payload: remove empty strings for optional fields
      const cleanedData = { ...data };
      if (cleanedData.rating === "") delete cleanedData.rating;
      if (cleanedData.totalReviews === 0) delete cleanedData.totalReviews;
      if (cleanedData.shopLatitude === "") delete cleanedData.shopLatitude;
      if (cleanedData.shopLongitude === "") delete cleanedData.shopLongitude;
      
      const payload = {
        ...cleanedData,
        footerMenuProducts: footerProducts,
        footerMenuSupport: footerSupport,
        footerMenuConnect: footerConnect,
        featureBoxes,
        quickLinks,
        heroSlider,
        featuredProducts,
        customBanners,
      };

      if (settings?.id) {
        const res = await fetch(`/api/admin/shop-settings/${settings.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update settings');
        return res.json();
      } else {
        const res = await fetch('/api/admin/shop-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ...payload, isDefault: true }),
        });
        if (!res.ok) throw new Error('Failed to create settings');
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/shop-settings'] });
      toast({
        title: "✅ Thành công",
        description: settings?.id ? "Đã cập nhật cài đặt shop" : "Đã tạo cài đặt shop",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ShopSettingsForm) => {
    saveMutation.mutate(data as ShopSettingsData);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Cài Đặt Shop
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý thông tin và cấu hình của cửa hàng
          </p>
        </div>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={saveMutation.isPending}
          size="lg"
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Lưu cài đặt
            </>
          )}
        </Button>
      </div>

      <form className="space-y-6">
        <Accordion type="multiple" defaultValue={["basic", "contact"]} className="space-y-4">
          {/* Basic Information */}
          <AccordionItem value="basic" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                <span className="font-semibold">Thông tin cơ bản</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Tên doanh nghiệp *</Label>
                  <Input
                    id="businessName"
                    {...form.register("businessName")}
                    placeholder="VD: NhangSach.Net"
                  />
                  {form.formState.errors.businessName && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.businessName.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="tagline">Slogan</Label>
                  <Input
                    id="tagline"
                    {...form.register("tagline")}
                    placeholder="VD: Nhà cung cấp nhang sạch uy tín"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Mô tả ngắn về cửa hàng"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  {...form.register("logoUrl")}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Contact Information */}
          <AccordionItem value="contact" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                <span className="font-semibold">Thông tin liên hệ</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div>
                <Label htmlFor="address">Địa chỉ *</Label>
                <Textarea
                  id="address"
                  {...form.register("address")}
                  placeholder="VD: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
                  rows={2}
                />
                {form.formState.errors.address && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.address.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="phone">Số điện thoại *</Label>
                  <Input
                    id="phone"
                    {...form.register("phone")}
                    placeholder="0123456789"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    placeholder="contact@shop.com"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="zaloNumber">Số Zalo</Label>
                  <Input
                    id="zaloNumber"
                    {...form.register("zaloNumber")}
                    placeholder="0123456789"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  {...form.register("website")}
                  placeholder="https://shop.com"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Ratings & Working Hours */}
          <AccordionItem value="ratings" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">Đánh giá & Giờ làm việc</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rating">Đánh giá (0-5)</Label>
                  <Input
                    id="rating"
                    {...form.register("rating")}
                    placeholder="4.8"
                    type="number"
                    step="0.1"
                  />
                </div>
                <div>
                  <Label htmlFor="totalReviews">Tổng số đánh giá</Label>
                  <Input
                    id="totalReviews"
                    {...form.register("totalReviews", { valueAsNumber: true })}
                    placeholder="2847"
                    type="number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workingHours">Giờ làm việc</Label>
                  <Input
                    id="workingHours"
                    {...form.register("workingHours")}
                    placeholder="8:00 - 22:00"
                  />
                </div>
                <div>
                  <Label htmlFor="workingDays">Ngày làm việc</Label>
                  <Input
                    id="workingDays"
                    {...form.register("workingDays")}
                    placeholder="Thứ 2 - Chủ nhật"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="support247"
                  checked={form.watch("support247")}
                  onCheckedChange={(checked) => form.setValue("support247", checked)}
                />
                <Label htmlFor="support247">Hỗ trợ 24/7</Label>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Shop Location */}
          <AccordionItem value="location" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span className="font-semibold">Vị trí cửa hàng</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="text-sm text-muted-foreground mb-2">
                Đánh dấu vị trí cửa hàng trên bản đồ để tính khoảng cách đến khách hàng
              </div>
              
              {form.watch("shopLatitude") && form.watch("shopLongitude") && (
                <div className="flex items-center gap-2 text-sm p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-800">
                    Vị trí: {parseFloat(form.watch("shopLatitude") || "0").toFixed(6)}, {parseFloat(form.watch("shopLongitude") || "0").toFixed(6)}
                  </span>
                </div>
              )}

              <Suspense fallback={
                <div className="flex items-center justify-center h-[400px] border rounded-md">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Đang tải bản đồ...</p>
                  </div>
                </div>
              }>
                <AddressMapPicker
                  initialLatitude={form.watch("shopLatitude") ? parseFloat(form.watch("shopLatitude") || "0") : null}
                  initialLongitude={form.watch("shopLongitude") ? parseFloat(form.watch("shopLongitude") || "0") : null}
                  onLocationSelect={(address, latitude, longitude) => {
                    form.setValue("shopLatitude", latitude.toString());
                    form.setValue("shopLongitude", longitude.toString());
                    if (!form.watch("address")) {
                      form.setValue("address", address);
                    }
                  }}
                  height="400px"
                  isShopLocation={true}
                />
              </Suspense>
            </AccordionContent>
          </AccordionItem>

          {/* Footer Menus */}
          <AccordionItem value="footer" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <span className="font-semibold">Menu Footer</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Menu Sản phẩm</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {footerProducts.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={item.label}
                        onChange={(e) => {
                          const updated = [...footerProducts];
                          updated[idx].label = e.target.value;
                          setFooterProducts(updated);
                        }}
                        placeholder="Tên menu"
                      />
                      <Input
                        value={item.url}
                        onChange={(e) => {
                          const updated = [...footerProducts];
                          updated[idx].url = e.target.value;
                          setFooterProducts(updated);
                        }}
                        placeholder="URL"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setFooterProducts(footerProducts.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {footerProducts.length < 6 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFooterProducts([...footerProducts, { label: "", url: "" }])}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm link ({footerProducts.length}/6)
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Menu Hỗ trợ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {footerSupport.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={item.label}
                        onChange={(e) => {
                          const updated = [...footerSupport];
                          updated[idx].label = e.target.value;
                          setFooterSupport(updated);
                        }}
                        placeholder="Tên menu"
                      />
                      <Input
                        value={item.url}
                        onChange={(e) => {
                          const updated = [...footerSupport];
                          updated[idx].url = e.target.value;
                          setFooterSupport(updated);
                        }}
                        placeholder="URL"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setFooterSupport(footerSupport.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {footerSupport.length < 6 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFooterSupport([...footerSupport, { label: "", url: "" }])}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm link ({footerSupport.length}/6)
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Menu Kết nối</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {footerConnect.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={item.label}
                        onChange={(e) => {
                          const updated = [...footerConnect];
                          updated[idx].label = e.target.value;
                          setFooterConnect(updated);
                        }}
                        placeholder="Tên menu"
                      />
                      <Input
                        value={item.url}
                        onChange={(e) => {
                          const updated = [...footerConnect];
                          updated[idx].url = e.target.value;
                          setFooterConnect(updated);
                        }}
                        placeholder="URL"
                      />
                      <Input
                        value={item.icon || ""}
                        onChange={(e) => {
                          const updated = [...footerConnect];
                          updated[idx].icon = e.target.value;
                          setFooterConnect(updated);
                        }}
                        placeholder="Icon (optional)"
                        className="w-32"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setFooterConnect(footerConnect.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {footerConnect.length < 4 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFooterConnect([...footerConnect, { label: "", url: "" }])}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm link ({footerConnect.length}/4)
                    </Button>
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* App Links */}
          <AccordionItem value="apps" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                <span className="font-semibold">Link tải ứng dụng</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div>
                <Label htmlFor="appStoreUrl">App Store URL</Label>
                <Input
                  id="appStoreUrl"
                  {...form.register("appStoreUrl")}
                  placeholder="https://apps.apple.com/..."
                />
              </div>
              <div>
                <Label htmlFor="googlePlayUrl">Google Play URL</Label>
                <Input
                  id="googlePlayUrl"
                  {...form.register("googlePlayUrl")}
                  placeholder="https://play.google.com/..."
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Copyright & Legal */}
          <AccordionItem value="legal" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span className="font-semibold">Bản quyền & Pháp lý</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div>
                <Label htmlFor="copyrightMain">Văn bản bản quyền chính</Label>
                <Input
                  id="copyrightMain"
                  {...form.register("copyrightMain")}
                  placeholder="© 2024 NhangSach.Net - All rights reserved"
                />
              </div>
              <div>
                <Label htmlFor="copyrightSub">Văn bản bản quyền phụ</Label>
                <Input
                  id="copyrightSub"
                  {...form.register("copyrightSub")}
                  placeholder="Bản quyền thuộc về công ty..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="termsUrl">Điều khoản sử dụng URL</Label>
                  <Input
                    id="termsUrl"
                    {...form.register("termsUrl")}
                    placeholder="/terms"
                  />
                </div>
                <div>
                  <Label htmlFor="privacyUrl">Chính sách bảo mật URL</Label>
                  <Input
                    id="privacyUrl"
                    {...form.register("privacyUrl")}
                    placeholder="/privacy"
                  />
                </div>
                <div>
                  <Label htmlFor="sitemapUrl">Sitemap URL</Label>
                  <Input
                    id="sitemapUrl"
                    {...form.register("sitemapUrl")}
                    placeholder="/sitemap.xml"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Feature Boxes */}
          <AccordionItem value="features" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Grid3x3 className="h-5 w-5" />
                <span className="font-semibold">Hộp tính năng</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              {featureBoxes.map((box, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Hộp tính năng #{idx + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFeatureBoxes(featureBoxes.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        value={box.title}
                        onChange={(e) => {
                          const updated = [...featureBoxes];
                          updated[idx].title = e.target.value;
                          setFeatureBoxes(updated);
                        }}
                        placeholder="Tiêu đề"
                      />
                      <Input
                        value={box.icon}
                        onChange={(e) => {
                          const updated = [...featureBoxes];
                          updated[idx].icon = e.target.value;
                          setFeatureBoxes(updated);
                        }}
                        placeholder="Icon"
                      />
                    </div>
                    <Textarea
                      value={box.desc}
                      onChange={(e) => {
                        const updated = [...featureBoxes];
                        updated[idx].desc = e.target.value;
                        setFeatureBoxes(updated);
                      }}
                      placeholder="Mô tả"
                      rows={2}
                    />
                    <Input
                      value={box.link}
                      onChange={(e) => {
                        const updated = [...featureBoxes];
                        updated[idx].link = e.target.value;
                        setFeatureBoxes(updated);
                      }}
                      placeholder="Link"
                    />
                  </CardContent>
                </Card>
              ))}
              {featureBoxes.length < 4 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFeatureBoxes([...featureBoxes, { title: "", desc: "", icon: "", link: "" }])}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm hộp tính năng ({featureBoxes.length}/4)
                </Button>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Quick Links */}
          <AccordionItem value="quicklinks" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                <span className="font-semibold">Link nhanh</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-2">
              {quickLinks.map((link, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={link.label}
                    onChange={(e) => {
                      const updated = [...quickLinks];
                      updated[idx].label = e.target.value;
                      setQuickLinks(updated);
                    }}
                    placeholder="Tên link"
                  />
                  <Input
                    value={link.url}
                    onChange={(e) => {
                      const updated = [...quickLinks];
                      updated[idx].url = e.target.value;
                      setQuickLinks(updated);
                    }}
                    placeholder="URL"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuickLinks(quickLinks.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {quickLinks.length < 4 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickLinks([...quickLinks, { label: "", url: "" }])}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm link nhanh ({quickLinks.length}/4)
                </Button>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Hero Slider */}
          <AccordionItem value="hero" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                <span className="font-semibold">Hero Slider</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              {heroSlider.map((slide, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Slide #{idx + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setHeroSlider(heroSlider.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-sm text-gray-600 mb-1.5 block">Loại</Label>
                          <Select
                            value={slide.type}
                            onValueChange={(value: 'image' | 'video') => {
                              const updated = [...heroSlider];
                              updated[idx].type = value;
                              setHeroSlider(updated);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="image">Hình ảnh</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600 mb-1.5 block">Hiển thị trang</Label>
                          <Select
                            value={slide.targetPage || 'all'}
                            onValueChange={(value: 'home' | 'category' | 'product' | 'all') => {
                              const updated = [...heroSlider];
                              updated[idx].targetPage = value;
                              setHeroSlider(updated);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn trang" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tất cả</SelectItem>
                              <SelectItem value="home">Trang chủ</SelectItem>
                              <SelectItem value="category">Danh mục</SelectItem>
                              <SelectItem value="product">Sản phẩm</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600 mb-1.5 block">Alt text</Label>
                          <Input
                            value={slide.alt || ""}
                            onChange={(e) => {
                              const updated = [...heroSlider];
                              updated[idx].alt = e.target.value;
                              setHeroSlider(updated);
                            }}
                            placeholder="Mô tả hình ảnh"
                          />
                        </div>
                      </div>
                    </div>
                    <Input
                      value={slide.url}
                      onChange={(e) => {
                        const updated = [...heroSlider];
                        updated[idx].url = e.target.value;
                        setHeroSlider(updated);
                      }}
                      placeholder="URL hình ảnh/video"
                    />
                    {slide.type === 'video' && (
                      <Input
                        value={slide.thumbnail || ""}
                        onChange={(e) => {
                          const updated = [...heroSlider];
                          updated[idx].thumbnail = e.target.value;
                          setHeroSlider(updated);
                        }}
                        placeholder="Thumbnail URL (cho video)"
                      />
                    )}
                    <div className="space-y-3 pt-2 border-t">
                      <Label className="text-sm font-medium">Link & Call-to-Action</Label>
                      <Input
                        value={slide.link || ""}
                        onChange={(e) => {
                          const updated = [...heroSlider];
                          updated[idx].link = e.target.value;
                          setHeroSlider(updated);
                        }}
                        placeholder="Link URL (VD: /products hoặc https://...)"
                      />
                      <Input
                        value={slide.buttonText || ""}
                        onChange={(e) => {
                          const updated = [...heroSlider];
                          updated[idx].buttonText = e.target.value;
                          setHeroSlider(updated);
                        }}
                        placeholder="Button Text (mặc định: Shop Now)"
                      />
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={slide.showButton ?? true}
                          onCheckedChange={(checked) => {
                            const updated = [...heroSlider];
                            updated[idx].showButton = checked;
                            setHeroSlider(updated);
                          }}
                        />
                        <Label className="text-sm">Hiện nút Call-to-Action</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {heroSlider.length < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setHeroSlider([...heroSlider, { type: 'image', url: '', showButton: true, targetPage: 'all' }])}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm slide ({heroSlider.length}/3)
                </Button>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Featured Products */}
          <AccordionItem value="featured-products" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                <span className="font-semibold">Sản Phẩm Nổi Bật ({featuredProducts.length}/8)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="text-sm text-muted-foreground mb-3">
                Chọn tối đa 8 sản phẩm để hiển thị trong phần nổi bật
              </div>

              {/* Product Selection Dropdown */}
              <div>
                <Label className="text-sm mb-2 block">Chọn sản phẩm</Label>
                <Select
                  value=""
                  onValueChange={(productId) => {
                    if (featuredProducts.length < 8 && !featuredProducts.includes(productId)) {
                      setFeaturedProducts([...featuredProducts, productId]);
                    }
                  }}
                  disabled={featuredProducts.length >= 8}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={featuredProducts.length >= 8 ? "Đã đạt giới hạn 8 sản phẩm" : "Chọn sản phẩm để thêm..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.filter((p: any) => !featuredProducts.includes(p.id)).map((product: any) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Products Preview */}
              {featuredProducts.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Sản phẩm đã chọn</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {featuredProducts.map((productId) => {
                      const product = products.find((p: any) => p.id === productId);
                      if (!product) return null;
                      
                      return (
                        <Card key={productId} className="overflow-hidden">
                          <CardContent className="p-3">
                            <div className="flex gap-3">
                              {/* Product Image */}
                              <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                {product.imageUrl ? (
                                  <img 
                                    src={product.imageUrl} 
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <ImageIcon className="h-6 w-6" />
                                  </div>
                                )}
                              </div>
                              
                              {/* Product Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">{product.name}</h4>
                                <p className="text-sm text-primary font-semibold mt-1">
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                </p>
                              </div>
                              
                              {/* Remove Button */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 flex-shrink-0"
                                onClick={() => setFeaturedProducts(featuredProducts.filter(id => id !== productId))}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Custom Banners */}
          <AccordionItem value="custom-banners" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                <span className="font-semibold">Banner Tùy Chỉnh ({customBanners.length}/5)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="text-sm text-muted-foreground mb-3">
                Tạo tối đa 5 banner tùy chỉnh với vị trí và nội dung riêng
              </div>

              {/* Existing Banners */}
              {customBanners.map((banner, idx) => (
                <Card key={idx} className="overflow-hidden">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">Banner #{idx + 1}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          banner.position === 'top' ? 'bg-blue-100 text-blue-700' :
                          banner.position === 'middle' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {banner.position === 'top' ? 'Trên cùng' : banner.position === 'middle' ? 'Giữa' : 'Dưới cùng'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={banner.isActive}
                            onCheckedChange={(checked) => {
                              const updated = [...customBanners];
                              updated[idx].isActive = checked;
                              setCustomBanners(updated);
                            }}
                          />
                          <Label className="text-sm">
                            {banner.isActive ? 'Đang hiển thị' : 'Ẩn'}
                          </Label>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setCustomBanners(customBanners.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Banner Preview */}
                    {banner.imageUrl && (
                      <div className="relative w-full h-32 rounded-md overflow-hidden bg-gray-100">
                        <img 
                          src={banner.imageUrl} 
                          alt={banner.title || `Banner ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Banner Form Fields */}
                    <div className="space-y-3 pt-2">
                      <div>
                        <Label className="text-sm">Hình ảnh URL *</Label>
                        <Input
                          value={banner.imageUrl}
                          onChange={(e) => {
                            const updated = [...customBanners];
                            updated[idx].imageUrl = e.target.value;
                            setCustomBanners(updated);
                          }}
                          placeholder="https://example.com/banner.jpg"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm">Tiêu đề (tùy chọn)</Label>
                          <Input
                            value={banner.title || ""}
                            onChange={(e) => {
                              const updated = [...customBanners];
                              updated[idx].title = e.target.value;
                              setCustomBanners(updated);
                            }}
                            placeholder="Tiêu đề banner"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Link (tùy chọn)</Label>
                          <Input
                            value={banner.link || ""}
                            onChange={(e) => {
                              const updated = [...customBanners];
                              updated[idx].link = e.target.value;
                              setCustomBanners(updated);
                            }}
                            placeholder="https://..."
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm">Mô tả (tùy chọn)</Label>
                        <Textarea
                          value={banner.description || ""}
                          onChange={(e) => {
                            const updated = [...customBanners];
                            updated[idx].description = e.target.value;
                            setCustomBanners(updated);
                          }}
                          placeholder="Mô tả ngắn cho banner"
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Vị trí hiển thị</Label>
                        <Select
                          value={banner.position}
                          onValueChange={(value: 'top' | 'middle' | 'bottom') => {
                            const updated = [...customBanners];
                            updated[idx].position = value;
                            setCustomBanners(updated);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="top">Trên cùng</SelectItem>
                            <SelectItem value="middle">Giữa</SelectItem>
                            <SelectItem value="bottom">Dưới cùng</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add Banner Button */}
              {customBanners.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setCustomBanners([...customBanners, { 
                    imageUrl: '', 
                    position: 'top', 
                    isActive: true 
                  }])}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm Banner ({customBanners.length}/5)
                </Button>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </form>
    </div>
  );
}
