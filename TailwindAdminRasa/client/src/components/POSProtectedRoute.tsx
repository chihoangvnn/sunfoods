import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface POSProtectedRouteProps {
  children: React.ReactNode;
}

export default function POSProtectedRoute({ children }: POSProtectedRouteProps) {
  const { admin, isLoading, isAuthenticated } = useAdminAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setLocation("/pos/login");
        return;
      }

      const allowedRoles = ["cashier", "staff", "admin", "superadmin"];
      if (admin && !allowedRoles.includes(admin.role)) {
        setLocation("/admin/login");
        return;
      }
    }
  }, [isLoading, isAuthenticated, admin, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#A0826D] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#6B6B6B]">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const allowedRoles = ["cashier", "staff", "admin", "superadmin"];
  if (admin && !allowedRoles.includes(admin.role)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#4A4A4A] mb-2">
            Không có quyền truy cập
          </h2>
          <p className="text-[#6B6B6B]">
            Bạn không có quyền truy cập hệ thống POS
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
