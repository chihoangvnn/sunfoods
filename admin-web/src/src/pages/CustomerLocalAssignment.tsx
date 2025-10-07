import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Users, Search, Filter, UserCheck, UserX, Save, X, Globe, Home } from "lucide-react";

// TypeScript interfaces
interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: string;
  total_debt: number;
  credit_limit: number;
  join_date: string;
  membership_tier: string;
  total_spent: number;
  points_balance: number;
  is_local_customer: boolean;
  membership_data?: any;
  social_account_ids?: string[];
  social_data?: any;
  limits_data?: any;
}

interface CustomerFilter {
  search: string;
  membershipTier: string;
  localStatus: string;
  sortBy: string;
}

export default function CustomerLocalAssignment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>("");
  
  const [filters, setFilters] = useState<CustomerFilter>({
    search: "",
    membershipTier: "all",
    localStatus: "all",
    sortBy: "name"
  });

  // Fetch all customers
  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: async (): Promise<Customer[]> => {
      const response = await fetch("/api/customers");
      if (!response.ok) throw new Error("Failed to fetch customers");
      return await response.json();
    }
  });

  // Update customer local status mutation
  const updateLocalStatusMutation = useMutation({
    mutationFn: async ({ customerId, isLocal }: { customerId: string; isLocal: boolean }) => {
      const response = await fetch(`/api/customers/${customerId}/local-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_local_customer: isLocal })
      });
      if (!response.ok) throw new Error("Failed to update customer local status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({
        title: "✅ Status Updated",
        description: "Customer local status updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Bulk update customers mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ customerIds, isLocal }: { customerIds: string[]; isLocal: boolean }) => {
      const promises = customerIds.map(customerId =>
        fetch(`/api/customers/${customerId}/local-status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_local_customer: isLocal })
        })
      );
      
      const responses = await Promise.all(promises);
      const failedUpdates = responses.filter(r => !r.ok);
      
      if (failedUpdates.length > 0) {
        throw new Error(`Failed to update ${failedUpdates.length} customers`);
      }
      
      return responses.length;
    },
    onSuccess: (updatedCount) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setSelectedCustomers(new Set());
      setBulkAction("");
      toast({
        title: "✅ Bulk Update Complete",
        description: `Successfully updated ${updatedCount} customers`
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Bulk Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleToggleLocalStatus = (customerId: string, currentStatus: boolean) => {
    updateLocalStatusMutation.mutate({
      customerId,
      isLocal: !currentStatus
    });
  };

  const handleCustomerSelect = (customerId: string, checked: boolean) => {
    const newSelected = new Set(selectedCustomers);
    if (checked) {
      newSelected.add(customerId);
    } else {
      newSelected.delete(customerId);
    }
    setSelectedCustomers(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(new Set(filteredCustomers.map(c => c.id)));
    } else {
      setSelectedCustomers(new Set());
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedCustomers.size === 0) {
      toast({
        title: "❌ Invalid Action",
        description: "Please select customers and choose an action",
        variant: "destructive"
      });
      return;
    }

    const isLocal = bulkAction === "set_local";
    bulkUpdateMutation.mutate({
      customerIds: Array.from(selectedCustomers),
      isLocal
    });
  };

  // Filter and sort customers
  const filteredCustomers = customers
    .filter(customer => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          customer.name.toLowerCase().includes(searchLower) ||
          customer.email.toLowerCase().includes(searchLower) ||
          (customer.phone && customer.phone.includes(filters.search));
        if (!matchesSearch) return false;
      }

      // Membership tier filter
      if (filters.membershipTier !== "all" && customer.membership_tier !== filters.membershipTier) {
        return false;
      }

      // Local status filter
      if (filters.localStatus === "local" && !customer.is_local_customer) return false;
      if (filters.localStatus === "global" && customer.is_local_customer) return false;

      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "join_date":
          return new Date(b.join_date).getTime() - new Date(a.join_date).getTime();
        case "total_spent":
          return b.total_spent - a.total_spent;
        case "membership_tier":
          return a.membership_tier.localeCompare(b.membership_tier);
        default:
          return 0;
      }
    });

  // Statistics
  const stats = {
    total: customers.length,
    local: customers.filter(c => c.is_local_customer).length,
    global: customers.filter(c => !c.is_local_customer).length,
    selected: selectedCustomers.size
  };

  const membershipTiers = ["Đồng", "Bạc", "Vàng", "Kim Cương"];

  if (isLoadingCustomers) {
    return (
      <div className="p-6">
        <div className="text-center">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="text-green-600" />
            Customer Local Assignment
          </h1>
          <p className="text-gray-600 mt-1">
            Manage which customers can access local products (bánh kẹo, đồ ăn dặm)
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users size={18} className="text-blue-600" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Home size={18} className="text-green-600" />
              Local Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.local}</div>
            <div className="text-sm text-gray-600">
              {stats.total > 0 ? Math.round((stats.local / stats.total) * 100) : 0}% of total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe size={18} className="text-blue-600" />
              Global Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.global}</div>
            <div className="text-sm text-gray-600">
              {stats.total > 0 ? Math.round((stats.global / stats.total) * 100) : 0}% of total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter size={18} className="text-purple-600" />
              Selected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.selected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={18} />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search name, email, phone..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="membership-filter">Membership Tier</Label>
              <Select value={filters.membershipTier} onValueChange={(value) => setFilters(prev => ({ ...prev, membershipTier: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  {membershipTiers.map(tier => (
                    <SelectItem key={tier} value={tier}>{tier}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="local-filter">Local Status</Label>
              <Select value={filters.localStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, localStatus: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="local">Local Only</SelectItem>
                  <SelectItem value="global">Global Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sort-filter">Sort By</Label>
              <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="join_date">Join Date</SelectItem>
                  <SelectItem value="total_spent">Total Spent</SelectItem>
                  <SelectItem value="membership_tier">Membership Tier</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedCustomers.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Actions ({selectedCustomers.size} selected)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="bulk-action">Action</Label>
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="set_local">Set as Local Customers</SelectItem>
                    <SelectItem value="set_global">Set as Global Customers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleBulkAction}
                disabled={!bulkAction || bulkUpdateMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                Apply to {selectedCustomers.size} customers
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedCustomers(new Set())}
                className="flex items-center gap-2"
              >
                <X size={16} />
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Customers ({filteredCustomers.length})</span>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedCustomers.size === filteredCustomers.length && filteredCustomers.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Select All</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>No customers found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.has(customer.id)}
                      onChange={(e) => handleCustomerSelect(customer.id, e.target.checked)}
                      className="w-4 h-4"
                    />
                    
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={customer.avatar} />
                      <AvatarFallback>{customer.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{customer.name}</span>
                        <Badge variant="outline">{customer.membership_tier}</Badge>
                        <Badge variant={customer.is_local_customer ? "default" : "secondary"}>
                          {customer.is_local_customer ? "Local" : "Global"}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {customer.email} • {customer.phone || "No phone"} • 
                        Spent: {(customer.total_spent || 0).toLocaleString()}đ
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={customer.is_local_customer}
                      onCheckedChange={() => handleToggleLocalStatus(customer.id, customer.is_local_customer)}
                      disabled={updateLocalStatusMutation.isPending}
                    />
                    <Label className="text-sm">
                      {customer.is_local_customer ? "Local" : "Global"}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}