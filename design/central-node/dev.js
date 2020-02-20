
var arweaveURLs = fetchFromZoneRegistry();
// var promises = prepPromises(arweaveURLs)


var geometries = collectZoneGeometries(arweaveURLs);
console.log('FROM FUNCTIONA', geometries);
// var polygons = retrieveGeoJSONfromArweave(arweaveURLs);

function collectZoneGeometries (urls) {


  let geometries =  retrieveGeoJSONfromArweave(urls);
  return  geometries;
}


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

function prepPromises(urls ) {
  let promises = [];
  urls.forEach(function (url) {
    console.log(url)
    promises.push(d3.json(url.arweave));
  });

  return Promise.all(promises);
}


function retrieveGeoJSONfromArweave(urls) {


  prepPromises(urls)
    .then(function (fetchedGeoJSON) {
      return fetchedGeoJSON;
    })


}
