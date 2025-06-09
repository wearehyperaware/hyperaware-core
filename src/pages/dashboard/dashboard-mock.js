import React from 'react'
import * as d3 from 'd3'
import { schemeCategory10 } from 'd3-scale-chromatic';
import mapboxgl from 'mapbox-gl'
import * as turf from '@turf/turf'
import 'mapbox-gl/dist/mapbox-gl.css'
import geojsonMerge from '@mapbox/geojson-merge'
import makeCar from './createCar'
import updatePositions from './updatePositions'
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
            recentCharges: []
        };
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

            // Initialize map
            map = new mapboxgl.Map({
                container: this.mapContainer,
                style: 'mapbox://styles/mapbox/light-v10',
                center: [24.56900802672635, 51.27714197030792],
                zoom: 3.4
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
                    
                    // Setup WebSocket listeners
                    console.log('🔌 Setting up WebSocket listeners...');
                    this.setupSocketListeners();
                    console.log('✅ Socket listeners set up');
                    
                    // Add map move handler like original
                    map.on('move', () => {
                        this.updateMapElements();
                    });
                    
                    // Start vehicle movement simulation
                    setTimeout(() => {
                        console.log('🎬 Starting vehicle simulation...');
                        socket.emit('startSimulation');
                    }, 2000);
                    
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
                    
                    // Zoom to show all zones like original
                    if (this.state.zones && this.state.zones.length > 0) {
                        setTimeout(() => {
                            try {
                                const turfPolygons = geojsonMerge.merge(this.state.zones);
                                if (turfPolygons) {
                                    map.fitBounds(turf.bbox(turfPolygons), {
                                        padding: {
                                            left: 100,
                                            top: 100,
                                            bottom: 100,
                                            right: 500
                                        }
                                    });
                                }
                            } catch (e) {
                                console.log('Could not auto-zoom to zones:', e);
                            }
                        }, 800);
                    }
                    
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
            d3.select('#overlay').append('svg');
            
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
                    if (makeCar) {
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

    setupSocketListeners() {
        console.log('🔧 Setting up socket listeners...');
        
        // Listen for vehicle position updates
        socket.on('vehiclePositions', (positions) => {
            console.log('🚗 Received vehicle positions:', Object.keys(positions).length, 'vehicles');
            this.updateVehiclePositions(positions);
        });
        
        // Listen for zone charge events
        socket.on('zoneCharge', (charge) => {
            console.log('💰 Zone charge event:', charge);
            this.handleZoneCharge(charge);
        });
        
        // Listen for zone entry/exit events
        socket.on('zoneEntry', (entry) => {
            console.log('🟢 Zone entry:', entry);
            // You could add visual notifications here
        });
        
        socket.on('zoneExit', (exit) => {
            console.log('🔴 Zone exit:', exit);
            // You could add visual notifications here
        });
        
        // Force socket connection if not connected
        if (!socket.connected) {
            console.log('🔄 Socket not connected, attempting to connect...');
            socket.connect();
        }
    }

    updateVehiclePositions(positions) {
        const { vehicles } = this.state;
        
        console.log('Updating positions for', vehicles.length, 'vehicles');
        
        // Use the original updatePositions function if available
        if (updatePositions && typeof updatePositions === 'function') {
            updatePositions(positions);
        } else {
            // Fallback: update D3 circles directly
            Object.keys(positions).forEach(vehicleId => {
                const newPos = positions[vehicleId];
                if (newPos) {
                    console.log(`Moving vehicle ${vehicleId} to [${newPos.lng}, ${newPos.lat}]`);
                    
                    // Update D3 circle position
                    const circle = d3.select(`#${vehicleId.replace(/:/g, '_')}`);
                    if (!circle.empty()) {
                        const pixelCoords = map.project([newPos.lng, newPos.lat]);
                        circle.attr('transform', `translate(${pixelCoords.x}, ${pixelCoords.y})`);
                    }
                }
            });
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
        
        // Update balances
        const newBalances = {
            ...vehicleBalances,
            [charge.vehicleId]: charge.newBalance
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
            zoneCharges: zoneCharges + charge.charge,
            vehicleBalances: newBalances,
            recentCharges: newRecentCharges
        });
    }

    togglePrivateMode = () => {
        const { privateMode, vehicles } = this.state;
        const newMode = !privateMode;
        
        // Hide/show private vehicles
        vehicles.forEach(vehicle => {
            if (vehicle.private && vehicle.element) {
                vehicle.element.style.display = newMode ? 'none' : 'block';
            }
        });
        
        this.setState({ privateMode: newMode });
    }

    render() {
        const { zones, vehicles, totalVehicles, zoneCharges, privateMode, recentCharges } = this.state;
        
        return (
            <div>
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
                    <button className='btn btn-primary mx-2'>ADVANCE</button>
                    <button className='btn btn-primary mx-2'
                            onClick={this.togglePrivateMode}>{privateMode ? 'Privacy Mode Off' : 'Privacy Mode On'}</button>
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
                    pointerEvents: 'none'
                }}/>

                <Col lg={7} style={{width: '550px', marginTop: '110px', marginLeft: '66.5%'}}>
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

                <Col lg={7} style={{width: '550px', marginLeft: '66.5%'}}>
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
                                    1500 IOTX
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