import React from 'react'
import turf from 'turf'
import d3 from 'd3'
import mapboxgl from 'mapbox-gl'
import makeCar from './createCar'
import updatePositions from './updatePositions'

// import zones from "./samplePolygons.json";
// import zones from "./zones.json";
import {ABI} from "../vehicle-registration/ABI";
import Antenna from 'iotex-antenna'
// import { subscribeToTimer } from '../../websocket_api/timerExample';
// import { subscribeToPointUpdates } from '../../websocket_api/subscribeToPointUpdates';
// import { setDashboardState } from '../../websocket_api/setDashboardState';

import openSocket from 'socket.io-client';
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
            currentPos: 1
        };
    }

    async componentDidMount() {
      // subscribeToTimer((err, timestamp) => {
      //     console.log(timestamp)
      //     }
      // );
      // let map;

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

          // makeCar(1, did);
          // setInterval(function() {
          //     did = allRegisteredDIDs[Math.floor(Math.random() * allRegisteredDIDs.length)]
          //     did2 = allRegisteredDIDs[Math.floor(Math.random() * allRegisteredDIDs.length)]
          //     did3 = allRegisteredDIDs[Math.floor(Math.random() * allRegisteredDIDs.length)]
          //
          //     makeCar(1, did);
          //     makeCar(1, did);
          //     makeCar(1, did);
          //
          // }, 2000);
        }) // closes on('style.load') event listener


      });


      socket.on('updatePositions', (newPositions) => {
        console.log(newPositions)
        updatePositions(newPositions);

      })

      map.on('move', () => {
        renderMap();
      })

      d3.select('#advance')
        .on('click', () => {
          console.log('fetching points');
          socket.emit('fetchNewPositionsFromServer');
          // updatePositions(this.state.positions[this.state.currentPos % 6]);
          // this.state.currentPos += 1;
        })

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

    render() {

        return (
            <div>
                <div ref={this.overlay} className='overlay' id='overlay'/>
                <div id='topbar' className='fill-light show-mobile topbar'>
                    <div className="clearfix">

                        <div className='mobile-col4'>
                            <div className='metriclabel small quiet space-top2 space-bottom2'>Vehicles in zone</div>
                            <div className='metric current-vehicles'>0</div>
                        </div>
                        <div className='mobile-col4'>
                            <div className='metriclabel small quiet space-top2 space-bottom2'>Total traffic</div>
                            <div className='metric total-vehicles'>0</div>
                        </div>
                        <div className='mobile-col4'>
                            <div className='metriclabel small quiet space-top2 space-bottom2'>Total Revenue</div>
                            <div className='metric space-bottom2'>£<span className='total-revenue'>0</span></div>
                        </div>
                    </div>
                </div>
                <div className='notifications-button-mobile show-mobile'>
                    <p className='icon big bell'></p>
                </div>

                <div className='mobile-notifications-container'>
                    <div className='clearfix'>
                        <div className="notifications-button-mobile">
                            <p className='icon big close'></p>
                        </div>
                        <div className='metriclabel small quiet space-top4 space-bottom2'>Notifications</div>
                    </div>

                    <div className='ticker dark small text-left' id='ticker'>
                    </div>
                </div>

                <div id='sidebar' className='sidebar fill-light'>
                    <div className='clearfix'>
                    <div className="mobile-col-4">
                      <button id="advance" className='btn-outline-primary mt-3'>ADVANCE</button>
                    </div>
                        <div className='row'>
                            <div className='col-md-6'>
                                <div className='metriclabel small quiet space-top2 space-bottom2'>Vehicles
                                    <div>in zone</div>
                                    <div className='metric current-vehicles denim'>0</div>
                                </div>
                            </div>
                            <div className='col-md-6'>
                                <div className='metriclabel small quiet space-top2 space-bottom2'>Total daily
                                    <div>traffic</div>
                                    <div className='metric total-vehicles'>0</div>
                                </div>
                            </div>
                    </div>
                        <div>
                    <div className='metriclabel small quiet space-bottom2' style={{paddingTop:'30'}}>Total Revenue</div>
                    <div className='metric space-bottom2'>£<span className='total-revenue'>0</span></div>

                    <div className='dark small text-left pad2 space-top7 blurb hidden'>
                        <p>This is a map showing an application of Mapbox tools for geofencing purposes. Specifically,
                            this visualizes the London congestion charge zone. </p>
                    </div>

                    <div className='pad2y block center'></div>
                    <div className='marvel-device iphone5s gold'>
                        <div className='camera'></div>
                        <div className='sensor'></div>
                        <div className='speaker'></div>
                        <div className='screen'>
                            <div className='metriclabel small quiet space-top2 space-bottom2'>Notifications</div>
                            <div className='ticker dark small text-left' id='ticker'>
                            </div>
                        </div>
                        <div className='home'></div>
                        <div className='bottom-bar'></div>
                    </div>
                        </div>
                    </div>
                </div>
                <div ref={el => this.mapContainer = el} className='map' id='map'/>
            </div>
        )
    }
}
