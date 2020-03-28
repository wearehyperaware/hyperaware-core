import React from 'react'
import d3 from 'd3'
import { schemeCategory10 } from 'd3-scale-chromatic';
import mapboxgl from 'mapbox-gl'
import * as turf from '@turf/turf'
import geojsonMerge from '@mapbox/geojson-merge'
import makeCar from './createCar'
import updatePositions from './updatePositions'
import axios from 'axios'
import Antenna from 'iotex-antenna'
import connect from 'socket.io-client';
import Topbar from "../../components/Layout/Topbar";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import AnimateHeight from "react-animate-height";
import car from '../../images/icon/car.svg'
import ship from '../../images/icon/ship.svg'
import plane from '../../images/icon/plane.svg'
import arrowBottom from '../../images/shapes/arrow-bottom.png';
import {getStartEnd} from "./getPath";

mapboxgl.accessToken = "pk.eyJ1IjoiamdqYW1lcyIsImEiOiJjazd5cHlucXUwMDF1M2VtZzM1bjVwZ2hnIn0.Oavbw2oHnexn0hiVOoZwuA";
let socket
if (process.env.NODE_ENV === 'production') {
    socket = connect(window.location.hostname)
} else {
    socket = connect('http://localhost:3001');
}

export var map
export var zone

// var buffered = turf.buffer(zones.length > 1 ? zones[1] : zones, 200, 'feet');

