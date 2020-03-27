const turf = require('turf');
const axios = require('axios');
const addGeometriesToDidDocs = require('./addGeometriesToDidDocs')

module.exports = async (addresses, zoneContract) => {
    console.log('addresses', addresses)
    var zoneDIDURIs = addresses.map((did) => did[2])
    // await Promise.all(
    //     addresses.map((addr) => {
    //         return zoneContract.getURI(addr);
    //     })
    // );
    console.log(zoneDIDURIs);
    var zoneDIDDocs = await Promise.all(
        zoneDIDURIs.map((uri) => {
            return axios.get(uri)
                .then((res) => {
                    return res.data
                });
        })
    );
    console.log(zoneDIDDocs);
    zoneDIDDocs = await addGeometriesToDidDocs(zoneDIDDocs);

    return zoneDIDDocs;

}
