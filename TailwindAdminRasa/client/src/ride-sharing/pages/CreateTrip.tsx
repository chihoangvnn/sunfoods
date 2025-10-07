import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Car, MapPin, Clock, Users, DollarSign } from "lucide-react";
import { mockVehicles } from "@/ride-sharing/mockData";

export default function CreateTrip() {
  const { toast } = useToast();
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTimeStart, setDepartureTimeStart] = useState("");
  const [departureTimeEnd, setDepartureTimeEnd] = useState("");
  const [seatsToSell, setSeatsToSell] = useState("");
  const [pricePerSeat, setPricePerSeat] = useState("");

  const selectedVehicleData = mockVehicles.find(v => v.id === selectedVehicle);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVehicle || !startLocation || !endLocation || !departureDate || 
        !departureTimeStart || !departureTimeEnd || !seatsToSell || !pricePerSeat) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive"
      });
      return;
    }

    if (parseInt(seatsToSell) > (selectedVehicleData?.seatType || 0)) {
      toast({
        title: "Lỗi",
        description: `Số ghế không được vượt quá ${selectedVehicleData?.seatType} chỗ`,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Thành công",
      description: "Chuyến xe đã được tạo và xuất hiện trên bảng chờ trực tuyến",
    });

    setSelectedVehicle("");
    setStartLocation("");
    setEndLocation("");
    setDepartureDate("");
    setDepartureTimeStart("");
    setDepartureTimeEnd("");
    setSeatsToSell("");
    setPricePerSeat("");
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
                {mockVehicles.map(vehicle => (
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

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time-start">Giờ bắt đầu khung giờ</Label>
              <Input
                id="time-start"
                type="time"
                value={departureTimeStart}
                onChange={(e) => setDepartureTimeStart(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="time-end">Giờ kết thúc khung giờ</Label>
              <Input
                id="time-end"
                type="time"
                value={departureTimeEnd}
                onChange={(e) => setDepartureTimeEnd(e.target.value)}
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

          <Button type="submit" size="lg" className="w-full">
            Tạo chuyến xe
          </Button>
        </form>
      </Card>
    </div>
  );
}
