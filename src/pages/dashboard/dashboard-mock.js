import React from 'react'
import * as d3 from 'd3'
import { schemeCategory10 } from 'd3-scale-chromatic';
import mapboxgl from 'mapbox-gl'
import * as turf from '@turf/turf'
import 'mapbox-gl/dist/mapbox-gl.css'
import geojsonMerge from '@mapbox/geojson-merge'
import axios from 'axios'
import io from 'socket.io-client';
import Topbar from "../../components/Layout/Topbar";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import AnimateHeight from "react-animate-height";
import car from '../../images/icon/car.svg'
import ship from '../../images/icon/ship.svg'
import plane from '../../images/icon/plane.svg'
import arrowBottom from '../../images/shapes/arrow-bottom.png';
import {getStartEnd} from "./getPath";
import {htmlIDFromDID} from "../helperFunctions";

// Simplified loading text function
function setLoadingText(text) {
    const loadingElement = document.getElementById('loading-text');
    if (loadingElement) {
        if (text) {
            loadingElement.innerHTML = text;
            loadingElement.style.display = 'block';
        } else {
            loadingElement.style.display = 'none';
        }
    }
}

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || "pk.eyJ1IjoiamdqYW1lcyIsImEiOiJjazd5cHlucXUwMDF1M2VtZzM1bjVwZ2hnIn0.Oavbw2oHnexn0hiVOoZwuA";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8002';
console.log('API_URL for HTTP requests:', API_URL);
console.log('Using proxy for API requests via:', window.location.origin + '/api');

// Force direct connection to port 8002 for socket.io
const SOCKET_URL = 'http://localhost:8002';
console.log('Socket connecting directly to:', SOCKET_URL);

const socket = io(SOCKET_URL, {
    autoConnect: true,
    timeout: 10000,
    transports: ['websocket', 'polling'],
    forceNew: true
});

// Debug socket connection
socket.on('connect', () => {
    console.log('✅ Socket connected to server at:', API_URL);
    console.log('Socket ID:', socket.id);
});

socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error);
});

socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
});

console.log('Socket instance created:', socket);

export var map;
export var zone;

// Inline makeCar function based on original createCar.js
function makeCar(coords, vehicle) {
    const color = "#2f55d4";
    const id = (vehicle.id || '').replace(/:/g, '_');
    
    let new_car;
    if (vehicle.isPrivate === "true" || vehicle.isPrivate === true) {
        new_car = d3.select('svg')
            .append('circle')
            .attr('id', id)
            .classed('inzone', vehicle.within || false)
            .attr('isPrivateVehicle', 'true')
            .attr('data-coords', coords.toString())
            .attr('fill', 'transparent')
            .attr('stroke', 'transparent')
            .attr('r', '5px') // Original size
            .attr('transform', function () {
                var pixelCoords = map.project(coords);
                return 'translate(' + pixelCoords.x + ',' + pixelCoords.y + ')';
            })
            .on('click', function () {
                console.log(id);
            });
    } else {
        new_car = d3.select('svg')
            .append('circle')
            .attr('id', id)
            .classed('inzone', vehicle.within || false)
            .attr('isPrivateVehicle', 'false')
            .attr('data-coords', coords.toString())
            .attr('fill', color)
            .attr('stroke', '#fff')
            .attr('r', 5) // Original size
            .attr('transform', function () {
                var pixelCoords = map.project(coords);
                return 'translate(' + pixelCoords.x + ',' + pixelCoords.y + ')';
            })
            .on('click', function () {
                console.log(id);
            });
    }
    return new_car;
}

// Inline updatePositions function based on original updatePositions.js
function updatePositions(positions) {
    positions.forEach((position) => {
        const coords = position.coords || [position.lng, position.lat];
        const id = (position.vehicle?.id || position.id || '').replace(/:/g, '_');
        const within = position.vehicle?.within || position.within || false;

        const circle = d3.select('#' + id);
        if (!circle.empty()) {
            // Stop any existing transitions
            circle.interrupt();

            // Update class for radius change (CSS handles r attribute only)
            circle.classed('inzone', within);

            // Set fill color directly via D3 attribute (not CSS, not inline style)
            if (circle.attr('isPrivateVehicle') !== 'true') {
                const newColor = within ? 'red' : '#2f55d4';
                circle.attr('fill', newColor);
            }

            // Calculate new position and transition
            let pixelCoords = map.project(coords);
            circle
                .transition()
                .duration(400)
                .attr('transform', 'translate(' + pixelCoords.x + ',' + pixelCoords.y + ')');
        }
    });
}

