import openSocket from 'socket.io-client';
const  socket = openSocket('http://localhost:3001');

function setDashboardState(cb) {

    socket.on('setDashboardState', (state) => {
      console.log(state);
    });

}
export { setDashboardState };
