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
  
  // Return data in the same format as samplePoints.json
  // Array of timesteps, each timestep has positions for all vehicles
  const numTimesteps = 20;
  const numVehicles = Object.keys(vehiclePositions).length;
  const vehicleIds = Object.keys(vehiclePositions);
  
  const timesteps = [];
  
  for (let t = 0; t < numTimesteps; t++) {
    const timestep = [];
    
    for (let v = 0; v < numVehicles; v++) {
      const vehicleId = vehicleIds[v];
      const startPos = vehiclePositions[vehicleId];
      
      // Generate movement for this timestep
      const distance = 0.002 + (Math.random() * 0.003); // Small incremental movement
      const angle = (t * 0.1 + v * 60) * Math.PI / 180; // Different paths for each vehicle
      
      const lat = startPos.lat + distance * t * Math.cos(angle);
      const lng = startPos.lng + distance * t * Math.sin(angle);
      
      timestep.push({
        coords: [lng, lat]
      });
    }
    
    timesteps.push(timestep);
  }
  
  res.json(timesteps);
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
  
  // Track current timestep for route advancement
  let currentTimestep = 0;
  
  // Handle fetchNewPositionsFromServer - the original event from dashboard
  socket.on('fetchNewPositionsFromServer', (positions, zones) => {
    console.log('Received fetchNewPositionsFromServer request with', positions?.length || 0, 'timesteps');
    
    if (!positions || positions.length === 0) {
      console.log('No positions data provided');
      return;
    }
    
    // Advance to next timestep
    currentTimestep = (currentTimestep + 1) % positions.length;
    const currentPositions = positions[currentTimestep];
    
    console.log(`Advancing to timestep ${currentTimestep}, ${currentPositions.length} vehicles`);
    
    // Update vehicle positions and create response
    const newPositions = [];
    currentPositions.forEach((pos, vehicleIndex) => {
      if (pos.vehicle && pos.vehicle.id) {
        const vehicleId = pos.vehicle.id;
        const coords = pos.coords;
        
        // Update vehicle position
        vehiclePositions[vehicleId] = {
          lat: coords[1],
          lng: coords[0],
          speed: 30,
          heading: 0
        };
        
        // Check zone status
        const currentZones = checkPointInZones(coords[1], coords[0]);
        const within = currentZones.length > 0;
        
        // Add to positions array for updatePositions
        newPositions.push({
          id: vehicleId,
          vehicle: { ...pos.vehicle, id: vehicleId, within },
          coords: coords,
          lng: coords[0],
          lat: coords[1],
          within
        });
        
        // Emit zone entry/exit if changed
        const previousZones = vehicleInZones[vehicleId] || new Set();
        const currentZoneNames = new Set(currentZones.map(z => z.name));
        
        currentZoneNames.forEach(zoneName => {
          if (!previousZones.has(zoneName)) {
            socket.emit('fetchNewPositionsFromServerResponse', {
              type: 'enter',
              vehicleDetails: {
                id: vehicleId,
                enterTime: new Date().toISOString()
              },
              rate: currentZones.find(z => z.name === zoneName)?.rate || 0.007
            }, '0x' + Math.random().toString(16).slice(2, 10));
          }
        });
        
        previousZones.forEach(zoneName => {
          if (!currentZoneNames.has(zoneName)) {
            socket.emit('fetchNewPositionsFromServerResponse', {
              type: 'exit',
              vehicleDetails: {
                id: vehicleId,
                enterTime: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
                exitTime: new Date().toISOString()
              },
              rate: 0.007
            }, '0x' + Math.random().toString(16).slice(2, 10));
          }
        });
        
        vehicleInZones[vehicleId] = currentZoneNames;
      }
    });
    
    // Emit the new positions to update the map  
    if (newPositions.length > 0) {
      socket.emit('updatePositions', newPositions, positions);
      console.log(`Emitted ${newPositions.length} position updates`);
    }
  });
  
  // Handle manual advance request (keeping for compatibility)
  socket.on('advancePositions', () => {
    console.log('Received advance request from client');
    
    // Manually trigger one step of vehicle movement
    Object.keys(vehiclePositions).forEach(vehicleId => {
      const pos = vehiclePositions[vehicleId];
      
      // Update position based on speed and heading (5x normal speed for ADVANCE)
      const speedKmh = pos.speed;
      const speedMs = speedKmh / 3.6;
      const distanceM = speedMs * 5; // 5 seconds worth of movement
      const distanceDeg = distanceM / 111320;
      
      pos.lat += distanceDeg * Math.cos(pos.heading * Math.PI / 180);
      pos.lng += distanceDeg * Math.sin(pos.heading * Math.PI / 180);
      
      // Randomly change heading slightly
      pos.heading += (Math.random() - 0.5) * 20;
      
      // Keep vehicles in London area
      if (pos.lat < 51.3 || pos.lat > 51.7) {
        pos.heading = (pos.heading + 180) % 360;
        pos.lat = Math.max(51.3, Math.min(51.7, pos.lat));
      }
      if (pos.lng < -0.5 || pos.lng > 0.2) {
        pos.heading = (pos.heading + 180) % 360;
        pos.lng = Math.max(-0.5, Math.min(0.2, pos.lng));
      }
    });
    
    // Emit updated positions immediately
    io.emit('vehiclePositions', vehiclePositions);
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

const PORT = process.env.PORT || 8002;
server.listen(PORT, () => {
  console.log(`Enhanced mock server running on port ${PORT}`);
  console.log(`Vehicles loaded: ${Object.keys(vehiclePositions).length}`);
  console.log(`Zones loaded: ${zonePolygons.length}`);
  console.log('Zone detection and charging enabled');
});