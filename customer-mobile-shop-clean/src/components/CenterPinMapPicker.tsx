'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { reverseGeocode } from '@/lib/nominatimSearch';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CenterPinMapPickerProps {
  onLocationSelect: (address: string, lat: number, lng: number) => void;
  initialCenter?: [number, number];
  label?: string;
}

export function CenterPinMapPicker({
  onLocationSelect,
  initialCenter = [16.0544, 108.2022],
  label = '📍 Chọn vị trí',
}: CenterPinMapPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const geocodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView(initialCenter, 13);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const handleMoveEnd = () => {
      const center = map.getCenter();
      
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }

      geocodeTimeoutRef.current = setTimeout(() => {
        geocodeLocation(center.lat, center.lng);
      }, 500);
    };

    map.on('moveend', handleMoveEnd);

    geocodeLocation(initialCenter[0], initialCenter[1]);

    return () => {
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const geocodeLocation = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    const address = await reverseGeocode(lat, lng);
    setCurrentAddress(address);
    setIsGeocoding(false);
  };

  const handleConfirm = () => {
    if (mapRef.current && currentAddress) {
      const center = mapRef.current.getCenter();
      onLocationSelect(currentAddress, center.lat, center.lng);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {isGeocoding && (
          <span className="text-xs text-blue-600">Đang tải địa chỉ...</span>
        )}
      </div>

      {currentAddress && (
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <p className="text-xs text-green-700 mb-1">📍 Địa chỉ hiện tại:</p>
          <p className="text-sm font-medium text-green-900">{currentAddress}</p>
        </div>
      )}

      <div className="relative">
        <div
          ref={containerRef}
          className="h-[300px] w-full rounded-lg border-2 border-gray-300 overflow-hidden"
        />
        
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[1000]">
          <div className="relative">
            <svg
              width="40"
              height="50"
              viewBox="0 0 40 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 0C8.95 0 0 8.95 0 20C0 35 20 50 20 50C20 50 40 35 40 20C40 8.95 31.05 0 20 0ZM20 27C16.13 27 13 23.87 13 20C13 16.13 16.13 13 20 13C23.87 13 27 16.13 27 20C27 23.87 23.87 27 20 27Z"
                fill="#DC2626"
              />
              <circle cx="20" cy="20" r="5" fill="white" />
            </svg>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        💡 Di chuyển bản đồ để chọn vị trí chính xác
      </p>

      <Button
        onClick={handleConfirm}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
        disabled={!currentAddress || isGeocoding}
      >
        ✓ Xác nhận vị trí
      </Button>
    </div>
  );
}
