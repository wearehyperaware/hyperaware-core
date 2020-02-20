const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const d3 = require('d3');

// Set up express server
const server = express();
server.use(bodyParser.urlencoded({ extended: false }));
// including flat file service
server.use('/', express.static(path.join(__dirname, 'public/home')));

// Set server to listener for socket.io connection
const http = server.listen(3001, () => {
        console.log('Express server and socket.io websocket are running on localhost:3001');
    }
);

// Import socket.io and create instance
const io = require('socket.io')(http);


// Connect to jurisdiction registry and fetch in arweave urls

var arweaveURLs = fetchFromZoneRegistry();
var polygons = retrieveGeoJSONfromArweave(arweaveURLs);




function fetchFromZoneRegistry() {

  // hardcoded dummy data ... 
  return [
  {
    name: 'london',
    arweave:"https://arweave.net/0KCazCF6ok3x37C9TThXCUpnq5jpYD7h-YYFUOcBHmw",
    ipfs: "https://ipfs.io/ipfs/QmdG9DLEP9ha9qHZYR7v8dYwFD9PkKSACoZZyZ6J52r6pr"
  },
  {
    name: 'berlin' ,
    arweave: "https://arweave.net/WHYZxyw_AL--zROiJlF_oMf2AQytiMgo5j3tTL-9JPU",
    ipfs: "https://ipfs.io/ipfs/QmbsryEzoZhTK3GLJSz2Rp6BrNeLhs69XUEu1auvaFQv1Y"
  },
  {
    name: 'paris',
    arweave: "https://arweave.net/EGbLOMIsqGNQ9BM_sHskfKWYVuqESM8tVwcoHx65Z1c",
    ipfs: "https://ipfs.io/ipfs/QmcGJotvEs25KFLyxe6Y2jiXZUBaYsqJZbDPWxYpdeJqND"
  }]
}


function retrieveGeoJSONfromArweave(urls) {


  prepPromises(urls)
    .then(function (fetchedGeoJSON) {
      console.log(fetchedGeoJSON);
    })



  function prepPromises(urls ) {
    let promises = [];
    urls.forEach(function (url) {

      promises.push(d3.json(url.arweave));
    });

    return Promise.all(promises);
  }



}
