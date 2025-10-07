import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Truck, 
  User, 
  Car, 
  MapPin, 
  AlertCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Phone,
  Mail,
  Package
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  membershipData?: {
    totalDeliveries?: number;
  };
}

interface Vehicle {
  id: string;
  licensePlate: string;
  type: string;
  driverId: string;
  driverName?: string;
  capacity: number;
  status: string;
}

interface Trip {
  id: string;
  customerName?: string;
  vehicleId: string;
  deliveryAddress: string;
  status: string;
  scheduledTime: string;
  driverId: string;
}

export default function DriverManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("drivers");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [tripDialogOpen, setTripDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  
  const [newVehicle, setNewVehicle] = useState({
    licensePlate: "",
    type: "",
    capacity: 0,
    driverId: "",
  });
  
  const [newTrip, setNewTrip] = useState({
    customerName: "",
    vehicleId: "",
    deliveryAddress: "",
    scheduledTime: "",
  });

  const { data: drivers, isLoading: driversLoading } = useQuery<Driver[]>({
    queryKey: ["drivers"],
    queryFn: async () => {
      const res = await fetch("/api/customers", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch drivers");
      const customers = await res.json();
      return customers.filter((c: any) => {
        const roles = c.customerRoles || [];
        return roles.includes('driver') || c.customerRole === 'driver';
      });
    },
  });

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const res = await fetch("/api/driver-portal/vehicles", {
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          return [];
        }
        throw new Error("Failed to fetch vehicles");
      }
      const data = await res.json();
      const vehiclesData = Array.isArray(data) ? data : [];
      
      const driversMap = new Map(drivers?.map(d => [d.id, d.name]) || []);
      return vehiclesData.map((v: any) => ({
        ...v,
        driverName: driversMap.get(v.driverId) || 'Unknown'
      }));
    },
    enabled: !!drivers,
  });

  const { data: trips, isLoading: tripsLoading } = useQuery<Trip[]>({
    queryKey: ["trips"],
    queryFn: async () => {
      const res = await fetch("/api/driver-portal/trips", {
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          return [];
        }
        throw new Error("Failed to fetch trips");
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const createVehicleMutation = useMutation({
    mutationFn: async (vehicleData: typeof newVehicle) => {
      const res = await fetch("/api/driver-portal/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(vehicleData),
      });
      if (!res.ok) throw new Error("Failed to create vehicle");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setVehicleDialogOpen(false);
      setNewVehicle({ licensePlate: "", type: "", capacity: 0, driverId: "" });
      toast({
        title: "Thành công",
        description: "Xe đã được thêm thành công",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm xe",
        variant: "destructive",
      });
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: async (vehicleId: string) => {
      const res = await fetch(`/api/driver-portal/vehicles/${vehicleId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete vehicle");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast({
        title: "Thành công",
        description: "Xe đã được xóa",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa xe",
        variant: "destructive",
      });
    },
  });

  const createTripMutation = useMutation({
    mutationFn: async (tripData: typeof newTrip) => {
      const res = await fetch("/api/driver-portal/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(tripData),
      });
      if (!res.ok) throw new Error("Failed to create trip");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      setTripDialogOpen(false);
      setNewTrip({ customerName: "", vehicleId: "", deliveryAddress: "", scheduledTime: "" });
      toast({
        title: "Thành công",
        description: "Chuyến đi đã được tạo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo chuyến đi",
        variant: "destructive",
      });
    },
  });

  const updateTripStatusMutation = useMutation({
    mutationFn: async ({ tripId, status }: { tripId: string; status: string }) => {
      const res = await fetch(`/api/driver-portal/trips/${tripId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update trip status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast({
        title: "Thành công",
        description: "Trạng thái chuyến đi đã được cập nhật",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái",
        variant: "destructive",
      });
    },
  });

  const filteredDrivers = drivers?.filter(driver => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      driver.name.toLowerCase().includes(term) ||
      driver.phone.includes(term) ||
      (driver.email && driver.email.toLowerCase().includes(term))
    );
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'completed':
        return 'default';
      case 'scheduled':
        return 'secondary';
      case 'in_progress':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getTripStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'in_progress':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  if (driversLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-500/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Quản lý Tài xế & Giao hàng
            </h1>
            <p className="text-muted-foreground mt-1">
              Quản lý tài xế, phương tiện và chuyến giao hàng
            </p>
          </div>
          <Badge variant="secondary" className="text-sm bg-blue-500/10 text-blue-600 border-blue-500/20">
            <Truck className="h-3 w-3 mr-1" />
            Driver Management
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="drivers" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Tài xế
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Phương tiện
            </TabsTrigger>
            <TabsTrigger value="trips" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Chuyến đi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="drivers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Danh sách Tài xế</CardTitle>
                <CardDescription>
                  Quản lý tài xế giao hàng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm theo tên, số điện thoại..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {filteredDrivers && filteredDrivers.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tên</TableHead>
                          <TableHead>Số điện thoại</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Tổng giao hàng</TableHead>
                          <TableHead>Trạng thái</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDrivers.map((driver) => (
                          <TableRow key={driver.id} className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-500" />
                                {driver.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                {driver.phone}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                {driver.email || "N/A"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Package className="h-3 w-3 text-muted-foreground" />
                                {driver.membershipData?.totalDeliveries || 0}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(driver.status)}>
                                {driver.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>Không tìm thấy tài xế nào</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Danh sách Phương tiện</CardTitle>
                  <CardDescription>
                    Quản lý xe giao hàng
                  </CardDescription>
                </div>
                <Button onClick={() => setVehicleDialogOpen(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm xe
                </Button>
              </CardHeader>
              <CardContent>
                {vehiclesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : vehicles && vehicles.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Biển số xe</TableHead>
                          <TableHead>Loại xe</TableHead>
                          <TableHead>Tài xế</TableHead>
                          <TableHead>Sức chứa</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vehicles.map((vehicle) => (
                          <TableRow key={vehicle.id}>
                            <TableCell className="font-medium">
                              {vehicle.licensePlate}
                            </TableCell>
                            <TableCell className="capitalize">{vehicle.type}</TableCell>
                            <TableCell>{vehicle.driverName}</TableCell>
                            <TableCell>{vehicle.capacity} kg</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(vehicle.status)}>
                                {vehicle.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingVehicle(vehicle);
                                  setVehicleDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteVehicleMutation.mutate(vehicle.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Car className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>Chưa có phương tiện nào</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trips" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Danh sách Chuyến đi</CardTitle>
                  <CardDescription>
                    Quản lý chuyến giao hàng
                  </CardDescription>
                </div>
                <Button onClick={() => setTripDialogOpen(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo chuyến đi
                </Button>
              </CardHeader>
              <CardContent>
                {tripsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : trips && trips.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Khách hàng</TableHead>
                          <TableHead>Xe</TableHead>
                          <TableHead>Địa chỉ giao</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Thời gian</TableHead>
                          <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trips.map((trip) => (
                          <TableRow key={trip.id}>
                            <TableCell className="font-medium">
                              {trip.customerName || "N/A"}
                            </TableCell>
                            <TableCell>
                              {vehicles?.find(v => v.id === trip.vehicleId)?.licensePlate || "N/A"}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {trip.deliveryAddress}
                            </TableCell>
                            <TableCell>
                              <Badge className={getTripStatusColor(trip.status)}>
                                {trip.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(trip.scheduledTime).toLocaleString('vi-VN')}
                            </TableCell>
                            <TableCell className="text-right">
                              <Select
                                value={trip.status}
                                onValueChange={(status) => 
                                  updateTripStatusMutation.mutate({ tripId: trip.id, status })
                                }
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="scheduled">Đã lên lịch</SelectItem>
                                  <SelectItem value="in_progress">Đang giao</SelectItem>
                                  <SelectItem value="completed">Hoàn thành</SelectItem>
                                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>Chưa có chuyến đi nào</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={vehicleDialogOpen} onOpenChange={setVehicleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingVehicle ? "Sửa xe" : "Thêm xe mới"}</DialogTitle>
              <DialogDescription>
                Nhập thông tin xe giao hàng
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="licensePlate">Biển số xe</Label>
                <Input
                  id="licensePlate"
                  value={newVehicle.licensePlate}
                  onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                  placeholder="VD: 29A-12345"
                />
              </div>
              <div>
                <Label htmlFor="type">Loại xe</Label>
                <Select
                  value={newVehicle.type}
                  onValueChange={(value) => setNewVehicle({ ...newVehicle, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại xe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motorcycle">Xe máy</SelectItem>
                    <SelectItem value="van">Xe van</SelectItem>
                    <SelectItem value="truck">Xe tải</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="capacity">Sức chứa (kg)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newVehicle.capacity}
                  onChange={(e) => setNewVehicle({ ...newVehicle, capacity: parseInt(e.target.value) || 0 })}
                  placeholder="100"
                />
              </div>
              <div>
                <Label htmlFor="driverId">Tài xế</Label>
                <Select
                  value={newVehicle.driverId}
                  onValueChange={(value) => setNewVehicle({ ...newVehicle, driverId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tài xế" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers?.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name} - {driver.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setVehicleDialogOpen(false);
                  setEditingVehicle(null);
                  setNewVehicle({ licensePlate: "", type: "", capacity: 0, driverId: "" });
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={() => createVehicleMutation.mutate(newVehicle)}
                disabled={!newVehicle.licensePlate || !newVehicle.type || !newVehicle.driverId}
              >
                {editingVehicle ? "Cập nhật" : "Thêm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={tripDialogOpen} onOpenChange={setTripDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo chuyến đi mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin chuyến giao hàng
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerName">Tên khách hàng</Label>
                <Input
                  id="customerName"
                  value={newTrip.customerName}
                  onChange={(e) => setNewTrip({ ...newTrip, customerName: e.target.value })}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <Label htmlFor="vehicleId">Xe giao hàng</Label>
                <Select
                  value={newTrip.vehicleId}
                  onValueChange={(value) => setNewTrip({ ...newTrip, vehicleId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn xe" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles?.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.licensePlate} - {vehicle.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="deliveryAddress">Địa chỉ giao hàng</Label>
                <Input
                  id="deliveryAddress"
                  value={newTrip.deliveryAddress}
                  onChange={(e) => setNewTrip({ ...newTrip, deliveryAddress: e.target.value })}
                  placeholder="123 Đường ABC, Quận 1, TP.HCM"
                />
              </div>
              <div>
                <Label htmlFor="scheduledTime">Thời gian dự kiến</Label>
                <Input
                  id="scheduledTime"
                  type="datetime-local"
                  value={newTrip.scheduledTime}
                  onChange={(e) => setNewTrip({ ...newTrip, scheduledTime: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setTripDialogOpen(false);
                  setNewTrip({ customerName: "", vehicleId: "", deliveryAddress: "", scheduledTime: "" });
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={() => createTripMutation.mutate(newTrip)}
                disabled={!newTrip.customerName || !newTrip.vehicleId || !newTrip.deliveryAddress || !newTrip.scheduledTime}
              >
                Tạo chuyến đi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
