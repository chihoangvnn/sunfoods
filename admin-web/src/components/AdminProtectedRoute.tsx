import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import type { Admin } from "@shared/schema";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Admin["role"][];
}

export default function AdminProtectedRoute({ 
  children, 
  requiredRoles 
}: AdminProtectedRouteProps) {
  // TEMPORARY: Auth disabled for testing layout
  return <>{children}</>;
  
  /* Original auth logic - commented for testing
  const { admin, isLoading, isAuthenticated } = useAdminAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated - redirect to login
      if (!isAuthenticated) {
        setLocation("/admin/login");
        return;
      }

      // Check role requirements
      if (requiredRoles && requiredRoles.length > 0) {
        if (!admin || !requiredRoles.includes(admin.role)) {
          // Insufficient permissions - redirect to dashboard with error
          setLocation("/");
          return;
        }
      }
    }
  }, [isLoading, isAuthenticated, admin, requiredRoles, setLocation]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#A0826D] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#6B6B6B]">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Check role permissions
  if (requiredRoles && requiredRoles.length > 0) {
    if (!admin || !requiredRoles.includes(admin.role)) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#4A4A4A] mb-2">
              Không có quyền truy cập
            </h2>
            <p className="text-[#6B6B6B]">
              Bạn không có quyền truy cập trang này
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
  */
}
