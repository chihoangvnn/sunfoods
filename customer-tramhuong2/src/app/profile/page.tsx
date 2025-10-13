'use client';

import { useAuth, MOCK_USERS, MOCK_ORDERS, MOCK_ADDRESSES } from '@/contexts/AuthContext';
import { User, LogOut, Award, CreditCard, Gift, Package, MapPin, ChevronRight, Plus, Edit, Trash2, Info } from 'lucide-react';
import { useState } from 'react';

type TabType = 'overview' | 'orders' | 'addresses';

export default function ProfilePage() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#3D2B1F]/10 via-[#C1A875]/12 to-[#C1A875]/5">
        <div className="text-tramhuong-accent font-nunito font-semibold">Đang tải...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#3D2B1F]/10 via-[#C1A875]/12 to-[#C1A875]/5 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-[#FFFFFF]/85 backdrop-blur-xl rounded-lg shadow-[0_12px_40px_rgba(61,43,31,0.15)] p-8 border border-[#C1A875]/30">
          <h1 className="text-3xl font-bold font-playfair mb-2 text-tramhuong-primary text-center">
            Chọn tài khoản để test
          </h1>
          <p className="text-center text-tramhuong-primary/70 mb-8 font-nunito">
            Demo mode - Chọn một tài khoản để xem các tính năng member
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customer Account */}
            <button
              onClick={() => login(MOCK_USERS.customer)}
              className="group relative bg-[#FFFFFF]/85 backdrop-blur-xl rounded-lg p-6 border-2 border-[#C1A875]/30 hover:border-[#C1A875] hover:shadow-[0_16px_48px_rgba(193,168,117,0.25)] transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-tramhuong-accent/10 flex items-center justify-center group-hover:bg-tramhuong-accent/20 transition-colors duration-300">
                  <User className="h-8 w-8 text-tramhuong-accent" />
                </div>
                <div>
                  <h3 className="font-playfair font-bold text-lg text-tramhuong-primary">
                    Khách hàng
                  </h3>
                  <p className="text-sm text-tramhuong-primary/70 font-nunito mt-1">
                    {MOCK_USERS.customer.name}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-tramhuong-accent/10 rounded-full">
                    <Award className="h-3 w-3 text-tramhuong-accent" />
                    <span className="text-xs font-semibold text-tramhuong-accent">
                      Gold Member
                    </span>
                  </div>
                </div>
              </div>
            </button>

            {/* Vendor Account */}
            <button
              onClick={() => login(MOCK_USERS.vendor)}
              className="group relative bg-[#FFFFFF]/85 backdrop-blur-xl rounded-lg p-6 border-2 border-[#C1A875]/30 hover:border-[#C1A875] hover:shadow-[0_16px_48px_rgba(193,168,117,0.25)] transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-tramhuong-accent/10 flex items-center justify-center group-hover:bg-tramhuong-accent/20 transition-colors duration-300">
                  <svg className="h-8 w-8 text-tramhuong-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-playfair font-bold text-lg text-tramhuong-primary">
                    Vendor
                  </h3>
                  <p className="text-sm text-tramhuong-primary/70 font-nunito mt-1">
                    {MOCK_USERS.vendor.name}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-tramhuong-accent/10 rounded-full">
                    <span className="text-xs font-semibold text-tramhuong-accent">
                      Nhà cung cấp
                    </span>
                  </div>
                </div>
              </div>
            </button>

            {/* Admin Account */}
            <button
              onClick={() => login(MOCK_USERS.admin)}
              className="group relative bg-[#FFFFFF]/85 backdrop-blur-xl rounded-lg p-6 border-2 border-[#C1A875]/30 hover:border-[#C1A875] hover:shadow-[0_16px_48px_rgba(193,168,117,0.25)] transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-tramhuong-accent/10 flex items-center justify-center group-hover:bg-tramhuong-accent/20 transition-colors duration-300">
                  <svg className="h-8 w-8 text-tramhuong-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-playfair font-bold text-lg text-tramhuong-primary">
                    Admin
                  </h3>
                  <p className="text-sm text-tramhuong-primary/70 font-nunito mt-1">
                    {MOCK_USERS.admin.name}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-tramhuong-accent/10 rounded-full">
                    <span className="text-xs font-semibold text-tramhuong-accent">
                      Quản trị viên
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-6 p-4 bg-[#C1A875]/8 border border-[#C1A875]/25 rounded-lg flex items-center gap-3">
            <Info className="h-5 w-5 text-tramhuong-accent flex-shrink-0" />
            <p className="text-sm text-tramhuong-primary/70 font-nunito">
              Dữ liệu sẽ được lưu trong localStorage để test các tính năng member
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: 'Chờ xác nhận', className: 'bg-tramhuong-accent/10 text-tramhuong-accent border-tramhuong-accent/30' },
      processing: { label: 'Đang giao', className: 'bg-tramhuong-accent/20 text-tramhuong-accent border-tramhuong-accent/40' },
      completed: { label: 'Hoàn thành', className: 'bg-tramhuong-accent/30 text-tramhuong-primary border-tramhuong-accent/50' },
      cancelled: { label: 'Đã hủy', className: 'bg-tramhuong-primary/10 text-tramhuong-primary/60 border-tramhuong-primary/20' },
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3D2B1F]/10 via-[#C1A875]/12 to-[#C1A875]/5 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* User Info Header */}
        <div className="bg-[#FFFFFF]/85 backdrop-blur-xl rounded-lg shadow-[0_16px_48px_rgba(193,168,117,0.25)] p-6 border border-[#C1A875]/30">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-tramhuong-accent/20 to-tramhuong-accent/10 flex items-center justify-center shadow-[0_4px_16px_rgba(193,168,117,0.2)]">
                <User className="h-12 w-12 text-tramhuong-accent" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-playfair text-tramhuong-primary">
                  {user.name}
                </h1>
                <p className="text-tramhuong-primary/70 font-nunito mt-1">{user.email}</p>
                <p className="text-tramhuong-accent font-medium mt-1">{user.phone}</p>
                {user.membershipTier && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-tramhuong-accent/20 to-tramhuong-accent/10 rounded-full border border-tramhuong-accent/30">
                    <Award className="h-4 w-4 text-tramhuong-accent" />
                    <span className="text-sm font-bold font-playfair text-tramhuong-accent capitalize">
                      {user.membershipTier} Member
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#C1A875]/15 hover:bg-[#C1A875]/25 rounded-lg transition-all duration-300 group border border-[#C1A875]/30 hover:border-[#C1A875]/50"
            >
              <LogOut className="h-5 w-5 text-tramhuong-primary/60 group-hover:text-tramhuong-accent transition-colors duration-300" />
              <span className="text-sm font-nunito font-semibold text-tramhuong-primary/60 group-hover:text-tramhuong-accent transition-colors duration-300">
                Đăng xuất
              </span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#FFFFFF]/85 backdrop-blur-xl rounded-lg shadow-[0_12px_40px_rgba(61,43,31,0.15)] border border-[#C1A875]/30">
          <div className="flex border-b border-tramhuong-accent/20">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-4 font-playfair font-semibold transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'text-tramhuong-accent border-b-2 border-tramhuong-accent bg-[#C1A875]/10'
                  : 'text-tramhuong-primary/60 hover:text-tramhuong-accent hover:bg-[#C1A875]/8'
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 px-6 py-4 font-playfair font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'orders'
                  ? 'text-tramhuong-accent border-b-2 border-tramhuong-accent bg-[#C1A875]/10'
                  : 'text-tramhuong-primary/60 hover:text-tramhuong-accent hover:bg-[#C1A875]/8'
              }`}
            >
              <Package className="h-4 w-4" />
              Đơn hàng
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`flex-1 px-6 py-4 font-playfair font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'addresses'
                  ? 'text-tramhuong-accent border-b-2 border-tramhuong-accent bg-[#C1A875]/10'
                  : 'text-tramhuong-primary/60 hover:text-tramhuong-accent hover:bg-[#C1A875]/8'
              }`}
            >
              <MapPin className="h-4 w-4" />
              Địa chỉ
            </button>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && user.role === 'customer' && user.membershipTier && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold font-playfair text-tramhuong-primary">
                  Thông tin thành viên
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="group bg-gradient-to-br from-tramhuong-accent/10 to-tramhuong-accent/5 rounded-lg p-6 border border-tramhuong-accent/20 hover:border-tramhuong-accent/40 hover:shadow-[0_8px_24px_rgba(193,168,117,0.2)] transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <Award className="h-6 w-6 text-tramhuong-accent" />
                      <span className="text-sm font-nunito text-tramhuong-primary/70">Hạng thành viên</span>
                    </div>
                    <p className="text-4xl font-bold font-playfair text-tramhuong-accent capitalize">
                      {user.membershipTier}
                    </p>
                  </div>

                  <div className="group bg-gradient-to-br from-tramhuong-accent/10 to-tramhuong-accent/5 rounded-lg p-6 border border-tramhuong-accent/20 hover:border-tramhuong-accent/40 hover:shadow-[0_8px_24px_rgba(193,168,117,0.2)] transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <Gift className="h-6 w-6 text-tramhuong-accent" />
                      <span className="text-sm font-nunito text-tramhuong-primary/70">Điểm tích lũy</span>
                    </div>
                    <p className="text-4xl font-bold font-playfair text-tramhuong-accent">
                      {user.pointsBalance?.toLocaleString('vi-VN')}
                    </p>
                  </div>

                  <div className="group bg-gradient-to-br from-tramhuong-accent/10 to-tramhuong-accent/5 rounded-lg p-6 border border-tramhuong-accent/20 hover:border-tramhuong-accent/40 hover:shadow-[0_8px_24px_rgba(193,168,117,0.2)] transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <CreditCard className="h-6 w-6 text-tramhuong-accent" />
                      <span className="text-sm font-nunito text-tramhuong-primary/70">Tổng chi tiêu</span>
                    </div>
                    <p className="text-3xl font-bold font-playfair text-tramhuong-accent">
                      {user.totalSpent?.toLocaleString('vi-VN')} ₫
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'overview' && (!user.membershipTier || user.role !== 'customer') && (
              <div className="text-center py-12">
                <User className="h-16 w-16 text-tramhuong-accent/50 mx-auto mb-4" />
                <p className="text-tramhuong-primary/70 font-nunito">
                  Thông tin tài khoản {user.role === 'vendor' ? 'Nhà cung cấp' : 'Quản trị viên'}
                </p>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold font-playfair text-tramhuong-primary">
                    Lịch sử đơn hàng
                  </h2>
                  <span className="text-sm font-nunito text-tramhuong-primary/70">
                    {MOCK_ORDERS.length} đơn hàng
                  </span>
                </div>

                <div className="space-y-4">
                  {MOCK_ORDERS.map((order) => {
                    const badge = getStatusBadge(order.status);
                    return (
                      <div
                        key={order.id}
                        className="group bg-[#FFFFFF]/85 backdrop-blur-xl rounded-lg p-5 border border-[#C1A875]/25 hover:border-[#C1A875]/50 hover:shadow-[0_12px_32px_rgba(193,168,117,0.25)] transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-[#C1A875]/15 flex items-center justify-center flex-shrink-0">
                              <Package className="h-6 w-6 text-tramhuong-accent" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-playfair font-bold text-lg text-tramhuong-primary">
                                  {order.code}
                                </h3>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${badge.className}`}>
                                  {badge.label}
                                </span>
                              </div>
                              <p className="text-sm text-tramhuong-primary/70 font-nunito mb-1">
                                {order.productPreview} • {order.items} sản phẩm
                              </p>
                              <p className="text-xs text-tramhuong-primary/50 font-nunito">
                                {new Date(order.date).toLocaleDateString('vi-VN', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between md:justify-end gap-4">
                            <p className="text-2xl font-bold font-playfair text-tramhuong-accent">
                              {order.total.toLocaleString('vi-VN')} ₫
                            </p>
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#C1A875]/15 hover:bg-[#C1A875]/25 rounded-lg transition-all duration-300 group/btn border border-[#C1A875]/30">
                              <span className="text-sm font-nunito font-medium text-tramhuong-accent">
                                Chi tiết
                              </span>
                              <ChevronRight className="h-4 w-4 text-tramhuong-accent group-hover/btn:translate-x-1 transition-transform duration-300" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold font-playfair text-tramhuong-primary">
                    Địa chỉ giao hàng
                  </h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#C1A875]/15 hover:bg-[#C1A875]/25 rounded-lg transition-all duration-300 border border-[#C1A875]/30 group">
                    <Plus className="h-5 w-5 text-tramhuong-accent" />
                    <span className="text-sm font-nunito font-semibold text-tramhuong-accent">
                      Thêm địa chỉ mới
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MOCK_ADDRESSES.map((address) => (
                    <div
                      key={address.id}
                      className={`group bg-[#FFFFFF]/85 backdrop-blur-xl rounded-lg p-5 border transition-all duration-300 ${
                        address.isDefault
                          ? 'border-[#C1A875]/50 shadow-[0_8px_24px_rgba(193,168,117,0.25)]'
                          : 'border-[#C1A875]/25 hover:border-[#C1A875]/50 hover:shadow-[0_12px_32px_rgba(193,168,117,0.25)]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-tramhuong-accent flex-shrink-0" />
                          <div>
                            <h3 className="font-playfair font-bold text-tramhuong-primary">
                              {address.name}
                            </h3>
                            <p className="text-sm text-tramhuong-accent font-nunito">
                              {address.phone}
                            </p>
                          </div>
                        </div>
                        {address.isDefault && (
                          <span className="inline-flex items-center px-3 py-1 bg-tramhuong-accent/20 text-tramhuong-accent rounded-full text-xs font-bold border border-tramhuong-accent/30">
                            Mặc định
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-tramhuong-primary/70 font-nunito mb-4 leading-relaxed">
                        {address.address}, {address.ward}, {address.district}, {address.city}
                      </p>

                      <div className="flex items-center gap-2 pt-4 border-t border-tramhuong-accent/10">
                        <button className="flex items-center gap-2 px-3 py-2 bg-[#C1A875]/15 hover:bg-[#C1A875]/25 rounded-lg transition-all duration-300 text-sm font-nunito font-medium text-tramhuong-accent">
                          <Edit className="h-4 w-4" />
                          Sửa
                        </button>
                        {!address.isDefault && (
                          <>
                            <button className="flex items-center gap-2 px-3 py-2 bg-tramhuong-primary/5 hover:bg-tramhuong-primary/10 rounded-lg transition-all duration-300 text-sm font-nunito font-medium text-tramhuong-primary/70">
                              <Trash2 className="h-4 w-4" />
                              Xóa
                            </button>
                            <button className="ml-auto px-3 py-2 bg-[#C1A875]/15 hover:bg-[#C1A875]/25 rounded-lg transition-all duration-300 text-xs font-nunito font-semibold text-tramhuong-accent">
                              Đặt làm mặc định
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Demo Mode Notice */}
        <div className="bg-[#C1A875]/8 border border-[#C1A875]/25 rounded-lg p-4 flex items-center gap-3">
          <Info className="h-5 w-5 text-tramhuong-accent flex-shrink-0" />
          <p className="text-sm text-tramhuong-primary/70 font-nunito">
            <strong className="text-tramhuong-accent">Demo Mode:</strong> Đang sử dụng dữ liệu giả để test. Dữ liệu được lưu trong localStorage.
          </p>
        </div>
      </div>
    </div>
  );
}
