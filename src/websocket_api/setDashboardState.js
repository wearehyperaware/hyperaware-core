import openSocket from 'socket.io-client';
const  socket = openSocket('http://localhost:3001');

function setDashboardState(callback) {

    socket.on('setDashboardState', (state) => callback(null, state));

}
export { setDashboardState };
