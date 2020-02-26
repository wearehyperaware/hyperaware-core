import React from 'react'
import turf from 'turf'
import d3 from 'd3'
import mapboxgl from 'mapbox-gl'
import makeCar from './createCar'
import updatePositions from './updatePositions'
import arrowBottom from '../../images/shapes/arrow-bottom.png';

// import zones from "./samplePolygons.json";
// import zones from "./zones.json";
import {ABI} from "../vehicle-registration/ABI";
import Antenna from 'iotex-antenna'
// import { subscribeToTimer } from '../../websocket_api/timerExample';
// import { subscribeToPointUpdates } from '../../websocket_api/subscribeToPointUpdates';
// import { setDashboardState } from '../../websocket_api/setDashboardState';

import openSocket from 'socket.io-client';
import Topbar from "../../components/Layout/Topbar";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import AnimateHeight from "react-animate-height";
import {Link} from "react-router-dom";
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
            vehiclesChevron: "mdi-chevron-double-down"

        };
    }

    async componentDidMount() {

      // Dismiss loading bar
      document.getElementById("pageLoader").style.display = "block";
      setTimeout(function () { document.getElementById("pageLoader").style.display = "none"; }, 1000);

      mapboxgl.accessToken = 'pk.eyJ1IjoiaW90eHBsb3JlciIsImEiOiJjazZhbXVpZjkwNmc4M29vZ3A2cTViNWo1In0.W38aUZEDsxdIcdVVJ7_LWw';

      var bounds = [
        0.448565673828125, 50.33146969705743, // Southwest coordinates
        -1.5005645751953125, 52.65211086156918, // Northeast coordinates
      ];

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
        //maxBounds: bounds
      });

      socket.on('setDashboardState', (dashboardState) => {

        // Set up state:
        this.state.zones = dashboardState.zones;
        this.state.vehicles = dashboardState.vehicles;
        this.state.positions = dashboardState.positions;

        // this.state.buffered = turf.buffer(dashboardState.zones.length > 1 ? dashboardState.zones[1] : dashboardState.zones, 200, 'feet')
        // ^^ convert to take FeatureCollection or array of polygons?
        // ^^ We will want to zoom the map to the full extent of all registered zones I expect ...

        console.log(this.state)

        // zone = turf.merge(this.state.buffered);


        let buffered = this.state.buffered;
        let vehicles = this.state.vehicles;

        map.on('style.load', async function() {
          // Why can't I access the this.state object in here?


          // initialize the congestion zone data and layer
          dashboardState.zones.forEach(function (zone) {
            console.log('ZONE', zone)
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

          function initializeVehicles(vehicleArray, positions) {
            console.log(vehicleArray, positions);
            // set up svg canvas
            let svg = d3.select('#overlay').append('svg');

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


            // Add to map ... get id, get position, put circle on.

            //

            let allRegisteredDIDs = [];

            vehicleArray.forEach(function (vehicle) {

              allRegisteredDIDs.push(vehicle.id);

              let pos = positions.find((position) => {
                return position.vehicleID == vehicle.id;
              });


              // JUST ADD THE CAR TO THE MAP
              makeCar(pos.coords, vehicle);

              // dashboardState.positions.forEach(function (position) {
              //   if (position.vehicleId == vehicle.id) {
              //     pos = position.coords
              //   }
              // })
              // test if there is a position

                // if yes, add to map at position

                // else, pass for now - but later add to
                // righthand panel with indication that there's no position

            })


          }

          initializeVehicles(dashboardState.vehicles, dashboardState.positions[0]);
        })


      });


      socket.on('updatePositions', (newPositions) => {
        console.log(newPositions)
        updatePositions(newPositions);

      })

      map.on('move', () => {
        renderMap();
      })

        socket.on('fetchNewPositionsFromServerResponse', (message) => {
            addNotification("enter", message.slashedDID)
        })



    const addNotification = (type, did) => {
            var color = "red"
            var ticker = d3.selectAll('#ticker');
            var notification_types = { enter: { alert: '! Alert', message: 'entering' }, exit: { alert: '✓ Leaving', message: 'exiting' } };

            var html = '<strong class="strongpad" style="background:' + color + '"">' + notification_types[type].alert + '</strong> ' + truncateDID(did) + ' is <strong>' + notification_types[type].message + '</strong> congestion zone.'
            html = type === 'enter' ? html + 'You will incur a £5 fee.' : html;
            ticker.insert('div', ':first-child').html(html).classed('expanded', true);
        }

        function truncateDID(did) {
            return did.substr(0, 15) + "..." + did.substr(42, 8)
        }

      const renderMap = () => {
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
  }

     handleAdvance = (e) => {
        e.preventDefault()
        console.log('fetching points');
        socket.emit('fetchNewPositionsFromServer');
        // updatePositions(this.state.positions[this.state.currentPos % 6]);
        // this.state.currentPos += 1;
    }

    expandZonesCard = (e) => {
        e.preventDefault()
        let chevronIcon = this.state.zonesChevron === 'mdi-chevron-double-down' ? 'mdi-chevron-double-up' : 'mdi-chevron-double-down'
        let height = this.state.heightZonesCard === 'auto' ? '0' : 'auto'
        this.setState({heightZonesCard: height, zonesChevron: chevronIcon})
    }

    expandVehiclesCard = (e) => {
        e.preventDefault()
        let chevronIcon = this.state.zonesChevron === 'mdi-chevron-double-down' ? 'mdi-chevron-double-up' : 'mdi-chevron-double-down'
        let height = this.state.heightVehiclesCard === 'auto' ? '0' : 'auto'
        this.setState({heightVehiclesCard: height, vehiclesChevron: chevronIcon})
    }

    render() {

        return (
            <div>

                <div ref={this.overlay} className='overlay' id='overlay'/>
                <div ref={el => this.mapContainer = el} className='map' id='map'>
                    <Topbar/>
                </div>

                    <Col lg={7} style={{width:'550px', marginTop: '150px', marginLeft: '70%'}}>
                        <div className='my-3 d-flex justify-content-center'>
                            <button className='btn btn-primary mt-3' onClick={this.handleAdvance}>ADVANCE</button>
                        </div>
                        <div className="studio-home bg-white shadow mt-5 " style={{paddingTop:'8px', paddingLeft: '8px'}}>
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
                                <div className="bg-light pt-5 pb-5 p-4 rounded text-center">
                                    <h2 className="title text-uppercase mb-4">United Kingdom</h2>
                                    <div className="d-flex justify-content-center mb-4">
                                        <p>io1dsfkjsndalmsa</p>
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
                    <Col lg={7} style={{width:'550px', marginLeft: '70%'}}>
                        <div className="studio-home bg-white shadow mt-5 " style={{paddingTop:'8px', paddingLeft: '8px'}}>
                            <h2 className='d-flex justify-content-center'>Vehicles<span className="text-primary">.</span></h2>
                            <div className='row d-flex justify-content-center'>
                                <div className='col-6'>
                                    <h2 className='row heading text-primary d-flex justify-content-center'>
                                        157
                                    </h2>
                                    <div className='row d-flex justify-content-center'>
                                        Vehicles Registered.
                                    </div>
                                </div>
                                <div className='col-6 text-center'>
                                    <h2 className='row heading text-primary d-flex justify-content-center'>
                                        47
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
                                <div className="bg-light pt-5 pb-5 p-4 rounded text-center">
                                    <h2 className="title text-uppercase mb-4">United Kingdom</h2>
                                    <div className="d-flex justify-content-center mb-4">
                                        <p>io1dsfkjsndalmsa</p>
                                    </div>
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
