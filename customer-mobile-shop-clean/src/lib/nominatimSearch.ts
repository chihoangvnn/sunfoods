import { detectCityInQuery, getCityFromAddress } from './vietnameseCities';

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export async function searchAddress(
  query: string,
  userLat?: number,
  userLng?: number,
  pickupAddress?: string
): Promise<NominatimResult[]> {
  if (!query || query.trim().length < 3) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '5',
      countrycodes: 'vn',
      'accept-language': 'vi'
    });

    const cityInQuery = detectCityInQuery(query);
    const cityInPickup = pickupAddress ? getCityFromAddress(pickupAddress) : null;

    if (userLat !== undefined && userLng !== undefined) {
      if (!cityInQuery) {
        // Tier 1 (Local): No city in query → bounded=1 + viewbox 50km
        const radius = 0.5; // ~55km in degrees
        const left = (userLng - radius).toFixed(6);
        const top = (userLat + radius).toFixed(6);
        const right = (userLng + radius).toFixed(6);
        const bottom = (userLat - radius).toFixed(6);
        
        params.append('viewbox', `${left},${top},${right},${bottom}`);
        params.append('bounded', '1');
      } else if (cityInPickup && cityInQuery === cityInPickup) {
        // Tier 2 (Same City): City in query = pickup city → bounded=1 + viewbox 100km (expanded)
        const radius = 1.0; // ~110km in degrees
        const left = (userLng - radius).toFixed(6);
        const top = (userLat + radius).toFixed(6);
        const right = (userLng + radius).toFixed(6);
        const bottom = (userLat - radius).toFixed(6);
        
        params.append('viewbox', `${left},${top},${right},${bottom}`);
        params.append('bounded', '1');
      }
      // Tier 3 (Cross-Province): City in query ≠ pickup city → no bounded & viewbox (full Vietnam search)
      // When cityInQuery exists but doesn't match cityInPickup, we don't add viewbox or bounded
    }

    const apiUrl = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'default',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Search failed');
    }

    const results: NominatimResult[] = await response.json();
    
    // Sort results: prioritize streets/roads over POIs (businesses, tourism spots)
    return results.sort((a, b) => {
      const aIsStreet = a.address?.road || a.type === 'road' || a.type === 'residential';
      const bIsStreet = b.address?.road || b.type === 'road' || b.type === 'residential';
      
      // Streets first
      if (aIsStreet && !bIsStreet) return -1;
      if (!aIsStreet && bIsStreet) return 1;
      
      return 0; // Keep original order for same type
    });
  } catch (error) {
    console.error('Nominatim search error:', error);
    return [];
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?` +
      `format=json&` +
      `lat=${lat}&` +
      `lon=${lng}&` +
      `addressdetails=1&` +
      `accept-language=vi`;
    
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'default',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
    
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}
