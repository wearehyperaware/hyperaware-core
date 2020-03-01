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

io.on('connection', async (client) => {

    client.emit('setDashboardState', {
      zones: samplePolygons,
      vehicles: sampleVehicles,
      positions: samplePoints
    });

    let counter = 1;

    client.on('fetchNewPositionsFromServer', function (points) {
      /* I don't think this is properly detecting when a vehicle exits. We should slash on exit because then we can
       base the slash amount on the amount of time detected inside.. but we need to properly detect exits first*/

      let index = counter % points.length
      let newPositions = points[index]

      // TEST points inside enclave
      for (var j = 0; j < newPositions.length; j++) {
        let newPosition = newPositions[j];

        for (var i = 0; i < turfPolygons.length; i++) {

          let turfPolygon = turfPolygons[i];

          let turfPt = turf.point(newPosition.coords)
          let within = turf.booleanContains(turfPolygon, turfPt);

          // If it wasn't already in, send notification
          if (within && !newPosition.vehicle.within) {
              newPosition.vehicle['within'] = true
              newPosition.vehicle['enterTime'] = new Date()
              client.emit('fetchNewPositionsFromServerResponse',
                  {vehicleDetails: newPosition.vehicle, jurisdictionAddress: samplePolygons[i].features[0].properties.tezosAddress, type: 'enter' })

            newPosition.owner = samplePolygons[i].features[0].properties.name;
            newPosition.address = samplePolygons[i].features[0].properties.tezosAddress;
            break;

            // If it was already in, but isn't anymore, slash and send exit notification
          } else if (!within && newPosition.vehicle.within){
              console.log("Invoking iotx slash() fn for", newPosition.vehicle.id);
              newPosition.vehicle['within'] = false
              newPosition.vehicle['exitTime'] = new Date()
              client.emit('fetchNewPositionsFromServerResponse',
                  {vehicleDetails: newPosition.vehicle, jurisdictionAddress: samplePolygons[i].features[0].properties.tezosAddress, type: 'exit' })
          }
        };
        newPositions[j] = newPosition
      };

        // For each vehicle..
        for (let i in newPositions) {
            // Loop through entire points array and overwrite vehicle info so that at every point in the array we know
            // that the vehicle was previously detected as inside (or outside). This can probably be avoided? See dashboard.js line 259
            for (let r in points) {
                for (let s in points[index+1]) {
                    if (points[r][s].vehicle.id === newPositions[i].vehicle.id) {
                        points[r][s].vehicle = newPositions[i].vehicle
                    }
                }
            }
        }
        // Transmit points to browser to visualize and update state
        client.emit('updatePositions', newPositions, points);
      counter += 1;
    })


    client.on('disconnect', function () {
      console.log('user disconnected');
    })
});


server.get('/api/getAllVehicles', async (req, res) => {
    let antenna = new Antenna.default("http://api.testnet.iotex.one:80")

        // Get total number of registered vehicles
        try {
            let numberOfRegisteredVehicles = await antenna.iotx.readContractByMethod(
                {
                        from: "io1y3cncf05k0wh4jfhp9rl9enpw9c4d9sltedhld",
                        abi: VEHICLE_REGISTER_ABI,
                        contractAddress: "io1vrxvsyxc9wc6vq29rqrn37ev33p4v2rt00usnx",
                        method: "getEveryRegisteredVehicle"
                    },
                0);
            numberOfRegisteredVehicles = numberOfRegisteredVehicles.toString('hex')
            let registeredVehicles = []
            // Iterate through the registered vehicles array and return each string
            for (let i = 0; i < numberOfRegisteredVehicles; i++) {
                const vehicleID = await antenna.iotx.readContractByMethod(
                    {
                        from: "io1y3cncf05k0wh4jfhp9rl9enpw9c4d9sltedhld",
                        abi: VEHICLE_REGISTER_ABI,
                        contractAddress: "io1vrxvsyxc9wc6vq29rqrn37ev33p4v2rt00usnx",
                        method: "allVehicles"
                    },
                    i);
                registeredVehicles.push(vehicleID)
            }
            let ret = []

            // Get the DID documents associated with each
            for (let i in registeredVehicles) {
                let uri = await antenna.iotx.readContractByMethod({
                    from: "io1y3cncf05k0wh4jfhp9rl9enpw9c4d9sltedhld",
                    contractAddress: "io1zyksvtuqyxeadegsqsw6vsqrzr36cs7u2aa0ag",
                    abi: DID_REGISTER_ABI,
                    method: "getURI"
                }, registeredVehicles[i]);
                uri = uri.toString('hex');
                if (uri) {
                    let doc = await axios.get(uri)
                    ret.push(doc.data)
                }
            }
            res.send(ret)
        } catch (err) {
            console.log(err)
        }
});


server.get('/api/getAllPolygons', async (req, res) => {
    res.send(samplePolygons) // Needs to be calling smart contracts to get polygons
})

server.get('/api/getAllPoints', async (req, res) => {
    res.send(samplePoints) // Should probably have a generateRoutes() function which generates random routes equal to the amount of registered vehicles.
    // See mapbox directions API for potential solution.
})

server.get('/api/getTotalStaked', async (req, res) => {
    let meta = await axios({
        url: "https://testnet.iotexscan.io/api-gateway/",
        method: "post",
        data: {
            query: `
                  query {
                          getAccount (address: "io1vrxvsyxc9wc6vq29rqrn37ev33p4v2rt00usnx"){
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
