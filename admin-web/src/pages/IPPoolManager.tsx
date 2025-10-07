import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, RefreshCw, Trash2, Edit2, Power, PowerOff, 
  Wifi, WifiOff, Activity, DollarSign, BarChart3,
  Clock, CheckCircle2, XCircle, AlertCircle, Loader2,
  Settings, TrendingUp, Database, Cloud, Smartphone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Types
interface IPPool {
  id: number;
  name: string;
  type: 'usb-4g' | 'proxy-api' | 'cloud-worker';
  status: 'active' | 'inactive' | 'error';
  currentIp: string | null;
  config: Record<string, any>;
  healthScore: number;
  totalRotations: number;
  lastRotatedAt: Date | null;
  isEnabled: boolean;
  priority: number;
  costPerMonth: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface IPPoolSession {
  id: number;
  ipPoolId: number;
  sessionStart: Date;
  sessionEnd: Date | null;
  ipAddress: string | null;
  postsCount: number;
  successCount: number;
  failCount: number;
  status: 'active' | 'completed' | 'failed';
  metadata: Record<string, any>;
  createdAt: Date;
}

interface IPRotationLog {
  id: number;
  ipPoolId: number;
  oldIp: string | null;
  newIp: string | null;
  rotationReason: string | null;
  rotationMethod: string | null;
  success: boolean;
  errorMessage: string | null;
  metadata: Record<string, any>;
  createdAt: Date;
}

export function IPPoolManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPool, setEditingPool] = useState<IPPool | null>(null);
  const [selectedPoolId, setSelectedPoolId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('pools');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    type: 'usb-4g' as 'usb-4g' | 'proxy-api' | 'cloud-worker',
    currentIp: '',
    priority: 0,
    costPerMonth: '',
    notes: '',
    isEnabled: true,
    config: {} as Record<string, any>
  });

  // Fetch IP Pools
  const { data: pools = [], isLoading: poolsLoading, refetch: refetchPools } = useQuery({
    queryKey: ['ip-pools'],
    queryFn: async () => {
      const res = await fetch('/api/ip-pools');
      if (!res.ok) throw new Error('Failed to fetch IP pools');
      return res.json() as Promise<IPPool[]>;
    },
  });

  // Fetch Sessions for selected pool
  const { data: sessions = [] } = useQuery({
    queryKey: ['ip-pool-sessions', selectedPoolId],
    queryFn: async () => {
      if (!selectedPoolId) return [];
      const res = await fetch(`/api/ip-pools/${selectedPoolId}/sessions`);
      if (!res.ok) throw new Error('Failed to fetch sessions');
      return res.json() as Promise<IPPoolSession[]>;
    },
    enabled: !!selectedPoolId,
  });

  // Fetch Rotation Logs for selected pool
  const { data: rotationLogs = [] } = useQuery({
    queryKey: ['ip-rotation-logs', selectedPoolId],
    queryFn: async () => {
      if (!selectedPoolId) return [];
      const res = await fetch(`/api/ip-pools/${selectedPoolId}/logs?limit=50`);
      if (!res.ok) throw new Error('Failed to fetch rotation logs');
      return res.json() as Promise<IPRotationLog[]>;
    },
    enabled: !!selectedPoolId,
  });

  // Create IP Pool
  const createPoolMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/ip-pools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          costPerMonth: data.costPerMonth ? parseFloat(data.costPerMonth) : null,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create IP pool');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'IP Pool Created',
        description: 'Successfully created new IP pool',
      });
      queryClient.invalidateQueries({ queryKey: ['ip-pools'] });
      setShowCreateModal(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update IP Pool
  const updatePoolMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<typeof formData> }) => {
      const res = await fetch(`/api/ip-pools/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          costPerMonth: data.costPerMonth ? parseFloat(data.costPerMonth as string) : null,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update IP pool');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'IP Pool Updated',
        description: 'Successfully updated IP pool',
      });
      queryClient.invalidateQueries({ queryKey: ['ip-pools'] });
      setEditingPool(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete IP Pool
  const deletePoolMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/ip-pools/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete IP pool');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'IP Pool Deleted',
        description: 'Successfully deleted IP pool',
      });
      queryClient.invalidateQueries({ queryKey: ['ip-pools'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Trigger Rotation
  const rotatePoolMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/ip-pools/${id}/rotate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to rotate IP');
      return res.json();
    },
    onSuccess: (_data, id) => {
      toast({
        title: 'IP Rotation Triggered',
        description: 'IP rotation started successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['ip-pools'] });
      queryClient.invalidateQueries({ queryKey: ['ip-pool-sessions', id] });
      queryClient.invalidateQueries({ queryKey: ['ip-rotation-logs', id] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Helpers
  const resetForm = () => {
    setFormData({
      name: '',
      type: 'usb-4g',
      currentIp: '',
      priority: 0,
      costPerMonth: '',
      notes: '',
      isEnabled: true,
      config: {}
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingPool(null);
    setShowCreateModal(true);
  };

  const openEditModal = (pool: IPPool) => {
    setEditingPool(pool);
    setFormData({
      name: pool.name,
      type: pool.type,
      currentIp: pool.currentIp || '',
      priority: pool.priority,
      costPerMonth: pool.costPerMonth?.toString() || '',
      notes: pool.notes || '',
      isEnabled: pool.isEnabled,
      config: pool.config || {}
    });
    setShowCreateModal(true);
  };

  const handleSubmit = () => {
    if (editingPool) {
      updatePoolMutation.mutate({ id: editingPool.id, data: formData });
    } else {
      createPoolMutation.mutate(formData);
    }
  };

  // Filter pools
  const filteredPools = pools.filter(pool => {
    const matchesSearch = pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pool.currentIp?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || pool.type === filterType;
    const matchesStatus = filterStatus === 'all' || pool.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Dashboard stats
  const stats = {
    total: pools.length,
    active: pools.filter(p => p.status === 'active').length,
    inactive: pools.filter(p => p.status === 'inactive').length,
    error: pools.filter(p => p.status === 'error').length,
    avgHealth: pools.length > 0 ? Math.round(pools.reduce((sum, p) => sum + p.healthScore, 0) / pools.length) : 0,
    totalCost: pools.reduce((sum, p) => sum + (p.costPerMonth || 0), 0),
    totalRotations: pools.reduce((sum, p) => sum + p.totalRotations, 0),
  };

  // Type icons
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'usb-4g': return <Smartphone className="h-4 w-4" />;
      case 'proxy-api': return <Cloud className="h-4 w-4" />;
      case 'cloud-worker': return <Database className="h-4 w-4" />;
      default: return <Wifi className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'destructive' | 'secondary' | 'outline', icon: any }> = {
      active: { variant: 'default', icon: CheckCircle2 },
      inactive: { variant: 'secondary', icon: AlertCircle },
      error: { variant: 'destructive', icon: XCircle },
    };
    const config = variants[status] || variants.inactive;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">IP Pool Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage IP sources for safe multi-fanpage posting
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchPools()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add IP Pool
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} active, {stats.inactive} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(stats.avgHealth)}`}>
              {stats.avgHealth}%
            </div>
            <p className="text-xs text-muted-foreground">Overall system health</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Rotations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRotations}</div>
            <p className="text-xs text-muted-foreground">All-time IP changes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCost.toLocaleString()} VNĐ</div>
            <p className="text-xs text-muted-foreground">Total infrastructure cost</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pools">IP Pools</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="logs">Rotation Logs</TabsTrigger>
        </TabsList>

        {/* IP Pools Tab */}
        <TabsContent value="pools" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search pools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="usb-4g">USB 4G</SelectItem>
                <SelectItem value="proxy-api">Proxy API</SelectItem>
                <SelectItem value="cloud-worker">Cloud Worker</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current IP</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Rotations</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Cost/Month</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {poolsLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredPools.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No IP pools found. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPools.map((pool) => (
                    <TableRow key={pool.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(pool.type)}
                          {pool.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{pool.type}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(pool.status)}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {pool.currentIp || <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${getHealthColor(pool.healthScore)}`}>
                          {pool.healthScore}%
                        </span>
                      </TableCell>
                      <TableCell>{pool.totalRotations}</TableCell>
                      <TableCell>{pool.priority}</TableCell>
                      <TableCell>
                        {pool.costPerMonth ? `${pool.costPerMonth.toLocaleString()} VNĐ` : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => rotatePoolMutation.mutate(pool.id)}
                            disabled={rotatePoolMutation.isPending}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(pool)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Delete this IP pool?')) {
                                deletePoolMutation.mutate(pool.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <div className="flex gap-4">
            <Select
              value={selectedPoolId?.toString() || ''}
              onValueChange={(val) => setSelectedPoolId(val ? parseInt(val) : null)}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select IP pool" />
              </SelectTrigger>
              <SelectContent>
                {pools.map((pool) => (
                  <SelectItem key={pool.id} value={pool.id.toString()}>
                    {pool.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPoolId && (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session Start</TableHead>
                    <TableHead>Session End</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Posts</TableHead>
                    <TableHead>Success</TableHead>
                    <TableHead>Failed</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No sessions found for this pool
                      </TableCell>
                    </TableRow>
                  ) : (
                    sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>{new Date(session.sessionStart).toLocaleString()}</TableCell>
                        <TableCell>
                          {session.sessionEnd ? new Date(session.sessionEnd).toLocaleString() : 'Active'}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{session.ipAddress || '-'}</TableCell>
                        <TableCell>{session.postsCount}</TableCell>
                        <TableCell className="text-green-600">{session.successCount}</TableCell>
                        <TableCell className="text-red-600">{session.failCount}</TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* Rotation Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <div className="flex gap-4">
            <Select
              value={selectedPoolId?.toString() || ''}
              onValueChange={(val) => setSelectedPoolId(val ? parseInt(val) : null)}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select IP pool" />
              </SelectTrigger>
              <SelectContent>
                {pools.map((pool) => (
                  <SelectItem key={pool.id} value={pool.id.toString()}>
                    {pool.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPoolId && (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Old IP</TableHead>
                    <TableHead>New IP</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rotationLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No rotation logs found for this pool
                      </TableCell>
                    </TableRow>
                  ) : (
                    rotationLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                        <TableCell className="font-mono text-sm">{log.oldIp || '-'}</TableCell>
                        <TableCell className="font-mono text-sm">{log.newIp || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.rotationMethod || 'manual'}</Badge>
                        </TableCell>
                        <TableCell>{log.rotationReason || '-'}</TableCell>
                        <TableCell>
                          {log.success ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Success
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Failed
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPool ? 'Edit IP Pool' : 'Create IP Pool'}</DialogTitle>
            <DialogDescription>
              {editingPool ? 'Update IP pool configuration' : 'Add a new IP source for posting'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., USB 4G Primary"
              />
            </div>

            <div>
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usb-4g">USB 4G Dongle (~1M VNĐ/month)</SelectItem>
                  <SelectItem value="proxy-api">Proxy API (~7-12M VNĐ/month)</SelectItem>
                  <SelectItem value="cloud-worker">Cloud Worker (Vercel/Railway)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currentIp">Current IP</Label>
              <Input
                id="currentIp"
                value={formData.currentIp}
                onChange={(e) => setFormData({ ...formData, currentIp: e.target.value })}
                placeholder="e.g., 123.45.67.89"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="cost">Cost/Month (VNĐ)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={formData.costPerMonth}
                  onChange={(e) => setFormData({ ...formData, costPerMonth: e.target.value })}
                  placeholder="e.g., 1000000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional information..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="enabled"
                checked={formData.isEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: !!checked })}
              />
              <Label htmlFor="enabled" className="cursor-pointer">Enable this IP pool</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || createPoolMutation.isPending || updatePoolMutation.isPending}
            >
              {createPoolMutation.isPending || updatePoolMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                editingPool ? 'Update Pool' : 'Create Pool'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
