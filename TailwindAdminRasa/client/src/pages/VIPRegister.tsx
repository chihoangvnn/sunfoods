import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Crown,
  Loader2,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Phone,
  MapPin,
  User,
} from "lucide-react";

interface TokenVerificationData {
  success: boolean;
  tier: string;
  expiresAt: string;
  remainingUses: number | null;
  error?: string;
}

export default function VIPRegister() {
  const [, params] = useRoute("/vip-register/:token");
  const { toast } = useToast();
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenData, setTokenData] = useState<TokenVerificationData | null>(null);
  const [tokenError, setTokenError] = useState<string>("");
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!params?.token) {
        setTokenError("Token không hợp lệ");
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch(`/api/vip-registration/verify/${params.token}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          setTokenError(data.error || "Token không hợp lệ hoặc đã hết hạn");
          setIsVerifying(false);
          return;
        }

        setTokenData(data);
        setIsVerifying(false);
      } catch (error) {
        console.error("Token verification error:", error);
        setTokenError("Không thể xác thực token. Vui lòng thử lại.");
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [params?.token]);

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (formData: { token: string; name: string; phone: string; address: string }) => {
      const response = await fetch("/api/vip-registration/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Đăng ký thất bại");
      }

      return data;
    },
    onSuccess: () => {
      setRegistrationSuccess(true);
      toast({
        title: "Đăng ký thành công!",
        description: "Đăng ký VIP thành công! Vui lòng đợi admin duyệt.",
        duration: 5000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Đăng ký thất bại",
        description: error.message || "Vui lòng thử lại sau",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập đầy đủ tên và số điện thoại",
        variant: "destructive",
      });
      return;
    }

    if (!params?.token) {
      return;
    }

    registerMutation.mutate({
      token: params.token,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });
  };

  // Tier display helper
  const getTierBadgeVariant = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "diamond":
        return "default";
      case "platinum":
        return "secondary";
      case "gold":
        return "outline";
      case "silver":
        return "outline";
      default:
        return "outline";
    }
  };

  const getTierLabel = (tier: string) => {
    const labels: Record<string, string> = {
      diamond: "Kim Cương",
      platinum: "Bạch Kim",
      gold: "Vàng",
      silver: "Bạc",
    };
    return labels[tier.toLowerCase()] || tier;
  };

  // Loading state
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600 mb-4" />
          <p className="text-gray-600">Đang xác thực token...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (tokenError || !tokenData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4 mx-auto">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Token không hợp lệ</CardTitle>
            <CardDescription>
              {tokenError || "Token không tồn tại hoặc đã hết hạn"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vui lòng liên hệ quản trị viên để nhận token đăng ký VIP mới.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Đăng ký thành công!</CardTitle>
            <CardDescription>
              Đăng ký VIP thành công! Vui lòng đợi admin duyệt.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Thông tin đăng ký của bạn đã được ghi nhận. Quản trị viên sẽ xem xét và duyệt trong thời gian sớm nhất.
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Thông tin đăng ký</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Tên:</strong> {name}</p>
                <p><strong>Số điện thoại:</strong> {phone}</p>
                {address && <p><strong>Địa chỉ:</strong> {address}</p>}
                <p>
                  <strong>Hạng thành viên:</strong>{" "}
                  <Badge variant={getTierBadgeVariant(tokenData.tier)}>
                    {getTierLabel(tokenData.tier)}
                  </Badge>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Registration form
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-50/10 opacity-30"></div>
      
      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đăng ký VIP
          </h1>
          <p className="text-gray-600">
            Trở thành thành viên VIP với ưu đãi đặc biệt
          </p>
        </div>

        {/* Registration Card */}
        <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
              <UserPlus className="h-5 w-5 text-purple-600" />
              Thông tin đăng ký
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Token Info */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-900">Hạng thành viên:</span>
                <Badge variant={getTierBadgeVariant(tokenData.tier)} className="text-sm">
                  <Crown className="h-3 w-3 mr-1" />
                  {getTierLabel(tokenData.tier)}
                </Badge>
              </div>
              {tokenData.remainingUses !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-700">Số lượt còn lại:</span>
                  <span className="text-sm font-medium text-purple-900">{tokenData.remainingUses}</span>
                </div>
              )}
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ và tên"
                  required
                  className="w-full"
                />
              </div>

              {/* Phone Input */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Số điện thoại <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  required
                  className="w-full"
                />
              </div>

              {/* Address Input */}
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Địa chỉ
                </Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nhập địa chỉ (không bắt buộc)"
                  rows={3}
                  className="w-full resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2.5"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng ký...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Đăng ký VIP
                  </>
                )}
              </Button>
            </form>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center">
              Bằng việc đăng ký, bạn đồng ý với điều khoản và chính sách của chương trình VIP
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
