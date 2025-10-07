'use client'

import { useState } from 'react';
import { User, Mail, Phone, MapPin, Save, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { affiliateService } from '@/services/affiliateService';

interface ProfileData {
  affiliate: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    affiliateCode: string;
    tier: string;
    commissionRate: number;
    status: string;
    totalOrders: number;
    totalRevenue: number;
    totalCommission: number;
  };
  paymentInfo?: any;
  paymentHistory?: any[];
}

interface ProfileClientProps {
  initialData: ProfileData;
}

export default function ProfileClient({ initialData }: ProfileClientProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: initialData.affiliate.name,
    email: initialData.affiliate.email || '',
    phone: initialData.affiliate.phone || '',
    address: '',
    affiliateCode: initialData.affiliate.affiliateCode,
    joinDate: '2025-01-01',
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      await affiliateService.updateProfile(profileData);
      setEditing(false);
      alert('Đã cập nhật thông tin thành công!');
    } catch (error) {
      alert('Lỗi cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hồ sơ của tôi</h1>
        <p className="text-gray-600 mt-1">Quản lý thông tin cá nhân và tài khoản</p>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Thông tin cá nhân
            </CardTitle>
            {!editing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                Chỉnh sửa
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(false)}
                >
                  Hủy
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4" />
                Họ và tên
              </label>
              {editing ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <p className="text-gray-900 font-semibold">{profileData.name}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              {editing ? (
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <p className="text-gray-900 font-semibold">{profileData.email}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4" />
                Số điện thoại
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <p className="text-gray-900 font-semibold">{profileData.phone}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4" />
                Địa chỉ
              </label>
              {editing ? (
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <p className="text-gray-900 font-semibold">{profileData.address || 'Chưa cập nhật'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Thông tin tài khoản
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Mã CTV</p>
              <p className="text-lg font-bold text-green-600">{profileData.affiliateCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Cấp độ</p>
              <p className="text-lg font-semibold text-gray-900">{initialData.affiliate.tier}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Tỷ lệ hoa hồng</p>
              <p className="text-lg font-semibold text-gray-900">{initialData.affiliate.commissionRate}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng đơn hàng</p>
              <p className="text-lg font-semibold text-gray-900">{initialData.affiliate.totalOrders}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle>Link giới thiệu của bạn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Chia sẻ link này để khách hàng mua hàng qua mã CTV của bạn:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`https://cuahangtamlinh.com?aff=${profileData.affiliateCode}`}
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg font-mono text-sm"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(`https://cuahangtamlinh.com?aff=${profileData.affiliateCode}`);
                  alert('Đã sao chép link!');
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Sao chép
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
