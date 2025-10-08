import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useIsMobile } from '@/hooks/use-mobile';
import { apiRequest } from '@/lib/queryClient';
import { Search, Plus, Settings, BarChart, Power, PowerOff, Wrench, AlertTriangle, CheckCircle, XCircle, Timer, Users, Activity, RefreshCcw, Scan, Eye, Play, Code, TrendingUp, Shield, Clock, Database, Bolt, FileText, Bug, Monitor } from 'lucide-react';

// Types
interface ApiConfiguration {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  category: string;
  isEnabled: boolean;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  rateLimitEnabled: boolean;
  rateLimitRequests?: number;
  rateLimitWindowSeconds?: number;
  accessCount: number;
  errorCount: number;
  avgResponseTime: string;
  lastAccessed?: string;
  lastToggled?: string;
  lastError?: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
  tags?: string[];
  owner?: string;
  requiresAuth: boolean;
  adminOnly: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiStats {
  total: number;
  enabled: number;
  disabled: number;
  maintenance: number;
  categories: Record<string, number>;
  totalAccess: number;
  totalErrors: number;
  avgResponseTime: number;
}

interface ApiConfigurationsResponse {
  configs: ApiConfiguration[];
  categories: string[];
  total: number;
}

export default function ApiManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const [showScanResults, setShowScanResults] = useState(false);
  
  // Detailed view states
  const [selectedApi, setSelectedApi] = useState<ApiConfiguration | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'testing' | 'metrics' | 'logs' | 'config'>('overview');
  const [testRequest, setTestRequest] = useState({
    method: 'GET',
    headers: '{}',
    body: '',
    queryParams: ''
  });
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // Fetch API configurations
  const { data: configsData, isLoading, error } = useQuery<ApiConfigurationsResponse>({
    queryKey: ['/api/api-configurations'],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  // Fetch statistics
  const { data: stats } = useQuery<ApiStats>({
    queryKey: ['/api/api-configurations/stats/summary'],
    refetchInterval: 30000,
  });

  // Toggle API mutation
  const toggleApiMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      await apiRequest('POST', `/api/api-configurations/${id}/toggle`, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/api-configurations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/api-configurations/stats/summary'] });
    },
  });

