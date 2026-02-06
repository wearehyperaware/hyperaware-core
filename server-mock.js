const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

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

// Initialize vehicle positions and balances
sampleVehicles.forEach((vehicle, index) => {
  vehiclePositions[vehicle.id || `vehicle_${index}`] = {
    lat: 51.5074 + (Math.random() - 0.5) * 0.1,
    lng: -0.1278 + (Math.random() - 0.5) * 0.1,
    speed: 30 + Math.random() * 20,
    heading: Math.random() * 360
  };
  vehicleBalances[vehicle.id || `vehicle_${index}`] = 100; // Start with 100 credits
});

// API endpoints
app.get('/api/getAllVehicles', (req, res) => {
  console.log('Fetching all vehicles...');
  // Return sample vehicles with current positions
  const vehiclesWithPositions = sampleVehicles.map((vehicle, index) => ({
    ...vehicle,
    position: vehiclePositions[vehicle.id || `vehicle_${index}`],
    balance: vehicleBalances[vehicle.id || `vehicle_${index}`]
  }));
  res.json(vehiclesWithPositions);
});

app.get('/api/getAllPolygons', (req, res) => {
  console.log('Fetching all zones...');
  res.json(samplePolygons);
});

app.get('/api/getAllPoints', (req, res) => {
  console.log('Generating vehicle routes...');
  // Generate random points for vehicle movement
  const points = sampleVehicles.map((vehicle, index) => {
    const vehicleId = vehicle.id || `vehicle_${index}`;
    const currentPos = vehiclePositions[vehicleId];
    
    // Generate a route of 10 points
    const route = [];
    let lat = currentPos.lat;
    let lng = currentPos.lng;
    
    for (let i = 0; i < 10; i++) {
      lat += (Math.random() - 0.5) * 0.01;
      lng += (Math.random() - 0.5) * 0.01;
      route.push({
        lat,
        lng,
        timestamp: Date.now() + i * 5000 // 5 seconds between points
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
  console.log('Getting total staked...');
  res.json({ totalStaked: '1000000' }); // Mock value
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    mapbox: 'ready',
    vehicles: Object.keys(vehiclePositions).length,
    zones: samplePolygons.length,
    timestamp: new Date().toISOString()
  });
});

// WebSocket handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Send initial positions
  socket.emit('vehiclePositions', vehiclePositions);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Simulate vehicle movement
setInterval(() => {
  Object.keys(vehiclePositions).forEach(vehicleId => {
    const pos = vehiclePositions[vehicleId];
    
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
    if (pos.lat < 51.4 || pos.lat > 51.6) pos.heading += 180;
    if (pos.lng < -0.3 || pos.lng > 0.1) pos.heading += 180;
    
    // Simulate zone charges (random)
    if (Math.random() < 0.01) { // 1% chance per second
      vehicleBalances[vehicleId] = Math.max(0, vehicleBalances[vehicleId] - 5);
      io.emit('zoneCharge', {
        vehicleId,
        charge: 5,
        newBalance: vehicleBalances[vehicleId],
        zone: 'London Congestion Zone'
      });
    }
  });
  
  // Emit updated positions
  io.emit('vehiclePositions', vehiclePositions);
}, 1000);

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
  console.log(`Vehicles loaded: ${Object.keys(vehiclePositions).length}`);
  console.log(`Zones loaded: ${samplePolygons.length}`);
});