'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Package as PackageIcon, CheckCircle2 } from "lucide-react";
import { SendPackageForm } from "@/ride-sharing/components/SendPackageForm";
import { Button } from "@/components/ui/button";

export default function SendPackage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      const payload = {
        type: 'package',
        pickupLocation: data.senderAddress,
        dropoffLocation: data.receiverAddress,
        estimatedDistance: null,
        senderName: data.senderName,
        senderPhone: data.senderPhone,
        weight: data.weight || null,
        suggestedPrice: data.value || null,
        pickupTime: data.deliveryInstructions || null,
        deliveryNote: data.specialNotes || data.description || null,
        customerNotes: JSON.stringify({
          receiverName: data.receiverName,
          receiverPhone: data.receiverPhone,
          receiverAddress: data.receiverAddress,
          images: data.images,
          packageType: data.packageType,
          dimensions: data.dimensionLength && data.dimensionWidth && data.dimensionHeight ? {
            length: data.dimensionLength,
            width: data.dimensionWidth,
            height: data.dimensionHeight
          } : null,
          paymentMethod: data.paymentMethod,
          codAmount: data.codAmount
        })
      };

      const response = await fetch('/api/ride-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create package request');
      }

      const result = await response.json();
      console.log('Package request created:', result);

      setIsSubmitting(false);
      setShowSuccess(true);

      setTimeout(() => {
        router.push("/datxe/packages");
      }, 2000);
    } catch (error) {
      console.error('Error submitting package:', error);
      setIsSubmitting(false);
      alert(error instanceof Error ? error.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  if (showSuccess) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card className="p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-green-800">Gửi hàng thành công!</h2>
          <p className="text-gray-600">
            Đơn hàng của bạn đã được tạo. Tài xế sẽ xem và báo giá sớm nhất.
          </p>
          <p className="text-sm text-gray-500">
            Đang chuyển đến trang đơn hàng của bạn...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-4 space-y-6">
      <div className="flex items-center gap-2">
        <PackageIcon className="h-6 w-6 text-orange-600" />
        <div>
          <h1 className="text-xl font-bold">Gửi Hàng Mới</h1>
          <p className="text-muted-foreground">Điền thông tin để gửi hàng qua tài xế</p>
        </div>
      </div>

      <Card className="p-6">
        <SendPackageForm 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </Card>
    </div>
  );
}
