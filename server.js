const express = require('express');
const bodyParser = require('body-parser');
const server = express();

server.use(bodyParser.urlencoded({ extended: false }));

const http = server.listen(3001, () => {
        console.log('Express server and socket.io websocket are running on localhost:3001');
    }
);

const io = require('socket.io')(http);

// Example websocket connection. Call subscribeToTimer from the browser (example in src/websocket-api)
io.on('connection', (client) => {
    client.on('subscribeToTimer', (interval) => {
        console.log('client is subscribing to timer with interval ', interval);
        setInterval(() => {
            client.emit('timer', new Date());
        }, interval);
    });
});

// Example get request to express server
server.get('/api/ping', async (req, res) => {
    res.send("pong")
});



// Example get request to express server
server.use('/', express.static(path.join(__dirname, 'public/home')));
