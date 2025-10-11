import { useState } from "react";
import { Map, Marker } from "pigeon-maps";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Navigation, Loader2, Check, Bird, Car } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { calculateRouteDistance } from "@/lib/osrm";

const DEFAULT_CENTER: [number, number] = [10.8231, 106.6297];
const DEFAULT_ZOOM = 15;

interface AddressMapPickerProps {
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  onLocationSelect: (
    address: string,
    latitude: number,
    longitude: number,
    distanceFromShop?: number,
    district?: string,
    routeDistanceFromShop?: number | null
  ) => void;
  height?: string;
  showShopMarker?: boolean;
  isShopLocation?: boolean;
}

interface PendingLocation {
  address: string;
  latitude: number;
  longitude: number;
  distanceFromShop?: number;
  district?: string;
  routeDistanceFromShop?: number | null;
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
          'User-Agent': 'AdminWebApp/1.0'
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
  initialLatitude,
  initialLongitude,
  onLocationSelect,
  height = "400px",
  showShopMarker = true,
  isShopLocation = false
}: AddressMapPickerProps) {
  const { toast } = useToast();
  const [customerPosition, setCustomerPosition] = useState<[number, number] | null>(
    initialLatitude && initialLongitude ? [initialLatitude, initialLongitude] : null
  );
  const [pendingLocation, setPendingLocation] = useState<PendingLocation | null>(null);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [center, setCenter] = useState<[number, number]>(
    initialLatitude && initialLongitude ? [initialLatitude, initialLongitude] : DEFAULT_CENTER
  );
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  const { data: shopSettings } = useQuery({
    queryKey: ['/api/admin/shop-settings'],
    queryFn: async () => {
      const res = await fetch('/api/admin/shop-settings', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch shop settings');
      return res.json();
    },
    enabled: !isShopLocation,
  });

  const shopPosition: [number, number] | null = shopSettings?.data?.shopLatitude && shopSettings?.data?.shopLongitude
    ? [parseFloat(shopSettings.data.shopLatitude), parseFloat(shopSettings.data.shopLongitude)]
    : null;

  const handleMapClick = async ({ latLng }: { latLng: [number, number] }) => {
    const [lat, lng] = latLng;
    setCustomerPosition([lat, lng]);
    
    const { address, district } = await reverseGeocode(lat, lng);
    
    if (isShopLocation) {
      setPendingLocation({ address, latitude: lat, longitude: lng });
    } else {
      let distanceFromShop = 0;
      let routeDistanceFromShop: number | null = null;
      
      if (shopPosition) {
        distanceFromShop = calculateDistance(shopPosition[0], shopPosition[1], lat, lng);
        routeDistanceFromShop = await calculateRouteDistance(
          shopPosition[0], 
          shopPosition[1], 
          lat, 
          lng
        );
      }
      
      setPendingLocation({ 
        address, 
        latitude: lat, 
        longitude: lng, 
        distanceFromShop, 
        district,
        routeDistanceFromShop 
      });
    }
  };

  const handleConfirmLocation = () => {
    if (!pendingLocation) return;
    
    onLocationSelect(
      pendingLocation.address,
      pendingLocation.latitude,
      pendingLocation.longitude,
      pendingLocation.distanceFromShop,
      pendingLocation.district,
      pendingLocation.routeDistanceFromShop
    );
    
    setPendingLocation(null);
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Lỗi",
        description: "Trình duyệt của bạn không hỗ trợ định vị",
        variant: "destructive"
      });
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
        
        if (isShopLocation) {
          setPendingLocation({ address, latitude, longitude });
        } else {
          let distanceFromShop = 0;
          let routeDistanceFromShop: number | null = null;
          
          if (shopPosition) {
            distanceFromShop = calculateDistance(shopPosition[0], shopPosition[1], latitude, longitude);
            routeDistanceFromShop = await calculateRouteDistance(
              shopPosition[0], 
              shopPosition[1], 
              latitude, 
              longitude
            );
          }
          
          setPendingLocation({ 
            address, 
            latitude, 
            longitude, 
            distanceFromShop, 
            district,
            routeDistanceFromShop 
          });
        }
        setIsGeolocating(false);
        
        toast({
          title: "Thành công",
          description: "Đã lấy vị trí của bạn. Nhấn 'Lưu vị trí' để xác nhận.",
        });
      },
      (error) => {
        setIsGeolocating(false);
        toast({
          title: "Lỗi",
          description: "Không thể lấy vị trí của bạn: " + error.message,
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const distanceText = !isShopLocation && customerPosition && shopPosition
    ? `${calculateDistance(shopPosition[0], shopPosition[1], customerPosition[0], customerPosition[1])} km từ cửa hàng`
    : '';

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
                Đang lấy vị trí...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Chia sẻ vị trí của tôi
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
            {pendingLocation.distanceFromShop !== undefined && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-300">
                  <Bird className="h-3.5 w-3.5" />
                  <span>Chim bay: {pendingLocation.distanceFromShop} km</span>
                </div>
                {pendingLocation.routeDistanceFromShop !== null && pendingLocation.routeDistanceFromShop !== undefined && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-300">
                    <Car className="h-3.5 w-3.5" />
                    <span>Đường đi: {pendingLocation.routeDistanceFromShop} km</span>
                  </div>
                )}
                {pendingLocation.routeDistanceFromShop === null && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-500/60 dark:text-blue-400/60">
                    <Car className="h-3.5 w-3.5" />
                    <span>Đường đi: Không tính được</span>
                  </div>
                )}
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

        {!pendingLocation && distanceText && (
          <div className="text-sm text-muted-foreground">
            📍 {distanceText}
          </div>
        )}

        <div style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
          <Map
            center={center}
            zoom={zoom}
            onBoundsChanged={({ center, zoom }) => {
              setCenter(center);
              setZoom(zoom);
            }}
            onClick={handleMapClick}
          >
            {!isShopLocation && showShopMarker && shopPosition && (
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
                color={isShopLocation ? "#ef4444" : "#3b82f6"}
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
