const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const path = require('path');
const samplePoints = require('./data/samplePoints.json');
const samplePolygons = require('./data/samplePolygons.json');
const sampleVehicles = require('./data/sampleVehicles.json');

server.use(bodyParser.urlencoded({ extended: false }));

const http = server.listen(3001, () => {
        console.log('Express server and socket.io websocket are running on localhost:3001');
    }
);

const io = require('socket.io')(http);

// Example websocket connection. Call subscribeToTimer from the browser (example in src/websocket-api)
io.on('connection', (client) => {

    client.emit('setDashboardState', {"zones": samplePolygons, vehicles: [sampleVehicles[0]]});

    // client.on('subscribeToTimer', (interval) => {
    //
    //   // vvv this is running on the server
    //     console.log('client is subscribing to timer with interval ', interval);
    //     setInterval(() => {
    //
    //         client.emit('timer', new Date());
    //         client.emit('updatePoint', new Date());
    //
    //     }, interval);
    // });

    console.log('Client connected!')


    let counter = 0;

    client.on('updatePoint', (interval) => {
        console.log('client is subscribing to point updates with interval ', interval);
        setInterval(() => {

            let point = samplePoints[counter % 6];

            // let within = t
            client.emit('point', counter,  samplePoints[counter % 6]);
            counter += 1;

            // client.emit('updatePoint', [0,0]);


        }, interval);
    });

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
