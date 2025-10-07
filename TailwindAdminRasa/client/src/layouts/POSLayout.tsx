import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { LogOut, ShoppingCart, User } from "lucide-react";

interface POSLayoutProps {
  children: React.ReactNode;
}

export default function POSLayout({ children }: POSLayoutProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { admin, logout } = useAdminAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Đăng xuất thành công",
        description: "Hẹn gặp lại bạn!",
      });
      setLocation("/pos/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi đăng xuất",
        description: error instanceof Error ? error.message : "Không thể đăng xuất",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#A0826D] to-[#8B6F47] rounded-lg">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#4A4A4A]">
              Hệ thống POS
            </h1>
            <p className="text-xs text-[#6B6B6B]">
              Quầy thanh toán
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <User className="w-4 h-4 text-[#A0826D]" />
            <div className="text-right">
              <p className="text-sm font-medium text-[#4A4A4A]">
                {admin?.name || admin?.email}
              </p>
              <p className="text-xs text-[#6B6B6B] capitalize">
                {admin?.role === 'cashier' ? 'Thu ngân' : admin?.role === 'staff' ? 'Nhân viên' : 'Quản lý'}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-[#D4C4A8] hover:bg-[#F5E6D3] hover:text-[#4A4A4A]"
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
