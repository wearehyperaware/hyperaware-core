var geojsonString;

dropJSON(document.getElementById("drop-zone"),

  function(_geojson, _files) {

    if (window.geojsonString) {
      alert('There is already a valid GeoJSON file loaded. If this is incorrect please reload and try again.')
      return;
    }


    // validate JSON ...
    let errors = geojsonhint.hint(_geojson),
      validPolygon = false;

    if (errors.length == 0) {

      // if polygon, great
      if (_geojson.type == "Polygon") {
        validPolygon = true;
      } else if (
        _geojson.type == 'Feature' &&
        _geojson.geometry.type == 'Polygon'
      ) {
        validPolygon = true;
        _geojson = _geojson.geometry
      } else if (
        _geojson.type == 'FeatureCollection' &&
        _geojson.features[0].geometry.type == 'Polygon'
      ) {
        validPolygon = true;
        _geojson = _geojson.features[0].geometry
      } else {
        //
      } // type test




    } else { // raise errors detected
      console.log(errors)
    }

    if (validPolygon) {
      // change drop zone to be filename
      document.querySelector('#drop-zone')
        .classList.remove('invalid');

      document.querySelector('#drop-zone')
        .classList.add('valid');

      document.querySelector('#drop-zone > p')
        .innerHTML = 'File to register: ' + _files['0'].name;

    } else {
      document.querySelector('#drop-zone')
        .classList.add('invalid');

        document.querySelector('#drop-zone > p')
          .innerHTML = 'Please upload a file with one valid GeoJSON polygon.';
    }



    // add polygon to the map and zoom to extent + padding
      // remove existing layer:

      // map.addSource
    if (validPolygon) {
      map.addSource('polygon', {
        "type": 'geojson',
        'data': _geojson
      });

      map.addLayer({
        'id': 'polygon',
        'type': 'fill',
        'source': 'polygon',
        'layout': {},
        'paint': {
          'fill-color': '#088',
          'fill-opacity': 0.4
        }
      });

      map.fitBounds(turf.bbox(_geojson),
        {padding: 25}
      );

    }

      // map.addLayer



    // store file to be ready to write to Arweave;
    window.geojsonString = JSON.stringify(_geojson);







    //
    // var layerColor = d3.scaleOrdinal(d3.schemeSet2)
    //   .domain(d3.range(8));
    // // from https://stackoverflow.com/questions/20590396/d3-scale-category10-not-behaving-as-expected
    //
    // if (numLoadedFiles == 0) {
    //   d3.select('#add-layer-button')
    //     .text('Manage layers');
    // }
    //
    // // Get hex color specific to features in this file
    // // Will restart cycle after 8 files are loaded.
    // var c = layerColor(numLoadedFiles);
    //
    // var f = _files[0];
    //
    // // Get arrays of Point, Linestring and Polygon features
    // var points = _data.features.filter(function(feature) {
    //     return feature.geometry.type == "Point";
    //   }),
    //   lines = _data.features.filter(function(feature) {
    //     return feature.geometry.type == "LineString";
    //   }),
    //   polygons = _data.features.filter(function(feature) {
    //     return feature.geometry.type == "Polygon";
    //   });
    //
    //
    // // The next blocks add the filtered layers to the list, coloring
    // // them similarly and adding elements to enable users to toggle
    // // layers on and off and zoom to layer extent.
    //
    // if (points.length > 0) {
    //
    //   // Now it is GeoJSON!
    //   var pointData = {
    //     type: "FeatureCollection",
    //     features: points
    //   }
    //
    //   var layerId = "loaded-points-" + f.name.split('.')[0] +
    //     '-' + Math.random().toString(36).substring(7);
    //   // ^^ Random bit added to prevent bugs from occurring if two files of the
    //   // same name are loaded. From  https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    //
    //   // Note that no extra styling based on layer attributes is included here.
    //   // Would love to extend to that, but UX might get very complicated very quickly ...
    //   map.addLayer({
    //     "id": layerId,
    //     "type": "circle",
    //     "source": {
    //       "type": "geojson",
    //       "data": pointData
    //     },
    //     "paint": {
    //       "circle-radius": {
    //         "stops": [
    //           [0, 5],
    //           [5, 6],
    //           [8, 7],
    //           [11, 9],
    //           [16, 15]
    //         ]
    //       },
    //       "circle-color": c,
    //       "circle-stroke-width": 1,
    //       "circle-stroke-color": "black"
    //     },
    //   });
    //   addLayerToLayerList(pointData, 'point', layerId, c);
    // }
    //
    // if (lines.length > 0) {
    //
    //   var lineData = {
    //     type: "FeatureCollection",
    //     features: lines
    //   }
    //
    //   var layerId = "loaded-lines-" + f.name.split('.')[0] +
    //     '-' + Math.random().toString(36).substring(7);
    //
    //   map.addLayer({
    //     "id": layerId,
    //     "type": "line",
    //     "source": {
    //       "type": "geojson",
    //       "data": lineData
    //     },
    //     "layout": {
    //       "line-join": "round",
    //       "line-cap": "round"
    //     },
    //     "paint": {
    //       "line-color": c,
    //       "line-width": 5
    //     },
    //   });
    //   addLayerToLayerList(lineData, 'line', layerId, c);
    // }
    //
    // if (polygons.length > 0) {
    //
    //   var polygonData = {
    //     type: "FeatureCollection",
    //     features: polygons
    //   }
    //
    //   var layerId = "loaded-polygons-" + f.name.split('.')[0] +
    //     '-' + Math.random().toString(36).substring(7);;
    //
    //   map.addLayer({
    //     "id": layerId,
    //     "type": "fill",
    //     "source": {
    //       "type": "geojson",
    //       "data": polygonData
    //     },
    //     "layout": {},
    //     "paint": {
    //       "fill-color": c,
    //       "fill-opacity": 0.8,
    //       'fill-outline-color': 'black'
    //     },
    //   });
    //
    //   addLayerToLayerList(polygonData, 'polygon', layerId, c);
    // }
    //
    // numLoadedFiles += 1;
    //
    //
    // // A local function to add to list of loaded files
    // // including color of points
    // // Include visibility toggle ... ...
    // function addLayerToLayerList(_layerData, _layerType, _layerId, _c) {
    //
    //   var layerList = d3.select('#loaded-list');
    //
    //   // Add legend icons with toggle-able click events to switch
    //   // layer visibility on and off.
    //   layerList.append('dt')
    //     .classed('col-2', true)
    //     .append('span')
    //     .classed('loaded-layer-toggle', true)
    //     .classed(_layerType, true)
    //     .classed('active', true)
    //     .style('background', function() {
    //       if (_layerType == 'line') {
    //         // From https://learn.shayhowe.com/html-css/setting-backgrounds-and-gradients/
    //         return 'linear-gradient(to bottom right, white 40%, '
    //           + c + ' 40%, ' + c + ' 60%, white 60%)';
    //       }
    //     })
    //     .style('background-color', function() {
    //       if (_layerType != 'line') {
    //         console.log(_c);
    //         return _c;
    //       } else {
    //         return null;
    //       }
    //     })
    //     .on('click', function() {
    //
    //       var visibility = map.getLayoutProperty(_layerId, 'visibility');
    //
    //       if (visibility === 'visible') {
    //         map.setLayoutProperty(_layerId, 'visibility', 'none');
    //         d3.select(this).classed('active', false);
    //       } else {
    //         d3.select(this).classed('active', true);
    //         map.setLayoutProperty(_layerId, 'visibility', 'visible');
    //       }
    //     });
    //
    //   // Add layer and feature type name
    //   var dd = layerList.append('dd')
    //     .classed('col-6', true)
    //     .append('p');
    //
    //     console.log('layer id',_layerId,  _layerId.split('-').slice(2).join('-'))
    //   dd.text(_layerId.split('-').slice(2, _layerId.split('-').length - 1).join('-') + ' (' + _layerType + ')');
    //   // // Hooks for future extensions - commented for efficiency's sake
    //   // .on('mouseenter', function () {
    //   //   // highlight layer by _layerId
    //   //   return;
    //   // })
    //   // .on('mouseleave', function () {
    //   //   // unhighlight layer ...
    //   //   return;
    //   // });
    //
    //   // Zoom to button ...
    //   layerList.append('dd')
    //     .classed('col-4', true)
    //     .append('button')
    //     .classed('btn btn-outline-secondary ml-4', true)
    //     .text('Zoom to layer')
    //     .on('click', function() {
    //
    //       // from https://stackoverflow.com/questions/35586360/mapbox-gl-js-getbounds-fitbounds
    //       // Sadly, our only use of turf.js in this project ...
    //       var bounds = turf.bbox(_layerData);
    //
    //       map.fitBounds(bounds, {
    //         padding: 200
    //       });
    //     });
    // }
  }
);


