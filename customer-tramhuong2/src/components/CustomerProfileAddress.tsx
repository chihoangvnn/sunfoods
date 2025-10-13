'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AddressMapPicker } from './AddressMapPicker';
import { MapPin, ArrowLeft, Loader2, Save, Bird } from 'lucide-react';

interface CustomerProfileAddressProps {
  onBack?: () => void;
  onSaved?: () => void;
}

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  district?: string;
  distanceFromShop?: number;
}

interface ShopLocation {
  lat: number;
  lon: number;
}

export function CustomerProfileAddress({ onBack, onSaved }: CustomerProfileAddressProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [shopLocation, setShopLocation] = useState<ShopLocation | null>(null);
  
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [district, setDistrict] = useState('');
  const [distanceFromShop, setDistanceFromShop] = useState<number | null>(null);
  
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, shopRes] = await Promise.all([
        fetch('/api/customer/profile'),
        fetch('/api/shop-settings/location')
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setCustomer(profileData);
        setAddress(profileData.address || '');
        setLatitude(profileData.latitude || null);
        setLongitude(profileData.longitude || null);
        setDistrict(profileData.district || '');
        setDistanceFromShop(profileData.distanceFromShop || null);
      }

      if (shopRes.ok) {
        const shopData = await shopRes.json();
        setShopLocation(shopData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Lỗi khi tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (data: {
    lat: number;
    lon: number;
    address: string;
    district: string;
    distanceFromShop: number | null;
  }) => {
    setAddress(data.address);
    setLatitude(data.lat);
    setLongitude(data.lon);
    setDistrict(data.district);
    setDistanceFromShop(data.distanceFromShop);
  };

  const handleSaveAddress = async () => {
    if (!address.trim()) {
      setMessage('Vui lòng nhập địa chỉ');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/customer/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          latitude,
          longitude,
          district,
          distanceFromShop,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        setMessage(error.error || 'Cập nhật thất bại');
        return;
      }

      const updated = await res.json();
      setCustomer(updated);
      setMessage('✅ Cập nhật địa chỉ thành công!');

      setTimeout(() => {
        if (onSaved) {
          onSaved();
        }
      }, 1500);
    } catch (error) {
      console.error('Error saving address:', error);
      setMessage('Lỗi kết nối. Vui lòng thử lại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-6">
      <div className="flex items-center mb-6">
        {onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="p-2 mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-xl font-semibold text-gray-900">Địa chỉ chính của bạn</h1>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold">Địa chỉ</h3>
          </div>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Nhập địa chỉ đầy đủ hoặc chọn trên bản đồ bên dưới"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            rows={3}
          />
          {distanceFromShop !== null && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <Bird className="h-4 w-4 text-blue-600" />
              <span>Khoảng cách chim bay từ cửa hàng: <strong>{distanceFromShop} km</strong></span>
            </div>
          )}
        </CardContent>
      </Card>

      <AddressMapPicker
        shopLocation={shopLocation}
        initialLocation={
          latitude && longitude
            ? { lat: latitude, lon: longitude }
            : undefined
        }
        onLocationSelect={handleLocationSelect}
      />

      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          message.includes('✅')
            ? 'bg-green-50 text-green-800'
            : 'bg-red-50 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <div className="mt-6 pb-6">
        <Button
          onClick={handleSaveAddress}
          disabled={saving || !address.trim()}
          className="w-full py-6 text-lg font-semibold bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white"
        >
          {saving ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Lưu địa chỉ
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
