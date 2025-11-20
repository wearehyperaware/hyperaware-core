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
const samplePoints = require('./data/samplePoints.json');

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
  console.log('Fetching vehicles (single vehicle mode)...');

  // Only return the FIRST vehicle for debugging
  const firstVehicle = sampleVehicles[0];
  const vehicleId = firstVehicle.id || 'vehicle_0';

  // Set initial position to the route start (first coordinate)
  const routeStart = [-0.21736251996773603, 51.45971970324189];
  vehiclePositions[vehicleId] = {
    lat: routeStart[1],
    lng: routeStart[0],
    speed: 30,
    heading: 0
  };

  const vehiclesWithPositions = [{
    ...firstVehicle,
    id: vehicleId,
    isPrivate: false,  // Make vehicle visible (not transparent)
    position: vehiclePositions[vehicleId],
    balance: vehicleBalances[vehicleId],
    currentZones: Array.from(vehicleInZones[vehicleId] || [])
  }];

  console.log(`Returning 1 vehicle at position [${routeStart[0]}, ${routeStart[1]}]`);
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
  console.log('Generating single-vehicle route animation...');

  // User-provided LineString route through London (exact coordinates)
  const routeCoordinates = [
    [-0.21736251996773603, 51.45971970324189],
    [-0.21404191091170333, 51.46528673135887],
    [-0.20963455707340017, 51.469348728696104],
    [-0.20824593874021957, 51.46946155679373],
    [-0.20613282388680432, 51.47141719948428],
    [-0.20015572758580902, 51.472695843611746],
    [-0.1904957739676547, 51.47765965175668],
    [-0.18335375799054532, 51.481269304680495],
    [-0.19271183805778946, 51.48875100836108],
    [-0.18516499929398833, 51.491156923544196],
    [-0.18045577190477502, 51.491044149106045],
    [-0.17393530321308504, 51.49390101555227],
    [-0.1742371767639952, 51.49491591184761],
    [-0.17073544357745618, 51.49638183327187],
    [-0.16062600386496229, 51.50167938127865],
    [-0.151932045608703, 51.503145085183405],
    [-0.14915480894330813, 51.50340815525331],
    [-0.13796786557307428, 51.508623579443764],
    [-0.13434538296615983, 51.50982602849572],
    [-0.1326548910830354, 51.50986360451725],
    [-0.13048140151948928, 51.50775929958502],
    [-0.12734191659302496, 51.50760898837095],
    [-0.12233081565389625, 51.50640648080537],
    [-0.11846683420725412, 51.510013908293274],
    [-0.11357648268747766, 51.50486572160659],
    [-0.10785605810312404, 51.50695878098031],
    [-0.10435432491757979, 51.50707151604607],
    [-0.10429395020739207, 51.51161826453543],
    [-0.09578111608172435, 51.51173098807246],
    [-0.09089076456194789, 51.513008501997405],
    [-0.08787202905682534, 51.513459380711424],
    [-0.0844306705804172, 51.513459380711424],
    [-0.07930432575378177, 51.519586848829675],
    [-0.07731196031977561, 51.52311810260133],
    [-0.07797608213175522, 51.52743788108879],
    [-0.07711910323908455, 51.53457958102658],
    [-0.07435267601294981, 51.55673837318699]
  ];

  const vehicleIds = Object.keys(vehiclePositions);
  const singleVehicleId = vehicleIds[0];

  console.log(`Route has ${routeCoordinates.length} coordinate points`);
  console.log(`Using single vehicle: ${singleVehicleId}`);

  // Use the actual LineString coordinates as timesteps
  // This will make the vehicle follow the exact path
  const timesteps = routeCoordinates.map((coord, index) => {
    console.log(`Point ${index}: [${coord[0].toFixed(4)}, ${coord[1].toFixed(4)}]`);
    return [{
      coords: coord
    }];
  });

  console.log(`Generated ${timesteps.length} timesteps following exact LineString path`);
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