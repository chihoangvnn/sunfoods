'use client'

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { mockVendor } from '@/data/mockVendorData';
import { 
  User, MapPin, Phone, Mail, Save, CreditCard, Bell, Shield, 
  HelpCircle, Lock, LogOut, AlertTriangle, Calendar, Building2,
  FileText, ExternalLink, Loader2
} from 'lucide-react';

export default function VendorSettings() {
  const [accountInfo, setAccountInfo] = useState({
    name: mockVendor.name,
    email: mockVendor.email,
    phone: mockVendor.phone,
  });

  const [warehouseInfo, setWarehouseInfo] = useState({
    address: mockVendor.warehouseAddress,
    province: 'TP.HCM',
    district: 'Quận 3',
    ward: 'Phường 4',
  });

  const [paymentSettings, setPaymentSettings] = useState({
    codToShop: true,
    bankName: 'Vietcombank',
    accountNumber: '1234567890',
    accountHolder: mockVendor.name,
    branch: 'Chi nhánh Sài Gòn',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    orderUpdates: true,
    lowBalance: true,
    consignmentApproval: true,
  });

  const [isAccountSaving, setIsAccountSaving] = useState(false);
  const [isWarehouseSaving, setIsWarehouseSaving] = useState(false);
  const [isPaymentSaving, setIsPaymentSaving] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSaveAccountInfo = async () => {
    setIsAccountSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsAccountSaving(false);
    alert('Thông tin tài khoản đã được cập nhật!');
  };

  const handleSaveWarehouse = async () => {
    setIsWarehouseSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsWarehouseSaving(false);
    alert('Địa chỉ kho hàng đã được cập nhật!');
  };

  const handleSavePayment = async () => {
    setIsPaymentSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsPaymentSaving(false);
    alert('Cài đặt thanh toán đã được lưu!');
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsPasswordModalOpen(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    alert('Mật khẩu đã được thay đổi thành công!');
  };

  const handleLogoutAllDevices = async () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi tất cả các thiết bị?')) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Đã đăng xuất khỏi tất cả các thiết bị!');
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
        <p className="text-gray-600 mt-1">Quản lý thông tin tài khoản và cài đặt hệ thống</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="account">Tài khoản</TabsTrigger>
          <TabsTrigger value="warehouse">Kho hàng</TabsTrigger>
          <TabsTrigger value="payment">Thanh toán</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
          <TabsTrigger value="support">Hỗ trợ</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Thông tin tài khoản</h2>
                <p className="text-sm text-gray-600">Cập nhật thông tin nhà cung cấp</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="vendor-name">Tên nhà cung cấp</Label>
                  <Input 
                    id="vendor-name" 
                    value={accountInfo.name}
                    onChange={(e) => setAccountInfo({ ...accountInfo, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Trạng thái</Label>
                  <Badge variant={mockVendor.status === 'active' ? 'default' : 'secondary'}>
                    {mockVendor.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      id="email" 
                      type="email"
                      value={accountInfo.email}
                      onChange={(e) => setAccountInfo({ ...accountInfo, email: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      id="phone" 
                      value={accountInfo.phone}
                      onChange={(e) => setAccountInfo({ ...accountInfo, phone: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Ngày tham gia</Label>
                <div className="flex items-center gap-2 mt-1 text-gray-700">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{mockVendor.createdAt.toLocaleDateString('vi-VN', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  })}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={handleSaveAccountInfo}
                  disabled={isAccountSaving}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isAccountSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Cập nhật thông tin
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="warehouse" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Địa chỉ kho hàng</h2>
                <p className="text-sm text-gray-600">Quản lý địa chỉ lấy hàng cho shipper</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="full-address">Địa chỉ đầy đủ</Label>
                <Textarea 
                  id="full-address" 
                  value={warehouseInfo.address}
                  onChange={(e) => setWarehouseInfo({ ...warehouseInfo, address: e.target.value })}
                  className="mt-1"
                  rows={3}
                  placeholder="Nhập địa chỉ kho hàng đầy đủ..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="province">Tỉnh/Thành phố</Label>
                  <Select 
                    value={warehouseInfo.province} 
                    onValueChange={(value) => setWarehouseInfo({ ...warehouseInfo, province: value })}
                  >
                    <SelectTrigger id="province" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TP.HCM">TP. Hồ Chí Minh</SelectItem>
                      <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                      <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                      <SelectItem value="Cần Thơ">Cần Thơ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="district">Quận/Huyện</Label>
                  <Select 
                    value={warehouseInfo.district} 
                    onValueChange={(value) => setWarehouseInfo({ ...warehouseInfo, district: value })}
                  >
                    <SelectTrigger id="district" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Quận 1">Quận 1</SelectItem>
                      <SelectItem value="Quận 3">Quận 3</SelectItem>
                      <SelectItem value="Quận 5">Quận 5</SelectItem>
                      <SelectItem value="Quận 10">Quận 10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ward">Phường/Xã</Label>
                  <Select 
                    value={warehouseInfo.ward} 
                    onValueChange={(value) => setWarehouseInfo({ ...warehouseInfo, ward: value })}
                  >
                    <SelectTrigger id="ward" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Phường 1">Phường 1</SelectItem>
                      <SelectItem value="Phường 4">Phường 4</SelectItem>
                      <SelectItem value="Phường 7">Phường 7</SelectItem>
                      <SelectItem value="Phường 10">Phường 10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">Tích hợp bản đồ sắp tới</p>
                <p className="text-sm text-gray-500 mt-1">Sẽ hiển thị vị trí kho hàng trên bản đồ</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Lưu ý quan trọng</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Địa chỉ này sẽ được dùng để shipper đến lấy hàng. Vui lòng đảm bảo thông tin chính xác.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={handleSaveWarehouse}
                  disabled={isWarehouseSaving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isWarehouseSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Cập nhật địa chỉ
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Phương thức thanh toán</h2>
                <p className="text-sm text-gray-600">Cài đặt COD và thông tin ngân hàng</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="cod-toggle" className="text-base font-semibold">
                      Cho phép COD về Shop (tự động trừ ký quỹ)
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Khi bật, tiền COD sẽ về shop và tự động trừ vào số dư ký quỹ của bạn
                    </p>
                  </div>
                  <Switch
                    id="cod-toggle"
                    checked={paymentSettings.codToShop}
                    onCheckedChange={(checked) => setPaymentSettings({ ...paymentSettings, codToShop: checked })}
                    className="data-[state=checked]:bg-orange-600"
                  />
                </div>

                {paymentSettings.codToShop && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-orange-800">
                      <strong>Lưu ý:</strong> Đảm bảo duy trì số dư ký quỹ đủ để trừ COD
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Thông tin tài khoản ngân hàng
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Dùng cho hoàn tiền và thanh toán ký quỹ
                </p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bank-name">Ngân hàng</Label>
                    <Select 
                      value={paymentSettings.bankName} 
                      onValueChange={(value) => setPaymentSettings({ ...paymentSettings, bankName: value })}
                    >
                      <SelectTrigger id="bank-name" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Vietcombank">Vietcombank</SelectItem>
                        <SelectItem value="Techcombank">Techcombank</SelectItem>
                        <SelectItem value="BIDV">BIDV</SelectItem>
                        <SelectItem value="VietinBank">VietinBank</SelectItem>
                        <SelectItem value="ACB">ACB</SelectItem>
                        <SelectItem value="Agribank">Agribank</SelectItem>
                        <SelectItem value="MBBank">MBBank</SelectItem>
                        <SelectItem value="VPBank">VPBank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="account-number">Số tài khoản</Label>
                      <Input 
                        id="account-number" 
                        value={paymentSettings.accountNumber}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, accountNumber: e.target.value })}
                        className="mt-1"
                        placeholder="Nhập số tài khoản"
                      />
                    </div>

                    <div>
                      <Label htmlFor="account-holder">Tên chủ tài khoản</Label>
                      <Input 
                        id="account-holder" 
                        value={paymentSettings.accountHolder}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, accountHolder: e.target.value })}
                        className="mt-1"
                        placeholder="Tên đầy đủ theo CMND"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="branch">Chi nhánh (tùy chọn)</Label>
                    <Input 
                      id="branch" 
                      value={paymentSettings.branch}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, branch: e.target.value })}
                      className="mt-1"
                      placeholder="Ví dụ: Chi nhánh Sài Gòn"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={handleSavePayment}
                  disabled={isPaymentSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isPaymentSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu cài đặt thanh toán
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bell className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Thông báo</h2>
                <p className="text-sm text-gray-600">Quản lý tùy chọn nhận thông báo</p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between py-4 border-b">
                <div>
                  <p className="font-medium text-gray-900">Thông báo qua Email</p>
                  <p className="text-sm text-gray-600">Nhận thông báo quan trọng qua email</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                  className="data-[state=checked]:bg-orange-600"
                />
              </div>

              <div className="flex items-center justify-between py-4 border-b">
                <div>
                  <p className="font-medium text-gray-900">Thông báo qua SMS</p>
                  <p className="text-sm text-gray-600">Nhận tin nhắn SMS cho các cập nhật quan trọng</p>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                  className="data-[state=checked]:bg-orange-600"
                />
              </div>

              <div className="flex items-center justify-between py-4 border-b">
                <div>
                  <p className="font-medium text-gray-900">Cập nhật trạng thái đơn hàng</p>
                  <p className="text-sm text-gray-600">Nhận thông báo khi đơn hàng thay đổi trạng thái</p>
                </div>
                <Switch
                  checked={notifications.orderUpdates}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, orderUpdates: checked })}
                  className="data-[state=checked]:bg-orange-600"
                />
              </div>

              <div className="flex items-center justify-between py-4 border-b">
                <div>
                  <p className="font-medium text-gray-900">Cảnh báo số dư ký quỹ thấp</p>
                  <p className="text-sm text-gray-600">Nhận thông báo khi số dư ký quỹ dưới mức tối thiểu</p>
                </div>
                <Switch
                  checked={notifications.lowBalance}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, lowBalance: checked })}
                  className="data-[state=checked]:bg-orange-600"
                />
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium text-gray-900">Phê duyệt sản phẩm ký gửi</p>
                  <p className="text-sm text-gray-600">Nhận thông báo về trạng thái ký gửi sản phẩm</p>
                </div>
                <Switch
                  checked={notifications.consignmentApproval}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, consignmentApproval: checked })}
                  className="data-[state=checked]:bg-orange-600"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Bảo mật</h2>
                <p className="text-sm text-gray-600">Quản lý mật khẩu và bảo mật tài khoản</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium text-gray-900">Đổi mật khẩu</p>
                  <p className="text-sm text-gray-600">Cập nhật mật khẩu đăng nhập của bạn</p>
                </div>
                <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Lock className="h-4 w-4 mr-2" />
                      Đổi mật khẩu
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Đổi mật khẩu</DialogTitle>
                      <DialogDescription>
                        Nhập mật khẩu hiện tại và mật khẩu mới để thay đổi
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                        <Input 
                          id="current-password" 
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-password">Mật khẩu mới</Label>
                        <Input 
                          id="new-password" 
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                        <Input 
                          id="confirm-password" 
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
                        Hủy
                      </Button>
                      <Button onClick={handleChangePassword} className="bg-orange-600 hover:bg-orange-700">
                        Đổi mật khẩu
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">Xác thực hai yếu tố</p>
                    <Badge variant="secondary" className="text-xs">
                      Sắp ra mắt
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">Tăng cường bảo mật với xác thực hai bước</p>
                </div>
                <Switch disabled className="opacity-50" />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">Quản lý phiên đăng nhập</p>
                  <p className="text-sm text-gray-600">Đăng xuất khỏi tất cả các thiết bị khác</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogoutAllDevices}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Đăng xuất tất cả
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <HelpCircle className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Hỗ trợ</h2>
                <p className="text-sm text-gray-600">Trợ giúp và tài liệu hướng dẫn</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto py-4"
                onClick={() => alert('Đang kết nối với quản trị viên...')}
              >
                <div className="flex items-start gap-3 text-left">
                  <Mail className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Liên hệ quản trị viên</p>
                    <p className="text-sm text-gray-600">Gửi yêu cầu hỗ trợ trực tiếp</p>
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start h-auto py-4"
                onClick={() => window.open('#', '_blank')}
              >
                <div className="flex items-start gap-3 text-left w-full">
                  <HelpCircle className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Trung tâm trợ giúp</p>
                    <p className="text-sm text-gray-600">Hướng dẫn sử dụng và câu hỏi thường gặp</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start h-auto py-4"
                onClick={() => window.open('#', '_blank')}
              >
                <div className="flex items-start gap-3 text-left w-full">
                  <FileText className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Điều khoản và điều kiện</p>
                    <p className="text-sm text-gray-600">Quy định sử dụng dịch vụ</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start h-auto py-4"
                onClick={() => window.open('#', '_blank')}
              >
                <div className="flex items-start gap-3 text-left w-full">
                  <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Chính sách bảo mật</p>
                    <p className="text-sm text-gray-600">Cách chúng tôi bảo vệ dữ liệu của bạn</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Cần hỗ trợ khẩn cấp?</p>
                <p className="text-sm text-gray-600 mb-3">
                  Liên hệ hotline: <strong className="text-orange-600">1900-xxxx</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Email: <strong className="text-orange-600">support@shop.com</strong>
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
