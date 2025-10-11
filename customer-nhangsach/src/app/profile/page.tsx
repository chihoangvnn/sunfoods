'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/customer/profile');
      if (!res.ok) {
        router.push('/api/login');
        return;
      }
      const data = await res.json();
      setCustomer(data);
      setPhone(data.phone || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!phone || phone.length < 10) {
      setMessage('Vui lòng nhập số điện thoại hợp lệ (ít nhất 10 số)');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/customer/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      if (!res.ok) {
        const error = await res.json();
        setMessage(error.error || 'Cập nhật thất bại');
        return;
      }

      const updated = await res.json();
      setCustomer(updated);
      setMessage('✅ Cập nhật số điện thoại thành công!');
      
      setTimeout(() => router.push('/datxe/book-ride'), 1500);
    } catch (error) {
      setMessage('Lỗi kết nối. Vui lòng thử lại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Đang tải...</div>
      </div>
    );
  }

  const needsPhoneUpdate = customer?.phone?.startsWith('GOOGLE_');

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Cập nhật thông tin</h1>

        {needsPhoneUpdate && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Bạn cần cập nhật số điện thoại để sử dụng tính năng đặt xe
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ tên
            </label>
            <input
              type="text"
              value={customer?.name || ''}
              disabled
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={customer?.email || ''}
              disabled
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="0912345678"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Số điện thoại sẽ được hiển thị cho tài xế khi đặt xe thành công
            </p>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('✅') 
                ? 'bg-green-50 text-green-800' 
                : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !phone}
            className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {saving ? 'Đang lưu...' : 'Cập nhật'}
          </button>
        </div>
      </div>
    </div>
  );
}
