'use client'

import { useState } from "react";
import { Map, Marker } from "pigeon-maps";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Navigation, Loader2, Check, Bird } from "lucide-react";

const DEFAULT_CENTER: [number, number] = [10.8231, 106.6297];
const DEFAULT_ZOOM = 15;

interface AddressMapPickerProps {
  shopLocation: { lat: number; lon: number } | null;
  initialLocation?: { lat: number; lon: number };
  onLocationSelect: (data: {
    lat: number;
    lon: number;
    address: string;
    district: string;
    distanceFromShop: number | null;
  }) => void;
}

interface PendingLocation {
  lat: number;
  lon: number;
  address: string;
  district: string;
  distanceFromShop: number | null;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}

async function reverseGeocode(lat: number, lon: number): Promise<{ address: string; district: string }> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=vi`,
      {
        headers: {
          'User-Agent': 'CustomerMobileApp/1.0'
        }
      }
    );
    const data = await response.json();
    
    const address = data.display_name || `${lat}, ${lon}`;
    
    const parts = data.display_name?.split(', ') || [];
    const district = parts.length >= 2 ? parts[parts.length - 2] : '';
    
    return { address, district };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      address: `${lat}, ${lon}`,
      district: ''
    };
  }
}

export function AddressMapPicker({
  shopLocation,
  initialLocation,
  onLocationSelect
}: AddressMapPickerProps) {
  const [customerPosition, setCustomerPosition] = useState<[number, number] | null>(
    initialLocation ? [initialLocation.lat, initialLocation.lon] : null
  );
  const [pendingLocation, setPendingLocation] = useState<PendingLocation | null>(null);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [center, setCenter] = useState<[number, number]>(
    initialLocation 
      ? [initialLocation.lat, initialLocation.lon] 
      : shopLocation 
        ? [shopLocation.lat, shopLocation.lon]
        : DEFAULT_CENTER
  );
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  const shopPosition: [number, number] | null = shopLocation
    ? [shopLocation.lat, shopLocation.lon]
    : null;

  const handleMapClick = async ({ latLng }: { latLng: [number, number] }) => {
    const [lat, lng] = latLng;
    setCustomerPosition([lat, lng]);
    
    const { address, district } = await reverseGeocode(lat, lng);
    
    let distanceFromShop: number | null = null;
    if (shopPosition) {
      distanceFromShop = calculateDistance(shopPosition[0], shopPosition[1], lat, lng);
    }
    
    setPendingLocation({ 
      lat,
      lon: lng,
      address, 
      district,
      distanceFromShop 
    });
  };

  const handleConfirmLocation = () => {
    if (!pendingLocation) return;
    
    onLocationSelect({
      lat: pendingLocation.lat,
      lon: pendingLocation.lon,
      address: pendingLocation.address,
      district: pendingLocation.district,
      distanceFromShop: pendingLocation.distanceFromShop
    });
    
    setPendingLocation(null);
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt của bạn không hỗ trợ định vị");
      return;
    }

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newPosition: [number, number] = [latitude, longitude];
        
        setCustomerPosition(newPosition);
        setCenter(newPosition);
        
        const { address, district } = await reverseGeocode(latitude, longitude);
        
        let distanceFromShop: number | null = null;
        if (shopPosition) {
          distanceFromShop = calculateDistance(shopPosition[0], shopPosition[1], latitude, longitude);
        }
        
        setPendingLocation({ 
          lat: latitude,
          lon: longitude,
          address, 
          district,
          distanceFromShop 
        });
        
        setIsGeolocating(false);
      },
      (error) => {
        setIsGeolocating(false);
        alert("Không thể lấy vị trí của bạn: " + error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Chọn vị trí trên bản đồ</h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGeolocation}
            disabled={isGeolocating}
          >
            {isGeolocating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang lấy...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Vị trí của tôi
              </>
            )}
          </Button>
        </div>

        {pendingLocation && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-2">
            <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
              📍 Vị trí đã chọn:
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-200">
              {pendingLocation.address}
            </div>
            {pendingLocation.distanceFromShop !== null && (
              <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-300">
                <Bird className="h-3.5 w-3.5" />
                <span>Khoảng cách chim bay: {pendingLocation.distanceFromShop} km</span>
              </div>
            )}
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmLocation}
              className="w-full"
            >
              <Check className="h-4 w-4 mr-2" />
              Lưu vị trí
            </Button>
          </div>
        )}

        <div style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
          <Map
            center={center}
            zoom={zoom}
            onBoundsChanged={({ center, zoom }) => {
              setCenter(center);
              setZoom(zoom);
            }}
            onClick={handleMapClick}
          >
            {shopPosition && (
              <Marker 
                width={50}
                anchor={shopPosition}
                color="#ef4444"
              />
            )}

            {customerPosition && (
              <Marker
                width={50}
                anchor={customerPosition}
                color="#3b82f6"
              />
            )}
          </Map>
        </div>

        <div className="text-xs text-muted-foreground">
          💡 Nhấp vào bản đồ để chọn vị trí, sau đó nhấn nút "Lưu vị trí" để xác nhận.
        </div>
      </CardContent>
    </Card>
  );
}