  // Clear cache mutation
  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/api-configurations/cache/clear');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/api-configurations'] });
    },
  });

  // API Scanning mutation
  const scanApisMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/scan-apis');
      return response;
    },
    onSuccess: (data) => {
      setScanResults(data);
      setShowScanResults(true);
      queryClient.invalidateQueries({ queryKey: ['/api/api-configurations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/api-configurations/stats/summary'] });
    },
  });

  const configs: ApiConfiguration[] = configsData?.configs || [];
  const categories: string[] = configsData?.categories || [];

  // Filter configurations
  const filteredConfigs = configs.filter((config: ApiConfiguration) => {
    const matchesSearch = config.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         config.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         config.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || config.category === selectedCategory;
    
    const matchesStatus = selectedStatus === 'all' ||
                         (selectedStatus === 'enabled' && config.isEnabled && !config.maintenanceMode) ||
                         (selectedStatus === 'disabled' && !config.isEnabled) ||
                         (selectedStatus === 'maintenance' && config.maintenanceMode);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleToggleApi = async (id: string, currentEnabled: boolean) => {
    await toggleApiMutation.mutateAsync({ id, enabled: !currentEnabled });
  };

  // Handle API detail view
  const handleViewApiDetails = (api: ApiConfiguration) => {
    setSelectedApi(api);
    setShowDetailView(true);
    setActiveDetailTab('overview');
    setTestRequest({
      method: api.method,
      headers: '{}',
      body: '',
      queryParams: ''
    });
  };

  // Handle API testing
  const handleTestApi = async () => {
    if (!selectedApi) return;

    setTestLoading(true);
    setTestResult(null);

    try {
      let url = selectedApi.endpoint;
      
      // Add query parameters if provided
      if (testRequest.queryParams) {
        const params = new URLSearchParams(testRequest.queryParams);
        url += '?' + params.toString();
      }

      let headers: Record<string, string> = {};
      try {
        headers = JSON.parse(testRequest.headers);
      } catch (e) {
        headers = {};
      }

      const response = await apiRequest(
        testRequest.method as any,
        url,
        testRequest.body ? JSON.parse(testRequest.body) : undefined
      );

      const data = await response.text();
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch (e) {
        parsedData = data;
      }

      setTestResult({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: parsedData,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      setTestResult({
        status: 0,
        statusText: 'Error',
        headers: {},
        data: { error: error.message },
        timestamp: new Date().toISOString()
      });
    } finally {
      setTestLoading(false);
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (config: ApiConfiguration) => {
    if (config.maintenanceMode) {
      return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20"><Wrench className="w-3 h-3 mr-1" />Maintenance</Badge>;
    }
    if (!config.isEnabled) {
      return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="w-3 h-3 mr-1" />Disabled</Badge>;
    }
    return <Badge variant="outline" className="bg-success/10 text-success border-success/20"><CheckCircle className="w-3 h-3 mr-1" />Enabled</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      critical: 'destructive',
      high: 'outline',
      normal: 'secondary',
      low: 'outline'
    };
    return <Badge variant={variants[priority as keyof typeof variants] as any}>{priority}</Badge>;
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load API configurations. Please check your connection and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Management</h1>
          <p className="text-muted-foreground">
            Control and monitor your API endpoints in real-time
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => scanApisMutation.mutate()}
            disabled={scanApisMutation.isPending}
            className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
          >
            <Scan className="w-4 h-4 mr-2" />
            {scanApisMutation.isPending ? 'Scanning...' : 'Scan APIs'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => clearCacheMutation.mutate()}
            disabled={clearCacheMutation.isPending}
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Clear Cache
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add API
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total APIs</CardTitle>
              <Activity className="h-4 w-4 text-activity-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.enabled} enabled, {stats.disabled} disabled
              </p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <BarChart className="h-4 w-4 text-activity-pink" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAccess.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalErrors} errors ({((stats.totalErrors / stats.totalAccess) * 100).toFixed(2)}%)
              </p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Timer className="h-4 w-4 text-activity-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.avgResponseTime)}ms</div>
              <p className="text-xs text-muted-foreground">
                Across all endpoints
              </p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance Mode</CardTitle>
              <Wrench className="h-4 w-4 text-activity-coral" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.maintenance}</div>
              <p className="text-xs text-muted-foreground">
                APIs under maintenance
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search APIs by endpoint, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="md:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category: string) => (
                    <SelectItem key={category} value={category}>
                      {category} ({stats?.categories[category] || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:w-48">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Configurations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">API Configurations</CardTitle>
          <CardDescription>
            {filteredConfigs.length} of {configs.length} APIs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Access Count</TableHead>
                    <TableHead className="text-right">Errors</TableHead>
                    <TableHead className="text-right">Avg Time</TableHead>
                    <TableHead>Last Accessed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConfigs.map((config: ApiConfiguration) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-mono text-sm">
                        <div>
                          {config.endpoint}
                          {config.description && (
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {config.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {config.method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{config.category}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(config)}</TableCell>
                      <TableCell>{getPriorityBadge(config.priority)}</TableCell>
                      <TableCell className="text-right font-mono">
                        {config.accessCount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        <span className={config.errorCount > 0 ? 'text-destructive' : ''}>
                          {config.errorCount}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {Math.round(Number(config.avgResponseTime))}ms
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateTime(config.lastAccessed)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={config.isEnabled && !config.maintenanceMode}
                            onCheckedChange={() => handleToggleApi(config.id, config.isEnabled)}
                            disabled={toggleApiMutation.isPending}
                          />
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleViewApiDetails(config)}
                            title="View API Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            title="Quick Test API"
                            onClick={() => {
                              handleViewApiDetails(config);
                              setActiveDetailTab('testing');
                            }}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredConfigs.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  No API configurations found matching your filters.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create API Dialog - Placeholder for now */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New API Configuration</DialogTitle>
            <DialogDescription>
              Configure a new API endpoint for management and monitoring.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              API creation form will be implemented in the next iteration.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCreateDialog(false)}>
              Create API
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scan Results Dialog */}
      <Dialog open={showScanResults} onOpenChange={setShowScanResults}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scan className="w-5 h-5 text-blue-600" />
              API Discovery Results
            </DialogTitle>
            <DialogDescription>
              {scanResults && (
                <div className="space-y-2">
                  <p>Scan completed successfully! Here's what we found:</p>
                  <div className="flex gap-4 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      📊 Total: {scanResults.summary?.totalFound || 0} APIs
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      ✨ New: {scanResults.summary?.newAPIs || 0} APIs
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      📋 Existing: {scanResults.summary?.existingAPIs || 0} APIs
                    </span>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {scanResults && (
            <div className="space-y-4">
              {scanResults.newAPIs && scanResults.newAPIs.length > 0 ? (
                <div>
                  <h3 className="font-semibold text-green-800 mb-3">🆕 Newly Discovered APIs</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {scanResults.newAPIs.map((api: any, index: number) => (
                      <div 
                        key={index} 
                        className="p-3 border rounded-lg bg-green-50 border-green-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                              {api.method}
                            </Badge>
                            <code className="text-sm font-mono">{api.path}</code>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {api.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{api.description}</p>
                        <div className="flex gap-2 mt-2 text-xs text-gray-500">
                          <span>Rate Limit: {api.rateLimit}/min</span>
                          <span>•</span>
                          <span>Active: {api.isActive ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <h3 className="font-semibold text-gray-800">All APIs Already Configured</h3>
                  <p>No new APIs were discovered. Your API Management is up to date!</p>
                </div>
              )}

              {scanResults.discovered && scanResults.discovered.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-800 mb-3">📋 All Discovered APIs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {scanResults.discovered.map((api: any, index: number) => (
                      <div 
                        key={index} 
                        className="p-2 border rounded bg-gray-50 border-gray-200"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {api.method}
                          </Badge>
                          <code className="text-xs font-mono truncate">{api.path}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScanResults(false)}>
              Close
            </Button>
            {scanResults?.newAPIs?.length > 0 && (
              <Button 
                onClick={() => {
                  setShowScanResults(false);
                  // TODO: Auto-add new APIs functionality
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Add New APIs
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🔍 DETAILED API VIEW MODAL */}
      <Dialog open={showDetailView} onOpenChange={setShowDetailView}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col p-0">
          {selectedApi && (
            <>
              {/* Header */}
              <div className="border-b p-6 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
                      <Code className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {selectedApi.method}
                        </Badge>
                        {selectedApi.endpoint}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">{selectedApi.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedApi)}
                    {getPriorityBadge(selectedApi.priority)}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mt-4 bg-gray-100 rounded-lg p-1">
                  {[
                    { id: 'overview', label: 'Overview', icon: Monitor },
                    { id: 'testing', label: 'API Testing', icon: Play },
                    { id: 'metrics', label: 'Metrics', icon: TrendingUp },
                    { id: 'logs', label: 'Logs', icon: FileText },
                    { id: 'config', label: 'Configuration', icon: Settings }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <Button
                        key={tab.id}
                        variant={activeDetailTab === tab.id ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveDetailTab(tab.id as any)}
                        className={`flex items-center gap-2 ${
                          activeDetailTab === tab.id 
                            ? 'bg-white shadow-sm border' 
                            : 'hover:bg-white/50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-6">
                {/* OVERVIEW TAB */}
                {activeDetailTab === 'overview' && (
                  <div className="space-y-6">
                    {/* API Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="border border-blue-200 bg-blue-50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Activity className="h-8 w-8 text-blue-600" />
                            <div>
                              <div className="text-2xl font-bold text-blue-900">
                                {selectedApi.accessCount.toLocaleString()}
                              </div>
                              <div className="text-sm text-blue-700">Total Requests</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-red-200 bg-red-50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Bug className="h-8 w-8 text-red-600" />
                            <div>
                              <div className="text-2xl font-bold text-red-900">
                                {selectedApi.errorCount}
                              </div>
                              <div className="text-sm text-red-700">Error Count</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-green-200 bg-green-50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Clock className="h-8 w-8 text-green-600" />
                            <div>
                              <div className="text-2xl font-bold text-green-900">
                                {Math.round(Number(selectedApi.avgResponseTime))}ms
                              </div>
                              <div className="text-sm text-green-700">Avg Response</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* API Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Basic Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            API Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="font-semibold text-gray-700">Endpoint:</div>
                            <div className="col-span-2 font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                              {selectedApi.endpoint}
                            </div>
                            
                            <div className="font-semibold text-gray-700">Method:</div>
                            <div className="col-span-2">
                              <Badge variant="outline">{selectedApi.method}</Badge>
                            </div>
                            
                            <div className="font-semibold text-gray-700">Category:</div>
                            <div className="col-span-2">
                              <Badge variant="secondary">{selectedApi.category}</Badge>
                            </div>
                            
                            <div className="font-semibold text-gray-700">Auth Required:</div>
                            <div className="col-span-2">
                              {selectedApi.requiresAuth ? (
                                <Badge variant="destructive">Yes</Badge>
                              ) : (
                                <Badge variant="secondary">No</Badge>
                              )}
                            </div>
                            
                            <div className="font-semibold text-gray-700">Admin Only:</div>
                            <div className="col-span-2">
                              {selectedApi.adminOnly ? (
                                <Badge variant="destructive">Yes</Badge>
                              ) : (
                                <Badge variant="secondary">No</Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Rate Limiting */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Rate Limiting
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="font-semibold text-gray-700">Enabled:</div>
                            <div className="col-span-2">
                              {selectedApi.rateLimitEnabled ? (
                                <Badge variant="default" className="bg-green-600">Enabled</Badge>
                              ) : (
                                <Badge variant="outline">Disabled</Badge>
                              )}
                            </div>
                            
                            {selectedApi.rateLimitEnabled && (
                              <>
                                <div className="font-semibold text-gray-700">Requests:</div>
                                <div className="col-span-2">
                                  {selectedApi.rateLimitRequests || 'N/A'} requests
                                </div>
                                
                                <div className="font-semibold text-gray-700">Window:</div>
                                <div className="col-span-2">
                                  {selectedApi.rateLimitWindowSeconds || 'N/A'} seconds
                                </div>
                              </>
                            )}
                            
                            <div className="font-semibold text-gray-700">Last Access:</div>
                            <div className="col-span-2 text-xs text-gray-600">
                              {formatDateTime(selectedApi.lastAccessed)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Tags & Owner */}
                    {(selectedApi.tags || selectedApi.owner) && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Additional Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedApi.tags && (
                              <div>
                                <div className="font-semibold text-gray-700 mb-2">Tags:</div>
                                <div className="flex flex-wrap gap-2">
                                  {selectedApi.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {selectedApi.owner && (
                              <div>
                                <div className="font-semibold text-gray-700 mb-2">Owner:</div>
                                <div className="text-sm">{selectedApi.owner}</div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* TESTING TAB */}
                {activeDetailTab === 'testing' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Play className="h-5 w-5" />
                          API Testing Console
                        </CardTitle>
                        <CardDescription>
                          Test this API endpoint with custom parameters and see real-time responses
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Request Configuration */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Method & URL */}
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">HTTP Method</Label>
                              <Select 
                                value={testRequest.method} 
                                onValueChange={(value) => setTestRequest(prev => ({ ...prev, method: value }))}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="GET">GET</SelectItem>
                                  <SelectItem value="POST">POST</SelectItem>
                                  <SelectItem value="PUT">PUT</SelectItem>
                                  <SelectItem value="DELETE">DELETE</SelectItem>
                                  <SelectItem value="PATCH">PATCH</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Query Parameters</Label>
                              <Input
                                className="mt-1 font-mono text-sm"
                                placeholder="param1=value1&param2=value2"
                                value={testRequest.queryParams}
                                onChange={(e) => setTestRequest(prev => ({ ...prev, queryParams: e.target.value }))}
                              />
                            </div>
                          </div>

                          {/* Headers */}
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">Headers (JSON)</Label>
                              <textarea
                                className="mt-1 w-full h-20 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                                placeholder='{"Content-Type": "application/json"}'
                                value={testRequest.headers}
                                onChange={(e) => setTestRequest(prev => ({ ...prev, headers: e.target.value }))}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Request Body */}
                        {testRequest.method !== 'GET' && (
                          <div>
                            <Label className="text-sm font-medium">Request Body (JSON)</Label>
                            <textarea
                              className="mt-1 w-full h-32 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                              placeholder='{"key": "value"}'
                              value={testRequest.body}
                              onChange={(e) => setTestRequest(prev => ({ ...prev, body: e.target.value }))}
                            />
                          </div>
                        )}

                        {/* Test Button */}
                        <div className="flex items-center gap-4">
                          <Button 
                            onClick={handleTestApi}
                            disabled={testLoading}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {testLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Testing...
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Send Request
                              </>
                            )}
                          </Button>

                          <div className="text-sm text-gray-600">
                            Target: <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                              {selectedApi.method} {selectedApi.endpoint}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Test Results */}
                    {testResult && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Bolt className="h-5 w-5" />
                            Response
                            <Badge 
                              variant={testResult.status >= 200 && testResult.status < 300 ? "default" : "destructive"}
                              className="ml-2"
                            >
                              {testResult.status} {testResult.statusText}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Response received at {new Date(testResult.timestamp).toLocaleString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Response Headers */}
                            <div>
                              <Label className="text-sm font-semibold">Response Headers</Label>
                              <pre className="mt-1 bg-gray-100 p-3 rounded-lg text-xs font-mono overflow-auto max-h-32">
                                {JSON.stringify(testResult.headers, null, 2)}
                              </pre>
                            </div>

                            {/* Response Body */}
                            <div>
                              <Label className="text-sm font-semibold">Response Body</Label>
                              <pre className="mt-1 bg-gray-100 p-3 rounded-lg text-xs font-mono overflow-auto max-h-64">
                                {typeof testResult.data === 'string' 
                                  ? testResult.data 
                                  : JSON.stringify(testResult.data, null, 2)
                                }
                              </pre>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* METRICS TAB */}
                {activeDetailTab === 'metrics' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Performance Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-gray-500">
                          <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                          <h3 className="font-semibold text-gray-800">Metrics Dashboard</h3>
                          <p>Detailed performance metrics and analytics coming soon!</p>
                          <p className="text-sm mt-2">
                            Will include: Response time charts, error rate graphs, request volume trends, 
                            geographic data, and performance insights.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* LOGS TAB */}
                {activeDetailTab === 'logs' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          API Logs
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                          <h3 className="font-semibold text-gray-800">Request Logs</h3>
                          <p>Real-time API request and error logs coming soon!</p>
                          <p className="text-sm mt-2">
                            Will include: Request/response logs, error traces, access patterns, 
                            and log filtering capabilities.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* CONFIG TAB */}
                {activeDetailTab === 'config' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="h-5 w-5" />
                          API Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-gray-500">
                          <Settings className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                          <h3 className="font-semibold text-gray-800">Configuration Editor</h3>
                          <p>Advanced API configuration editor coming soon!</p>
                          <p className="text-sm mt-2">
                            Will include: Rate limit settings, authentication config, 
                            maintenance mode controls, and advanced options.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}