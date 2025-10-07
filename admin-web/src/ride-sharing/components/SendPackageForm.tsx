import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadPreview } from "./ImageUploadPreview";
import { Package as PackageIcon } from "lucide-react";

interface PackageFormData {
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  images: string[];
}

interface SendPackageFormProps {
  onSubmit: (data: PackageFormData) => void;
  isSubmitting?: boolean;
}

export function SendPackageForm({ onSubmit, isSubmitting = false }: SendPackageFormProps) {
  const [formData, setFormData] = useState<PackageFormData>({
    senderName: "",
    senderPhone: "",
    senderAddress: "",
    receiverName: "",
    receiverPhone: "",
    receiverAddress: "",
    images: []
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PackageFormData, string>>>({});

  const handleInputChange = (field: keyof PackageFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({ ...prev, images }));
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PackageFormData, string>> = {};

    if (!formData.senderName.trim()) newErrors.senderName = "Vui lòng nhập tên người gửi";
    if (!formData.senderPhone.trim()) newErrors.senderPhone = "Vui lòng nhập SĐT người gửi";
    if (!formData.senderAddress.trim()) newErrors.senderAddress = "Vui lòng nhập địa chỉ lấy hàng";
    if (!formData.receiverName.trim()) newErrors.receiverName = "Vui lòng nhập tên người nhận";
    if (!formData.receiverPhone.trim()) newErrors.receiverPhone = "Vui lòng nhập SĐT người nhận";
    if (!formData.receiverAddress.trim()) newErrors.receiverAddress = "Vui lòng nhập địa chỉ giao hàng";
    if (formData.images.length === 0) newErrors.images = "Vui lòng tải lên ít nhất 1 ảnh";

    if (formData.senderPhone && !/^0\d{9}$/.test(formData.senderPhone.replace(/\s/g, ''))) {
      newErrors.senderPhone = "SĐT không hợp lệ (VD: 0901234567)";
    }
    if (formData.receiverPhone && !/^0\d{9}$/.test(formData.receiverPhone.replace(/\s/g, ''))) {
      newErrors.receiverPhone = "SĐT không hợp lệ (VD: 0901234567)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <PackageIcon className="h-5 w-5 text-orange-600" />
          <h3 className="font-semibold text-lg">Hình ảnh hàng hóa</h3>
        </div>
        <ImageUploadPreview 
          images={formData.images}
          onImagesChange={handleImagesChange}
          maxFiles={5}
          maxSizeInMB={5}
        />
        {errors.images && <p className="text-sm text-red-600">{errors.images}</p>}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <div className="h-5 w-5 flex items-center justify-center bg-green-100 rounded text-green-700 text-xs font-bold">
            G
          </div>
          <h3 className="font-semibold text-lg">Thông tin người gửi</h3>
        </div>
        
        <div className="grid gap-4">
          <div>
            <Label htmlFor="senderName">Họ và tên <span className="text-red-500">*</span></Label>
            <Input
              id="senderName"
              value={formData.senderName}
              onChange={(e) => handleInputChange("senderName", e.target.value)}
              placeholder="VD: Nguyễn Văn An"
              className={errors.senderName ? "border-red-500" : ""}
            />
            {errors.senderName && <p className="text-sm text-red-600 mt-1">{errors.senderName}</p>}
          </div>

          <div>
            <Label htmlFor="senderPhone">Số điện thoại <span className="text-red-500">*</span></Label>
            <Input
              id="senderPhone"
              type="tel"
              value={formData.senderPhone}
              onChange={(e) => handleInputChange("senderPhone", e.target.value)}
              placeholder="VD: 0901234567"
              className={errors.senderPhone ? "border-red-500" : ""}
            />
            {errors.senderPhone && <p className="text-sm text-red-600 mt-1">{errors.senderPhone}</p>}
          </div>

          <div>
            <Label htmlFor="senderAddress">Địa chỉ lấy hàng <span className="text-red-500">*</span></Label>
            <Textarea
              id="senderAddress"
              value={formData.senderAddress}
              onChange={(e) => handleInputChange("senderAddress", e.target.value)}
              placeholder="VD: 123 Lê Lợi, Tiên Phước"
              rows={2}
              className={errors.senderAddress ? "border-red-500" : ""}
            />
            {errors.senderAddress && <p className="text-sm text-red-600 mt-1">{errors.senderAddress}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <div className="h-5 w-5 flex items-center justify-center bg-red-100 rounded text-red-700 text-xs font-bold">
            N
          </div>
          <h3 className="font-semibold text-lg">Thông tin người nhận</h3>
        </div>
        
        <div className="grid gap-4">
          <div>
            <Label htmlFor="receiverName">Họ và tên <span className="text-red-500">*</span></Label>
            <Input
              id="receiverName"
              value={formData.receiverName}
              onChange={(e) => handleInputChange("receiverName", e.target.value)}
              placeholder="VD: Trần Thị Bình"
              className={errors.receiverName ? "border-red-500" : ""}
            />
            {errors.receiverName && <p className="text-sm text-red-600 mt-1">{errors.receiverName}</p>}
          </div>

          <div>
            <Label htmlFor="receiverPhone">Số điện thoại <span className="text-red-500">*</span></Label>
            <Input
              id="receiverPhone"
              type="tel"
              value={formData.receiverPhone}
              onChange={(e) => handleInputChange("receiverPhone", e.target.value)}
              placeholder="VD: 0907654321"
              className={errors.receiverPhone ? "border-red-500" : ""}
            />
            {errors.receiverPhone && <p className="text-sm text-red-600 mt-1">{errors.receiverPhone}</p>}
          </div>

          <div>
            <Label htmlFor="receiverAddress">Địa chỉ giao hàng <span className="text-red-500">*</span></Label>
            <Textarea
              id="receiverAddress"
              value={formData.receiverAddress}
              onChange={(e) => handleInputChange("receiverAddress", e.target.value)}
              placeholder="VD: 456 Trần Phú, Đà Nẵng"
              rows={2}
              className={errors.receiverAddress ? "border-red-500" : ""}
            />
            {errors.receiverAddress && <p className="text-sm text-red-600 mt-1">{errors.receiverAddress}</p>}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          className="flex-1 bg-orange-600 hover:bg-orange-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang gửi..." : "Gửi hàng"}
        </Button>
      </div>
    </form>
  );
}
