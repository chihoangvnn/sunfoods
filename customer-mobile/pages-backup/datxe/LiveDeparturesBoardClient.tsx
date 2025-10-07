'use client'

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TripCard } from "@/ride-sharing/components/TripCard";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { type Trip } from "../../../shared/schema";

interface TripCardData {
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
}

function mapTripToCardTrip(trip: Trip): TripCardData {
  return {
    id: trip.id,
    driverName: "Tài xế",
    driverRating: 4.8,
    vehicleModel: trip.vehicleId || "Xe",
    seatType: 7,
    licensePlate: trip.vehicleId || "N/A",
    startLocation: trip.startLocation,
    endLocation: trip.endLocation,
    departureWindowStart: trip.departureWindowStart?.toISOString() || new Date().toISOString(),
    departureWindowEnd: trip.departureWindowEnd?.toISOString() || new Date(Date.now() + 30 * 60000).toISOString(),
    availableSeats: trip.availableSeats || 4,
    pricePerSeat: trip.pricePerSeat || 120000,
  };
}

interface LiveDeparturesBoardClientProps {
  initialTrips: Trip[];
}

export default function LiveDeparturesBoardClient({ initialTrips }: LiveDeparturesBoardClientProps) {
  const [activeTab, setActiveTab] = useState("tp-to-dn");
  const [currentTime, setCurrentTime] = useState(new Date().getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().getTime());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const now = currentTime;
  const mappedTrips = initialTrips
    .filter(t => t.status === 'pending')
    .map(mapTripToCardTrip);

  const tpToDnTrips = mappedTrips
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
    });

  const dnToTpTrips = mappedTrips
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
    });

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 py-4 bg-white border-b">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Chọn chuyến xe</h1>
            <p className="text-sm text-gray-600">Các chuyến xe sắp khởi hành</p>
          </div>
        </div>
        
        {/* Book a Ride CTA */}
        <a 
          href="/datxe/book-ride"
          className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
        >
          Đặt xe riêng - Nhận báo giá từ nhiều tài xế
        </a>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="pt-3">
        <div className="px-4 pb-3">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100">
            <TabsTrigger value="tp-to-dn" className="flex items-center gap-1.5 text-sm">
              <span>Tiên Phước</span>
              <ArrowRight className="h-3.5 w-3.5" />
              <span>Đà Nẵng</span>
            </TabsTrigger>
            <TabsTrigger value="dn-to-tp" className="flex items-center gap-1.5 text-sm">
              <span>Đà Nẵng</span>
              <ArrowRight className="h-3.5 w-3.5" />
              <span>Tiên Phước</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="tp-to-dn" className="px-4 space-y-3 mt-0">
          {tpToDnTrips.length > 0 ? (
            tpToDnTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))
          ) : (
            <Card className="p-8 text-center border-dashed">
              <p className="text-gray-500">Chưa có chuyến xe nào</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dn-to-tp" className="px-4 space-y-3 mt-0">
          {dnToTpTrips.length > 0 ? (
            dnToTpTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))
          ) : (
            <Card className="p-8 text-center border-dashed">
              <p className="text-gray-500">Chưa có chuyến xe nào</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
