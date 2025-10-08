import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, CheckCircle, X } from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  status: "active" | "pending" | "inactive" | "suspended";
  depositBalance: number;
  totalOrders: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(value);
}

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    active: { label: "Active", className: "bg-green-100 text-green-800" },
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
    inactive: { label: "Inactive", className: "bg-gray-100 text-gray-800" },
    suspended: { label: "Suspended", className: "bg-red-100 text-red-800" },
  };

  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

export default function VendorManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: vendors = [], isLoading } = useQuery<Vendor[]>({
    queryKey: ["/api/admin/vendors", { status: statusFilter !== "all" ? statusFilter : undefined, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/admin/vendors?${params}`);
      if (!response.ok) throw new Error('Failed to fetch vendors');
      return response.json();
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (vendorId: string) => {
      const response = await fetch(`/api/admin/vendors/${vendorId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to approve vendor");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendors"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ vendorId, reason }: { vendorId: string; reason: string }) => {
      const response = await fetch(`/api/admin/vendors/${vendorId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error("Failed to reject vendor");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendors"] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ vendorId, status }: { vendorId: string; status: string }) => {
      const response = await fetch(`/api/admin/vendors/${vendorId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendors"] });
    },
  });

  const handleApprove = (vendorId: string) => {
    if (confirm("Are you sure you want to approve this vendor?")) {
      approveMutation.mutate(vendorId);
    }
  };

  const handleReject = (vendorId: string) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      rejectMutation.mutate({ vendorId, reason });
    }
  };

  const handleStatusChange = (vendorId: string, newStatus: string) => {
    statusMutation.mutate({ vendorId, status: newStatus });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
        <p className="text-sm text-gray-500">Manage vendor accounts and approvals</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Vendors</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deposit Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : vendors.length > 0 ? (
                vendors.map((vendor) => (
                  <tr key={vendor.id} className="odd:bg-gray-50 hover:bg-gray-100">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{vendor.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{vendor.contact}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{vendor.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{vendor.phone}</td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(vendor.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(vendor.depositBalance)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{vendor.totalOrders}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {vendor.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(vendor.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(vendor.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                            >
                              <X className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        )}
                        {vendor.status !== "pending" && (
                          <select
                            value={vendor.status}
                            onChange={(e) => handleStatusChange(vendor.id, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        )}
                        <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                    No vendors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