export class Dashboard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            zoneDIDs: [],
            zones: [],
            vehicles: [],
            antenna: new Antenna(process.env.REACT_APP_ANTENNA_TESTNET_HOST),
            buffered: null,
            positions: [],
            currentPos: 1,
            heightZonesCard: '0%',
            heightVehiclesCard: '0%',
            zonesChevron: "mdi-chevron-double-down",
            vehiclesChevron: "mdi-chevron-double-down",
            isPrivacyMode: true,
            totalStaked: 0,
            totalCharges: 0.0,
            timestep: 0
        };
    }

    async componentDidMount() {

        // Dismiss loading bar
        document.getElementById("pageLoader").style.display = "block";
        document.getElementById('topnav').classList.add('bg-white');
        setTimeout(function () {
            document.getElementById("pageLoader").style.display = "none";
        }, 1000);

        var screenWidth = document.documentElement.clientWidth;
        var screenHeight = document.documentElement.clientHeight;

        // map loads with different zoom / center depending on the type of device
        var zoom = screenWidth < 700 ? 8.5 : screenHeight <= 600 || screenWidth < 1000 ? 9.5 : 9;
        var center = screenWidth < 700 ? [-0.149688720703125, 51.48865188163204] : [-0.15003204345703125, 51.50489601254001];

        map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/mapbox/light-v10',
            zoom,
            center,
        });

        let totalStaked = await axios.get('/api/getTotalStaked')
        totalStaked = totalStaked.data.totalStaked
        let vehicles = await axios.get('/api/getAllVehicles')
        vehicles = vehicles.data
        let zoneDIDs = await axios.get('/api/getAllPolygons');
        zoneDIDs = zoneDIDs.data;
        let zones = zoneDIDs.map((did) => {
            return did.service.map((zone) => {
                if (typeof zone.geojson.features != 'undefined') {
                    zone.geojson.features[0].properties.did = did.id;
                } else {
                    zone.geojson.properties.did = did.id;
                }
                return zone
            })
        }).flat();
        let positions = await axios.get('/api/getAllPoints')
        positions = positions.data

        // Randomly assign a vehicle to a route
        let mapping = {}
        let seen = {}
        for (let i in positions[0]) {
            let vehicleIndex = Math.floor(Math.random() * vehicles.length)
            while (vehicleIndex in seen) {
                vehicleIndex = Math.floor(Math.random() * vehicles.length)
            }
            seen[vehicleIndex] = true
            mapping[i] = vehicleIndex
        }

        // Add each vehicle to its assigned route

        /*  Make sure that we only generate one route per vehicle, because we don't allow one vehicle
        * to have multiple routes and the. */

        for (let i = 0; i < positions.length; i++) {
            for (let j = 0; j < positions[0].length; j++) {
                positions[i][j] = {...positions[i][j], vehicle: {within: false, ...vehicles[mapping[j]]}}
            }
        }


        await this.setState({zoneDIDs, zones, vehicles, positions, totalStaked})

        this.loadVehiclesAndZones(map)

        socket.on('updatePositions', async (newPositions, newPointsArrayToUpdateState) => {
            await this.setState({positions: newPointsArrayToUpdateState})
            updatePositions(newPositions);
        })

        map.on('move', () => {
            this.updateMap();
        })

        socket.on('fetchNewPositionsFromServerResponse', (message, slashHash) => {
            this.addNotification(message.type, message.vehicleDetails.id, message.vehicleDetails.enterTime, message.vehicleDetails.exitTime, slashHash)
        })

    }

    updateMap = () => {
        // d3Projection = getD3();
        // path.projection(d3Projection)

        d3.selectAll('circle')
            // here we could have a radius scaling factor based on map zoom ...
            .attr('transform', function () {
                let pixelCoords = map.project(
                    d3.select(this)
                        .attr('data-coords')
                        .split(',')
                        .map(Number)
                );

                return 'translate(' + pixelCoords.x + ',' + pixelCoords.y + ')';
            })
    }

    ellipsisText = (s, width) => {

        console.log(s, width);
        const NARROW_WIDTH_HOME = 1279;
        const NARROW_WIDTH = 768;
        const MIN_SUB_LENGTH = 6;
        if (s.length >= 60) {
            const length = s.length;
            const newLen = Math.floor(width / length) - 5;
            return `${s.substr(0, 8)}...${s.substr(length - 5, 5)}`;
        }

        if (width > NARROW_WIDTH_HOME) {
            return s;
        }
        const length = s.length;
        const newLen = Math.floor(width / length) - 5;
        const subLen = newLen >= MIN_SUB_LENGTH ? newLen : MIN_SUB_LENGTH;
        if (length > 13) {
            return `${s.substring(0, subLen)}...${s.substring(
                length - subLen,
                length
            )}`;
        }
        return s;
    }

    addNotification = (type, did, enterTime, exitTime, hash, rate = 0.007) => {
        const TIME_MULTIPLIER = 3.5
        let timeElapsedInMinutes
        if (type === 'exit') {
            timeElapsedInMinutes = ((Date.parse(exitTime) - Date.parse(enterTime)) * TIME_MULTIPLIER) / 1000
            this.state.totalCharges += Number((rate * timeElapsedInMinutes * 60).toFixed(2));
        }
        var color = type === 'exit' ? "#2f55d4 !important" : "#6c757d"
        var ticker = d3.selectAll('#ticker');
        var notification_types = {
            enter: {alert: '! Entering', message: 'entering'},
            exit: {alert: '✓ Leaving', message: 'exiting'}
        };

        var html = '<strong class="strongpad" style="background:' + color + '"">' + notification_types[type].alert + '</strong> ' + '<strong>' + this.truncateDID(did) + '</strong>' + ' is <strong>' + notification_types[type].message + '</strong> a zone.'
        html = type === 'exit' ? html + ` Detected in zone for <strong> ${timeElapsedInMinutes.toFixed(2)} minutes</strong>. Vehicle has been charged <strong>${(rate * timeElapsedInMinutes * 60).toFixed(2)}</strong> 
        (Rate: ${rate} / second) <a href="https://testnet.iotexscan.io/action/${hash}" target="_blank" style="color:blue">https://testnet.iotexscan.io/action/${this.ellipsisText(hash, 1278)}</a>` : html;
        
        ticker.insert('div', ':first-child').html(html).classed('expanded', true);
    }

    flyToZone = (geojson) => {

        map.fitBounds(turf.bbox(geojson), {
            padding: {
                left: 100,
                top: 100,
                bottom: 100,
                right: 500
            }
        });
    }

    // flyToZone = (geojson) => {
        
    //     map.fitBounds(turf.bbox(geojson));
    // }

    loadVehiclesAndZones = async (map) => {
        // Draw zone boundaries on map
        let didsArray = this.state.zoneDIDs.map(function(e) { return e.id; });

        this.state.zones.forEach(function (zone) {

            let zoneName = zone.id.split('#')[1],
                did = zone.id.split('#')[0],
                didIndex = didsArray.indexOf(did);
            
            zone = zone.geojson;

            if (typeof zone.features == "undefined") {
                zone = {
                    type: "FeatureCollection",
                    features: [
                        zone
                    ]
                }
            }

            // let zoneName = zone.features[0].properties.name,
                // zoneAddress = zone.features[0].properties.tezosAddress,
             let   zoneType = "terrestrial";

            map.addSource('zone-' + zoneName.toLowerCase(), {
                type: 'geojson',
                data: zone
            });

            map.addLayer({
                id: 'zone-border-' + zoneName.toLowerCase(),
                source: 'zone-' + zoneName.toLowerCase(),
                type: 'line',
                paint: {
                    'line-width': 5,
                    'line-opacity': .5,
                    'line-color': schemeCategory10[didIndex % 10]
                }
            });

            map.addLayer({
                id: 'zone-fill-' + zoneName.toLowerCase(),
                source: 'zone-' + zoneName.toLowerCase(),
                type: 'fill',
                paint: {
                    'fill-opacity': .1,
                    'fill-color': schemeCategory10[didIndex % 10]
                }
            });

        })

        // Set up svg canvas
        d3.select('#overlay').append('svg');

        const {positions} = this.state

        // Randomly assign a vehicle to a route
        let mapping = {}
        let seen = {}
        for (let i in positions[0]) {
            let vehicleIndex = Math.floor(Math.random() * this.state.vehicles.length)
            while (vehicleIndex in seen) {
                vehicleIndex = Math.floor(Math.random() * this.state.vehicles.length)
            }
            seen[vehicleIndex] = true
            mapping[i] = vehicleIndex
        }

        // Add each vehicle to its assigned route

        /*  Make sure that we only generate one route per vehicle, because we don't allow one vehicle
        * to have multiple routes. */

        for (let i = 0; i < positions.length; i++) {
            for (let j = 0; j < positions[0].length; j++) {
                positions[i][j] = {...positions[i][j], vehicle: {within: false, ...this.state.vehicles[mapping[j]]}}
            }
        }

        // Render each vehicle in its initial position
        for (let i in positions[0]) {
            console.log(positions[0][i])
            makeCar(positions[0][i].coords, positions[0][i].vehicle)
        }

        let turfPolygons = geojsonMerge.merge(this.state.zones.map((zone) => {
            return zone.geojson
        }));
        // let bbox = turf.bbox(turfPolygons);
        this.flyToZone(turfPolygons);

 

    }

    togglePrivacyMode = async (e) => {
        e.preventDefault()
        await this.setState({isPrivacyMode: this.state.isPrivacyMode === true ? false : true})

        if (this.state.isPrivacyMode) {
            let circles = d3.selectAll('circle')
            circles[0].forEach((circle) => {
                if (circle.attributes['isPrivateVehicle'].value === 'true') {
                    d3.select(circle).attr('fill', 'transparent').attr('stroke', 'transparent')
                }
            })
        } else {
            let circles = d3.selectAll('circle')
            circles[0].forEach((circle) => {
                if (circle.attributes['isPrivateVehicle'].value === 'true') {
                    d3.select(circle).attr('fill', this.getRandomColor()).attr('stroke', '#fff')
                }
            })
        }

    }

    getRandomColor = () => {
        var colors = d3.scale.category10().range();
        var max = colors.length;
        return colors[Math.floor(Math.random() * max)];
    }

    // getEntityCount = (vehicles) => {
    //     let seen = {}
    //     let counter = 0
    //     vehicles.forEach((vehicle) => {
    //         if (!(vehicle.creator in seen)) {
    //             seen[vehicle.creator] = true
    //             counter += 1
    //         }
    //     })
    //     return counter
    // }

    getCtVehiclesInZones = () => {

        if (this.state.positions.length > 0) {

            let ct = 0;
            for (let v of this.state.positions[this.state.currentPos]) {

                if (v.vehicle.within) {
                    ct += 1;
                }
            }
            return ct;

        } else {
            return '...';
        }
    }



    getVehicleIcon = (vehicleType) => {
        let type = vehicleType.toLowerCase()
        if (type.includes("plane")) {
            return plane
        } else if (type.includes("ship")) {
            return ship
        } else {
            return car
        }
    }

    handleAdvance = (e) => {
        e.preventDefault()

        // OLD code ??? vv
        // this.state.timestep += 1;

        // // This hardcodes advance into the browser - there is no interaction
        // // with the server ... this is NOT reflecting if the point is
        // // inside a Zone in the browser
        // updatePositions(this.state.positions[this.state.timestep % this.state.positions.length]);

        // socket.emit('fetchNewPositionsFromServer', this.state.positions);

        socket.emit('fetchNewPositionsFromServer', this.state.positions, this.state.zoneDIDs);
    }

    truncateDID = (did) => {
        return did.substr(0, 15) + "..." + did.substr(42, 8)
    }

    expandZonesCard = (e) => {
        e.preventDefault()
        let chevronIcon = this.state.zonesChevron === 'mdi-chevron-double-down' ? 'mdi-chevron-double-up' : 'mdi-chevron-double-down'
        let height = this.state.heightZonesCard === 'auto' ? '0%' : 'auto'
        this.setState({
            heightZonesCard: height,
            zonesChevron: chevronIcon,
            heightVehiclesCard: '0%',
            vehiclesChevron: 'mdi-chevron-double-down'
        })
    }

    expandVehiclesCard = (e) => {
        e.preventDefault()
        let chevronIcon = this.state.vehiclesChevron === 'mdi-chevron-double-down' ? 'mdi-chevron-double-up' : 'mdi-chevron-double-down'
        let height = this.state.heightVehiclesCard === 'auto' ? '0%' : 'auto'
        this.setState({
            heightVehiclesCard: height,
            vehiclesChevron: chevronIcon,
            heightZonesCard: '0%',
            zonesChevron: 'mdi-chevron-double-down'
        })
    }

    render() {
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
                    <button className='btn btn-primary mx-2' onClick={this.handleAdvance}>ADVANCE</button>
                    <button className='btn btn-primary mx-2'
                            onClick={this.togglePrivacyMode}>{this.state.isPrivacyMode ? 'Privacy Mode Off' : 'Privacy Mode On'}</button>
                </div>

                <Topbar/>

                <div ref={el => this.mapContainer = el} className='map' id='map'></div>
                
                <div ref={this.overlay} className='overlay' id='overlay'/>

                <Col lg={7} style={{width: '550px', marginTop: '110px', marginLeft: '72.5%'}}>

                    <div className="studio-home bg-white shadow mt-4 " style={{paddingTop: '16px', paddingLeft: '8px'}}>
                        <h2 className='d-flex justify-content-center'>Zones<span className="text-primary">.</span></h2>
                        <div className='row d-flex justify-content-center'>
                            <div className='col-6'>
                                <h2 className='row heading text-primary d-flex justify-content-center'>
                                    {this.state.zoneDIDs.length}
                                </h2>
                                <div className='row d-flex justify-content-center'>
                                    Jurisdictions.
                                </div>
                            </div>
                            <div className='col-6 text-center'>
                                <h2 className='row heading text-primary d-flex justify-content-center'>
                                    { this.getCtVehiclesInZones() }
                                </h2>
                                <div className='row d-flex justify-content-center'>
                                    Vehicles in zones.
                                </div>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-6'>
                                <h2 className='row heading text-primary d-flex justify-content-center'>
                                    {this.state.zones.length}
                                </h2>
                                <div className='row d-flex justify-content-center'>
                                    Policy Zones.
                                </div>
                            </div>
                            <div className='col-6'>
                                <h2 className='row heading text-primary d-flex justify-content-center'>
                                    {this.state.totalCharges.toFixed(2)}
                                </h2>
                                <div className='row d-flex justify-content-center'>
                                    Charges Collected Today.
                                </div>
                            </div>
                        </div>
                        <AnimateHeight duration={500} height={this.state.heightZonesCard}>
                            <div style={{height: 300, overflowY: "auto"}}>
                                {
                                    !this.state.zones ? <div></div> : (

                                        this.state.zones.map((zone) => {
                                            var zoneDID = this.state.zoneDIDs.find((didDoc) => {
                                                return didDoc.id == zone.geojson.features[0].properties.did
                                            })
                                            // set event listener to zoom to zone on click ...
                                            return (
                                                <div /*onClick={ this.flyToZone(zone.geojson) }*/
                                                    className="zone-card event-schedule d-flex bg-white rounded p-3 border"
                                                    key={zone.id} style={{
                                                    marginLeft: '40px',
                                                    marginTop: '25px',
                                                    marginRight: '20px'
                                                }}>
                                                    <div className="float-left">
                                                        <ul className="date text-center text-primary mr-md-4 mr-3 mb-0 list-unstyled">
                                                            <li className="day font-weight-bold mb-2">UK</li>
                                                            {/* <- fix this */}
                                                        </ul>
                                                    </div>
                                                    <div className="content">
                                                        <h4 className="text-dark title"
                                                            style={{marginBottom: '0px'}}>{zone.name}</h4>
                                                        <div style={{
                                                            fontSize: '10px',
                                                            marginBottom: '18px'
                                                        }}>{zone.id}</div>
                                                        <p className="text-muted location-time">
                                                            <span className="text-dark h6">Beneficiary: </span><a
                                                            target="_blank"
                                                            href={"https://etherscan.io/address/" + zone.policies.beneficiary}> {this.truncateDID(zone.policies.beneficiary)}</a>
                                                            <br/>
                                                            <span
                                                                className="text-dark h6">Charge: </span>{zone.policies.chargePerMinute + " " + zone.policies.currency} /
                                                            minute
                                                            <br/>
                                                            <span className="text-dark h6">Zone Geometry: </span><a
                                                            target="_blank"
                                                            href={zone.serviceEndpoint}> {this.truncateDID(zone.serviceEndpoint)}</a>
                                                        </p>

                                                    </div>
                                                </div>
                                            )
                                        })

                                    )}
                            </div>

                        </AnimateHeight>
                    </div>
                    <div className="container-fluid">
                        <Row>
                            <div className="home-shape-arrow">
                                <img src={arrowBottom} alt="Hyperaware" className="img-fluid mx-auto d-block"/>
                                {/* eslint-disable jsx-a11y/anchor-is-valid */}
                                <a href="" className="mouse-down" onClick={this.expandZonesCard}><i
                                    className={`mdi ${this.state.zonesChevron} arrow-icon mover text-dark h5`}></i></a>
                            </div>
                        </Row>
                    </div>
                </Col>
                <Col lg={7} style={{width: '550px', marginLeft: '72.5%'}}>
                    <div className="studio-home bg-white shadow mt-5 " style={{paddingTop: '8px', paddingLeft: '8px'}}>
                        <h2 className='d-flex justify-content-center'>Vehicles<span className="text-primary">.</span>
                        </h2>
                        <div className='row d-flex justify-content-center'>
                            <div className='col-6'>
                                <h2 className='row heading text-primary d-flex justify-content-center'>
                                    {this.state.vehicles ? this.state.vehicles.length : "..."}
                                </h2>
                                <div className='row d-flex justify-content-center'>
                                    Vehicles Registered.
                                </div>
                            </div>
                            <div className='col-6 text-center'>
                                <h2 className='row heading text-primary d-flex justify-content-center'>
                                    {this.state.zoneDIDs ? this.state.zoneDIDs.length : "..."}
                                </h2>
                                <div className='row d-flex justify-content-center'>
                                    Entities.
                                </div>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col'>
                                <h2 className='row heading text-primary d-flex justify-content-center'>
                                    {this.state.totalStaked} IOTX
                                </h2>
                                <div className='row d-flex justify-content-center'>
                                    Staked in Contract.
                                </div>
                            </div>
                        </div>
                        <AnimateHeight duration={500} height={this.state.heightVehiclesCard}>
                            <div style={{height: 300, overflowY: "auto"}}>
                                {!this.state.vehicles ? <div></div> : (
                                    this.state.vehicles.map((vehicle) => {
                                        return (
                                            <div className="event-schedule d-flex bg-white rounded p-3 border"
                                                 key={vehicle.id}
                                                 style={{marginLeft: '40px', marginTop: '25px', marginRight: '20px'}}>
                                                <div className="float-left">
                                                    <ul className="date text-center text-primary mr-md-4 mr-3 mb-0 list-unstyled">
                                                        <li className="day font-weight-bold mb-2">
                                                            <div className="image position-relative d-inline-block">
                                                                <img src={this.getVehicleIcon(vehicle.vehicleType)}
                                                                     alt="" style={{height: '40px', width: '40px'}}/>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div className="content">
                                                    <h4 className="text-dark title"
                                                        style={{marginBottom: '0px'}}>ID: {this.truncateDID(vehicle.id)}</h4>
                                                    <div style={{
                                                        fontSize: '10px',
                                                        marginBottom: '18px'
                                                    }}>Owner: {this.truncateDID(vehicle.creator)}</div>
                                                    <p className="text-muted location-time">
                                                        <span
                                                            className="text-dark h6">Registered: </span>{new Date(vehicle.created).toLocaleString()}
                                                        <br/>
                                                        <span
                                                            className="text-dark h6">Vehicle Type: </span>{vehicle.vehicleType}
                                                        <br/>
                                                        <span className="text-dark h6">IMEI: </span>{vehicle.imei}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </AnimateHeight>
                    </div>
                    <div className="container-fluid">
                        <Row>
                            <div className="home-shape-arrow">
                                <img src={arrowBottom} alt="Hyperaware" className="img-fluid mx-auto d-block"/>
                                <a className="mouse-down" onClick={this.expandVehiclesCard}><i
                                    className={`mdi ${this.state.vehiclesChevron} arrow-icon mover text-dark h5`}></i></a>
                            </div>
                        </Row>
                    </div>
                </Col>
            </div>
        )
    }
}
