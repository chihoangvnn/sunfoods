'use client'

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TripCard } from "@/ride-sharing/components/TripCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bus, ArrowRight, Loader2 } from "lucide-react";
import { mockTrips, type TripStatus } from "@/ride-sharing/mockData";
import { useDriverTrips, Trip as ApiTrip } from "@/ride-sharing/hooks/useRideSharingApi";
import { DepartureCountdown } from "@/ride-sharing/components/DepartureCountdown";
import { TripStatusBadge } from "@/ride-sharing/components/TripStatusBadge";

// TripCard display format type
type TripCardData = {
  id: string;
  driverName: string;
  driverRating: number;
  vehicleModel: string;
  seatType: number;
  licensePlate: string;
  startLocation: string;
  endLocation: string;
  departureWindowStart: string;
  departureWindowEnd: string;
  availableSeats: number;
  pricePerSeat: number;
};

// Adapter function to convert API Trip to TripCard format
function mapApiTripToCardTrip(trip: ApiTrip): TripCardData {
  return {
    id: trip.id,
    driverName: "Tài xế",
    driverRating: 4.8,
    vehicleModel: trip.vehicleId || "Xe",
    seatType: 7,
    licensePlate: trip.vehicleId || "N/A",
    startLocation: trip.startLocation,
    endLocation: trip.endLocation,
    departureWindowStart: trip.departureWindowStart || new Date().toISOString(),
    departureWindowEnd: trip.departureWindowEnd || new Date(Date.now() + 30 * 60000).toISOString(),
    availableSeats: trip.availableSeats || 4,
    pricePerSeat: trip.pricePerSeat || 120000,
  };
}

export default function LiveDeparturesBoard() {
  const [activeTab, setActiveTab] = useState("tp-to-dn");
  const [currentTime, setCurrentTime] = useState(new Date().getTime());
  const [statusFilter, setStatusFilter] = useState<TripStatus | "all">("all");

  // Fetch trips from API - note: this currently fetches driver's trips
  // TODO: Backend needs a public trips endpoint for passengers to browse all available trips
  const { data: apiTrips, isLoading, isError } = useDriverTrips('pending');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().getTime());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const now = currentTime;

  // Convert API trips to TripCard format and use as data source
  // Fallback to mock data if API returns empty or errors
  const mappedApiTrips = apiTrips && apiTrips.length > 0 
    ? apiTrips.map(mapApiTripToCardTrip)
    : [];
  
  const allTrips = mappedApiTrips.length > 0 ? mappedApiTrips : mockTrips;

  const filterByStatus = (trips: typeof allTrips) => {
    if (statusFilter === "all") return trips;
    return trips.filter(t => {
      const mockTrip = mockTrips.find(mt => mt.id === t.id);
      if (!mockTrip) return statusFilter === "pending";
      return mockTrip.status === statusFilter;
    });
  };

  const tpToDnTrips = filterByStatus(allTrips
    .filter(t => {
      const endTime = t.departureWindowEnd || t.departureWindowStart;
      if (!endTime) return false;
      const departureWindowEnd = new Date(endTime).getTime();
      return t.startLocation === "Tiên Phước" && 
             t.endLocation === "Đà Nẵng" && 
             now <= departureWindowEnd;
    })
    .sort((a, b) => {
      const aTime = a.departureWindowStart ? new Date(a.departureWindowStart).getTime() : 0;
      const bTime = b.departureWindowStart ? new Date(b.departureWindowStart).getTime() : 0;
      return aTime - bTime;
    }));

  const dnToTpTrips = filterByStatus(allTrips
    .filter(t => {
      const endTime = t.departureWindowEnd || t.departureWindowStart;
      if (!endTime) return false;
      const departureWindowEnd = new Date(endTime).getTime();
      return t.startLocation === "Đà Nẵng" && 
             t.endLocation === "Tiên Phước" && 
             now <= departureWindowEnd;
    })
    .sort((a, b) => {
      const aTime = a.departureWindowStart ? new Date(a.departureWindowStart).getTime() : 0;
      const bTime = b.departureWindowStart ? new Date(b.departureWindowStart).getTime() : 0;
      return aTime - bTime;
    }));

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-4 space-y-6">
        <div className="flex items-center gap-2">
          <Bus className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Bảng Chờ Trực Tuyến</h1>
            <p className="text-muted-foreground">Các chuyến xe sắp khởi hành</p>
          </div>
        </div>
        <Card className="p-8 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Đang tải chuyến xe...</span>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 space-y-6">
      <div className="flex items-center gap-2">
        <Bus className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-xl font-bold">Bảng Chờ Trực Tuyến</h1>
          <p className="text-muted-foreground">Các chuyến xe sắp khởi hành</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Lọc theo trạng thái:</p>
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={statusFilter === "all" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setStatusFilter("all")}
            >
              Tất cả
            </Badge>
            <Badge 
              variant={statusFilter === "pending" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setStatusFilter("pending")}
            >
              Chờ khởi hành
            </Badge>
            <Badge 
              variant={statusFilter === "checked_in" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setStatusFilter("checked_in")}
            >
              Đã check-in
            </Badge>
            <Badge 
              variant={statusFilter === "in_progress" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setStatusFilter("in_progress")}
            >
              Đang di chuyển
            </Badge>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tp-to-dn" className="flex items-center gap-2">
            Tiên Phước
            <ArrowRight className="h-4 w-4" />
            Đà Nẵng
          </TabsTrigger>
          <TabsTrigger value="dn-to-tp" className="flex items-center gap-2">
            Đà Nẵng
            <ArrowRight className="h-4 w-4" />
            Tiên Phước
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tp-to-dn" className="space-y-4 mt-6">
          {isError && (
            <Card className="p-4 mb-4 bg-yellow-50 border-yellow-200">
              <p className="text-sm text-yellow-800">
                Không thể tải dữ liệu từ server. Đang hiển thị dữ liệu mẫu.
              </p>
            </Card>
          )}
          {tpToDnTrips.length > 0 ? (
            tpToDnTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              Chưa có chuyến xe nào sắp khởi hành trên tuyến này
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dn-to-tp" className="space-y-4 mt-6">
          {isError && (
            <Card className="p-4 mb-4 bg-yellow-50 border-yellow-200">
              <p className="text-sm text-yellow-800">
                Không thể tải dữ liệu từ server. Đang hiển thị dữ liệu mẫu.
              </p>
            </Card>
          )}
          {dnToTpTrips.length > 0 ? (
            dnToTpTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              Chưa có chuyến xe nào sắp khởi hành trên tuyến này
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
