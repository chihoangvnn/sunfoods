'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CenterPinMapPicker } from '@/components/CenterPinMapPicker';
import { searchAddress, reverseGeocode, NominatimResult } from '@/lib/nominatimSearch';
import { toast } from '@/hooks/use-toast';
import { MapPin, Locate } from 'lucide-react';

interface LocationInputProps {
  label?: string;
  placeholder?: string;
  onLocationSelect: (address: string, lat: number, lng: number) => void;
  initialValue?: string;
  biasLat?: number | null;
  biasLng?: number | null;
  biasAddress?: string;
}

export function LocationInput({
  label = 'Điểm đến',
  placeholder = 'Nhập địa chỉ hoặc chia sẻ vị trí...',
  onLocationSelect,
  initialValue = '',
  biasLat = null,
  biasLng = null,
  biasAddress,
}: LocationInputProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Could not get location for biased search:', error.message);
        },
        { enableHighAccuracy: false, timeout: 5000 }
      );
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (value.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        // Prioritize biasLat/biasLng (from pickup) over GPS userLocation
        const lat = biasLat ?? userLocation?.lat;
        const lng = biasLng ?? userLocation?.lng;
        
        const results = await searchAddress(
          value,
          lat,
          lng,
          biasAddress
        );

        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setIsSearching(false);
      } catch (error) {
        console.error('Error in autocomplete search:', error);
        setSuggestions([]);
        setShowSuggestions(false);
        setIsSearching(false);
      }
    }, 500);
  };

  const handleSuggestionClick = (suggestion: NominatimResult) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    
    setInputValue(suggestion.display_name);
    setSelectedLat(lat);
    setSelectedLng(lng);
    setSuggestions([]);
    setShowSuggestions(false);
    
    onLocationSelect(suggestion.display_name, lat, lng);
  };

  const handleGPSLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Lỗi',
        description: 'Trình duyệt không hỗ trợ định vị GPS',
        variant: 'destructive',
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const address = await reverseGeocode(latitude, longitude);
        
        setInputValue(address);
        setSelectedLat(latitude);
        setSelectedLng(longitude);
        setIsGettingLocation(false);
        
        onLocationSelect(address, latitude, longitude);
        
        toast({
          title: 'Thành công',
          description: 'Đã lấy vị trí hiện tại của bạn',
        });
      },
      (error) => {
        setIsGettingLocation(false);
        
        let errorMessage = 'Không thể lấy vị trí. Vui lòng kiểm tra quyền truy cập.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Bạn đã từ chối quyền truy cập vị trí. Vui lòng bật lại trong cài đặt trình duyệt.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Không thể xác định vị trí hiện tại.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Yêu cầu lấy vị trí đã hết thời gian.';
            break;
        }
        
        toast({
          title: 'Lỗi',
          description: errorMessage,
          variant: 'destructive',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleMapSelect = (address: string, lat: number, lng: number) => {
    setInputValue(address);
    setSelectedLat(lat);
    setSelectedLng(lng);
    setShowMapPicker(false);
    
    onLocationSelect(address, lat, lng);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="pr-4"
          />
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {suggestion.display_name}
                  </p>
                </button>
              ))}
            </div>
          )}
          
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleGPSLocation}
          disabled={isGettingLocation}
          className="flex-shrink-0"
          title="Lấy vị trí hiện tại"
        >
          {isGettingLocation ? (
            <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
          ) : (
            <Locate className="h-4 w-4" />
          )}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowMapPicker(true)}
          className="flex-shrink-0"
          title="Chọn trên bản đồ"
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>

      {inputValue && (
        <p className="text-xs text-gray-500">
          ✓ Đã chọn: {inputValue.length > 60 ? inputValue.slice(0, 60) + '...' : inputValue}
        </p>
      )}

      <Dialog open={showMapPicker} onOpenChange={setShowMapPicker}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chọn vị trí trên bản đồ</DialogTitle>
          </DialogHeader>
          <CenterPinMapPicker
            onLocationSelect={handleMapSelect}
            initialCenter={selectedLat && selectedLng ? [selectedLat, selectedLng] : [16.0544, 108.2022]}
            label="🎯 Điểm đến"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
