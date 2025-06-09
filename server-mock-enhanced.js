const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const turf = require('@turf/turf');
const booleanPointInPolygon = require('@turf/boolean-point-in-polygon').default;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'build')));

// Load sample data
const sampleVehicles = require('./data/sampleVehicles.json');
const samplePolygons = require('./data/samplePolygons.json');

// Track active vehicles and their positions
let vehiclePositions = {};
let vehicleBalances = {};
let vehicleInZones = {}; // Track which zones vehicles are in

// Zone charging rates (£ per minute)
const zoneRates = {
  'London Congestion Zone': 0.20,
  'Birmingham Clean Air Zone': 0.15,
  'Manchester Low Emission Zone': 0.18,
  'Default Zone': 0.10
};

// Initialize vehicle positions and balances
sampleVehicles.forEach((vehicle, index) => {
  const vehicleId = vehicle.id || `vehicle_${index}`;
  vehiclePositions[vehicleId] = {
    lat: 51.5074 + (Math.random() - 0.5) * 0.2, // Wider spread
    lng: -0.1278 + (Math.random() - 0.5) * 0.2,
    speed: 30 + Math.random() * 20,
    heading: Math.random() * 360
  };
  vehicleBalances[vehicleId] = 100; // Start with 100 credits
  vehicleInZones[vehicleId] = new Set();
});

// Convert zones to Turf polygons for efficient checking
const zonePolygons = samplePolygons.map((zone, index) => {
  const feature = zone.features ? zone.features[0] : zone;
  return {
    id: `zone_${index}`,
    name: feature.properties?.name || `Zone ${index + 1}`,
    polygon: turf.polygon(feature.geometry.coordinates),
    rate: zoneRates[feature.properties?.name] || zoneRates['Default Zone']
  };
});

// Check if a point is in any zones
function checkPointInZones(lat, lng) {
  const point = turf.point([lng, lat]);
  const zones = [];
  
  zonePolygons.forEach(zone => {
    try {
      // Use booleanPointInPolygon instead of booleanWithin
      if (booleanPointInPolygon(point, zone.polygon)) {
        zones.push(zone);
      }
    } catch (error) {
      console.log('Error checking point in polygon:', error);
    }
  });
  
  return zones;
}

// API endpoints
app.get('/api/getAllVehicles', (req, res) => {
  console.log('Fetching all vehicles...');
  const vehiclesWithPositions = sampleVehicles.map((vehicle, index) => {
    const vehicleId = vehicle.id || `vehicle_${index}`;
    return {
      ...vehicle,
      id: vehicleId,
      position: vehiclePositions[vehicleId],
      balance: vehicleBalances[vehicleId],
      currentZones: Array.from(vehicleInZones[vehicleId] || [])
    };
  });
  res.json(vehiclesWithPositions);
});

app.get('/api/getAllPolygons', (req, res) => {
  console.log('Fetching all zones...');
  // Add names and rates to zones
  const zonesWithMetadata = samplePolygons.map((zone, index) => {
    const feature = zone.features ? zone.features[0] : zone;
    if (!feature.properties) {
      feature.properties = {};
    }
    feature.properties.name = feature.properties.name || `Zone ${index + 1}`;
    feature.properties.rate = zoneRates[feature.properties.name] || zoneRates['Default Zone'];
    feature.properties.color = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'][index % 5];
    return zone;
  });
  res.json(zonesWithMetadata);
});

app.get('/api/getAllPoints', (req, res) => {
  console.log('Generating vehicle routes...');
  const points = Object.keys(vehiclePositions).map(vehicleId => {
    const currentPos = vehiclePositions[vehicleId];
    
    // Generate a route of 20 points
    const route = [];
    let lat = currentPos.lat;
    let lng = currentPos.lng;
    let heading = currentPos.heading;
    
    for (let i = 0; i < 20; i++) {
      // Simulate realistic movement
      heading += (Math.random() - 0.5) * 30; // Change direction slightly
      const distance = 0.005 + Math.random() * 0.005; // Variable speed
      
      lat += distance * Math.cos(heading * Math.PI / 180);
      lng += distance * Math.sin(heading * Math.PI / 180);
      
      // Keep in London area
      if (lat < 51.3 || lat > 51.7) heading += 180;
      if (lng < -0.5 || lng > 0.2) heading += 180;
      
      route.push({
        lat,
        lng,
        timestamp: Date.now() + i * 3000 // 3 seconds between points
      });
    }
    
    return {
      vehicleId,
      route
    };
  });
  res.json(points);
});

