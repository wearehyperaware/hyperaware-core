import React from 'react'
import * as d3 from 'd3'
import { schemeCategory10 } from 'd3-scale-chromatic';
import mapboxgl from 'mapbox-gl'
import * as turf from '@turf/turf'
import Topbar from "../../components/Layout/Topbar";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Badge from "react-bootstrap/Badge";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import car from '../../images/icon/car.svg'
import ship from '../../images/icon/ship.svg'
import plane from '../../images/icon/plane.svg'
import {setLoadingText} from "./loadingText";

// Mock socket and axios implementations
const mockSocket = {
    on: () => {},
    emit: () => {},
    disconnect: () => {}
};

const mockAxios = {
    get: (url) => {
        console.log('Mock API call:', url);
        if (url.includes('vehicles')) {
            return Promise.resolve({
                data: [
                    { 
                        id: '1',
                        position: {
                            lat: 51.505, 
                            lng: -0.09
                        },
                        balance: 100, 
                        type: 'car',
                        did: 'did:io:0xvehicle1'
                    },
                    { 
                        id: '2',
                        position: {
                            lat: 51.515, 
                            lng: -0.1
                        },
                        balance: 85, 
                        type: 'truck',
                        did: 'did:io:0xvehicle2'
                    }
                ]
            });
        }
        if (url.includes('polygons') || url.includes('zones')) {
            return Promise.resolve({
                data: [{
                    type: 'Feature',
                    properties: {
                        name: 'London Congestion Zone',
                        rate: 15,
                        color: '#ff0000'
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[
                            [-0.15, 51.5],
                            [-0.05, 51.5],
                            [-0.05, 51.52],
                            [-0.15, 51.52],
                            [-0.15, 51.5]
                        ]]
                    }
                }]
            });
        }
        return Promise.resolve({ data: [] });
    }
};

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || "pk.eyJ1IjoiamdqYW1lcyIsImEiOiJjazd5cHlucXUwMDF1M2VtZzM1bjVwZ2hnIn0.Oavbw2oHnexn0hiVOoZwuA";

const socket = mockSocket;

export var map;

