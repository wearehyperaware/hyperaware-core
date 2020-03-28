const toRau = require("iotex-antenna/lib/account/utils").toRau;
const Contract = require("iotex-antenna/lib/contract/contract").Contract
const turf = require('./modules/turfModules')
const buffer = require('@turf/buffer')
const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const path = require('path');
const Web3 = require('web3');
const Antenna = require('iotex-antenna')
const VEHICLE_REGISTER_ABI = require('./src/pages/vehicle-registration/ABI')
const DID_REGISTER_ABI = require('./src/pages/did-registration/did-contract-details').abi
const ZONE_REGISTER_ABI = require('./src/pages/jurisdiction-registry/zone-contract-details.js').abi
const ZONE_REGISTER_ADDRESS = require('./src/pages/jurisdiction-registry/zone-contract-details.js').address
const axios = require('axios').default
const generateRandomRoute = require('./modules/generateRandomRoute')
const fetchDIDsAndGeometries = require('./modules/fetchDIDsAndGeometries');
const addGeometriesToDidDocs = require('./modules/addGeometriesToDidDocs')
const mapboxtoken = 'pk.eyJ1IjoiamdqYW1lcyIsImEiOiJjazd5cHlucXUwMDF1M2VtZzM1bjVwZ2hnIn0.Oavbw2oHnexn0hiVOoZwuA'

// Fetch registered zones from Zone Registry
var samplePoints = require('./data/samplePoints.json');
const samplePolygons = require('./data/samplePolygons.json');
const sampleJurisdictionDIDdocs = require('./data/sampleZoneDids.json')
// const sampleVehicles = require('./data/sampleVehicles.json')
let turfPolygons = []
let VEHICLE_REGISTER_ADDRESS = "io10m9n3kge7l9es3n4raq90m3thtr7futpp0t3ph"

async function slash(did, enterTime, exitTime, rate) {
    // Calculate charge
    const TIME_MULTIPLIER = 5
    let timeElapsedInMinutes = ((Date.parse(exitTime) - Date.parse(enterTime)) * TIME_MULTIPLIER) / 1000

    // Connect to contract
    let antenna = new Antenna.default("http://api.testnet.iotex.one:80");
    let vehicleRegContract = new Contract(VEHICLE_REGISTER_ABI, VEHICLE_REGISTER_ADDRESS, {provider: antenna.iotx});

    // Get vehicle's document
    let uri = await antenna.iotx.readContractByMethod({
        from: "io1y3cncf05k0wh4jfhp9rl9enpw9c4d9sltedhld",
        contractAddress: "io1zyksvtuqyxeadegsqsw6vsqrzr36cs7u2aa0ag",
        abi: DID_REGISTER_ABI,
        method: "getURI"
    }, did);
    let res = await axios.get(uri)

    // Read owner from vehicle
    let vehicleOwner = res.data.creator

    // Slash owner (admin needs to use the private key of the owner of the VehicleRegistry contract)
    let admin = await antenna.iotx.accounts.privateKeyToAccount(
        "eec04109aab7af268a1158b88717bd6f62026895920aeb296d4150a7a309dec8"
    );
    try {
        let actionHash = await vehicleRegContract.methods.slash(toRau((rate * timeElapsedInMinutes).toFixed(2).toString(), "Iotx"), vehicleOwner, did, {
            account: admin,
            gasLimit: "1000000",
            gasPrice: toRau("1", "Qev")
        });
    console.log("Slash occurs now on:", vehicleOwner, "who owns", did, "at a rate of", rate, "totalling", (rate * timeElapsedInMinutes).toFixed(2) , ". Slashing action hash:")
        return actionHash
    } catch (err) {
        console.log(err);
    }

}

if (process.env.NODE_ENV === 'production') {
    // Serve static files from the React frontend app
    server.use(express.static(path.join(__dirname, '/build')))
}

server.use(bodyParser.urlencoded({
    extended: false
}));

let PORT = process.env.PORT || 3001

const http = server.listen(PORT, () => {
    console.log(`Express server and socket.io websocket are running on localhost:${PORT}`);
});

const io = require('socket.io')(http);

io.on('connection', async (client) => {
    // Start enclave listener
    const SecureWorker = require('./secureworker');
    const worker = new SecureWorker('enclave.so', 'enclave-point-polygon-check.js');

    let counter = 1;
    // When we receive a request for new points, send the points and polygons into the enclave and run the check
    client.on('fetchNewPositionsFromServer', function (points, dids) {
        worker.postMessage({
            type: 'pointInPolygonCheck',
            points,
            dids,
            counter
        })
        counter += 1;

        // We'll add the non-enclave tests and event emission here

    });

    // Listen for results from enclave
    worker.onMessage(async (message) => {
        if (message.type === 'enteringNotification') {
            // If enclave detects a vehicle entering a zone, send that to the client
            client.emit('fetchNewPositionsFromServerResponse', message.notification)
        } else if (message.type === 'exitingNotification') {
            // If enclave detects a vehicle exiting a zone, send that to the client and slash vehicle
            console.log(message.notification.rate)
            let hash = await slash(message.notification.vehicleDetails.id, message.notification.vehicleDetails.enterTime, message.notification.vehicleDetails.exitTime, message.notification.rate)
            client.emit('fetchNewPositionsFromServerResponse', message.notification, hash)
        } else if (message.type === 'updatePositions') {
            // When enclave finishes, get the new positions updated vehicle info and send to client
            client.emit('updatePositions', message.newPositions, message.points)
        }
    })

    client.on('disconnect', function () {
        console.log('user disconnected')
    })

})

