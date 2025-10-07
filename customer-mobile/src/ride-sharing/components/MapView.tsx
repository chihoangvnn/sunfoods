'use client'

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MarkerData {
  lat: number;
  lng: number;
  label: string;
  popup?: string;
}

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  markers?: MarkerData[];
  height?: string;
  className?: string;
}

export function MapView({ 
  center = [16.0544, 108.2022], 
  zoom = 13, 
  markers = [],
  height = '400px',
  className = ''
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    markers.forEach((markerData) => {
      const marker = L.marker([markerData.lat, markerData.lng]).addTo(map);
      
      if (markerData.popup) {
        marker.bindPopup(markerData.popup);
      } else if (markerData.label) {
        marker.bindPopup(markerData.label);
      }
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current!.removeLayer(layer);
      }
    });

    markers.forEach((markerData) => {
      const marker = L.marker([markerData.lat, markerData.lng]).addTo(mapRef.current!);
      
      if (markerData.popup) {
        marker.bindPopup(markerData.popup);
      } else if (markerData.label) {
        marker.bindPopup(markerData.label);
      }
    });
  }, [markers]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView(center, zoom);
  }, [center, zoom]);

  return (
    <div 
      ref={mapContainerRef} 
      className={`w-full rounded-lg overflow-hidden ${className}`}
      style={{ height }}
    />
  );
}
