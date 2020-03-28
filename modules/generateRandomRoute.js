var d3 = require('d3');
var turf = require('@turf/turf');
const length = require('@turf/length')
var axios = require('axios');
var geojsonTidy = require('@mapbox/geojson-tidy');

module.exports = async (polygon, token) => {

    if (polygon.type == 'FeatureCollection') {
        polygon = polygon.features[0]
    }


    var endpoints = generateRandomPoints(polygon).join(';');
    var directions_url = 'https://api.tiles.mapbox.com/v4/directions/mapbox.driving/' + endpoints + '.json?access_token=' + token;

    let route = await axios.get(directions_url)
        .then(function (res) {
            // console.log('geometry', res.data.routes[0].geometry)
            return res.data.routes[0].geometry
        });

    route.coordinates = route.coordinates.filter(function (value, i, Arr) {
        return i % Math.floor(route.coordinates.length / 10) == 0;
    })
    let feat = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {},
                "geometry": route
            }
        ]
    };

    let max = 15
    let min = 8

    return geojsonTidy.tidy(feat, {
        maximumPoints: 10 // Math.floor(Math.random() * (max - min + 1)) + min
    }).features[0]


    // return axios.get(directions_url);

}


function generateRandomPoints(polygon) {
    // console.log("POLYGONNN", JSON.stringify(polygon))
    try {

    
        let buffer = turf.buffer(polygon, 2, {units: "kilometers"});
        
        if (typeof buffer.features != "undefined") {
            buffer = buffer.features[0];
        }

        let border1 = turf.lineString(
            buffer.geometry.coordinates[0].slice(0, buffer.geometry.coordinates[0].length / 2)
        );

        let border2 = turf.lineString(
            buffer.geometry.coordinates[0].slice(buffer.geometry.coordinates[0].length / 2,   
                                                buffer.geometry.coordinates[0].length)
        );
        // console.log(border1, border2)
        var points = [turf.along(border1, Math.random() * length(border1, {units: 'kilometers'}), {units: 'kilometers'}),
                            turf.along(border2, Math.random() * length(border2, {units: 'kilometers'}), {units: 'kilometers'})
                        ];
        return points.map(function (feat) {
            return feat.geometry.coordinates;
        });
    } catch(err) {
        console.log("ERROR WITH: ", polygon)
        console.error( err);
    }

}
