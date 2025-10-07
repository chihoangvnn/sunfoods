import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Base API URL - sử dụng backend API từ env
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || '/api';

// Types
export interface Vehicle {
  id: string;
  plateNumber: string;
  vehicleType: string;
  model?: string;
  color?: string;
  capacity?: number;
}

export interface Trip {
  id: string;
  vehicleId: string;
  startLocation: string;
  endLocation: string;
  distance?: number;
  estimatedDuration?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  departureWindowStart?: string;
  departureWindowEnd?: string;
  availableSeats?: number;
  pricePerSeat?: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  name?: string;
  quantity: number;
  price: number;
}

export interface DeliveryOrder {
  id: string;
  status: string;
  order: {
    id: string;
    customerId?: string;
    total?: number;
    items?: OrderItem[];
    createdAt?: string;
  };
  driver?: {
    id: string;
    name?: string;
    phone?: string;
    vehicleId?: string;
  };
}

export interface CarGroup {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  groupType?: string;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

export interface DriverDashboard {
  totalTripsToday: number;
  completedTrips: number;
  revenue: number;
}

export interface DeliveryDashboard {
  totalOrders: number;
  totalVehicles: number;
  totalDrivers: number;
  totalRevenue: number;
}

// API Hooks

/**
 * Hook để lấy danh sách xe của tài xế
 */
export function useDriverVehicles() {
  return useQuery<Vehicle[]>({
    queryKey: ['driver-vehicles'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/driver-portal/vehicles`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch vehicles');
      return res.json();
    }
  });
}

/**
 * Hook để tạo xe mới
 */
export function useCreateVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (vehicleData: Omit<Vehicle, 'id'>) => {
      const res = await fetch(`${API_BASE}/driver-portal/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(vehicleData)
      });
      if (!res.ok) throw new Error('Failed to create vehicle');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-vehicles'] });
    }
  });
}

/**
 * Hook để lấy danh sách chuyến đi của tài xế
 */
export function useDriverTrips(status?: string) {
  return useQuery<Trip[]>({
    queryKey: ['driver-trips', status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      
      const res = await fetch(`${API_BASE}/driver-portal/trips?${params}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch trips');
      return res.json();
    }
  });
}

/**
 * Hook để lấy chi tiết một chuyến đi
 */
export function useTripDetails(tripId: string | null) {
  return useQuery<Trip>({
    queryKey: ['trip-details', tripId],
    queryFn: async () => {
      if (!tripId) throw new Error('Trip ID is required');
      const res = await fetch(`${API_BASE}/driver-portal/trips/${tripId}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch trip details');
      return res.json();
    },
    enabled: !!tripId
  });
}

/**
 * Hook để tạo chuyến đi mới
 */
export function useCreateTrip() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tripData: Omit<Trip, 'id' | 'status'>) => {
      const res = await fetch(`${API_BASE}/driver-portal/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(tripData)
      });
      if (!res.ok) throw new Error('Failed to create trip');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-trips'] });
    }
  });
}

/**
 * Hook để cập nhật trạng thái chuyến đi
 */
export function useUpdateTripStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ tripId, status }: { tripId: string; status: Trip['status'] }) => {
      const res = await fetch(`${API_BASE}/driver-portal/trips/${tripId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update trip status');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['driver-trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip-details', variables.tripId] });
    }
  });
}

/**
 * Hook để cập nhật thông tin chuyến đi
 */
export function useUpdateTrip() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ tripId, data }: { tripId: string; data: Partial<Trip> }) => {
      const res = await fetch(`${API_BASE}/driver-portal/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update trip');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['driver-trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip-details', variables.tripId] });
    }
  });
}

/**
 * Hook để lấy dashboard của tài xế
 */
export function useDriverDashboard() {
  return useQuery<DriverDashboard>({
    queryKey: ['driver-dashboard'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/driver-portal/dashboard`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      return res.json();
    }
  });
}

