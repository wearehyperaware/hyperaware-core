const booleanContains = require('@turf/helpers');
const turf = require('./modules/turfModules')
const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const path = require('path');
const samplePoints = require('./data/samplePoints.json');
const Antenna = require('iotex-antenna')
const VEHICLE_REGISTER_ABI = require('./src/pages/vehicle-registration/ABI')
const DID_REGISTER_ABI = require('./src/pages/did-registration/did-contract-details').abi
const axios = require('axios').default
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

server.use(bodyParser.urlencoded({ extended: false }));

const http = server.listen(3001, () => {
        console.log('Express server and socket.io websocket are running on localhost:3001');
    }
);

const io = require('socket.io')(http);

// Example websocket connection. Call subscribeToTimer from the browser (example in src/websocket-api)
io.on('connection', async (client) => {

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

      let newPositions =  JSON.parse(
        JSON.stringify(samplePoints[counter % 7])
      ); // ^^ lame - can I deep copy in JS?

      // TEST points inside enclave
      for (var j = 0; j < newPositions.length; j++) {

        for (var i = 0; i < turfPolygons.length; i++) {

          let turfPolygon = turfPolygons[i];
          let newPosition = newPositions[j];

          let turfPt = turf.point(newPosition.coords)
          let within = turf.booleanContains(turfPolygon, turfPt);


          if (within) {
            console.log("Invoking iotx slash() fn for",
              newPosition.vehicleID,
            );
            // If it wasn't already in, send notification
              if (!newPosition.within){
                  newPosition['within'] = true
                  newPosition['enterTime'] = new Date()
                  client.emit('fetchNewPositionsFromServerResponse',
                      {vehicleDetails: newPosition, jurisdictionAddress: samplePolygons[i].features[0].properties.tezosAddress, type: 'enter' })

              }

            newPosition.owner = samplePolygons[i].features[0].properties.name;
            newPosition.address = samplePolygons[i].features[0].properties.tezosAddress;

            // invoke IoTeX slash()
            // Including Zone owner? To pay country ... or notify them :D
            break;
          } else {
              if (newPosition.within) {
                  newPosition['within'] = false
                  newPosition['exitTime'] = new Date()
                  client.emit('fetchNewPositionsFromServerResponse',
                      {vehicleDetails: newPosition, jurisdictionAddress: samplePolygons[i].features[0].properties.tezosAddress, type: 'exit' })
              }
          }
        };

      };

      // transmit points to browser to visualize
      client.emit('updatePositions',newPositions);
      counter += 1;
    })


    client.on('disconnect', function () {
      console.log('user disconnected');
    })
});


// Example get request to express server
server.get('/api/getAllVehicles', async (req, res) => {
    let antenna = new Antenna.default("http://api.testnet.iotex.one:80")

    // NOTE: COMMENTED OUT BELOW IS WHAT WILL BE USED IN PRODUCTION
    // // Get the DIDs
    //     try {
    //         let allRegisteredDIDs = await antenna.iotx.readContractByMethod({
    //             from: "io1y3cncf05k0wh4jfhp9rl9enpw9c4d9sltedhld",
    //             abi: VEHICLE_REGISTER_ABI,
    //             contractAddress: "io1zf0g0e5l935wfq0lvu9ptqadwrgqqpht7v2a9q",
    //             gasPrice:"1",
    //             gasLimit:"10000",
    //             method: "getEveryRegisteredVehicle"
    //         });
    //
    //         // Extract DIDs
    //         let regex = /did:io:/gi, result, dids = [];
    //         while ( (result = regex.exec(allRegisteredDIDs[0])) ) {
    //             dids.push(allRegisteredDIDs[0].substr(result.index, 49));
    //         }
    //         let ret = []
    //     //  Get the DID documents associated with each
    //         for (let i in dids) {
    //             let uri = await antenna.iotx.readContractByMethod({
    //                 from: "io1y3cncf05k0wh4jfhp9rl9enpw9c4d9sltedhld",
    //                 contractAddress: "io1kxhm35frtzqmxct899c2zpnp8c2mh28lwcsk0m",
    //                 abi: DID_REGISTER_ABI,
    //                 method: "getURI"
    //             }, dids[i]);
    //             uri = uri.toString('hex');
    //             if (uri) {
    //                 let doc = await axios.get(uri)
    //                 ret.push(doc.data)
    //             }
    //         }
    //         res.send(ret)
    //     } catch (err) {
    //         console.log(err)
    //     }
    res.send(sampleVehicles)
});

// TEST ROUTES ONLY, IN PRACTICE WOULD USE ROUTES SIMILAR TO getAllRegisteredVehicles


server.get('/api/getAllPolygons', async (req, res) => {
    res.send(samplePolygons)
})

server.get('/api/getAllPoints', async (req, res) => {
    res.send(samplePoints)
})

server.get('/api/getTotalStaked', async (req, res) => {
    let meta = await axios({
        url: "https://testnet.iotexscan.io/api-gateway/",
        method: "post",
        data: {
            query: `
                  query {
                          getAccount (address: "io1zf0g0e5l935wfq0lvu9ptqadwrgqqpht7v2a9q"){
                            accountMeta {
                              balance
                            }
                          }
                        }
                  `
        },
    });
    res.send({totalStaked: meta.data.data.getAccount.accountMeta.balance/1e18})
})


// Example get request to express server
server.use('/', express.static(path.join(__dirname, 'public/home')));