export class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            zones: [],
            vehicles: [],
            buffered: null,
            positions: [],
            currentPos: 1,
            heightZonesCard: '0%',
            heightVehiclesCard: '0%',
            zoneCharges: 0,
            totalVehicles: 0,
            privateMode: false,
            vehicleBalances: {},
            recentCharges: [],
            isPlaying: false
        };
        this.playInterval = null;
    }

    async componentDidMount() {
        // Show the global page loader initially
        const pageLoader = document.getElementById("pageLoader");
        if (pageLoader) {
            pageLoader.style.display = "block";
            console.log('Global page loader shown');
        }
        
        setLoadingText("Initializing dashboard...");
        
        try {
            // Check if map container exists
            const mapContainer = document.getElementById('map');
            console.log('Map container found:', mapContainer);
            
            if (!mapContainer) {
                console.error('Map container not found!');
                setLoadingText("Error: Map container not found");
                return;
            }

            // Initialize map centered on London
            map = new mapboxgl.Map({
                container: this.mapContainer,
                style: 'mapbox://styles/mapbox/light-v10',
                center: [-0.1278, 51.5074], // London
                zoom: 11
            });

            console.log('Map created:', map);

            map.on('load', async () => {
                console.log('🗺️ Map loaded successfully');
                console.log('Map style loaded:', map.isStyleLoaded());
                console.log('Map center:', map.getCenter());
                console.log('Map zoom:', map.getZoom());
                setLoadingText("Loading zones and vehicles...");
                
                try {
                    // Load zones
                    console.log('📍 Starting to load zones...');
                    await this.loadZones();
                    console.log('✅ Zones loaded successfully');
                    
                    // Load vehicles
                    console.log('🚗 Starting to load vehicles...');
                    await this.loadVehicles();
                    console.log('✅ Vehicles loaded successfully');

                    // Load position/route data
                    console.log('📍 Loading vehicle route data...');
                    await this.loadPositions();
                    console.log('✅ Route data loaded successfully');

                    // Setup WebSocket listeners
                    console.log('🔌 Setting up WebSocket listeners...');
                    this.setupSocketListeners();
                    console.log('✅ Socket listeners set up');
                    
                    // Keep vehicle markers synced with map pan/zoom
                    map.on('move', () => {
                        this.updateMapElements();
                    });
                    
                    // Add the route LineString to the map for visualization (exact user-provided coordinates)
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

                    map.addSource('route', {
                        type: 'geojson',
                        data: {
                            type: 'Feature',
                            geometry: {
                                type: 'LineString',
                                coordinates: routeCoordinates
                            }
                        }
                    });

                    map.addLayer({
                        id: 'route-line',
                        type: 'line',
                        source: 'route',
                        paint: {
                            'line-color': '#888',
                            'line-width': 4,
                            'line-opacity': 0.6
                        }
                    });

                    console.log('🛣️ Route LineString added to map');

                    // Store route info for step-based animation
                    const line = turf.lineString(routeCoordinates);
                    const totalLength = turf.length(line, { units: 'kilometers' });
                    const numSteps = 20; // Number of discrete steps
                    const stepLength = totalLength / numSteps;

                    // Store on window for access from button handlers
                    window.routeAnimation = {
                        line,
                        totalLength,
                        numSteps,
                        stepLength,
                        currentStep: 0,
                        animationId: null,
                        isAnimating: false,
                        inZone: false  // Track zone state
                    };

                    // Store reference to addNotification for zone events
                    window.addNotification = this.addNotification.bind(this);

                    console.log(`Route: ${totalLength.toFixed(2)} km, ${numSteps} steps, ${stepLength.toFixed(2)} km/step`);

                    // Function to animate smoothly between two distances
                    window.animateToStep = (targetStep) => {
                        const ra = window.routeAnimation;
                        if (ra.isAnimating) return; // Don't interrupt ongoing animation

                        const startDistance = ra.currentStep * ra.stepLength;
                        const endDistance = Math.min(targetStep * ra.stepLength, ra.totalLength);
                        const duration = 500; // 500ms per step
                        let startTime = null;

                        ra.isAnimating = true;

                        const animate = (timestamp) => {
                            if (!startTime) startTime = timestamp;
                            const elapsed = timestamp - startTime;
                            const progress = Math.min(elapsed / duration, 1);

                            // Lerp between start and end distance
                            const currentDistance = startDistance + (endDistance - startDistance) * progress;
                            const point = turf.along(ra.line, currentDistance, { units: 'kilometers' });
                            const coords = point.geometry.coordinates;

                            // Update vehicle position
                            const vehicleId = 'did_io_0xb9006455c064207da1c613d8448efff729977f72';
                            const circle = d3.select('#' + vehicleId);
                            if (!circle.empty()) {
                                const pixelCoords = map.project(coords);
                                circle.attr('transform', 'translate(' + pixelCoords.x + ',' + pixelCoords.y + ')');
                                circle.attr('data-coords', coords.join(','));

                                // Zone detection
                                if (window.zonePolygons) {
                                    const vehiclePoint = turf.point(coords);
                                    let nowInZone = false;

                                    for (const zone of window.zonePolygons) {
                                        // Zone is a FeatureCollection, check each feature
                                        if (zone.features) {
                                            for (const feature of zone.features) {
                                                if (feature.geometry && turf.booleanPointInPolygon(vehiclePoint, feature)) {
                                                    nowInZone = true;
                                                    break;
                                                }
                                            }
                                        }
                                        if (nowInZone) break;
                                    }

                                    // Detect transitions
                                    if (nowInZone && !ra.inZone) {
                                        // Entering zone
                                        console.log('🟢 Entering congestion zone!');
                                        circle.attr('fill', 'red');
                                        circle.classed('inzone', true);
                                        if (window.addNotification) {
                                            window.addNotification('enter', vehicleId.replace(/_/g, ':'), 'Congestion Zone');
                                        }
                                        ra.inZone = true;
                                    } else if (!nowInZone && ra.inZone) {
                                        // Exiting zone
                                        console.log('🔴 Exiting congestion zone!');
                                        circle.attr('fill', '#2f55d4');
                                        circle.classed('inzone', false);
                                        if (window.addNotification) {
                                            window.addNotification('exit', vehicleId.replace(/_/g, ':'), 'Congestion Zone');
                                        }
                                        ra.inZone = false;
                                    }
                                }
                            }

                            if (progress < 1) {
                                ra.animationId = requestAnimationFrame(animate);
                            } else {
                                ra.currentStep = targetStep;
                                ra.isAnimating = false;
                                // If playing, continue to next step
                                if (window.isPlaying && ra.currentStep < ra.numSteps) {
                                    window.animateToStep(ra.currentStep + 1);
                                } else if (window.isPlaying && ra.currentStep >= ra.numSteps) {
                                    // Loop back to start
                                    ra.currentStep = 0;
                                    window.animateToStep(1);
                                }
                            }
                        };

                        ra.animationId = requestAnimationFrame(animate);
                    };

                    window.isPlaying = false;
                    
                    // Hide page loader and loading text like original
                    const pageLoader = document.getElementById("pageLoader");
                    if (pageLoader) {
                        pageLoader.style.display = "none";
                    }
                    const loadingTextEl = document.getElementById("loading-text");
                    if (loadingTextEl) {
                        loadingTextEl.style.display = "none";
                    }
                    setLoadingText("");

                    console.log('✅ Dashboard initialization complete');
                    console.log('Map sources after loading:', Object.keys(map.getStyle().sources || {}));
                    console.log('Map layers after loading:', map.getStyle().layers?.map(l => l.id) || []);
                } catch (error) {
                    console.error('❌ Error during map load:', error);
                    console.error('Error stack:', error.stack);
                    setLoadingText("Error loading dashboard: " + error.message);
                }
            });

            map.on('error', (e) => {
                console.error('Map error:', e);
                setLoadingText("Map failed to load");
            });

        } catch (error) {
            console.error('Error initializing map:', error);
            setLoadingText("Failed to initialize map");
        }
    }

    async loadZones() {
        try {
            console.log('🌐 Fetching zones from API...');
            console.log('Making request to:', '/api/getAllPolygons');
            const response = await axios.get('/api/getAllPolygons');
            console.log('📊 Zones API response:', response.status, response.data?.length || 0, 'zones');
            const zones = response.data;
            
            if (!zones || zones.length === 0) {
                console.warn('⚠️ No zones received from API');
                return;
            }
            
            // Add zones to map using original styling
            zones.forEach((zone, index) => {
                try {
                    const zoneName = zone.features?.[0]?.properties?.name || `zone-${index}`;
                    console.log(`🗺️ Adding zone ${index}: ${zoneName}`);
                    
                    map.addSource('zone-' + zoneName.toLowerCase(), {
                        type: 'geojson',
                        data: zone
                    });
                    
                    map.addLayer({
                        id: 'zone-border-' + zoneName.toLowerCase(),
                        source: 'zone-' + zoneName.toLowerCase(),
                        type: 'line',
                        paint: {
                            'line-opacity': .5,
                            'line-color': schemeCategory10[index % 10],
                            'line-width': [
                                'interpolate',
                                ['exponential', 0.5],
                                ['zoom'],
                                3,
                                1,
                                7,
                                2,
                                15,
                                3,
                                22,
                                5
                            ]
                        }
                    });
                    
                    map.addLayer({
                        id: 'zone-fill-' + zoneName.toLowerCase(),
                        source: 'zone-' + zoneName.toLowerCase(),
                        type: 'fill',
                        paint: {
                            'fill-opacity': .1,
                            'fill-color': schemeCategory10[index % 10]
                        }
                    });
                    
                    console.log(`✅ Zone ${index} added successfully`);
                } catch (zoneError) {
                    console.error(`❌ Error adding zone ${index}:`, zoneError);
                }
            });
            
            this.setState({ zones });
            // Store zones on window for animation zone detection
            window.zonePolygons = zones;
            console.log(`✅ Successfully loaded ${zones.length} zones to map`);
        } catch (error) {
            console.error('❌ Error loading zones:', error);
            console.error('Zone loading error stack:', error.stack);
            throw error; // Re-throw to be caught by calling function
        }
    }

    async loadVehicles() {
        try {
            console.log('🚗 Fetching vehicles from API...');
            console.log('Making request to:', '/api/getAllVehicles');
            const response = await axios.get('/api/getAllVehicles');
            console.log('📊 Vehicles API response:', response.status, response.data?.length || 0, 'vehicles');
            const vehicles = response.data;
            
            if (!vehicles || vehicles.length === 0) {
                console.warn('⚠️ No vehicles received from API');
                return;
            }
            
            // Set up svg canvas for D3 vehicles (like original)
            const svg = d3.select('#overlay').append('svg')
                .attr('width', '100%')
                .attr('height', '100%')
                .style('position', 'absolute')
                .style('top', 0)
                .style('left', 0);
            
            // Add each vehicle using D3 (like original)
            vehicles.forEach((vehicle, index) => {
                try {
                    console.log(`🚗 Adding vehicle ${index}: ${vehicle.id?.slice(-6) || 'Unknown'} at [${vehicle.position?.lng}, ${vehicle.position?.lat}]`);
                    
                    if (!vehicle.position || typeof vehicle.position.lng !== 'number' || typeof vehicle.position.lat !== 'number') {
                        console.warn(`⚠️ Invalid position for vehicle ${vehicle.id}:`, vehicle.position);
                        return;
                    }
                    
                    // Create vehicle using D3/SVG approach like original
                    const coords = [vehicle.position.lng, vehicle.position.lat];
                    if (typeof makeCar === 'function') {
                        makeCar(coords, vehicle);
                    }
                    
                    console.log(`✅ Vehicle ${index} added successfully`);
                } catch (vehicleError) {
                    console.error(`❌ Error adding vehicle ${index}:`, vehicleError);
                }
            });
            
            this.setState({ 
                vehicles,
                totalVehicles: vehicles.length,
                vehicleBalances: vehicles.reduce((acc, v) => ({
                    ...acc,
                    [v.id]: v.balance || 100
                }), {})
            });
            
            console.log(`✅ Successfully loaded ${vehicles.length} vehicles to map`);
        } catch (error) {
            console.error('❌ Error loading vehicles:', error);
            console.error('Vehicle loading error stack:', error.stack);
            throw error; // Re-throw to be caught by calling function
        }
    }

    async loadPositions() {
        try {
            console.log('🗺️ Fetching route/position data from API...');
            console.log('Making request to:', '/api/getAllPoints');
            const response = await axios.get('/api/getAllPoints');
            console.log('📊 Position data response:', response.status, response.data?.length || 0, 'timesteps');
            const positions = response.data;

            if (!positions || positions.length === 0) {
                console.warn('⚠️ No position data received from API');
                return;
            }

            // Add vehicle IDs to position data to match original format
            const vehicles = this.state.vehicles;
            const enhancedPositions = positions.map((timestep, timestepIndex) => {
                return timestep.map((pos, vehicleIndex) => {
                    const vehicle = vehicles[vehicleIndex];
                    return {
                        ...pos,
                        vehicle: {
                            id: vehicle?.id || `vehicle_${vehicleIndex}`,
                            within: false
                        }
                    };
                });
            });

            this.setState({
                positions: enhancedPositions,
                currentPos: 0
            });

            console.log(`✅ Successfully loaded ${enhancedPositions.length} position timesteps`);
        } catch (error) {
            console.error('❌ Error loading positions:', error);
            console.error('Position loading error stack:', error.stack);
            throw error;
        }
    }

    setupSocketListeners() {
        console.log('🔧 Setting up socket listeners...');

        // DISABLED: Position updates now handled by client-side smooth animation
        // socket.on('vehiclePositions', (positions) => {
        //     console.log('🚗 Received vehicle positions:', Object.keys(positions).length, 'vehicles');
        //     this.updateVehiclePositions(positions);
        // });

        // Listen for zone charge events
        socket.on('zoneCharge', (charge) => {
            console.log('💰 Zone charge event:', charge);
            this.handleZoneCharge(charge);
        });

        // Listen for zone entry/exit events
        socket.on('zoneEntry', (entry) => {
            console.log('🟢 Zone entry:', entry);
            this.addNotification('enter', entry.vehicleId, entry.zone);
        });

        socket.on('zoneExit', (exit) => {
            console.log('🔴 Zone exit:', exit);
            this.addNotification('exit', exit.vehicleId, exit.zone);
        });

        // DISABLED: Position updates now handled by client-side smooth animation
        // socket.on('updatePositions', (newPositions, allPositions) => {
        //     console.log('📍 Received updatePositions from server:', newPositions?.length || 0, 'positions');
        //     if (newPositions && newPositions.length > 0) {
        //         updatePositions(newPositions);
        //         if (allPositions) {
        //             this.setState({ positions: allPositions });
        //         }
        //     }
        // });

        // DISABLED: Zone notifications from ADVANCE (using client-side detection instead)
        // socket.on('fetchNewPositionsFromServerResponse', (notification, hash) => {
        //     console.log('📢 Zone event notification:', notification.type, notification.vehicleDetails?.id);
        //     if (notification.type === 'enter') {
        //         this.addNotification('enter', notification.vehicleDetails.id, 'zone');
        //     } else if (notification.type === 'exit') {
        //         this.addNotification('exit', notification.vehicleDetails.id, 'zone');
        //     }
        // });

        // Force socket connection if not connected
        if (!socket.connected) {
            console.log('🔄 Socket not connected, attempting to connect...');
            socket.connect();
        }
    }

    updateVehiclePositions(positions) {
        console.log('Updating vehicle positions:', positions);
        
        // Transform positions to match original format if needed
        if (Array.isArray(positions)) {
            updatePositions(positions);
        } else if (typeof positions === 'object') {
            // Convert object format to array format
            const positionsArray = Object.keys(positions).map(vehicleId => ({
                id: vehicleId,
                vehicle: { id: vehicleId, within: positions[vehicleId].within },
                coords: [positions[vehicleId].lng, positions[vehicleId].lat],
                lng: positions[vehicleId].lng,
                lat: positions[vehicleId].lat
            }));
            updatePositions(positionsArray);
        }
    }

    updateMapElements = () => {
        // Update D3 elements when map moves (like original)
        d3.selectAll('circle')
            .attr('transform', function () {
                const coords = d3.select(this)
                    .attr('data-coords');
                if (coords) {
                    let pixelCoords = map.project(
                        coords.split(',').map(Number)
                    );
                    return 'translate(' + pixelCoords.x + ',' + pixelCoords.y + ')';
                }
                return '';
            });
    }

    handleZoneCharge(charge) {
        const { zoneCharges, vehicleBalances, recentCharges } = this.state;

        // Update balances - parse to ensure numbers
        const newBalances = {
            ...vehicleBalances,
            [charge.vehicleId]: parseFloat(charge.newBalance)
        };

        // Add to recent charges (keep last 5)
        const newRecentCharges = [
            {
                ...charge,
                timestamp: new Date().toISOString()
            },
            ...recentCharges
        ].slice(0, 5);

        this.setState({
            zoneCharges: zoneCharges + parseFloat(charge.charge),
            vehicleBalances: newBalances,
            recentCharges: newRecentCharges
        });
    }

    generateTxHash = () => {
        // Generate a random Ethereum-style transaction hash
        return '0x' + Array.from({length: 64}, () =>
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
    }

    addNotification = (type, vehicleId, zoneName) => {
        const txHash = this.generateTxHash();
        const timestamp = new Date().toLocaleTimeString();

        // Always use "London Congestion Zone" as the zone name
        const displayZone = "London Congestion Zone";

        const notification_config = {
            enter: {
                iconSvg: 'data:image/svg+xml;base64,' + btoa(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#10b981" stroke="#059669" stroke-width="2"/><path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`),
                title: 'Zone Entry Detected',
                message: 'Vehicle has entered the congestion zone',
                borderColor: '#10b981',
                bgColor: '#f0fdf4'
            },
            exit: {
                iconSvg: 'data:image/svg+xml;base64,' + btoa(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#6366f1" stroke="#4f46e5" stroke-width="2"/><path d="M8 12L16 12M16 12L13 9M16 12L13 15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`),
                title: 'Zone Exit Confirmed',
                message: 'Vehicle has exited the congestion zone',
                borderColor: '#6366f1',
                bgColor: '#eef2ff'
            }
        };

        const config = notification_config[type];

        const toastHTML = `
            <div class="eth-toast" style="
                background: ${config.bgColor};
                border-left: 4px solid ${config.borderColor};
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08);
                padding: 16px;
                margin-bottom: 12px;
                min-width: 340px;
                max-width: 420px;
                animation: slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            ">
                <div style="display: flex; align-items: start; gap: 14px;">
                    <div style="flex-shrink: 0; margin-top: 2px;">
                        <img src="${config.iconSvg}" width="24" height="24" alt="" />
                    </div>
                    <div style="flex: 1;">
                        <div style="
                            font-weight: 600;
                            font-size: 15px;
                            color: #111827;
                            margin-bottom: 4px;
                            letter-spacing: -0.01em;
                        ">${config.title}</div>
                        <div style="
                            font-size: 13px;
                            color: #6b7280;
                            margin-bottom: 12px;
                            line-height: 1.4;
                        ">${config.message}</div>

                        <div style="
                            font-size: 11px;
                            color: #374151;
                            font-family: 'SF Mono', 'Roboto Mono', monospace;
                            background: white;
                            padding: 8px 10px;
                            border-radius: 6px;
                            margin-bottom: 6px;
                            border: 1px solid #e5e7eb;
                        ">
                            <div style="color: #9ca3af; font-size: 10px; margin-bottom: 3px;">VEHICLE DID</div>
                            <div style="font-weight: 500;">${this.truncateDID(vehicleId)}</div>
                        </div>

                        <div style="
                            font-size: 11px;
                            color: #374151;
                            font-family: 'SF Mono', 'Roboto Mono', monospace;
                            background: white;
                            padding: 8px 10px;
                            border-radius: 6px;
                            margin-bottom: 6px;
                            border: 1px solid #e5e7eb;
                        ">
                            <div style="color: #9ca3af; font-size: 10px; margin-bottom: 3px;">ZONE</div>
                            <div style="font-weight: 500;">${displayZone}</div>
                        </div>

                        <div style="
                            font-size: 10px;
                            color: #374151;
                            font-family: 'SF Mono', 'Roboto Mono', monospace;
                            background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
                            padding: 8px 10px;
                            border-radius: 6px;
                            border: 1px solid rgba(99, 102, 241, 0.2);
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        ">
                            <div style="width: 14px; height: 14px; flex-shrink: 0;">✓</div>
                            <div style="flex: 1; overflow: hidden;">
                                <div style="color: #9ca3af; font-size: 9px; margin-bottom: 2px;">TX HASH</div>
                                <div style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    ${txHash.substring(0, 10)}...${txHash.substring(58)}
                                </div>
                            </div>
                        </div>

                        <div style="
                            font-size: 10px;
                            color: #9ca3af;
                            margin-top: 8px;
                        ">
                            🕐 ${timestamp}
                        </div>
                    </div>
                </div>
            </div>
        `;

        const toastContainer = d3.select('#toast-container');
        const toast = toastContainer.insert('div', ':first-child').html(toastHTML);

        // Auto-remove after 8 seconds
        setTimeout(() => {
            toast.style('animation', 'slideOutLeft 0.3s ease-in')
                .transition()
                .duration(300)
                .style('opacity', 0)
                .remove();
        }, 8000);
    }

    truncateDID = (did) => {
        if (!did) return '...';
        return did.substr(0, 15) + "..." + did.substr(-8);
    }

    togglePrivateMode = () => {
        const { privateMode } = this.state;
        const newMode = !privateMode;
        
        // Hide/show private vehicles using D3
        if (newMode) {
            // Privacy mode ON - hide private vehicles
            d3.selectAll('circle[isPrivateVehicle="true"]')
                .attr('fill', 'transparent')
                .attr('stroke', 'transparent');
        } else {
            // Privacy mode OFF - show private vehicles
            d3.selectAll('circle[isPrivateVehicle="true"]')
                .attr('fill', '#2f55d4')
                .attr('stroke', '#fff');
        }
        
        this.setState({ privateMode: newMode });
    }

    handleAdvance = (e) => {
        if (e) e.preventDefault();
        console.log('🎯 ADVANCE button clicked');

        // Smoothly animate to next step
        if (window.routeAnimation && window.animateToStep) {
            const ra = window.routeAnimation;
            if (ra.currentStep < ra.numSteps) {
                window.animateToStep(ra.currentStep + 1);
                console.log(`Advancing to step ${ra.currentStep + 1}/${ra.numSteps}`);
            } else {
                // Loop back to start
                ra.currentStep = 0;
                window.animateToStep(1);
                console.log('Looping back to start');
            }
        }
    }

    handlePlayPause = (e) => {
        if (e) e.preventDefault();
        const { isPlaying } = this.state;

        if (isPlaying) {
            // Stop playing
            window.isPlaying = false;
            if (window.routeAnimation) {
                cancelAnimationFrame(window.routeAnimation.animationId);
                window.routeAnimation.isAnimating = false;
            }
            this.setState({ isPlaying: false });
            console.log('⏸️ Animation paused');
        } else {
            // Start playing
            window.isPlaying = true;
            this.setState({ isPlaying: true });
            console.log('▶️ Animation playing');
            // Kick off the animation
            if (window.routeAnimation && window.animateToStep) {
                const ra = window.routeAnimation;
                window.animateToStep(ra.currentStep + 1);
            }
        }
    }

    render() {
        const { zones, vehicles, totalVehicles, zoneCharges, privateMode, recentCharges, isPlaying } = this.state;
        
        return (
            <div>
                <style>{`
                    @keyframes slideInLeft {
                        from {
                            transform: translateX(-100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }
                    @keyframes slideOutLeft {
                        from {
                            transform: translateX(0);
                            opacity: 1;
                        }
                        to {
                            transform: translateX(-100%);
                            opacity: 0;
                        }
                    }
                    #toast-container {
                        position: fixed;
                        bottom: 20px;
                        left: 20px;
                        z-index: 10000;
                        pointer-events: none;
                    }
                `}</style>

                <div id="toast-container"></div>

                <div id='sidebar' className='sidebar'>
                    <div className='clearfix'>
                        <div className='screen'>
                            <div className='metriclabel small space-top2 space-bottom2'
                                 style={{color: '#363636'}}>Notifications
                            </div>
                            <div className='ticker dark small text-left' id='ticker'>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='d-flex justify-content-center dashboard-main-buttons'>
                    <button className='btn btn-primary mx-2' onClick={this.handlePlayPause}>
                        {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
                    </button>
                    <button className='btn btn-primary mx-2' onClick={this.handleAdvance}>ADVANCE</button>
                </div>

                <Topbar/>

                <div ref={el => this.mapContainer = el} className='map' id='map' style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    width: '100%'
                }}></div>

                <div ref={el => this.overlay = el} className='overlay' id='overlay' style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none'
                }}/>

                <Col lg={4} style={{position: 'absolute', right: '20px', top: '110px', width: '320px', zIndex: 10}}>
                    <div className="studio-home bg-white shadow mt-4 " style={{paddingTop: '16px', paddingLeft: '8px'}}>
                        <h2 className='d-flex justify-content-center'>Zones<span className="text-primary">.</span></h2>
                        <div className='row d-flex justify-content-center'>
                            <div className='col-6'>
                                <h2 className='row heading text-primary d-flex justify-content-center'>
                                    {zones.length}
                                </h2>
                                <div className='row d-flex justify-content-center'>
                                    Jurisdictions.
                                </div>
                            </div>
                            <div className='col-6 text-center'>
                                <h2 className='row heading text-primary d-flex justify-content-center'>
                                    {totalVehicles}
                                </h2>
                                <div className='row d-flex justify-content-center'>
                                    Vehicles in zones.
                                </div>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-6'>
                                <h2 className='row heading text-primary d-flex justify-content-center'>
                                    {zones.length}
                                </h2>
                                <div className='row d-flex justify-content-center'>
                                    Policy Zones.
                                </div>
                            </div>
                            <div className='col-6'>
                                <h2 className='row heading text-primary d-flex justify-content-center'>
                                    {zoneCharges.toFixed(2)}
                                </h2>
                                <div className='row d-flex justify-content-center'>
                                    Charges Collected Today.
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>

                <Col lg={4} style={{position: 'absolute', right: '20px', top: '380px', width: '320px', zIndex: 10}}>
                    <div className="studio-home bg-white shadow mt-5 " style={{paddingTop: '8px', paddingLeft: '8px'}}>
                        <h2 className='d-flex justify-content-center'>Vehicles<span className="text-primary">.</span></h2>
                        <div className='row d-flex justify-content-center'>
                            <div className='col-6'>
                                <h2 className='row heading text-primary d-flex justify-content-center'>
                                    {vehicles ? vehicles.length : "..."}
                                </h2>
                                <div className='row d-flex justify-content-center'>
                                    Vehicles Registered.
                                </div>
                            </div>
                            <div className='col-6 text-center'>
                                <h2 className='row heading text-primary d-flex justify-content-center'>
                                    {vehicles ? vehicles.length : "..."}
                                </h2>
                                <div className='row d-flex justify-content-center'>
                                    Entities.
                                </div>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col'>
                                <h2 className='row heading text-primary d-flex justify-content-center'>
                                    150 USDC
                                </h2>
                                <div className='row d-flex justify-content-center'>
                                    Staked in Contract.
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>
            </div>
        );
    }
}

export default Dashboard;