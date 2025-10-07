'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onLocationChange: (lat: number, lng: number, address: string) => void;
  height?: string;
  label?: string;
}

export function MapPicker({
  initialLat = 16.0544,
  initialLng = 108.2022,
  initialAddress = '',
  onLocationChange,
  height = '300px',
  label = 'Chọn vị trí',
}: MapPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentAddress, setCurrentAddress] = useState(initialAddress);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(containerRef.current).setView([initialLat, initialLng], 13);
    mapRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add draggable marker
    const marker = L.marker([initialLat, initialLng], {
      draggable: true,
    }).addTo(map);
    markerRef.current = marker;

    // Handle marker drag
    marker.on('dragend', async () => {
      const position = marker.getLatLng();
      await reverseGeocode(position.lat, position.lng);
    });

    // Handle map click to move marker
    map.on('click', async (e) => {
      marker.setLatLng(e.latlng);
      await reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      // Nominatim reverse geocoding (free tier, 1 req/sec limit)
      // Note: User-Agent header cannot be set in browser fetch (forbidden header)
      // Nominatim will see browser's default User-Agent
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );

      if (response.ok) {
        const data = await response.json();
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setCurrentAddress(address);
        onLocationChange(lat, lng, address);
      } else {
        // Fallback to coordinates
        const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setCurrentAddress(address);
        onLocationChange(lat, lng, address);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      // Fallback to coordinates
      const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setCurrentAddress(address);
      onLocationChange(lat, lng, address);
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {isGeocoding && (
          <span className="text-xs text-blue-600">Đang tải địa chỉ...</span>
        )}
      </div>
      <div
        ref={containerRef}
        style={{ height, width: '100%' }}
        className="rounded-lg border-2 border-gray-300 overflow-hidden"
      />
      {currentAddress && (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-600 mb-1">Địa chỉ đã chọn:</p>
          <p className="text-sm font-medium text-gray-900">{currentAddress}</p>
        </div>
      )}
      <p className="text-xs text-gray-500">
        💡 Kéo marker hoặc click vào bản đồ để chọn vị trí
      </p>
    </div>
  );
}
