import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, isAuthenticated } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      
      toast({
        title: "Đăng nhập thành công!",
        description: "Chào mừng bạn quay trở lại",
      });
      
      // Redirect to dashboard
      setLocation("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Đăng nhập thất bại",
        description: error instanceof Error ? error.message : "Email hoặc mật khẩu không đúng",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5E6D3] via-[#E8DCC8] to-[#D4C4A8] p-4">
      <Card className="w-full max-w-md shadow-2xl border-[#D4C4A8]">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A0826D] to-[#8B6F47] flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-[#4A4A4A]">
            Admin Dashboard
          </CardTitle>
          <CardDescription className="text-[#6B6B6B]">
            Đăng nhập để quản lý hệ thống
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#4A4A4A] font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0826D] w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="pl-10 border-[#D4C4A8] focus:border-[#A0826D] focus:ring-[#A0826D]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#4A4A4A] font-medium">
                Mật khẩu
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0826D] w-5 h-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 border-[#D4C4A8] focus:border-[#A0826D] focus:ring-[#A0826D]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A0826D] hover:text-[#8B6F47]"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#A0826D] to-[#8B6F47] hover:from-[#8B6F47] hover:to-[#7A5E3A] text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang đăng nhập...
                </span>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#6B6B6B]">
              🔐 Hệ thống bảo mật cao - Chỉ dành cho quản trị viên
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
