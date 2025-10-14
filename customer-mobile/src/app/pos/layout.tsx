"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, ShoppingCart, User } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || '/api';

interface Admin {
  id: string;
  name?: string;
  email: string;
  role: 'admin' | 'staff' | 'cashier';
}

export default function POSLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch admin info
  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/me`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setAdmin(data);
        } else {
          router.push('/pos/login');
        }
      } catch (error) {
        console.error('Failed to fetch admin info:', error);
        router.push('/pos/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminInfo();
  }, [router]);

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        toast({
          title: "Đăng xuất thành công",
          description: "Hẹn gặp lại bạn!",
        });
        router.push('/pos/login');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi đăng xuất",
        description: error instanceof Error ? error.message : "Không thể đăng xuất",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-[#A0826D] animate-pulse" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'cashier':
        return 'Thu ngân';
      case 'staff':
        return 'Nhân viên';
      case 'admin':
        return 'Quản lý';
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#A0826D] to-[#8B6F47] rounded-lg">
            <ShoppingCart className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold text-[#4A4A4A]">
              Hệ thống POS
            </h1>
            <p className="text-xs text-[#6B6B6B]">
              Quầy thanh toán
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <User className="w-4 h-4 text-[#A0826D]" />
            <div className="text-right">
              <p className="text-sm font-medium text-[#4A4A4A]">
                {admin.name || admin.email}
              </p>
              <p className="text-xs text-[#6B6B6B]">
                {getRoleLabel(admin.role)}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="min-h-10 md:min-h-12 border-[#D4C4A8] hover:bg-[#F5E6D3] hover:text-[#4A4A4A]"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:ml-2 sm:inline">Đăng xuất</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}
