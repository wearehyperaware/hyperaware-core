import { map } from './dashboard';
import { htmlIDFromDID } from '../helperFunctions';

var d3 = require('d3');



export default function(positions) {

  // positions must be an array.
  console.log(typeof(positions))
  console.log(positions);
  //
  positions.forEach((position) => {

    let coords = position.coords;

    d3.select('#' + htmlIDFromDID(position.vehicleID))
      .attr('data-coords', coords.toString())
      .transition(400)
      .attr('transform', function() {
        var pixelCoords = map.project(coords);
        return 'translate(' + pixelCoords.x + ',' + pixelCoords.y + ')';
      });;
  })




}
