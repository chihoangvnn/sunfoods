'use client'

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadPreview } from "./ImageUploadPreview";
import { CollapsibleSection } from "./CollapsibleSection";
import { Package as PackageIcon, DollarSign, AlertCircle, Box, Ruler, User, ArrowLeftRight, Copy } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PackageFormData {
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  images: string[];
  
  weight?: number;
  dimensionLength?: number;
  dimensionWidth?: number;
  dimensionHeight?: number;
  value?: number;
  packageType?: "electronics" | "food" | "fragile" | "documents" | "clothing" | "other";
  description?: string;
  
  paymentMethod?: "cash" | "cod" | "bank_transfer";
  codAmount?: number;
  
  specialNotes?: string;
  deliveryInstructions?: string;
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

  const [errors, setErrors] = useState<Partial<Record<keyof PackageFormData | "paymentMethod" | "codAmount", string>>>({});

  const [isPackageInfoOpen, setIsPackageInfoOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\s/g, '');
    if (/^0\d{9}$/.test(cleaned)) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    return phone;
  };

  const handleInputChange = (field: keyof PackageFormData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePhoneBlur = (field: 'senderPhone' | 'receiverPhone') => {
    const phone = formData[field];
    if (phone) {
      setFormData(prev => ({ ...prev, [field]: formatPhoneNumber(phone) }));
    }
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({ ...prev, images }));
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: undefined }));
    }
  };

  const handleQuickFillMyInfo = () => {
    const savedInfo = localStorage.getItem('senderInfo');
    if (savedInfo) {
      const info = JSON.parse(savedInfo);
      setFormData(prev => ({
        ...prev,
        senderName: info.name || "",
        senderPhone: info.phone || "",
        senderAddress: info.address || ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        senderName: "Nguyễn Văn A",
        senderPhone: "090 123 4567",
        senderAddress: "123 Lê Lợi, Tiên Phước"
      }));
      localStorage.setItem('senderInfo', JSON.stringify({
        name: "Nguyễn Văn A",
        phone: "090 123 4567",
        address: "123 Lê Lợi, Tiên Phước"
      }));
    }
  };

  const handleCopyFromSender = () => {
    setFormData(prev => ({
      ...prev,
      receiverName: prev.senderName,
      receiverPhone: prev.senderPhone,
      receiverAddress: prev.senderAddress
    }));
  };

  const handleSwapSenderReceiver = () => {
    setFormData(prev => ({
      ...prev,
      senderName: prev.receiverName,
      senderPhone: prev.receiverPhone,
      senderAddress: prev.receiverAddress,
      receiverName: prev.senderName,
      receiverPhone: prev.senderPhone,
      receiverAddress: prev.senderAddress
    }));
  };

  const estimatedFees = useMemo(() => {
    const baseDeliveryFee = 35000;
    const weightSurcharge = (formData.weight && formData.weight > 5) ? (formData.weight - 5) * 5000 : 0;
    const valueSurcharge = (formData.value && formData.value > 1000000) ? 10000 : 0;
    
    const deliveryFee = baseDeliveryFee + weightSurcharge + valueSurcharge;
    const serviceFee = 5000;
    
    return {
      deliveryFee,
      serviceFee,
      total: deliveryFee + serviceFee
    };
  }, [formData.weight, formData.value]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PackageFormData | "paymentMethod" | "codAmount", string>> = {};

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

    if (formData.paymentMethod === "cod") {
      if (!formData.codAmount || formData.codAmount <= 0) {
        newErrors.codAmount = "Vui lòng nhập số tiền thu hộ";
      }
    }

    if (formData.weight && formData.weight <= 0) {
      newErrors.weight = "Trọng lượng phải lớn hơn 0";
    }

    if (formData.value && formData.value < 0) {
      newErrors.value = "Giá trị hàng hóa không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const submissionData = {
        ...formData,
        senderPhone: formData.senderPhone.replace(/\s/g, ''),
        receiverPhone: formData.receiverPhone.replace(/\s/g, '')
      };
      onSubmit(submissionData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <PackageIcon className="h-5 w-5 text-orange-600" />
          <h3 className="font-semibold text-lg">Hình ảnh hàng hóa</h3>
          <span className="text-xs text-red-500 ml-auto">*</span>
        </div>
        <ImageUploadPreview 
          images={formData.images}
          onImagesChange={handleImagesChange}
          maxFiles={5}
          maxSizeInMB={5}
        />
        {errors.images && <p className="text-sm text-red-600">{errors.images}</p>}
      </div>

      <CollapsibleSection
        title="Thông tin hàng hóa"
        icon={<Box className="h-5 w-5 text-blue-600" />}
        isOpen={isPackageInfoOpen}
        onToggle={() => setIsPackageInfoOpen(!isPackageInfoOpen)}
        badge="(Tùy chọn)"
      >
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="weight">Trọng lượng (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                value={formData.weight || ""}
                onChange={(e) => handleInputChange("weight", e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="VD: 2.5"
                className={errors.weight ? "border-red-500" : ""}
              />
              {errors.weight && <p className="text-sm text-red-600 mt-1">{errors.weight}</p>}
            </div>

            <div>
              <Label htmlFor="value">Giá trị (VND)</Label>
              <Input
                id="value"
                type="number"
                min="0"
                value={formData.value || ""}
                onChange={(e) => handleInputChange("value", e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="VD: 500000"
                className={errors.value ? "border-red-500" : ""}
              />
              {errors.value && <p className="text-sm text-red-600 mt-1">{errors.value}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="dimensions" className="flex items-center gap-1">
              <Ruler className="h-4 w-4" />
              Kích thước (cm)
            </Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <Input
                type="number"
                step="0.1"
                min="0"
                value={formData.dimensionLength || ""}
                onChange={(e) => handleInputChange("dimensionLength", e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Dài"
              />
              <Input
                type="number"
                step="0.1"
                min="0"
                value={formData.dimensionWidth || ""}
                onChange={(e) => handleInputChange("dimensionWidth", e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Rộng"
              />
              <Input
                type="number"
                step="0.1"
                min="0"
                value={formData.dimensionHeight || ""}
                onChange={(e) => handleInputChange("dimensionHeight", e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Cao"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="packageType">Loại hàng hóa</Label>
            <Select
              value={formData.packageType}
              onValueChange={(value) => handleInputChange("packageType", value as PackageFormData["packageType"])}
            >
              <SelectTrigger id="packageType">
                <SelectValue placeholder="Chọn loại hàng hóa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electronics">Điện tử</SelectItem>
                <SelectItem value="food">Thực phẩm</SelectItem>
                <SelectItem value="fragile">Hàng dễ vỡ</SelectItem>
                <SelectItem value="documents">Giấy tờ</SelectItem>
                <SelectItem value="clothing">Quần áo</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Mô tả hàng hóa</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="VD: Laptop Dell cũ, còn nguyên hộp"
              rows={2}
            />
          </div>
        </div>
      </CollapsibleSection>

      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <div className="h-5 w-5 flex items-center justify-center bg-green-100 rounded text-green-700 text-xs font-bold">
            G
          </div>
          <h3 className="font-semibold text-lg">Thông tin người gửi</h3>
          <span className="text-xs text-red-500 ml-auto">*</span>
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleQuickFillMyInfo}
          className="w-full flex items-center gap-2"
        >
          <User className="h-4 w-4" />
          📋 Dùng thông tin của tôi
        </Button>

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
              onBlur={() => handlePhoneBlur('senderPhone')}
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
          <span className="text-xs text-red-500 ml-auto">*</span>
        </div>
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyFromSender}
            className="flex-1 flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            📋 Sao chép từ người gửi
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSwapSenderReceiver}
            className="flex-1 flex items-center gap-2"
          >
            <ArrowLeftRight className="h-4 w-4" />
            🔄 Đổi chỗ
          </Button>
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
              onBlur={() => handlePhoneBlur('receiverPhone')}
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

      <CollapsibleSection
        title="Thanh toán"
        icon={<DollarSign className="h-5 w-5 text-green-600" />}
        isOpen={isPaymentOpen}
        onToggle={() => setIsPaymentOpen(!isPaymentOpen)}
        badge="(Tùy chọn)"
      >
        <div className="grid gap-4">
          <div>
            <Label>Phương thức thanh toán</Label>
            <div className="grid gap-3 mt-2">
              <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${formData.paymentMethod === "cash" ? "border-orange-600 bg-orange-50" : "hover:bg-gray-50"}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === "cash"}
                  onChange={(e) => {
                    handleInputChange("paymentMethod", e.target.value as PackageFormData["paymentMethod"]);
                    if (errors.paymentMethod) {
                      setErrors(prev => ({ ...prev, paymentMethod: undefined }));
                    }
                  }}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                />
                <div className="flex-1">
                  <div className="font-medium">Tiền mặt</div>
                  <div className="text-sm text-gray-500">Người gửi thanh toán trực tiếp</div>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${formData.paymentMethod === "cod" ? "border-orange-600 bg-orange-50" : "hover:bg-gray-50"}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === "cod"}
                  onChange={(e) => {
                    handleInputChange("paymentMethod", e.target.value as PackageFormData["paymentMethod"]);
                    if (errors.paymentMethod) {
                      setErrors(prev => ({ ...prev, paymentMethod: undefined }));
                    }
                  }}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                />
                <div className="flex-1">
                  <div className="font-medium">Thu hộ (COD)</div>
                  <div className="text-sm text-gray-500">Tài xế thu tiền hộ từ người nhận</div>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${formData.paymentMethod === "bank_transfer" ? "border-orange-600 bg-orange-50" : "hover:bg-gray-50"}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={formData.paymentMethod === "bank_transfer"}
                  onChange={(e) => {
                    handleInputChange("paymentMethod", e.target.value as PackageFormData["paymentMethod"]);
                    if (errors.paymentMethod) {
                      setErrors(prev => ({ ...prev, paymentMethod: undefined }));
                    }
                  }}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                />
                <div className="flex-1">
                  <div className="font-medium">Chuyển khoản</div>
                  <div className="text-sm text-gray-500">Thanh toán qua ngân hàng</div>
                </div>
              </label>
            </div>
            {errors.paymentMethod && <p className="text-sm text-red-600 mt-1">{errors.paymentMethod}</p>}
          </div>

          {formData.paymentMethod === "cod" && (
            <div>
              <Label htmlFor="codAmount">Số tiền thu hộ (VND)</Label>
              <Input
                id="codAmount"
                type="number"
                min="0"
                value={formData.codAmount || ""}
                onChange={(e) => {
                  handleInputChange("codAmount", e.target.value ? parseInt(e.target.value) : undefined);
                  if (errors.codAmount) {
                    setErrors(prev => ({ ...prev, codAmount: undefined }));
                  }
                }}
                placeholder="VD: 500000"
                className={errors.codAmount ? "border-red-500" : ""}
              />
              {errors.codAmount && <p className="text-sm text-red-600 mt-1">{errors.codAmount}</p>}
            </div>
          )}

          {formData.paymentMethod && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2 text-blue-900">Phí dự kiến</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-medium">{estimatedFees.deliveryFee.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí dịch vụ:</span>
                  <span className="font-medium">{estimatedFees.serviceFee.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-300">
                  <span className="font-semibold text-blue-900">Tổng cộng:</span>
                  <span className="font-bold text-orange-600">{estimatedFees.total.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">* Phí cuối cùng sẽ được tài xế xác nhận</p>
            </div>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Ghi chú đặc biệt"
        icon={<AlertCircle className="h-5 w-5 text-amber-600" />}
        isOpen={isNotesOpen}
        onToggle={() => setIsNotesOpen(!isNotesOpen)}
        badge="(Tùy chọn)"
      >
        <div className="grid gap-4">
          <div>
            <Label htmlFor="specialNotes">Lưu ý về hàng hóa</Label>
            <Textarea
              id="specialNotes"
              value={formData.specialNotes || ""}
              onChange={(e) => handleInputChange("specialNotes", e.target.value)}
              placeholder="VD: Hàng dễ vỡ, cần bảo quản lạnh, không được lật ngược"
              rows={2}
            />
            <p className="text-xs text-gray-500 mt-1">Thông tin về cách xử lý hàng hóa</p>
          </div>

          <div>
            <Label htmlFor="deliveryInstructions">Hướng dẫn giao hàng</Label>
            <Textarea
              id="deliveryInstructions"
              value={formData.deliveryInstructions || ""}
              onChange={(e) => handleInputChange("deliveryInstructions", e.target.value)}
              placeholder="VD: Gọi trước 15 phút, giao tầng 3, không giao giờ trưa"
              rows={2}
            />
            <p className="text-xs text-gray-500 mt-1">Yêu cầu khi giao hàng đến người nhận</p>
          </div>
        </div>
      </CollapsibleSection>

      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-6"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang gửi..." : "Gửi hàng"}
        </Button>
      </div>
    </form>
  );
}
