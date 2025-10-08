import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Users, 
  Shield, 
  Database, 
  Globe,
  Eye,
  Trash2,
  BarChart,
  Activity,
  Clock,
  Plus,
  RefreshCw,
  Edit,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '../hooks/use-debounce';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface CookieProfile {
  id: string;
  userId: string;
  socialNetwork: string;
  groupTag: string;
  accountName: string;
  encryptedData: string;
  lastUsed?: string;
  isActive: boolean;
  metadata?: {
    browser?: string;
    userAgent?: string;
    domain?: string;
    cookieCount?: number;
    captureMethod?: 'manual' | 'extension';
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
  version?: number;
  isVerified?: boolean;
  verificationStatus?: string;
  lastVerifiedAt?: string;
  adAccounts?: any;
  hasAdsAccess?: boolean;
}

interface CookieStats {
  totalProfiles: number;
  totalUsers: number;
  profilesByPlatform: { platform: string; count: number }[];
  profilesByGroup: { group: string; count: number }[];
  activeProfiles: number;
  inactiveProfiles: number;
}

interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

interface CreateProfileFormData {
  userId: string;
  socialNetwork: string;
  groupTag: string;
  accountName: string;
  isActive: boolean;
  metadata?: {
    browser?: string;
    userAgent?: string;
    domain?: string;
    cookieCount?: number;
    captureMethod?: 'manual' | 'extension';
    notes?: string;
  };
}

export default function CookieManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<CookieProfile | null>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch cookie profiles with filtering (server-side)
  const { data: profiles = [], isLoading, refetch } = useQuery<CookieProfile[]>({
    queryKey: ['/api/cookie-profiles', debouncedSearchQuery, selectedPlatform, selectedGroup, selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
      if (selectedPlatform !== 'all') params.append('socialNetwork', selectedPlatform);
      if (selectedGroup !== 'all') params.append('groupTag', selectedGroup);
      if (selectedStatus !== 'all') params.append('isActive', selectedStatus);
      
      const response = await fetch(`/api/cookie-profiles?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch cookie profiles');
      return response.json();
    }
  });

  // Fetch statistics
  const { data: stats } = useQuery<CookieStats>({
    queryKey: ['/api/cookie-profiles/stats/summary'],
    queryFn: async () => {
      const response = await fetch('/api/cookie-profiles/stats/summary');
      if (!response.ok) throw new Error('Failed to fetch statistics');
      return response.json();
    }
  });

  // Fetch users for user management
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });

  // Create profile mutation
  const createProfile = useMutation({
    mutationFn: async (profileData: Omit<CookieProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await fetch('/api/cookie-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      if (!response.ok) throw new Error('Failed to create profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cookie-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cookie-profiles/stats/summary'] });
      setIsCreateModalOpen(false);
      toast({
        title: "Thành công",
        description: "Đã tạo hồ sơ cookie mới",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo hồ sơ cookie",
        variant: "destructive",
      });
    }
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CookieProfile> }) => {
      const response = await fetch(`/api/cookie-profiles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cookie-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cookie-profiles/stats/summary'] });
      setEditingProfile(null);
      toast({
        title: "Thành công",
        description: "Đã cập nhật hồ sơ cookie",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật hồ sơ cookie",
        variant: "destructive",
      });
    }
  });

  // Delete profile mutation
  const deleteProfile = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/cookie-profiles/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cookie-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cookie-profiles/stats/summary'] });
      toast({
        title: "Thành công",
        description: "Đã xóa hồ sơ cookie",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa hồ sơ cookie",
        variant: "destructive",
      });
    }
  });

  // Server-side filtering, no client-side filtering needed
  const filteredProfiles = profiles;

  // Get unique values for filters
  const platforms = useMemo(() => {
    const unique = Array.from(new Set(profiles.map(p => p.socialNetwork)));
    return unique.sort();
  }, [profiles]);

  const groups = useMemo(() => {
    const unique = Array.from(new Set(profiles.map(p => p.groupTag)));
    return unique.sort();
  }, [profiles]);

  const handleDeleteProfile = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa hồ sơ cookie này?')) {
      deleteProfile.mutate(id);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedPlatform('all');
    setSelectedGroup('all');
    setSelectedStatus('all');
  };

  const handleEditProfile = (profile: CookieProfile) => {
    setEditingProfile(profile);
  };

  // Mask encrypted data for security (zero-knowledge)
  const maskEncryptedData = (data: string) => {
    if (!data) return 'Không có dữ liệu';
    return `***...***${data.slice(-8)} (${data.length} bytes)`;
  };

  // Create Profile Form Component
  const CreateProfileForm = () => {
    const [formData, setFormData] = useState<CreateProfileFormData>({
      userId: '',
      socialNetwork: '',
      groupTag: '',
      accountName: '',
      isActive: true,
      metadata: {
        captureMethod: 'manual',
        notes: ''
      }
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Note: encryptedData will be provided by Chrome Extension during profile sync
      const profileData = {
        ...formData,
        encryptedData: 'PLACEHOLDER_ENCRYPTED_DATA' // This should be replaced by extension
      };
      createProfile.mutate(profileData);
    };

    return (
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo hồ sơ Cookie mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                value={formData.userId}
                onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                placeholder="Nhập User ID"
                required
              />
            </div>
            <div>
              <Label htmlFor="socialNetwork">Nền tảng</Label>
              <Input
                id="socialNetwork"
                value={formData.socialNetwork}
                onChange={(e) => setFormData(prev => ({ ...prev, socialNetwork: e.target.value }))}
                placeholder="VD: facebook, instagram"
                required
              />
            </div>
            <div>
              <Label htmlFor="groupTag">Nhóm dự án</Label>
              <Input
                id="groupTag"
                value={formData.groupTag}
                onChange={(e) => setFormData(prev => ({ ...prev, groupTag: e.target.value }))}
                placeholder="VD: campaign_2024"
                required
              />
            </div>
            <div>
              <Label htmlFor="accountName">Tên tài khoản</Label>
              <Input
                id="accountName"
                value={formData.accountName}
                onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                placeholder="Tên hiển thị tài khoản"
                required
              />
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 font-medium mb-2">
                <Shield className="h-4 w-4" />
                Bảo mật Zero-Knowledge
              </div>
              <p className="text-sm text-yellow-700">
                Dữ liệu cookie sẽ được mã hóa và upload tự động bởi Chrome Extension. 
                Admin panel không thể xem hoặc chỉnh sửa dữ liệu đã mã hóa.
              </p>
            </div>
            <div>
              <Label htmlFor="notes">Ghi chú</Label>
              <Input
                id="notes"
                value={formData.metadata?.notes || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  metadata: { ...prev.metadata, notes: e.target.value }
                }))}
                placeholder="Ghi chú tùy chọn"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Kích hoạt</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={createProfile.isPending}>
                {createProfile.isPending ? 'Đang tạo...' : 'Tạo hồ sơ'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  // Edit Profile Form Component
  const EditProfileForm = () => {
    const [formData, setFormData] = useState<Partial<CookieProfile>>(editingProfile || {});

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingProfile) {
        updateProfile.mutate({ id: editingProfile.id, updates: formData });
      }
    };

    if (!editingProfile) return null;

    return (
      <Dialog open={!!editingProfile} onOpenChange={() => setEditingProfile(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa hồ sơ Cookie</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-accountName">Tên tài khoản</Label>
              <Input
                id="edit-accountName"
                value={formData.accountName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                placeholder="Tên hiển thị tài khoản"
              />
            </div>
            <div>
              <Label htmlFor="edit-groupTag">Nhóm dự án</Label>
              <Input
                id="edit-groupTag"
                value={formData.groupTag || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, groupTag: e.target.value }))}
                placeholder="VD: campaign_2024"
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Ghi chú</Label>
              <Input
                id="edit-notes"
                value={formData.metadata?.notes || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  metadata: { ...prev.metadata, notes: e.target.value }
                }))}
                placeholder="Ghi chú tùy chọn"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="edit-isActive">Kích hoạt</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditingProfile(null)}>
                Hủy
              </Button>
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Cookie</h1>
          <p className="text-gray-600 mt-1">Quản lý hồ sơ cookie đã mã hóa cho đồng bộ Chrome Extension</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateModalOpen(true)} variant="default">
            <Plus className="h-4 w-4 mr-2" />
            Thêm hồ sơ
          </Button>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="profiles">Hồ sơ Cookie</TabsTrigger>
          <TabsTrigger value="users">Người dùng</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng hồ sơ</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalProfiles || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Hoạt động: {stats?.activeProfiles || 0} | Tạm ngưng: {stats?.inactiveProfiles || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Đang sử dụng hệ thống
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nền tảng</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.profilesByPlatform?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Mạng xã hội khác nhau
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nhóm dự án</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.profilesByGroup?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Nhóm phân loại
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Platform Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Thống kê theo nền tảng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.profilesByPlatform?.map(({ platform, count }) => (
                    <div key={platform} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{platform}</Badge>
                      </div>
                      <div className="text-sm font-medium">{count} hồ sơ</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Thống kê theo nhóm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.profilesByGroup?.map(({ group, count }) => (
                    <div key={group} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{group}</Badge>
                      </div>
                      <div className="text-sm font-medium">{count} hồ sơ</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profiles Tab */}
        <TabsContent value="profiles" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Tìm kiếm và Lọc
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Tìm theo tên tài khoản..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nền tảng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả nền tảng</SelectItem>
                    {platforms.map(platform => (
                      <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhóm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả nhóm</SelectItem>
                    {groups.map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="true">Hoạt động</SelectItem>
                    <SelectItem value="false">Tạm ngưng</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(searchQuery || selectedPlatform !== 'all' || selectedGroup !== 'all' || selectedStatus !== 'all') && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {filteredProfiles.length} / {profiles.length} hồ sơ
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Xóa bộ lọc
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profiles List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Danh sách hồ sơ Cookie ({filteredProfiles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Đang tải...</p>
                </div>
              ) : filteredProfiles.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Không có hồ sơ</h3>
                  <p className="text-gray-500">
                    {profiles.length === 0 ? 'Chưa có hồ sơ cookie nào được tạo.' : 'Không tìm thấy hồ sơ phù hợp với bộ lọc.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProfiles.map((profile) => (
                    <div key={profile.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">{profile.accountName}</h3>
                            <Badge variant="outline">{profile.socialNetwork}</Badge>
                            <Badge variant="secondary">{profile.groupTag}</Badge>
                            <Badge variant={profile.isActive ? "default" : "destructive"}>
                              {profile.isActive ? "Hoạt động" : "Tạm ngưng"}
                            </Badge>
                            {profile.hasAdsAccess && (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                Có ADS
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">User ID:</span> {profile.userId}
                            </div>
                            <div>
                              <span className="font-medium">Dữ liệu:</span> {maskEncryptedData(profile.encryptedData)}
                            </div>
                            <div>
                              <span className="font-medium">Trình duyệt:</span> {profile.metadata?.browser || 'N/A'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(profile.updatedAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                          </div>

                          {profile.metadata?.notes && (
                            <p className="text-sm text-gray-500 mt-2">{profile.metadata.notes}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditProfile(profile)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteProfile(profile.id)}
                            disabled={deleteProfile.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Quản lý người dùng ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có người dùng</h3>
                  <p className="text-gray-500">
                    Chưa có người dùng nào được đăng ký trong hệ thống.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => {
                    const userProfileCount = profiles.filter(p => p.userId === user.id).length;
                    return (
                      <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium text-gray-900">{user.name || user.email}</h3>
                              <Badge variant={user.isActive ? "default" : "destructive"}>
                                {user.isActive ? "Hoạt động" : "Tạm ngưng"}
                              </Badge>
                              <Badge variant="outline">
                                {userProfileCount} hồ sơ
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Email:</span> {user.email}
                              </div>
                              <div>
                                <span className="font-medium">Tham gia:</span> {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                              </div>
                              <div>
                                <span className="font-medium">Lần cuối:</span> {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('vi-VN') : 'Chưa đăng nhập'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              Xem hồ sơ
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Modals */}
      <CreateProfileForm />
      <EditProfileForm />
    </div>
  );
}