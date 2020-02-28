import { map } from './dashboard';
import { htmlIDFromDID } from '../helperFunctions';

var d3 = require('d3');



export default function updatePositions (positions, privacyMode) {

  // positions must be an array.
  positions.forEach((position) => {

    let coords = position.coords;

    d3.select('#' + htmlIDFromDID(position.vehicleID))
      .attr('data-coords', coords.toString())
      .classed('inzone', function () {

        if (position.within) {
          return true;
        } else if (!position.within) {
          return false;
        }



        // console.log("classed:", d3.select(this).classed('inzone'))
        // console.log('turf detected:',  position.within)
        //   return (d3.select(this).classed('inzone') != position.within);
      })
      .transition(400)
      .attr('transform', function() {
        var pixelCoords = map.project(coords);
        return 'translate(' + pixelCoords.x + ',' + pixelCoords.y + ')';
      });;
  })




}