export class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            zones: [],
            vehicles: [],
            totalVehicles: 0,
            totalCharges: 0,
            privateMode: false,
            vehicleBalances: {},
            recentEvents: [],
            zoneStats: {},
            showVehicleList: false,
            showZoneList: true,
            selectedVehicle: null
        };
        this.vehicleMarkers = {};
    }

    async componentDidMount() {
        setLoadingText("Initializing Hyperaware dashboard...");
        
        // Initialize map
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/dark-v10',
            center: [-0.1278, 51.5074], // London
            zoom: 11
        });

        map.on('load', async () => {
            setLoadingText("Loading zones and vehicles...");
            
            // Load zones first
            await this.loadZones();
            
            // Then load vehicles
            await this.loadVehicles();
            
            // Setup WebSocket listeners
            this.setupSocketListeners();
            
            setLoadingText("");
            
            // Add initial event
            this.addEvent('System', 'Dashboard initialized', 'info');
        });
    }

    async loadZones() {
        try {
            const response = await mockAxios.get('/api/getAllPolygons');
            const zones = response.data;
            
            // Add zones to map with enhanced styling
            zones.forEach((zone, index) => {
                const feature = zone.features ? zone.features[0] : zone;
                const sourceId = `zone-${index}`;
                const zoneName = feature.properties?.name || `Zone ${index + 1}`;
                const zoneColor = feature.properties?.color || schemeCategory10[index % 10];
                
                map.addSource(sourceId, {
                    type: 'geojson',
                    data: zone
                });
                
                // Fill layer
                map.addLayer({
                    id: `${sourceId}-fill`,
                    type: 'fill',
                    source: sourceId,
                    paint: {
                        'fill-color': zoneColor,
                        'fill-opacity': 0.3
                    }
                });
                
                // Outline layer
                map.addLayer({
                    id: `${sourceId}-outline`,
                    type: 'line',
                    source: sourceId,
                    paint: {
                        'line-color': zoneColor,
                        'line-width': 2,
                        'line-opacity': 0.8
                    }
                });
                
                // Label layer
                const bounds = turf.bbox(zone);
                const center = turf.center(zone);
                
                map.addLayer({
                    id: `${sourceId}-label`,
                    type: 'symbol',
                    source: {
                        type: 'geojson',
                        data: center
                    },
                    layout: {
                        'text-field': zoneName,
                        'text-size': 14,
                        'text-anchor': 'center'
                    },
                    paint: {
                        'text-color': '#FFFFFF',
                        'text-halo-color': '#000000',
                        'text-halo-width': 2
                    }
                });
                
                // Initialize zone stats
                this.state.zoneStats[zoneName] = {
                    vehiclesInside: 0,
                    totalCharges: 0,
                    rate: feature.properties?.rate || 0.10
                };
            });
            
            this.setState({ zones });
            console.log(`Loaded ${zones.length} zones`);
        } catch (error) {
            console.error('Error loading zones:', error);
            this.addEvent('Error', 'Failed to load zones', 'danger');
        }
    }

    async loadVehicles() {
        try {
            const response = await mockAxios.get('/api/getAllVehicles');
            const vehicles = response.data;
            
            // Create custom markers for vehicles
            vehicles.forEach((vehicle) => {
                const el = document.createElement('div');
                el.className = 'vehicle-marker';
                el.style.width = '40px';
                el.style.height = '40px';
                el.style.cursor = 'pointer';
                el.innerHTML = `
                    <div style="
                        width: 100%;
                        height: 100%;
                        background: white;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        transition: all 0.3s ease;
                    ">
                        <img src="${car}" alt="vehicle" style="width: 24px; height: 24px;">
                    </div>
                `;
                
                // Add hover effect
                el.addEventListener('mouseenter', () => {
                    el.style.transform = 'scale(1.2)';
                });
                el.addEventListener('mouseleave', () => {
                    el.style.transform = 'scale(1)';
                });
                
                // Add click handler
                el.addEventListener('click', () => {
                    this.selectVehicle(vehicle.id);
                });
                
                const marker = new mapboxgl.Marker(el)
                    .setLngLat([vehicle.position.lng, vehicle.position.lat])
                    .setPopup(new mapboxgl.Popup({ offset: 25 })
                        .setHTML(`
                            <h6>Vehicle ${vehicle.id}</h6>
                            <p>Balance: £${vehicle.balance}</p>
                            <p>Speed: ${vehicle.position.speed.toFixed(0)} km/h</p>
                        `))
                    .addTo(map);
                
                this.vehicleMarkers[vehicle.id] = {
                    marker,
                    element: el,
                    data: vehicle
                };
            });
            
            // Initialize balances
            const balances = {};
            vehicles.forEach(v => {
                balances[v.id] = v.balance || 100;
            });
            
            this.setState({ 
                vehicles,
                totalVehicles: vehicles.length,
                vehicleBalances: balances
            });
            
            console.log(`Loaded ${vehicles.length} vehicles`);
            this.addEvent('System', `${vehicles.length} vehicles loaded`, 'success');
        } catch (error) {
            console.error('Error loading vehicles:', error);
            this.addEvent('Error', 'Failed to load vehicles', 'danger');
        }
    }

    setupSocketListeners() {
        // Vehicle position updates
        socket.on('vehiclePositions', (positions) => {
            this.updateVehiclePositions(positions);
        });
        
        // Zone entry events
        socket.on('zoneEntry', (event) => {
            this.handleZoneEntry(event);
        });
        
        // Zone exit events
        socket.on('zoneExit', (event) => {
            this.handleZoneExit(event);
        });
        
        // Zone charge events
        socket.on('zoneCharge', (charge) => {
            this.handleZoneCharge(charge);
        });
        
        // Zone statistics updates
        socket.on('zonesUpdate', (data) => {
            this.updateZoneStats(data);
        });
    }

    updateVehiclePositions(positions) {
        Object.keys(positions).forEach(vehicleId => {
            const pos = positions[vehicleId];
            const vehicleData = this.vehicleMarkers[vehicleId];
            
            if (vehicleData && vehicleData.marker) {
                // Smoothly update position
                vehicleData.marker.setLngLat([pos.lng, pos.lat]);
                
                // Rotate vehicle icon
                if (vehicleData.element) {
                    vehicleData.element.firstChild.style.transform = `rotate(${pos.heading}deg)`;
                }
                
                // Update popup if open
                const popup = vehicleData.marker.getPopup();
                if (popup.isOpen()) {
                    popup.setHTML(`
                        <h6>Vehicle ${vehicleId}</h6>
                        <p>Balance: £${this.state.vehicleBalances[vehicleId]?.toFixed(2) || '0.00'}</p>
                        <p>Speed: ${pos.speed.toFixed(0)} km/h</p>
                    `);
                }
            }
        });
    }

    handleZoneEntry(event) {
        this.addEvent('Zone Entry', 
            `Vehicle ${event.vehicleId.slice(-6)} entered ${event.zone}`, 
            'primary');
        
        // Update zone stats
        const zoneStats = { ...this.state.zoneStats };
        if (zoneStats[event.zone]) {
            zoneStats[event.zone].vehiclesInside++;
            this.setState({ zoneStats });
        }
        
        // Flash zone on map
        this.flashZone(event.zone);
    }

    handleZoneExit(event) {
        this.addEvent('Zone Exit', 
            `Vehicle ${event.vehicleId.slice(-6)} left ${event.zone}`, 
            'secondary');
        
        // Update zone stats
        const zoneStats = { ...this.state.zoneStats };
        if (zoneStats[event.zone]) {
            zoneStats[event.zone].vehiclesInside = Math.max(0, zoneStats[event.zone].vehiclesInside - 1);
            this.setState({ zoneStats });
        }
    }

    handleZoneCharge(charge) {
        const { totalCharges, vehicleBalances, zoneStats } = this.state;
        
        // Update balances
        const newBalances = {
            ...vehicleBalances,
            [charge.vehicleId]: parseFloat(charge.newBalance)
        };
        
        // Update zone stats
        const newZoneStats = { ...zoneStats };
        if (newZoneStats[charge.zone]) {
            newZoneStats[charge.zone].totalCharges += parseFloat(charge.charge);
        }
        
        this.setState({
            totalCharges: totalCharges + parseFloat(charge.charge),
            vehicleBalances: newBalances,
            zoneStats: newZoneStats
        });
        
        this.addEvent('Charge', 
            `Vehicle ${charge.vehicleId.slice(-6)} charged £${charge.charge} in ${charge.zone}`, 
            'warning');
    }

    addEvent(type, message, variant) {
        const { recentEvents } = this.state;
        const newEvent = {
            id: Date.now(),
            type,
            message,
            variant,
            timestamp: new Date().toLocaleTimeString()
        };
        
        // Keep last 10 events
        this.setState({
            recentEvents: [newEvent, ...recentEvents].slice(0, 10)
        });
    }

    flashZone(zoneName) {
        // Find the zone layer and flash it
        const zoneIndex = this.state.zones.findIndex(z => {
            const feature = z.features ? z.features[0] : z;
            return feature.properties?.name === zoneName;
        });
        
        if (zoneIndex !== -1) {
            const layerId = `zone-${zoneIndex}-fill`;
            const originalOpacity = 0.3;
            
            // Flash effect
            map.setPaintProperty(layerId, 'fill-opacity', 0.7);
            setTimeout(() => {
                map.setPaintProperty(layerId, 'fill-opacity', originalOpacity);
            }, 500);
        }
    }

    selectVehicle(vehicleId) {
        this.setState({ selectedVehicle: vehicleId });
        
        // Center map on vehicle
        const vehicleData = this.vehicleMarkers[vehicleId];
        if (vehicleData && vehicleData.marker) {
            const pos = vehicleData.marker.getLngLat();
            map.flyTo({
                center: [pos.lng, pos.lat],
                zoom: 14
            });
            vehicleData.marker.togglePopup();
        }
    }

    togglePrivateMode = () => {
        const { privateMode } = this.state;
        const newMode = !privateMode;
        
        // Hide/show private vehicles
        Object.values(this.vehicleMarkers).forEach(vehicleData => {
            if (vehicleData.data.private && vehicleData.element) {
                vehicleData.element.style.display = newMode ? 'none' : 'block';
            }
        });
        
        this.setState({ privateMode: newMode });
        this.addEvent('Privacy', `Privacy mode ${newMode ? 'enabled' : 'disabled'}`, 'info');
    }

    render() {
        const { 
            zones, vehicles, totalVehicles, totalCharges, 
            privateMode, recentEvents, zoneStats, vehicleBalances,
            showVehicleList, showZoneList, selectedVehicle 
        } = this.state;
        
        return (
            <React.Fragment>
                <Topbar isDark={false} hideFooter={true}/>
                <Row style={{height: '100vh', margin: 0}}>
                    <Col lg={9} style={{padding: 0}}>
                        <section className="position-relative h-100">
                            <div id="map" style={{width: '100%', height: '100%'}}/>
                            <div id="loading-text" style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                color: 'white',
                                fontSize: '24px',
                                fontWeight: 'bold',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                                pointerEvents: 'none'
                            }}></div>
                            
                            {/* Map Controls */}
                            <div style={{
                                position: 'absolute',
                                top: 10,
                                left: 10,
                                zIndex: 1000
                            }}>
                                <Button 
                                    variant={privateMode ? 'success' : 'secondary'}
                                    onClick={this.togglePrivateMode}
                                    className="mb-2"
                                >
                                    Privacy Mode: {privateMode ? 'ON' : 'OFF'}
                                </Button>
                            </div>
                        </section>
                    </Col>
                    
                    <Col lg={3} style={{padding: 0, backgroundColor: '#f8f9fa'}}>
                        <Container fluid className="h-100 overflow-auto p-3">
                            <h4 className="mb-3">Hyperaware Dashboard</h4>
                            
                            {/* Statistics */}
                            <div className="mb-4 p-3 bg-white rounded shadow-sm">
                                <h5>Statistics</h5>
                                <Row>
                                    <Col xs={6}>
                                        <p className="mb-1"><strong>Zones:</strong> {zones.length}</p>
                                        <p className="mb-1"><strong>Vehicles:</strong> {totalVehicles}</p>
                                    </Col>
                                    <Col xs={6}>
                                        <p className="mb-1"><strong>Total Charges:</strong></p>
                                        <h4 className="text-success">£{totalCharges.toFixed(2)}</h4>
                                    </Col>
                                </Row>
                            </div>
                            
                            {/* Zone Statistics */}
                            <div className="mb-4">
                                <h5 
                                    className="d-flex justify-content-between align-items-center cursor-pointer"
                                    onClick={() => this.setState({ showZoneList: !showZoneList })}
                                >
                                    Zone Activity
                                    <Badge variant="primary">{zones.length}</Badge>
                                </h5>
                                {showZoneList && (
                                    <ListGroup className="mt-2">
                                        {Object.entries(zoneStats).map(([zoneName, stats]) => (
                                            <ListGroup.Item key={zoneName} className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <strong>{zoneName}</strong>
                                                    <br/>
                                                    <small>Rate: £{stats.rate}/min</small>
                                                </div>
                                                <div className="text-right">
                                                    <Badge variant="info">{stats.vehiclesInside} vehicles</Badge>
                                                    <br/>
                                                    <small>£{stats.totalCharges.toFixed(2)}</small>
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </div>
                            
                            {/* Vehicle List */}
                            <div className="mb-4">
                                <h5 
                                    className="d-flex justify-content-between align-items-center cursor-pointer"
                                    onClick={() => this.setState({ showVehicleList: !showVehicleList })}
                                >
                                    Vehicles
                                    <Badge variant="primary">{totalVehicles}</Badge>
                                </h5>
                                {showVehicleList && (
                                    <ListGroup className="mt-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        {vehicles.map(vehicle => (
                                            <ListGroup.Item 
                                                key={vehicle.id}
                                                active={selectedVehicle === vehicle.id}
                                                onClick={() => this.selectVehicle(vehicle.id)}
                                                className="cursor-pointer"
                                            >
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span>Vehicle {vehicle.id.slice(-6)}</span>
                                                    <Badge variant={vehicleBalances[vehicle.id] > 20 ? 'success' : 'warning'}>
                                                        £{vehicleBalances[vehicle.id]?.toFixed(2) || '0.00'}
                                                    </Badge>
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </div>
                            
                            {/* Recent Events */}
                            <div>
                                <h5>Recent Activity</h5>
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {recentEvents.length === 0 ? (
                                        <p className="text-muted">No events yet...</p>
                                    ) : (
                                        recentEvents.map(event => (
                                            <Alert 
                                                key={event.id} 
                                                variant={event.variant}
                                                className="py-2 mb-2"
                                            >
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <strong>{event.type}:</strong> {event.message}
                                                    </div>
                                                    <small className="text-muted">{event.timestamp}</small>
                                                </div>
                                            </Alert>
                                        ))
                                    )}
                                </div>
                            </div>
                        </Container>
                    </Col>
                </Row>
            </React.Fragment>
        );
    }
}

export default Dashboard;