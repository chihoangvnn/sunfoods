'use client'

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Car, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { useVehicles, useCreateVehicle, Vehicle } from "@/ride-sharing/hooks/useRideSharingApi";

// Adapter function to convert API Vehicle to display format
function mapVehicleToDisplay(vehicle: Vehicle) {
  return {
    id: vehicle.id,
    licensePlate: vehicle.plateNumber,
    model: vehicle.model || vehicle.vehicleType,
    seatType: vehicle.capacity || 4,
    imageUrl: null
  };
}

const mockVehicles = [
  {
    id: "1",
    licensePlate: "92A-123.45",
    model: "Toyota Innova",
    seatType: 7,
    imageUrl: null
  },
  {
    id: "2",
    licensePlate: "92B-456.78",
    model: "Mazda CX-5",
    seatType: 4,
    imageUrl: null
  }
];

export default function MyVehicles() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [licensePlate, setLicensePlate] = useState("");
  const [model, setModel] = useState("");
  const [seatType, setSeatType] = useState("");

  // Fetch vehicles from API
  const { data: apiVehicles, isLoading, isError } = useVehicles();
  const createVehicle = useCreateVehicle();

  // Convert API vehicles to display format and use as data source
  const mappedApiVehicles = apiVehicles && apiVehicles.length > 0 
    ? apiVehicles.map(mapVehicleToDisplay)
    : [];
  
  // Use API data if available, otherwise fallback to mock
  const vehicles = mappedApiVehicles.length > 0 ? mappedApiVehicles : mockVehicles;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!licensePlate || !model || !seatType) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive"
      });
      return;
    }

    try {
      await createVehicle.mutateAsync({
        plateNumber: licensePlate,
        vehicleType: `${parseInt(seatType)} chỗ`,
        model,
        capacity: parseInt(seatType)
      });

      toast({
        title: "Thành công",
        description: "Xe đã được thêm vào danh sách",
      });

      setLicensePlate("");
      setModel("");
      setSeatType("");
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm xe. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (vehicleId: string) => {
    toast({
      title: "Chức năng chưa khả dụng",
      description: "Chức năng xóa xe sẽ được bổ sung trong phiên bản sau.",
      variant: "default"
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Đang tải danh sách xe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Show error message if API failed */}
      {isError && (
        <Card className="p-4 border-yellow-500 bg-yellow-50">
          <p className="text-sm text-yellow-800">
            ⚠️ Không thể tải dữ liệu từ server. Đang hiển thị dữ liệu mẫu.
          </p>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Xe của tôi</h1>
          <p className="text-muted-foreground">Quản lý các xe dùng để chạy chuyến</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm xe mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm xe mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="plate">Biển số xe</Label>
                <Input
                  id="plate"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  placeholder="92A-123.45"
                />
              </div>

              <div>
                <Label htmlFor="model">Tên xe, đời xe</Label>
                <Input
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Toyota Innova 2020"
                />
              </div>

              <div>
                <Label htmlFor="seats">Loại xe</Label>
                <Select value={seatType} onValueChange={setSeatType}>
                  <SelectTrigger id="seats">
                    <SelectValue placeholder="Chọn loại xe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 chỗ</SelectItem>
                    <SelectItem value="7">7 chỗ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={createVehicle.isPending}>
                {createVehicle.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang thêm...
                  </>
                ) : (
                  "Thêm xe"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map(vehicle => (
          <Card key={vehicle.id} className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Car className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{vehicle.model}</h3>
                  <p className="text-sm text-muted-foreground">{vehicle.licensePlate}</p>
                </div>
              </div>
            </div>

            <Badge variant="secondary">
              {vehicle.seatType} chỗ
            </Badge>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Edit className="h-4 w-4 mr-1" />
                Sửa
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-destructive hover:text-destructive"
                onClick={() => handleDelete(vehicle.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Xóa
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {vehicles.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">
          Bạn chưa thêm xe nào. Thêm xe để bắt đầu tạo chuyến.
        </Card>
      )}
    </div>
  );
}
