const turf = require('turf');
const axios = require('axios');
const addGeometriesToDidDocs = require('./addGeometriesToDidDocs')

module.exports = async (addresses, zoneContract) => {

    var zoneDIDURIs = await Promise.all( 
        addresses.map( (addr) => { 
          return zoneContract.getURI(addr); 
        })
      );
      
      var zoneDIDDocs = await Promise.all( 
        zoneDIDURIs.map( (uri) => { 
          return axios.get(uri)
          .then((res)=> {
            return res.data
          }); 
        })
      );
  
      zoneDIDDocs = await addGeometriesToDidDocs(zoneDIDDocs);
      
      return zoneDIDDocs;

}
