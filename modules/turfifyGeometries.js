var turf = require('@turf/turf');


/*
DEPRECATED
returns array of turf objects
*/
module.exports = (geoJSONarray) => {
    console.log("TURFIFY GEOMETRIES CALLED")
    console.log(geoJSONarray);
    // create array of promises
    // return Promise.all(promises)
    let turfPolygons = [];


    geoJSONarray.forEach((polygon) => {
        // If polygons are FeatureCollections ...
        if (polygon.type == "FeatureCollection") {
            turfPolygons.push(turf.polygon(polygon.features[0]))
        } else if (polygon.type == 'Feature') {
            turfPolygons.push(turf.polygon(polygon.geometry.coordinates))
        } else if (polygon.type == "Polygon") {
            turfPolygons.push(polygon.coordinates)
        } else {
            console.log("Error with a polygon");
        }
    });

    return turfPolygons;


}