/**
 * Hook để lấy danh sách đơn giao hàng (Delivery Management)
 */
export function useDeliveryOrders(status?: string, limit: number = 100) {
  return useQuery<DeliveryOrder[]>({
    queryKey: ['delivery-orders', status, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('limit', limit.toString());
      
      const res = await fetch(`${API_BASE}/delivery-management/delivery-orders?${params}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch delivery orders');
      return res.json();
    }
  });
}

/**
 * Hook để lấy danh sách tất cả xe (Delivery Management)
 */
export function useAllVehicles() {
  return useQuery<Vehicle[]>({
    queryKey: ['all-vehicles'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/delivery-management/vehicles`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch all vehicles');
      return res.json();
    }
  });
}

/**
 * Hook để lấy danh sách nhóm xe
 */
export function useCarGroups(groupType?: string, isActive?: boolean) {
  return useQuery<CarGroup[]>({
    queryKey: ['car-groups', groupType, isActive],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (groupType) params.append('groupType', groupType);
      if (isActive !== undefined) params.append('isActive', isActive.toString());
      
      const res = await fetch(`${API_BASE}/delivery-management/car-groups?${params}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch car groups');
      return res.json();
    }
  });
}

/**
 * Hook để lấy chi tiết một nhóm xe
 */
export function useCarGroupDetails(groupId: string | null) {
  return useQuery<CarGroup>({
    queryKey: ['car-group-details', groupId],
    queryFn: async () => {
      if (!groupId) throw new Error('Group ID is required');
      const res = await fetch(`${API_BASE}/delivery-management/car-groups/${groupId}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch car group details');
      return res.json();
    },
    enabled: !!groupId
  });
}

/**
 * Hook để tạo nhóm xe mới
 */
export function useCreateCarGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (groupData: Omit<CarGroup, 'id'>) => {
      const res = await fetch(`${API_BASE}/delivery-management/car-groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(groupData)
      });
      if (!res.ok) throw new Error('Failed to create car group');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['car-groups'] });
    }
  });
}

/**
 * Hook để cập nhật nhóm xe
 */
export function useUpdateCarGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ groupId, data }: { groupId: string; data: Partial<CarGroup> }) => {
      const res = await fetch(`${API_BASE}/delivery-management/car-groups/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update car group');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['car-groups'] });
      queryClient.invalidateQueries({ queryKey: ['car-group-details', variables.groupId] });
    }
  });
}

/**
 * Hook để xóa nhóm xe
 */
export function useDeleteCarGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (groupId: string) => {
      const res = await fetch(`${API_BASE}/delivery-management/car-groups/${groupId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to delete car group');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['car-groups'] });
    }
  });
}

/**
 * Hook để gán xe vào nhóm
 */
export function useAddVehicleToGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ groupId, vehicleId, notes }: { groupId: string; vehicleId: string; notes?: string }) => {
      const res = await fetch(`${API_BASE}/delivery-management/car-groups/${groupId}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ vehicleId, notes })
      });
      if (!res.ok) throw new Error('Failed to add vehicle to group');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['car-group-details', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['all-vehicles'] });
    }
  });
}

/**
 * Hook để gỡ xe khỏi nhóm
 */
export function useRemoveVehicleFromGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ groupId, vehicleId }: { groupId: string; vehicleId: string }) => {
      const res = await fetch(`${API_BASE}/delivery-management/car-groups/${groupId}/vehicles/${vehicleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to remove vehicle from group');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['car-group-details', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['all-vehicles'] });
    }
  });
}

/**
 * Hook để lấy dashboard delivery management
 */
export function useDeliveryDashboard() {
  return useQuery<DeliveryDashboard>({
    queryKey: ['delivery-dashboard'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/delivery-management/dashboard`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch delivery dashboard');
      return res.json();
    }
  });
}

// Alias exports for easier import (match task spec naming)
export { useDriverVehicles as useVehicles, useDriverTrips as useTrips };
