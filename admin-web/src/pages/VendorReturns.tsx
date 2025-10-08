import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, X } from "lucide-react";

interface VendorReturn {
  id: string;
  vendorName: string;
  orderId: string;
  status: "pending" | "approved" | "rejected";
  reason: string;
  requestedDate: string;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
    approved: { label: "Approved", className: "bg-green-100 text-green-800" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
  };

  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

export default function VendorReturns() {
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: returns = [], isLoading } = useQuery<VendorReturn[]>({
    queryKey: ["/api/vendor/returns", { status: statusFilter !== "all" ? statusFilter : undefined }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/vendor/returns?${params}`);
      if (!response.ok) throw new Error('Failed to fetch returns');
      return response.json();
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (returnId: string) => {
      const response = await fetch(`/api/vendor/returns/${returnId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to approve return");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/returns"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (returnId: string) => {
      const response = await fetch(`/api/vendor/returns/${returnId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to reject return");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/returns"] });
    },
  });

  const handleApprove = (returnId: string) => {
    if (confirm("Are you sure you want to approve this return?")) {
      approveMutation.mutate(returnId);
    }
  };

  const handleReject = (returnId: string) => {
    if (confirm("Are you sure you want to reject this return?")) {
      rejectMutation.mutate(returnId);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendor Returns</h1>
        <p className="text-sm text-gray-500">Manage vendor return requests</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-4">
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Return Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : returns.length > 0 ? (
                returns.map((returnItem) => (
                  <tr key={returnItem.id} className="odd:bg-gray-50 hover:bg-gray-100">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      #{returnItem.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{returnItem.vendorName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      #{returnItem.orderId.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(returnItem.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{returnItem.reason}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(returnItem.requestedDate)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {returnItem.status === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(returnItem.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(returnItem.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                    No return requests found
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