app.get('/api/getTotalStaked', (req, res) => {
  const totalBalance = Object.values(vehicleBalances).reduce((sum, balance) => sum + balance, 0);
  res.json({ totalStaked: totalBalance.toFixed(2) });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    mapbox: 'ready',
    vehicles: Object.keys(vehiclePositions).length,
    zones: zonePolygons.length,
    timestamp: new Date().toISOString()
  });
});

// WebSocket handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Send initial positions
  socket.emit('vehiclePositions', vehiclePositions);
  
  // Send initial zone data
  socket.emit('zonesUpdate', {
    zones: zonePolygons.map(z => ({
      id: z.id,
      name: z.name,
      rate: z.rate,
      vehiclesInside: Object.keys(vehicleInZones).filter(vId => 
        vehicleInZones[vId].has(z.name)
      ).length
    }))
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Zone charging interval (every 5 seconds for demo purposes)
setInterval(() => {
  Object.keys(vehicleInZones).forEach(vehicleId => {
    const zones = vehicleInZones[vehicleId];
    if (zones.size > 0) {
      // Charge for each zone the vehicle is in
      zones.forEach(zoneName => {
        const zone = zonePolygons.find(z => z.name === zoneName);
        if (zone && vehicleBalances[vehicleId] > 0) {
          const charge = zone.rate * 5 / 60; // 5 seconds worth of charge
          vehicleBalances[vehicleId] = Math.max(0, vehicleBalances[vehicleId] - charge);
          
          io.emit('zoneCharge', {
            vehicleId,
            charge: charge.toFixed(2),
            newBalance: vehicleBalances[vehicleId].toFixed(2),
            zone: zoneName,
            rate: zone.rate
          });
        }
      });
    }
  });
}, 5000);

// Simulate vehicle movement
setInterval(() => {
  Object.keys(vehiclePositions).forEach(vehicleId => {
    const pos = vehiclePositions[vehicleId];
    const previousZones = new Set(vehicleInZones[vehicleId]);
    
    // Update position based on speed and heading
    const speedKmh = pos.speed;
    const speedMs = speedKmh / 3.6;
    const distanceM = speedMs * 1; // 1 second interval
    const distanceDeg = distanceM / 111320; // Rough conversion
    
    pos.lat += distanceDeg * Math.cos(pos.heading * Math.PI / 180);
    pos.lng += distanceDeg * Math.sin(pos.heading * Math.PI / 180);
    
    // Randomly change heading slightly
    pos.heading += (Math.random() - 0.5) * 10;
    
    // Keep vehicles in London area
    if (pos.lat < 51.3 || pos.lat > 51.7) {
      pos.heading = (pos.heading + 180) % 360;
      pos.lat = Math.max(51.3, Math.min(51.7, pos.lat));
    }
    if (pos.lng < -0.5 || pos.lng > 0.2) {
      pos.heading = (pos.heading + 180) % 360;
      pos.lng = Math.max(-0.5, Math.min(0.2, pos.lng));
    }
    
    // Check which zones the vehicle is now in
    const currentZones = checkPointInZones(pos.lat, pos.lng);
    const currentZoneNames = new Set(currentZones.map(z => z.name));
    
    // Update vehicle's zone tracking
    vehicleInZones[vehicleId] = currentZoneNames;
    
    // Detect zone entries and exits
    currentZoneNames.forEach(zoneName => {
      if (!previousZones.has(zoneName)) {
        // Vehicle entered a zone
        io.emit('zoneEntry', {
          vehicleId,
          zone: zoneName,
          timestamp: new Date().toISOString(),
          position: { lat: pos.lat, lng: pos.lng }
        });
      }
    });
    
    previousZones.forEach(zoneName => {
      if (!currentZoneNames.has(zoneName)) {
        // Vehicle exited a zone
        io.emit('zoneExit', {
          vehicleId,
          zone: zoneName,
          timestamp: new Date().toISOString(),
          position: { lat: pos.lat, lng: pos.lng }
        });
      }
    });
  });
  
  // Emit updated positions
  io.emit('vehiclePositions', vehiclePositions);
}, 1000);

// For development, let React dev server handle routing
// In production, you would serve the built React app here

const PORT = process.env.PORT || 8001;
server.listen(PORT, () => {
  console.log(`Enhanced mock server running on port ${PORT}`);
  console.log(`Vehicles loaded: ${Object.keys(vehiclePositions).length}`);
  console.log(`Zones loaded: ${zonePolygons.length}`);
  console.log('Zone detection and charging enabled');
});