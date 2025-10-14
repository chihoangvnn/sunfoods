"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, ShoppingCart } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function POSLogin() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/me`, {
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.role === "cashier") {
            router.push("/pos");
          } else if (["admin", "staff", "superadmin"].includes(userData.role)) {
            router.push("/admin");
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Email hoặc mật khẩu không đúng");
      }

      const meResponse = await fetch(`${API_URL}/admin/me`, {
        credentials: "include",
      });

      if (meResponse.ok) {
        const userData = await meResponse.json();
        
        if (userData.role === "cashier") {
          toast({
            title: "Đăng nhập thành công!",
            description: "Chào mừng đến với hệ thống POS",
          });
          router.push("/pos");
        } else if (["admin", "staff", "superadmin"].includes(userData.role)) {
          toast({
            title: "Đăng nhập thành công!",
            description: "Chuyển hướng đến trang quản trị...",
          });
          router.push("/admin");
        } else {
          throw new Error("Tài khoản không có quyền truy cập hệ thống POS");
        }
      }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5E6D3] via-[#E8DCC8] to-[#D4C4A8] p-6">
      <Card className="w-full max-w-lg shadow-2xl border-[#D4C4A8]">
        <CardHeader className="space-y-3 text-center p-6 md:p-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A0826D] to-[#8B6F47] flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-[#4A4A4A]">
            Hệ thống POS
          </CardTitle>
          <CardDescription className="text-[#6B6B6B] text-base">
            Đăng nhập để bắt đầu bán hàng
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#4A4A4A] font-medium text-base">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0826D] w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cashier@example.com"
                  className="pl-10 border-[#D4C4A8] focus:border-[#A0826D] focus:ring-[#A0826D] text-base min-h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#4A4A4A] font-medium text-base">
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
                  className="pl-10 pr-10 border-[#D4C4A8] focus:border-[#A0826D] focus:ring-[#A0826D] text-base min-h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A0826D] hover:text-[#8B6F47] min-w-12 min-h-12 flex items-center justify-center"
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
              className="w-full bg-gradient-to-r from-[#A0826D] to-[#8B6F47] hover:from-[#8B6F47] hover:to-[#7A5E3A] text-white font-semibold rounded-lg transition-all duration-200 shadow-lg min-h-12 text-base"
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
            <p className="text-base text-[#6B6B6B]">
              🛒 Dành cho thu ngân và nhân viên bán hàng
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
