import { map } from './dashboard';
import { htmlIDFromDID } from '../helperFunctions';

let d3 = require('d3');



export default function updatePositions (positions) {
  // positions must be an array.
  positions.forEach((position) => {

    let coords = position.coords;

    d3.select('#' + htmlIDFromDID(position.vehicle.id))
      .attr('data-coords', coords.toString())
      .classed('inzone', function () {

        if (position.vehicle.within) {
          return true;
        } else if (!position.vehicle.within) {
          return false;
        }

      })
      .transition(400)
      .attr('transform', function() {
        let pixelCoords = map.project(coords);
        return 'translate(' + pixelCoords.x + ',' + pixelCoords.y + ')';
      });;
  })




}
