const turf = require('./modules/turfModules')
const buffer = require('@turf/buffer')
const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const path = require('path');
const ethers = require('ethers');
const Antenna = require('iotex-antenna')
const VEHICLE_REGISTER_ABI = require('./src/pages/vehicle-registration/ABI')
const DID_REGISTER_ABI = require('./src/pages/did-registration/did-contract-details').abi
const ZONE_REGISTER_ABI = require('./src/pages/jurisdiction-registry/zone-contract-details.js').abi
const ZONE_REGISTER_ADDRESS = require('./src/pages/jurisdiction-registry/zone-contract-details.js').contractAddress
const axios = require('axios').default
const fetchDIDsAndGeometries = require('./modules/fetchDIDsAndGeometries');

const generateRandomRoute = require('./modules/generateRandomRoute');
const addGeometriesToDidDocs = require('./modules/addGeometriesToDidDocs')
const mapboxtoken = 'pk.eyJ1IjoiamdqYW1lcyIsImEiOiJjazd5cHlucXUwMDF1M2VtZzM1bjVwZ2hnIn0.Oavbw2oHnexn0hiVOoZwuA'

// Fetch registered zones from Zone Registry
var samplePoints = require('./data/samplePoints.json');
const samplePolygons = require('./data/samplePolygons.json');
const sampleJurisdictionDIDdocs = require('./data/sampleZoneDids.json')
// const sampleVehicles = require('./data/sampleVehicles.json')

var polygonsFetched = false;
var turfPolygons = [];
var sampleVehicles = [];

// Set up connection with ZoneRegistry contract on Ethereum
const ethProvider = ethers.getDefaultProvider('ropsten');
const zoneContract = new ethers.Contract(ZONE_REGISTER_ADDRESS, ZONE_REGISTER_ABI, ethProvider);


// Simulated Fetch DID URIs:
  var zoneAddresses = [
    "0x77DB10B97bbcE20656d386624ACb5469E57Dd21b", // <- UK
    "0x375ef39Fe23128a42992d5cad5a166Ab04C20A88", // <- Netherlands
    "0x3985dE49147725D64407d14c3430bd1dC9c11f04",  // <- Germany
    "0xe0eE166374DcD88e3dFE50E3f72005CEE37F64BD" // <- France
  ];

  // Fetch Zone DID Docs from addresses, and geojson from DID docs:
 (async function () {
    zoneDIDDocs = await fetchDIDsAndGeometries(zoneAddresses, zoneContract);
    console.log('Zone DID Docs and geometries loaded');

    zoneDIDDocs.map((did) => {
      did.service.map((zone) => {
        turfPolygons.push( turf.polygon(zone.geojson.features[0]));
      });
    });

    polygonsFetched = true;

    console.log(zoneDIDDocs.map((doc) => {return doc.service}));

  // Fetch vehicles and generate routes"
  let antenna = new Antenna.default("http://api.testnet.iotex.one:80");

  // Get total number of registered vehicles
  try {
    let numberOfRegisteredVehicles = await antenna.iotx.readContractByMethod({
        from: "io1y3cncf05k0wh4jfhp9rl9enpw9c4d9sltedhld",
        abi: VEHICLE_REGISTER_ABI,
        contractAddress: "io1vrxvsyxc9wc6vq29rqrn37ev33p4v2rt00usnx",
        method: "getEveryRegisteredVehicle"
      },
      0);
    numberOfRegisteredVehicles = numberOfRegisteredVehicles.toString('hex');
    let registeredVehicles = []
    // Iterate through the registered vehicles array and return each string
    console.log(numberOfRegisteredVehicles, "vehicles NOW")
    for (let i = 0; i < numberOfRegisteredVehicles; i++) {
      const vehicleID = await antenna.iotx.readContractByMethod({
          from: "io1y3cncf05k0wh4jfhp9rl9enpw9c4d9sltedhld",
          abi: VEHICLE_REGISTER_ABI,
          contractAddress: "io1vrxvsyxc9wc6vq29rqrn37ev33p4v2rt00usnx",
          method: "allVehicles"
        },
        i);

      // Generates a route near LONDON right now ...
      // NEXT up: pull random Terrestrial polygon from the zones and generate a route through that ...

      let route = await generateRandomRoute(turfPolygons[Math.floor(Math.random() * turfPolygons.length)], mapboxtoken)
      sampleVehicles.push(route);


      registeredVehicles.push(vehicleID)
    }
    // console.log(sampleVehicles);
    console.log(sampleVehicles)
    let samplePts = sampleVehicles.map((line) => line.geometry.coordinates)
    samplePoints = samplePts[0].map((col, i) => samplePts.map(function (row) {return { "coords": row[i]} }));

    console.log('samplePts', samplePoints);
    // samplePoints = sampleVehicles.map((line) => {
    //   return [line.geometry.coordinates.map((point) => {
    //     return {"coords": point}
    //   })]
    // })
    // // console.log(samplePoints)
    console.log("sampleVehicles", sampleVehicles)
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

    sampleVehicles = ret;
  } catch (err) {
    console.log(err)
  }
 })();