server.get('/api/getAllVehicles', async (req, res) => {
    let antenna = new Antenna.default("http://api.testnet.iotex.one:80");

    // Get total number of registered vehicles
    try {
        let numberOfRegisteredVehicles = await antenna.iotx.readContractByMethod({
                from: "io1y3cncf05k0wh4jfhp9rl9enpw9c4d9sltedhld",
                abi: VEHICLE_REGISTER_ABI,
                contractAddress: VEHICLE_REGISTER_ADDRESS,
                method: "numberOfRegisteredVehicles"
            },
            0);
        numberOfRegisteredVehicles = parseInt(numberOfRegisteredVehicles.toString())
        let registeredVehicles = []
        // Iterate through the registered vehicles array and return each string
        for (let i = 0; i < numberOfRegisteredVehicles; i++) {
            const vehicleID = await antenna.iotx.readContractByMethod({
                    from: "io1y3cncf05k0wh4jfhp9rl9enpw9c4d9sltedhld",
                    abi: VEHICLE_REGISTER_ABI,
                    contractAddress: VEHICLE_REGISTER_ADDRESS,
                    method: "allVehicles"
                },
                i);
            //console.log(vehicleID)
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
                try {
                    let doc = await axios.get(uri)
                    ret.push(doc.data)
                } catch (e) {
                    ret.push({})
                }
            }
        }
        res.send(ret)
    } catch (err) {
        console.log(err)
    }
});


server.get('/api/getAllPolygons', async (req, res) => {

    // Set up connection with ZoneRegistry contract on Ethereum

    const ropstenProvider = new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/799a48033afc4389a1576386aee584dd");
    const web3 = new Web3(ropstenProvider);

    const SERVER_PRIVATE_KEY = "0xa6e027a167eed0a181893685e7bbfbc8d41d0017c9abf0eab8ec4f66ebe4848b";
    const serverWallet = web3.eth.accounts.privateKeyToAccount(SERVER_PRIVATE_KEY);

    let isListening = await web3.eth.net.isListening();
    console.log('isListening', isListening);
    console.log(serverWallet)
    const zoneContract =  new web3.eth.Contract(ZONE_REGISTER_ABI, ZONE_REGISTER_ADDRESS)

    // Simulated Fetch DID URIs:

        // var zoneAddresses = [ // @LEO -> can you set this up to fetch all registered DIDs?
        //     // "0x77DB10B97bbcE20656d386624ACb5469E57Dd21b", // <- UK
        //     // "0x375ef39Fe23128a42992d5cad5a166Ab04C20A88", // <- Netherlands
        //     // "0x3985dE49147725D64407d14c3430bd1dC9c11f04",  // <- Germany
        //     // "0xe0eE166374DcD88e3dFE50E3f72005CEE37F64BD", // <- France
        //     "0xb7ec4260F21f6C1208Ef55ED4Afa550bCC37e5f5", // <- Wales
        //     "0x26A398bd8429Da356198D0c16D91BDEF3bdbCd76" // <- Birmingham
        // ];

    let zoneAddresses = await zoneContract.methods.getExistingDIDs().call({
        from: serverWallet.address,
        gasPrice: "80000000000"
    });

    // Fetch Zone DID Docs from addresses, and geojson from DID docs:
    zoneDIDDocs = await fetchDIDsAndGeometries(zoneAddresses, zoneContract);
    //console.log('Zone DID Docs and geometries loaded', zoneDIDDocs);

    zoneDIDDocs.map((did) => {
        did.service.map((zone) => {
            if (zone.geojson.type == 'FeatureCollection') {
                turfPolygons.push(zone.geojson.features[0]);
            } else if (zone.geojson.type == 'Feature') {
                turfPolygons.push(zone.geojson)
            }
        });
    });

    res.send(zoneDIDDocs)
})

server.get('/api/getAllPoints', async (req, res) => {
    let antenna = new Antenna.default("http://api.testnet.iotex.one:80");
    let numberOfRegisteredVehicles;
    // Get total number of registered vehicles
    try {
        numberOfRegisteredVehicles = await antenna.iotx.readContractByMethod({
                from: "io1y3cncf05k0wh4jfhp9rl9enpw9c4d9sltedhld",
                abi: VEHICLE_REGISTER_ABI,
                contractAddress: VEHICLE_REGISTER_ADDRESS,
                method: "numberOfRegisteredVehicles"
            },
            0);
        numberOfRegisteredVehicles = numberOfRegisteredVehicles.toString();
    } catch (err) {
        console.log(err)
    }

    // Generates a route near LONDON right now ...
    // NEXT up: pull random Terrestrial polygon from the zones and generate a route through that ...
    let sampleRoutes = []
    for (let i = 0; i < numberOfRegisteredVehicles; i++) {
        let route = await generateRandomRoute(turfPolygons[Math.floor(Math.random() * turfPolygons.length)], mapboxtoken)
        sampleRoutes.push(route);
    }

    let samplePts = sampleRoutes.map((line) => line.geometry.coordinates);
    let points = samplePts[0].map((col, i) => samplePts.map(function (row) {
        return {"coords": row[i]}
    }));

    res.send(points)
})

server.get('/api/getTotalStaked', async (req, res) => {
    let meta = await axios({
        url: "https://testnet.iotexscan.io/api-gateway/",
        method: "post",
        data: {
            query: `
                  query {
                          getAccount (address: "${VEHICLE_REGISTER_ADDRESS}"){
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

if (process.env.NODE_ENV === 'production') {
    // Anything that doesn't match the above, send back index.html
    server.get('*', (req, res) => {
        res.sendFile(path.join(__dirname + '/build/index.html'))
    })
}

