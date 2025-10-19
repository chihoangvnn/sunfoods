export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeocodingResult {
  success: boolean;
  coordinates?: Coordinates;
  error?: string;
  provider?: string;
}

export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  if (!address || address.trim().length === 0) {
    return {
      success: false,
      error: "Address is empty"
    };
  }

  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'VIP-Geo-Pricing-System/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || (data as any).length === 0) {
      return {
        success: false,
        error: "Address not found",
        provider: "nominatim"
      };
    }

    const result = (data as any)[0];
    
    return {
      success: true,
      coordinates: {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      },
      provider: "nominatim"
    };

  } catch (error) {
    console.error("Geocoding error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown geocoding error",
      provider: "nominatim"
    };
  }
}

export function calculateDistance(
  lat1: number | string | any,
  lon1: number | string | any,
  lat2: number | string | any,
  lon2: number | string | any
): number {
  const lat1Num = typeof lat1 === 'number' ? lat1 : parseFloat(lat1.toString());
  const lon1Num = typeof lon1 === 'number' ? lon1 : parseFloat(lon1.toString());
  const lat2Num = typeof lat2 === 'number' ? lat2 : parseFloat(lat2.toString());
  const lon2Num = typeof lon2 === 'number' ? lon2 : parseFloat(lon2.toString());

  const R = 6371; 
  const dLat = toRad(lat2Num - lat1Num);
  const dLon = toRad(lon2Num - lon1Num);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1Num)) * Math.cos(toRad(lat2Num)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 1000) / 1000;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