/*
⚠⚠⚠ EXPERIMENTAL! ⚠⚠⚠
Preps target drop zone to accept geojson files to visualize
from the local upload feature
@param {object} _targetEl: the selection of the
  html element where files are meant to be dropped
@param {function} _callback: the callback function to
  invoke once file data has been loaded into the browser
*/
function dropJSON(_targetEl, _callback) {
  // Adapted from https://stackoverflow.com/questions/8869403/drag-drop-json-into-chrome/
  // Disable default drag & drop functionality
  _targetEl.addEventListener('dragenter', function(e) {
    e.preventDefault();
  });
  _targetEl.addEventListener('dragover', function(e) {
    e.preventDefault();
  });

  // Prepare area for file drop!
  _targetEl.addEventListener('drop', function(event) {

    var file = event.dataTransfer.files;

    if (file.length > 1) {
      alert('Please only upload one geojson file at a time.\nWe will load the first file you dropped 😉');
      // ^^ Opportunity for extension - multi-file and zip uploads.
      // Also shapefiles to geojson in the browser!
      // https://github.com/calvinmetcalf/shapefile-js
    }

    console.log(file);

    var reader = new FileReader();

    reader.onloadend = function() {
      var data = JSON.parse(this.result);


      // Should add geojson validator, like this:
      // https://github.com/craveprogramminginc/GeoJSON-Validation
      // Code would be;
      // if (GJV.valid(data)) {
      //    _callback(data, file);
      // } else {
      //    alert('Please upload a valid geojson file!');j
      //    return;
      // }

      _callback(data, file);
    };

    reader.readAsText(event.dataTransfer.files[0]);
    event.preventDefault();
  });
}


function dropHandler(ev) {
  console.log('File(s) dropped');

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.items.length; i++) {
      // If dropped items aren't files, reject them
      if (ev.dataTransfer.items[i].kind === 'file') {
        var file = ev.dataTransfer.items[i].getAsFile();
        console.log('... file[' + i + '].name = ' + file.name);
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.files.length; i++) {
      console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
    }
  }
}
