'use client'

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Car, MapPin, Clock, Users, DollarSign, Loader2 } from "lucide-react";
import { mockVehicles } from "@/ride-sharing/mockData";
import { useVehicles, useCreateTrip, Vehicle } from "@/ride-sharing/hooks/useRideSharingApi";

// Unified display vehicle type
type DisplayVehicle = {
  id: string;
  model: string;
  seatType: number;
  licensePlate: string;
};

// Adapter to convert API Vehicle to display format
function mapVehicleToDisplay(vehicle: Vehicle | typeof mockVehicles[0]): DisplayVehicle {
  if ('plateNumber' in vehicle) {
    // API Vehicle
    return {
      id: vehicle.id,
      model: vehicle.model || vehicle.vehicleType || "Xe",
      seatType: vehicle.capacity || 4,
      licensePlate: vehicle.plateNumber
    };
  } else {
    // Mock Vehicle
    return {
      id: vehicle.id,
      model: vehicle.model,
      seatType: vehicle.seatType,
      licensePlate: vehicle.licensePlate
    };
  }
}

export default function CreateTrip() {
  const { toast } = useToast();
  
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  const getCurrentHour = () => {
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    nextHour.setMinutes(0, 0, 0);
    return nextHour.toTimeString().slice(0, 5);
  };

  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [departureDate, setDepartureDate] = useState(getTodayDate());
  const [departureTime, setDepartureTime] = useState(getCurrentHour());
  const [seatsToSell, setSeatsToSell] = useState("");
  const [pricePerSeat, setPricePerSeat] = useState("");

  // Fetch vehicles from API
  const { data: apiVehicles } = useVehicles();
  const createTrip = useCreateTrip();

  // Map all vehicles to display format
  const mappedApiVehicles = apiVehicles && apiVehicles.length > 0 
    ? apiVehicles.map(mapVehicleToDisplay)
    : [];
  const mappedMockVehicles = mockVehicles.map(mapVehicleToDisplay);

  // Use API vehicles or fallback to mock
  const vehicles = mappedApiVehicles.length > 0 ? mappedApiVehicles : mappedMockVehicles;
  const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle);

  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(vehicles[0].id);
    }
  }, [vehicles, selectedVehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVehicle || !startLocation || !endLocation || !departureDate || 
        !departureTime || !seatsToSell || !pricePerSeat) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive"
      });
      return;
    }

    const maxSeats = selectedVehicleData?.seatType || 0;
    if (parseInt(seatsToSell) > maxSeats) {
      toast({
        title: "Lỗi",
        description: `Số ghế không được vượt quá ${maxSeats} chỗ`,
        variant: "destructive"
      });
      return;
    }

    try {
      const departureDateTime = new Date(`${departureDate}T${departureTime}:00`).toISOString();

      await createTrip.mutateAsync({
        vehicleId: selectedVehicle,
        startLocation,
        endLocation,
        departureWindowStart: departureDateTime,
        departureWindowEnd: departureDateTime,
        availableSeats: parseInt(seatsToSell),
        pricePerSeat: parseInt(pricePerSeat)
      });

      toast({
        title: "Thành công",
        description: "Chuyến xe đã được tạo và xuất hiện trên bảng chờ trực tuyến",
      });

      if (vehicles.length > 0) {
        setSelectedVehicle(vehicles[0].id);
      }
      setStartLocation("");
      setEndLocation("");
      setDepartureDate(getTodayDate());
      setDepartureTime(getCurrentHour());
      setSeatsToSell("");
      setPricePerSeat("");
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo chuyến xe. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Tạo chuyến xe mới</h1>
        <p className="text-muted-foreground">Đăng chuyến đi của bạn lên bảng chờ trực tuyến</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="vehicle">
              <div className="flex items-center gap-2 mb-2">
                <Car className="h-4 w-4" />
                Chọn xe
              </div>
            </Label>
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger id="vehicle">
                <SelectValue placeholder="Chọn xe của bạn" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map(vehicle => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.model} - {vehicle.seatType} chỗ - {vehicle.licensePlate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4" />
                  Điểm đi
                </div>
              </Label>
              <Select value={startLocation} onValueChange={setStartLocation}>
                <SelectTrigger id="start">
                  <SelectValue placeholder="Chọn điểm đi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tiên Phước">Tiên Phước</SelectItem>
                  <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="end">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4" />
                  Điểm đến
                </div>
              </Label>
              <Select value={endLocation} onValueChange={setEndLocation}>
                <SelectTrigger id="end">
                  <SelectValue placeholder="Chọn điểm đến" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tiên Phước">Tiên Phước</SelectItem>
                  <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4" />
                  Ngày xuất phát
                </div>
              </Label>
              <Input
                id="date"
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="time">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4" />
                  Giờ xuất phát
                </div>
              </Label>
              <Input
                id="time"
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="seats">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4" />
                  Số ghế mở bán
                </div>
              </Label>
              <Input
                id="seats"
                type="number"
                min="1"
                max={selectedVehicleData?.seatType || 7}
                value={seatsToSell}
                onChange={(e) => setSeatsToSell(e.target.value)}
                placeholder={selectedVehicleData ? `Tối đa ${selectedVehicleData.seatType} chỗ` : "Chọn xe trước"}
              />
            </div>

            <div>
              <Label htmlFor="price">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4" />
                  Giá vé (VNĐ)
                </div>
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="1000"
                value={pricePerSeat}
                onChange={(e) => setPricePerSeat(e.target.value)}
                placeholder="100000"
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={createTrip.isPending}>
            {createTrip.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang tạo chuyến...
              </>
            ) : (
              "Tạo chuyến xe"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
