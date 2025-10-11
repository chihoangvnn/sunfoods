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

const greenIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Location {
  name: string;
  lat: number;
  lng: number;
}

interface RouteMapProps {
  startLocation: Location;
  endLocation: Location;
  height?: string;
  className?: string;
}

export function RouteMap({ 
  startLocation, 
  endLocation, 
  height = '300px',
  className = ''
}: RouteMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const startMarker = L.marker(
      [startLocation.lat, startLocation.lng], 
      { icon: greenIcon }
    ).addTo(map);
    startMarker.bindPopup(`<b>Điểm đi:</b> ${startLocation.name}`);

    const endMarker = L.marker(
      [endLocation.lat, endLocation.lng], 
      { icon: redIcon }
    ).addTo(map);
    endMarker.bindPopup(`<b>Điểm đến:</b> ${endLocation.name}`);

    markersRef.current = [startMarker, endMarker];

    const polyline = L.polyline(
      [
        [startLocation.lat, startLocation.lng],
        [endLocation.lat, endLocation.lng]
      ],
      { 
        color: 'blue', 
        weight: 3,
        opacity: 0.7
      }
    ).addTo(map);

    polylineRef.current = polyline;

    const bounds = L.latLngBounds(
      [startLocation.lat, startLocation.lng],
      [endLocation.lat, endLocation.lng]
    );
    map.fitBounds(bounds, { padding: [50, 50] });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = [];
      polylineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach(marker => {
      marker.remove();
    });

    if (polylineRef.current) {
      polylineRef.current.remove();
    }

    const startMarker = L.marker(
      [startLocation.lat, startLocation.lng], 
      { icon: greenIcon }
    ).addTo(mapRef.current);
    startMarker.bindPopup(`<b>Điểm đi:</b> ${startLocation.name}`);

    const endMarker = L.marker(
      [endLocation.lat, endLocation.lng], 
      { icon: redIcon }
    ).addTo(mapRef.current);
    endMarker.bindPopup(`<b>Điểm đến:</b> ${endLocation.name}`);

    markersRef.current = [startMarker, endMarker];

    const polyline = L.polyline(
      [
        [startLocation.lat, startLocation.lng],
        [endLocation.lat, endLocation.lng]
      ],
      { 
        color: 'blue', 
        weight: 3,
        opacity: 0.7
      }
    ).addTo(mapRef.current);

    polylineRef.current = polyline;

    const bounds = L.latLngBounds(
      [startLocation.lat, startLocation.lng],
      [endLocation.lat, endLocation.lng]
    );
    mapRef.current.fitBounds(bounds, { padding: [50, 50] });
  }, [startLocation, endLocation]);

  return (
    <div 
      ref={mapContainerRef} 
      className={`w-full rounded-lg overflow-hidden ${className}`}
      style={{ height }}
    />
  );
}
