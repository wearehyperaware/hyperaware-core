const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const path = require('path');
const samplePoints = require('./data/samplePoints.json');


// Fetch registered zones from Zone Registry (Tezos?)
const samplePolygons = require('./data/samplePolygons.json');


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

      // TEST points inside enclave

      // Attach status to points

      // transmit points to browser to visualize
      client.emit('updatePositions', samplePoints[counter % 6]);
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