server.use(bodyParser.urlencoded({
  extended: false
}));

const http = server.listen(3001, () => {
  console.log('Express server and socket.io websocket are running on localhost:3001');
});

const io = require('socket.io')(http);

io.on('connection', async (client) => {
  // Start enclave listener
  const SecureWorker = require('./secureworker');
  const worker = new SecureWorker('enclave.so', 'enclave-point-polygon-check.js');

  let counter = 1;
  // When we receive a request for new points, send the points and polygons into the enclave and run the check
  client.on('fetchNewPositionsFromServer', function(points) {
    worker.postMessage({
      type: 'pointInPolygonCheck',
      points,
      turfPolygons,
      samplePolygons,
      counter
    })
    counter += 1;


    // We'll add the non-enclave tests and event emission here
    console.log(samplePoints);
    client.emit('updatePositions', samplePoints[counter % 10])


  });

  // Listen for results from enclave
  worker.onMessage((message) => {
    if (message.type === 'enteringNotification') {
      // If enclave detects a vehicle entering a zone, send that to the client
      client.emit('fetchNewPositionsFromServerResponse', message.notification)
    } else if (message.type === 'exitingNotification') {
      // If enclave detects a vehicle exiting a zone, send that to the client and slash vehicle
      // SLASH HERE //
      client.emit('fetchNewPositionsFromServerResponse', message.notification)
    } else if (message.type === 'updatePositions') {
      // When enclave finishes, get the new positions updated vehicle info and send to client
      client.emit('updatePositions', message.newPositions, message.points)
    }
  })

  client.on('disconnect', function() {
    console.log('user disconnected')
  })

})


//// I think we should restructure this ...
// Like polygons - fetch vehicles into server memory when we start up server.js
// When the browser hits the vehicles API we just send them the already downloaded
// vehicles rather than connecting to IoTeX every API call ...
// And then we just have the server.js check for new vehicles every minute or so?
// ....... ?
// Part of the trouble is this generates new routes for the vehicles every time the api is hit.
// If we pull it outside the API callback then we create a demo route once, when we fetch
// vehicles into the server - then on ADVANCE we just feed them the next point in the array,
// based on some global "time" integer we iterate each time Advance is pressed.
// Though this ^ is also not ideal for the multiple-clients-to-one-server situation
// we should be anticipating. THat's a case for pushing all points to the browser straight away?
server.get('/api/getAllVehicles', async (req, res) => {
  res.send(sampleVehicles);
});


server.get('/api/getAllPolygons', async (req, res) => {
  res.send(zoneDIDDocs) // Needs to be calling smart contracts to get polygons
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
  res.send({
    totalStaked: meta.data.data.getAccount.accountMeta.balance / 1e18
  })
})


// Example get request to express server
server.use('/', express.static(path.join(__dirname, 'public/home')));
