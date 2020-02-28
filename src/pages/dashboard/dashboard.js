import React from 'react'
import d3 from 'd3'
import mapboxgl from 'mapbox-gl'
import makeCar from './createCar'
import updatePositions from './updatePositions'
import axios from 'axios'
import Antenna from 'iotex-antenna'
import openSocket from 'socket.io-client';
import Topbar from "../../components/Layout/Topbar";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import AnimateHeight from "react-animate-height";
import car from '../../images/icon/car.svg'
import ship from '../../images/icon/ship.svg'
import plane from '../../images/icon/plane.svg'
import arrowBottom from '../../images/shapes/arrow-bottom.png';

const socket = openSocket('http://localhost:3001');

export var map
export var zone

// var buffered = turf.buffer(zones.length > 1 ? zones[1] : zones, 200, 'feet');

export class Dashboard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            zones: [],
            vehicles: [],
            antenna: new Antenna("http://api.testnet.iotex.one:80"),
            buffered: null,
            positions: [],
            currentPos: 1,
            heightZonesCard: '0',
            heightVehiclesCard: '0',
            zonesChevron: "mdi-chevron-double-down",
            vehiclesChevron: "mdi-chevron-double-down",
            isPrivacyMode: true,
        };
    }

    async componentDidMount() {

      // Dismiss loading bar
      document.getElementById("pageLoader").style.display = "block";
      setTimeout(function () { document.getElementById("pageLoader").style.display = "none"; }, 1000);

      mapboxgl.accessToken = 'pk.eyJ1IjoiaW90eHBsb3JlciIsImEiOiJjazZhbXVpZjkwNmc4M29vZ3A2cTViNWo1In0.W38aUZEDsxdIcdVVJ7_LWw';

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

        let vehicles = await axios.get('/api/getAllVehicles')
        vehicles = vehicles.data
        let zones = await axios.get('/api/getAllPolygons')
        zones = zones.data
        let positions = await axios.get('/api/getAllPoints')
        positions = positions.data

        await this.setState({zones, vehicles, positions})

        this.loadVehiclesAndZones(map)

      socket.on('updatePositions', (newPositions) => {
        console.log(newPositions)
        updatePositions(newPositions);

      })

      map.on('move', () => {
        this.updateMap();
      })

    socket.on('fetchNewPositionsFromServerResponse', (message) => {
        this.addNotification("enter", message.slashedDID)
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

     addNotification = (type, did) => {
        var color = "#2f55d4 !important"
        var ticker = d3.selectAll('#ticker');
        var notification_types = { enter: { alert: '! Alert', message: 'entering' }, exit: { alert: '✓ Leaving', message: 'exiting' } };

        var html = '<strong class="strongpad" style="background:' + color + '"">' + notification_types[type].alert + '</strong> ' + this.truncateDID(did) + ' is <strong>' + notification_types[type].message + '</strong> congestion zone.'
        html = type === 'enter' ? html + 'You will incur a £5 fee.' : html;
        ticker.insert('div', ':first-child').html(html).classed('expanded', true);
    }

    loadVehiclesAndZones = async (map) => {
        // initialize the congestion zone data and layer
        this.state.zones.forEach(function (zone) {
            let zoneName = zone.features[0].properties.name,
                zoneAddress = zone.features[0].properties.tezosAddress,
                zoneType = zone.features[0].properties.type

            map.addSource('zone-' + zoneName.toLowerCase(), {
                type: 'geojson',
                data: zone
            });
            //map.setCenter(center);

            map.addLayer({
                id: 'zone-border-' + zoneName.toLowerCase(),
                source: 'zone-' + zoneName.toLowerCase(),
                type: 'line',
                paint: {
                    'line-width': 5,
                    'line-opacity': .5,
                    'line-color': zoneType == 'maritime' ? 'blue' : 'orange'
                }
            });

            map.addLayer({
                id: 'zone-fill-' + zoneName.toLowerCase(),
                source: 'zone-' + zoneName.toLowerCase(),
                type: 'fill',
                paint: {
                    // 'line-width': 5,
                    'fill-opacity': .1,
                    'fill-color': zoneType == 'maritime' ? 'blue' : 'orange'
                }
            });

        })

            // set up svg canvas
            d3.select('#overlay').append('svg');

            // Set up right panel
            var openMobileNotifications = d3.select(".notifications-button-mobile");
            var closeMobileNotifications = d3.select(".icon.big.close");
            var mobileTicker = d3.select(".mobile-notifications-container");
            openMobileNotifications.on('click', function() {
                mobileTicker.classed('show', true);
            });
            closeMobileNotifications.on('click', function() {
                mobileTicker.classed("show", false);
            })

            let allRegisteredDIDs = [];
            let positions = this.state.positions
            this.state.vehicles.forEach(function (vehicle) {
                allRegisteredDIDs.push(vehicle.id);
                let pos = positions[0].find((position) => {
                    return position.vehicleID == vehicle.id;
                });
                makeCar(pos.coords, vehicle);
            })

    }

    togglePrivacyMode = async (e) => {
        e.preventDefault()
        await this.setState({isPrivacyMode: this.state.isPrivacyMode === true ? false : true})

        if (this.state.isPrivacyMode) {
            let circles = d3.selectAll('circle')
            circles[0].forEach((circle) => {
                if (circle.attributes['isPrivate'].value === 'true') {
                    d3.select(circle).attr('fill', 'transparent').attr('stroke', 'transparent')
                }
            })
        } else {
            let circles = d3.selectAll('circle')
            circles[0].forEach((circle) => {
                if (circle.attributes['isPrivate'].value === 'true') {
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

    getEntityCount = (vehicles) => {
        let seen = {}
        let counter = 0
        vehicles.forEach((vehicle) => {
            if (!(vehicle.creator in seen)) {
                seen[vehicle.creator]= true
                counter += 1
            }
        })
        return counter
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
        console.log('fetching points');
        socket.emit('fetchNewPositionsFromServer');
        // updatePositions(this.state.positions[this.state.currentPos % 6]);
        // this.state.currentPos += 1;
    }

     truncateDID = (did) => {
        return did.substr(0, 15) + "..." + did.substr(42, 8)
    }

    expandZonesCard = (e) => {
        e.preventDefault()
        let chevronIcon = this.state.zonesChevron === 'mdi-chevron-double-down' ? 'mdi-chevron-double-up' : 'mdi-chevron-double-down'
        let height = this.state.heightZonesCard === 'auto' ? '0' : 'auto'
        this.setState({heightZonesCard: height, zonesChevron: chevronIcon, heightVehiclesCard: '0', vehiclesChevron: 'mdi-chevron-double-down'})
    }

    expandVehiclesCard = (e) => {
        e.preventDefault()
        let chevronIcon = this.state.zonesChevron === 'mdi-chevron-double-down' ? 'mdi-chevron-double-up' : 'mdi-chevron-double-down'
        let height = this.state.heightVehiclesCard === 'auto' ? '0' : 'auto'
        this.setState({heightVehiclesCard: height, vehiclesChevron: chevronIcon, heightZonesCard: '0', zonesChevron: 'mdi-chevron-double-down'})
    }

    render() {
        return (
            <div>

                <div ref={this.overlay} className='overlay' id='overlay'/>

                <div id='sidebar' className='sidebar'>
                    <div className='clearfix'>
                        <div className='screen'>
                            <div className='metriclabel small space-top2 space-bottom2' style={{color: '#363636'}}>Notifications</div>
                            <div className='ticker dark small text-left' id='ticker'>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='d-flex justify-content-center dashboard-main-buttons' >
                    <button className='btn btn-primary mx-2' onClick={this.handleAdvance}>ADVANCE</button>
                    <button className='btn btn-primary mx-2' onClick={this.togglePrivacyMode}>{this.state.isPrivacyMode ? 'Privacy Mode Off' : 'Privacy Mode On'}</button>
                </div>

                <div ref={el => this.mapContainer = el} className='map' id='map'>
                    <Topbar/>
                </div>

                    <Col lg={7} style={{width:'550px', marginTop: '110px', marginLeft: '71%'}}>

                        <div className="studio-home bg-white shadow mt-4 " style={{paddingTop:'16px', paddingLeft: '8px'}}>
                            <h2 className='d-flex justify-content-center'>Zones<span className="text-primary">.</span></h2>
                            <div className='row d-flex justify-content-center'>
                                <div className='col-6'>
                                    <h2 className='row heading text-primary d-flex justify-content-center'>
                                        7
                                    </h2>
                                    <div className='row d-flex justify-content-center'>
                                        Jurisdictions.
                                    </div>
                                </div>
                                <div className='col-6 text-center'>
                                    <h2 className='row heading text-primary d-flex justify-content-center'>
                                        51
                                    </h2>
                                    <div className='row d-flex justify-content-center'>
                                        Vehicles in zones.
                                    </div>
                                </div>
                            </div>
                            <div className='row'>
                                <div className='col-6'>
                                    <h2 className='row heading text-primary d-flex justify-content-center'>
                                        19
                                    </h2>
                                    <div className='row d-flex justify-content-center'>
                                        Policy Zones.
                                    </div>
                                </div>
                                <div className='col-6'>
                                    <h2 className='row heading text-primary d-flex justify-content-center'>
                                        £1945
                                    </h2>
                                    <div className='row d-flex justify-content-center'>
                                        Charges Collected Today.
                                    </div>
                                </div>
                            </div>
                            <AnimateHeight duration={500} height={this.state.heightZonesCard}>
                                <div style={{height:210, overflowY: "auto"}}>
                                        <div className="event-schedule d-flex bg-white rounded p-3 border" style={{marginLeft: '40px', marginTop:'25px', marginRight: '20px'}}>
                                            <div className="float-left">
                                                <ul className="date text-center text-primary mr-md-4 mr-3 mb-0 list-unstyled">
                                                    <li className="day font-weight-bold mb-2">UK</li>
                                                </ul>
                                            </div>
                                            <div className="content">
                                                <h4 className="text-dark title" style={{marginBottom: '0px'}}>Heathrow International Airport</h4>
                                                <div style={{fontSize: '10px', marginBottom: '18px'}}>tz0dsflksa938aslklkmalKLlknfdlkdl3223</div>
                                                <p className="text-muted location-time">
                                                    <span className="text-dark h6">Administrator: </span>Civil Aviation Authority
                                                    <br />
                                                    <span className="text-dark h6">Charge: </span>0.07 GBP / minute
                                                    <br />
                                                    <span className="text-dark h6">Zone Geometry: </span>arweave.net/WdfkAi3a
                                                </p>

                                            </div>
                                        </div>

                                    <div className="event-schedule d-flex bg-white rounded p-3 border" style={{marginLeft: '40px', marginTop:'25px', marginRight: '20px'}}>
                                        <div className="float-left">
                                            <ul className="date text-center text-primary mr-md-4 mr-3 mb-0 list-unstyled">
                                                <li className="day font-weight-bold mb-2">DE</li>
                                            </ul>
                                        </div>
                                        <div className="content">
                                            <h4 className="text-dark title" style={{marginBottom: '0px'}}>Berlin High Emission Area</h4>
                                            <div style={{fontSize: '10px', marginBottom: '18px'}}>tz0dsflksa938aslklkmalKLlknfdlkdl3223</div>
                                            <p className="text-muted location-time">
                                                <span className="text-dark h6">Administrator: </span>Civil Aviation Authority
                                                <br />
                                                <span className="text-dark h6">Charge: </span>0.043 EUR / minute
                                                <br />
                                                <span className="text-dark h6">Zone Geometry: </span>arweave.net/WdfkAi3a
                                            </p>

                                        </div>
                                    </div>
                                </div>

                            </AnimateHeight>
                        </div>
                        <div className="container-fluid">
                            <Row>
                                <div className="home-shape-arrow">
                                    <img src={arrowBottom} alt="Hyperaware" className="img-fluid mx-auto d-block" />
                                    <a className="mouse-down" onClick={this.expandZonesCard}><i className={`mdi ${this.state.zonesChevron} arrow-icon mover text-dark h5`}></i></a>
                                </div>
                            </Row>
                        </div>
                    </Col>
                    <Col lg={7} style={{width:'550px', marginLeft: '71%'}}>
                        <div className="studio-home bg-white shadow mt-5 " style={{paddingTop:'8px', paddingLeft: '8px'}}>
                            <h2 className='d-flex justify-content-center'>Vehicles<span className="text-primary">.</span></h2>
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
                                        {this.state.vehicles ? this.getEntityCount(this.state.vehicles) : "..."}
                                    </h2>
                                    <div className='row d-flex justify-content-center'>
                                        Entities.
                                    </div>
                                </div>
                            </div>
                            <div className='row'>
                                <div className='col'>
                                    <h2 className='row heading text-primary d-flex justify-content-center'>
                                        £47821
                                    </h2>
                                    <div className='row d-flex justify-content-center'>
                                        Staked in Contracts.
                                    </div>
                                </div>
                            </div>
                            <AnimateHeight duration={500} height={this.state.heightVehiclesCard}>
                                <div style={{height:210, overflowY: "auto"}}>
                                    {!this.state.vehicles ? <div></div> : (
                                        this.state.vehicles.map((vehicle) => { return (
                                            <div className="event-schedule d-flex bg-white rounded p-3 border" style={{marginLeft: '40px', marginTop:'25px', marginRight: '20px'}}>
                                                <div className="float-left">
                                                    <ul className="date text-center text-primary mr-md-4 mr-3 mb-0 list-unstyled">
                                                        <li className="day font-weight-bold mb-2">
                                                            <div className="image position-relative d-inline-block">
                                                                <img src={this.getVehicleIcon(vehicle.vehicleType)} alt="" style={{height: '40px', width: '40px'}}/>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                            <div className="content">
                                            <h4 className="text-dark title" style={{marginBottom: '0px'}}>ID: {this.truncateDID(vehicle.id)}</h4>
                                            <div style={{fontSize: '10px', marginBottom: '18px'}}>Owner: {vehicle.creator}</div>
                                            <p className="text-muted location-time">
                                                <span className="text-dark h6">Registered: </span>{vehicle.created}
                                                <br />
                                                <span className="text-dark h6">Vehicle Type: </span>{vehicle.vehicleType}
                                                <br />
                                                <span className="text-dark h6">IMEI: </span>{vehicle.IMEI}
                                            </p>
                                            </div>
                                            </div>
                                        )})
                                    )}
                                </div>
                            </AnimateHeight>
                        </div>
                        <div className="container-fluid">
                            <Row>
                                <div className="home-shape-arrow">
                                    <img src={arrowBottom} alt="Hyperaware" className="img-fluid mx-auto d-block" />
                                    <a className="mouse-down" onClick={this.expandVehiclesCard}><i className={`mdi ${this.state.vehiclesChevron} arrow-icon mover text-dark h5`}></i></a>
                                </div>
                            </Row>
                        </div>
                    </Col>
            </div>
        )
    }
}
