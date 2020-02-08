import React from 'react'
import turf from 'turf'
import d3 from 'd3'
import mapboxgl from 'mapbox-gl'
import makeCar from './createCar'
import zones from "./zones.json"
export var map
export var zone

var buffered = turf.buffer(zones, 200, 'feet');

export class Dashboard extends React.Component {

    componentDidMount() {
        mapboxgl.accessToken = 'pk.eyJ1IjoiaW90eHBsb3JlciIsImEiOiJjazZhbXVpZjkwNmc4M29vZ3A2cTViNWo1In0.W38aUZEDsxdIcdVVJ7_LWw';
        zone = turf.merge(buffered);

        var bounds = [
            0.248565673828125,51.33146969705743, // Southwest coordinates
            -0.5005645751953125, 51.65211086156918, // Northeast coordinates
        ];

        var screenWidth = document.documentElement.clientWidth;
        var screenHeight = document.documentElement.clientHeight;

        // map loads with different zoom / center depending on the type of device
        var zoom = screenWidth < 700 ? 10.5 : screenHeight <= 600 || screenWidth < 1000 ? 11.5 : 12;
        var center = screenWidth < 700 ? [-0.149688720703125,51.48865188163204] : [-0.15003204345703125, 51.50489601254001];

        map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/mapbox/light-v10',
            zoom,
            center,
            //maxBounds: bounds
        });

        map.on('style.load', function() {
            // initialize the congestion zone data and layer
            map.addSource('zone', {
                type: 'geojson',
                data: turf.merge(buffered)
            });
            //map.setCenter(center);

            map.addLayer({
                id: 'zone-line',
                source: 'zone',
                type: 'line',
                paint: {
                    'line-width': 5,
                    'line-opacity': .5,
                    'line-color': '#C96F16'
                }
            });
            // set up svg canvas
            let svg = d3.select('#overlay').append('svg');
            var openMobileNotifications = d3.select(".notifications-button-mobile");
            var closeMobileNotifications = d3.select(".icon.big.close");
            var mobileTicker = d3.select(".mobile-notifications-container");
            openMobileNotifications.on('click', function () {
                mobileTicker.classed('show', true);
            });
            closeMobileNotifications.on('click', function () {
                mobileTicker.classed("show", false);
            })
            // allRegisteredDIDs should be retrieved programatically - someone should add a method to VehicleRegistry contract which loops through all owners and returns all vehicles as a string array of DIDs.
            let allRegisteredDIDs = ["did:io:0x478fb9cfc04a792f32655912d3cb9851b6e047f0", "did:io:0xe3aa1b66a618847beb0096520ed8b0aabc5a124e", "did:io:0xf8a74256b4de4d2091624fc4ceebdebaa11929b5"]
            let did = allRegisteredDIDs[Math.floor(Math.random() * allRegisteredDIDs.length)]
            makeCar(1, did);
            setInterval(function() {
                did = allRegisteredDIDs[Math.floor(Math.random() * allRegisteredDIDs.length)]
                makeCar(1, did);
            }, 2000);
        }) // closes on('style.load') event listener

    }

    render() {

        return (
            <div>
                <div ref={this.overlay} className='overlay' id='overlay'/>
                <div id='topbar' className='fill-light show-mobile topbar'>
                    <div className="clearfix">
                        <div className='col-md-7'>
                            <div className='metriclabel small quiet space-top2 space-bottom2'>Vehicles in zone</div>
                            <div className='metric current-vehicles'>0</div>
                        </div>
                        <div className='col-md-7'>
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