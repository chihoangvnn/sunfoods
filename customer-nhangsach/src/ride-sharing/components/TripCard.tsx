'use client'

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ArrowRight, Clock, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { RouteMap } from "./RouteMap";
import { useIsMobile } from "@/hooks/use-mobile";

interface TripCardProps {
  trip: {
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
}

export function TripCard({ trip }: TripCardProps) {
  const [timeUntilDeparture, setTimeUntilDeparture] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const departure = new Date(trip.departureWindowStart).getTime();
      const diff = departure - now;
      
      if (diff <= 0) {
        setTimeUntilDeparture('Đang khởi hành xe');
        setIsUrgent(true);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      // If <= 6 hours, show countdown
      const sixHoursInMs = 6 * 60 * 60 * 1000;
      if (diff <= sixHoursInMs) {
        setTimeUntilDeparture(`Còn ${hours}h ${minutes}p xe khởi hành`);
        setIsUrgent(true);
      } else {
        setTimeUntilDeparture('');
        setIsUrgent(false);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [trip.departureWindowStart]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return `${price}đ`;
  };

  const getLocationCoordinates = (locationName: string): [number, number] => {
    const locations: Record<string, [number, number]> = {
      'Tiên Phước': [15.3667, 108.1333],
      'Đà Nẵng': [16.0544, 108.2022],
      'Tam Kỳ': [15.5708, 108.4746],
      'Hội An': [15.8801, 108.3380],
      'Quảng Ngãi': [15.1214, 108.8044],
      'Huế': [16.4637, 107.5909],
      'Nha Trang': [12.2388, 109.1967],
      'Quy Nhơn': [13.7830, 109.2192],
      'TP.HCM': [10.8231, 106.6297],
      'Hà Nội': [21.0285, 105.8542],
    };
    
    if (!locations[locationName]) {
      console.warn(`Location "${locationName}" not found in coordinates database. Using default center of Vietnam.`);
      return [16.0, 108.0];
    }
    
    return locations[locationName];
  };

  const mapHeight = isMobile ? '200px' : '300px';

  return (
    <Card className="border border-gray-200 hover:border-green-600 hover:shadow-md transition-all overflow-hidden">
      <div className="p-4 pb-0">
        {/* Top: Route */}
        <div className="mb-3">
          {/* Route - larger and bolder */}
          <div className="flex items-center gap-2.5 mb-2">
            <span className="font-bold text-lg text-gray-900">
              {trip.startLocation}
            </span>
            <ArrowRight className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span className="font-bold text-lg text-gray-900">
              {trip.endLocation}
            </span>
          </div>

          {/* Time - larger with color and countdown */}
          <div className="flex items-center gap-2">
            <Clock className={`h-5 w-5 ${isUrgent ? 'text-orange-500' : 'text-gray-500'}`} />
            <div className="flex items-center gap-2">
              <span className={`font-semibold text-xl ${isUrgent ? 'text-orange-600' : 'text-gray-800'}`}>
                {formatTime(trip.departureWindowStart)}
              </span>
              {timeUntilDeparture && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className={`font-medium text-base ${isUrgent ? 'text-orange-600' : 'text-gray-600'}`}>
                    {timeUntilDeparture}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Map Section */}
        <div className="border-t border-gray-200 mt-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowMap(!showMap);
            }}
            className="w-full flex items-center justify-between py-3 text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Xem bản đồ</span>
            </div>
            {showMap ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          
          {showMap && (
            <div className="pb-4">
              <RouteMap
                startLocation={{
                  name: trip.startLocation,
                  lat: getLocationCoordinates(trip.startLocation)[0],
                  lng: getLocationCoordinates(trip.startLocation)[1],
                }}
                endLocation={{
                  name: trip.endLocation,
                  lat: getLocationCoordinates(trip.endLocation)[0],
                  lng: getLocationCoordinates(trip.endLocation)[1],
                }}
                height={mapHeight}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Green bar with price and seats + booking */}
      <Link href={`/datxe/trip/${trip.id}`} className="block">
        <div className="bg-green-600 hover:bg-green-700 transition-colors px-4 py-3 flex items-center justify-between">
          <div className="text-white">
            <div className="text-2xl font-bold">
              {formatPrice(trip.pricePerSeat)}
            </div>
          </div>
          <div className="text-white font-semibold text-base">
            {trip.availableSeats} Ghế: Đặt Chỗ
          </div>
        </div>
      </Link>
    </Card>
  );
}
