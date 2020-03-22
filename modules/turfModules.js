const helpers = require('@turf/helpers');

module.exports = {
    polygon: helpers.polygon,
    point: helpers.point,
    booleanContains: require('@turf/boolean-contains').default

}
