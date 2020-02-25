const booleanContains = require('@turf/helpers');
const turf = require('./modules/turfModules')
const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const path = require('path');
const samplePoints = require('./data/samplePoints.json');


// Fetch registered zones from Zone Registry (Tezos?)
const samplePolygons = require('./data/samplePolygons.json');
const turfPolygons = [];

samplePolygons.forEach((polygon) => {
  // If polygons are FeatureCollections ...
  if (polygon.type == "FeatureCollection") {
    turfPolygons.push(turf.polygon(polygon.features[0].geometry.coordinates))
  } else if (polygon.type == 'Feature') {
    turfPolygons.push(turf.polygon(polygon.geometry.coordinates))
  } else if (polygon.type == "Polygon") {
    turfPolygons.push(polygon.coordinates)
  } else {
    console.log("Error with a polygon");
  }
});


// Fetch registered vehicles from Vehicle Registry (IoTeX)
const sampleVehicles = require('./data/sampleVehicles.json');
  // Doesn't seem like we are able to decode the below properly on iotex, may need a different solution? But someone else can try to fix
  // let allRegisteredDIDs = await antenna.iotx.readContractByMethod({ // obvs need to instantiate antenna and connect
  //     from: "io1y3cncf05k0wh4jfhp9rl9enpw9c4d9sltedhld",
  //     contractAddress: "io1zf0g0e5l935wfq0lvu9ptqadwrgqqpht7v2a9q",
  //     abi: ABI,
  //     method: "getEveryRegisteredVehicle"
  // });
  // console.log(allRegisteredDIDs)

server.use(bodyParser.urlencoded({ extended: false }));

const http = server.listen(3001, () => {
        console.log('Express server and socket.io websocket are running on localhost:3001');
    }
);

const io = require('socket.io')(http);

// Example websocket connection. Call subscribeToTimer from the browser (example in src/websocket-api)
io.on('connection', (client) => {

    client.emit('setDashboardState', {
      zones: samplePolygons,
      vehicles: sampleVehicles,
      positions: samplePoints
    });



    let counter = 1;

    // This functionality lets us test in browser -
    // updatePositions event will actually be emitted when
    // we fetch new data from the S3 bucket ...
    client.on('fetchNewPositionsFromServer', function () {


      console.log("Fetch request received")
      let newPositions =  JSON.parse(
        JSON.stringify(samplePoints[counter % 7])
      ); // ^^ lame - can I deep copy in JS?

      // TEST points inside enclave
      for (var j = 0; j < newPositions.length; j++) {
        for (var i = 0; i < turfPolygons.length; i++) {

          // Check within bounding box for efficiency
          let turfPolygon = turfPolygons[i];
          let newPosition = newPositions[j];

          let turfPt = turf.point(newPosition.coords)
          let within = turf.booleanContains(turfPolygon, turfPt);

          if (within) {
            console.log("Invoking iotx slash() fn for",
              newPosition.vehicleID,
              samplePolygons[i].features[0].properties.tezosAddress
            );
            client.emit('fetchNewPositionsFromServerResponse', {slashedDID: newPosition.vehicleID, jurisdictionAddress: samplePolygons[i].features[0].properties.tezosAddress })

            newPosition.within = within;
            newPosition.owner = samplePolygons[i].features[0].properties.name;
            newPosition.address = samplePolygons[i].features[0].properties.tezosAddress;

            // invoke IoTeX slash()
            // Including Zone owner? To pay country ... or notify them :D
            break;
          }
        };

      };
      console.log(newPositions);
      // Attach status to points

      // transmit points to browser to visualize
      client.emit('updatePositions',newPositions);
      counter += 1;
    })


    client.on('disconnect', function () {
      console.log('user disconnected');
    })
});


// Example get request to express server
server.get('/api/ping', async (req, res) => {
    res.send("pong")
});


// Example get request to express server
server.use('/', express.static(path.join(__dirname, 'public/home')));
