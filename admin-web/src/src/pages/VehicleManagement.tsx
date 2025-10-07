import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Car, Search, Plus, AlertCircle, Truck, Bike } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";

interface Vehicle {
  id: string;
  licensePlate: string;
  vehicleType: string;
  brand: string | null;
  model: string | null;
  status: string;
  driverId: string;
  seatingCapacity: number | null;
  cargoCapacity: string | null;
  isVerified: boolean;
}

export default function VehicleManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: vehicles, isLoading, error } = useQuery<Vehicle[]>({
    queryKey: ["delivery-vehicles"],
    queryFn: async () => {
      const res = await fetch('/api/delivery-management/vehicles', {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch vehicles");
      return res.json();
    },
  });

  const filteredVehicles = vehicles?.filter(v => 
    v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'motorcycle':
      case 'bicycle':
        return <Bike className="h-4 w-4" />;
      case 'truck':
      case 'van':
        return <Truck className="h-4 w-4" />;
      default:
        return <Car className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'maintenance':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Maintenance</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message || "Failed to load vehicles"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-500/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Quản lý Phương tiện
            </h1>
            <p className="text-muted-foreground mt-1">
              Danh sách và quản lý tất cả phương tiện
            </p>
          </div>
          <Link href="/driver-management">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Quản lý đầy đủ
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Danh sách phương tiện</CardTitle>
                <CardDescription>
                  Tổng {vehicles?.length || 0} phương tiện trong hệ thống
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo biển số, hãng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Biển số</TableHead>
                  <TableHead>Loại xe</TableHead>
                  <TableHead>Hãng / Model</TableHead>
                  <TableHead>Tải trọng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Xác minh</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles?.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getVehicleIcon(vehicle.vehicleType)}
                        {vehicle.licensePlate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {vehicle.vehicleType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {vehicle.brand && vehicle.model 
                        ? `${vehicle.brand} ${vehicle.model}`
                        : vehicle.brand || vehicle.model || "-"}
                    </TableCell>
                    <TableCell>
                      {vehicle.seatingCapacity ? (
                        <span>{vehicle.seatingCapacity} chỗ</span>
                      ) : vehicle.cargoCapacity ? (
                        <span>{vehicle.cargoCapacity} kg</span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                    <TableCell>
                      {vehicle.isVerified ? (
                        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                          ✓ Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredVehicles?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <Car className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? "Không tìm thấy phương tiện" : "Chưa có phương tiện nào"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Xe hoạt động</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">
                {vehicles?.filter(v => v.status === 'active').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Đang bảo trì</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">
                {vehicles?.filter(v => v.status === 'maintenance').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Đã xác minh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {vehicles?.filter(v => v.isVerified).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
