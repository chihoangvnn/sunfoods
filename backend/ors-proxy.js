const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001;

app.use(express.json());
app.use(cors());

// ORS Proxy Endpoint
app.post('/api/admin/calculate-route-distance', async (req, res) => {
  try {
    const { lat1, lon1, lat2, lon2 } = req.body;

    // Validate coordinates
    if (typeof lat1 !== 'number' || typeof lon1 !== 'number' || 
        typeof lat2 !== 'number' || typeof lon2 !== 'number') {
      return res.status(400).json({ 
        error: "Invalid coordinates. All values must be numbers.",
        distance: null 
      });
    }

    const ORS_API_KEY = process.env.ORS_API_KEY;
    
    if (!ORS_API_KEY) {
      console.warn('[ORS Proxy] ORS_API_KEY not found in environment');
      return res.json({ distance: null });
    }

    const url = `https://api.openrouteservice.org/v2/directions/driving-car?start=${lon1},${lat1}&end=${lon2},${lat2}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Authorization': ORS_API_KEY,
        'Accept': 'application/geo+json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn('[ORS Proxy] API request failed:', response.status);
      return res.json({ distance: null });
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      console.warn('[ORS Proxy] No route found');
      return res.json({ distance: null });
    }
    
    const distanceMeters = data.features[0].properties.summary.distance;
    const distanceKm = distanceMeters / 1000;
    const distance = Math.round(distanceKm * 10) / 10;
    
    res.json({ distance });
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('[ORS Proxy] Request timeout');
    } else {
      console.error('[ORS Proxy] Error:', error);
    }
    res.json({ distance: null });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🗺️ ORS Proxy Server running on port ${PORT}`);
  console.log(`   Endpoint: http://localhost:${PORT}/api/admin/calculate-route-distance`);
});
