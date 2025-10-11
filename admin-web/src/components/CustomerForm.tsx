import { useState, lazy, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Camera as CameraIcon, Upload as UploadIcon, X } from "lucide-react";
import { z } from "zod";

// Lazy-load AddressMapPicker to avoid Leaflet bundling issues
const AddressMapPicker = lazy(() => import("./AddressMapPicker").then(module => ({ default: module.AddressMapPicker })));

// Local schema definition to avoid import issues from backend
const customerFormSchema = z.object({
  name: z.string().min(1, "Tên là bắt buộc"),
  email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
  phone: z.string().optional().refine((val) => {
    if (!val) return true;
    return /^(\+84|0)[3-9][0-9]{8}$/.test(val);
  }, "Số điện thoại không hợp lệ"),
  status: z.string().default("active"),
  avatar: z.string().optional(),
  customerRole: z.string().default("customer"),
  gender: z.string().optional(),
  address: z.string().min(1, "Địa chỉ chính là bắt buộc"),
  address2: z.string().optional(),
  creditLimit: z.string().optional().refine((val) => {
    if (!val) return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, "Hạn mức phải lớn hơn hoặc bằng 0"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  distanceFromShop: z.number().optional(),
  routeDistanceFromShop: z.number().optional().nullable(),
  district: z.string().optional()
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

// Local types to avoid backend import issues
type Customers = any;
type InsertCustomers = any;

interface CustomerFormProps {
  customer?: Customers;
  onSubmit: (data: InsertCustomers) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: "add" | "edit";
}

const getInitials = (name: string) => {
  return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
};

export function CustomerForm({
  customer,
  onSubmit,
  onCancel,
  isLoading = false,
  mode
}: CustomerFormProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(customer?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: customer?.name || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      status: customer?.status || "active",
      avatar: customer?.avatar || undefined,
      customerRole: customer?.customerRole || "customer",
      gender: customer?.socialData?.gender || "",
      address: customer?.address || "",
      address2: customer?.address2 || "",
      creditLimit: customer?.creditLimit ? customer.creditLimit.toString() : "0",
      latitude: customer?.latitude ? parseFloat(customer.latitude) : undefined,
      longitude: customer?.longitude ? parseFloat(customer.longitude) : undefined,
      distanceFromShop: customer?.distanceFromShop ? parseFloat(customer.distanceFromShop) : undefined,
      routeDistanceFromShop: customer?.routeDistanceFromShop ? parseFloat(customer.routeDistanceFromShop) : undefined,
      district: customer?.district || "",
    },
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        form.setError("avatar", { message: "Ảnh phải nhỏ hơn 2MB" });
        return;
      }
      
      if (!file.type.startsWith("image/")) {
        form.setError("avatar", { message: "Vui lòng chọn file ảnh" });
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        form.setValue("avatar", result);
        form.clearErrors("avatar");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    form.setValue("avatar", undefined);
  };

  const handleFormSubmit = async (data: CustomerFormData) => {
    try {
      const submitData: InsertCustomers = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || "",
        status: data.status,
        avatar: avatarPreview || undefined,
        customerRole: (data.customerRole || "customer") as "customer" | "vip" | "affiliate" | "driver" | "corporate",
        address: data.address.trim(),
        address2: data.address2?.trim() || undefined,
        creditLimit: data.creditLimit ? data.creditLimit : "0",
        // Only include lat/long if they have valid values (not undefined)
        ...(data.latitude !== undefined && { latitude: data.latitude.toString() }),
        ...(data.longitude !== undefined && { longitude: data.longitude.toString() }),
        ...(data.distanceFromShop !== undefined && { distanceFromShop: data.distanceFromShop.toString() }),
        ...(data.routeDistanceFromShop !== undefined && data.routeDistanceFromShop !== null && { routeDistanceFromShop: data.routeDistanceFromShop.toString() }),
        district: data.district?.trim() || undefined,
        socialData: {
          ...(customer?.socialData || {}),
          gender: data.gender || undefined,
        },
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="space-y-6" data-testid="customer-form">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {mode === "add" ? "Thêm khách hàng mới" : "Chỉnh sửa khách hàng"}
        </h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview || ""} />
                <AvatarFallback className="text-lg">
                  {form.watch("name") ? getInitials(form.watch("name")) : "KH"}
                </AvatarFallback>
              </Avatar>
              {avatarPreview && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={handleRemoveAvatar}
                  data-testid="button-remove-avatar"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("avatar-input")?.click()}
                data-testid="button-upload-avatar"
              >
                <UploadIcon className="h-4 w-4 mr-2" />
                {avatarPreview ? "Thay đổi ảnh" : "Tải ảnh lên"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  // Mock taking photo - in real app would open camera
                  const mockImageUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${form.watch("name")}`;
                  setAvatarPreview(mockImageUrl);
                  form.setValue("avatar", mockImageUrl);
                }}
                data-testid="button-take-photo"
              >
                <CameraIcon className="h-4 w-4 mr-2" />
                Chụp ảnh
              </Button>
            </div>
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            {form.formState.errors.avatar && (
              <p className="text-sm text-destructive">{form.formState.errors.avatar.message}</p>
            )}
          </div>

          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên khách hàng <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input
                    id="customer-name"
                    placeholder="Nhập tên đầy đủ"
                    data-testid="input-customer-name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input
                    id="customer-email"
                    type="email"
                    placeholder="example@email.com"
                    data-testid="input-customer-email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone Field */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input
                    id="customer-phone"
                    placeholder="0901234567"
                    data-testid="input-customer-phone"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gender Field */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giới tính</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger data-testid="select-customer-gender">
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address 1 Field */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Địa chỉ chính <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input
                    id="customer-address"
                    placeholder="Nhập địa chỉ"
                    data-testid="input-customer-address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address 2 Field */}
          <FormField
            control={form.control}
            name="address2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Địa chỉ phụ (tùy chọn)</FormLabel>
                <FormControl>
                  <Input
                    id="customer-address2"
                    placeholder="Nhập địa chỉ phụ"
                    data-testid="input-customer-address2"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Map Picker for Location */}
          <div className="pt-2">
            <Suspense fallback={
              <div className="flex items-center justify-center h-[350px] border rounded-md">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Đang tải bản đồ...</p>
                </div>
              </div>
            }>
              <AddressMapPicker
                initialLatitude={form.watch("latitude") || null}
                initialLongitude={form.watch("longitude") || null}
                onLocationSelect={(address, latitude, longitude, distanceFromShop, district, routeDistanceFromShop) => {
                  form.setValue("address", address);
                  form.setValue("latitude", latitude);
                  form.setValue("longitude", longitude);
                  form.setValue("distanceFromShop", distanceFromShop);
                  form.setValue("district", district);
                  form.setValue("routeDistanceFromShop", routeDistanceFromShop);
                }}
                height="350px"
              />
            </Suspense>
          </div>

          {/* Credit Limit Field */}
          <FormField
            control={form.control}
            name="creditLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hạn mức tín dụng (VND)</FormLabel>
                <FormControl>
                  <Input
                    id="customer-credit-limit"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="0"
                    data-testid="input-customer-credit-limit"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Customer Role Field */}
          <FormField
            control={form.control}
            name="customerRole"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vai trò</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-customer-role">
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="customer">Khách hàng</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="affiliate">Đại lý</SelectItem>
                    <SelectItem value="driver">Tài xế</SelectItem>
                    <SelectItem value="corporate">Doanh nghiệp</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status Field */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trạng thái</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-customer-status">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Form Actions */}
          <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              data-testid="button-cancel"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              data-testid="button-submit"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  {mode === "add" ? "Đang thêm..." : "Đang cập nhật..."}
                </>
              ) : (
                mode === "add" ? "Thêm khách hàng" : "Cập nhật"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}