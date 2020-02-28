import openSocket from 'socket.io-client';
const  socket = openSocket('http://localhost:3001');

function subscribeToPointUpdates(cb) {

    socket.on('point', (i, point) => cb(null, i, point));
    socket.emit('updatePoint', 1000);
}
export { subscribeToPointUpdates };
