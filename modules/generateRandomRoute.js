var d3 = require('d3');
var turf = require('turf');
var axios = require('axios');
var geojsonTidy = require('@mapbox/geojson-tidy');

module.exports = async (polygon, token) => {


  var endpoints = generateRandomPoints(polygon).join(';');
  console.log(endpoints)
  var directions_url = 'https://api.tiles.mapbox.com/v4/directions/mapbox.driving/' + endpoints + '.json?access_token=' + token;

  let route = await axios.get(directions_url)
    .then(function(res) {
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



  return geojsonTidy.tidy(feat, {
    maximumPoints: 10
  }).features[0]



  // return axios.get(directions_url);

}


function generateRandomPoints(polygon) {


  let buffer = polygon;

  let border1 = turf.linestring(
    buffer.geometry.coordinates[0].slice(0, buffer.geometry.coordinates[0].length / 2)
  );

  let border2 = turf.linestring(
    polygon.geometry.coordinates[0].slice(polygon.geometry.coordinates[0].length / 2, polygon.geometry.coordinates[0].length));

  var points = [turf.along(border1, Math.random() * turf.lineDistance(border1, 'kilometers'), 'kilometers'),
    turf.along(border2, Math.random() * turf.lineDistance(border2, 'kilometers'), 'kilometers')
  ];

  return points.map(function(feat) {
    return feat.geometry.coordinates;
  })

}