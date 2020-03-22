const https = require('https');
const axios = require('axios');


/*
returns Promise.all() promise that resolves to an array of geojson objects ...
*/

module.exports = async (didDocsArray) => {

    console.log("Add GEOMETRIES CALLED")
    // create array of promises
    let promises = [];

    // *** vvv SECURITY ISSUE vvv ***
    const instance = axios.create({
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    })

    for (let i = 0; i < didDocsArray.length; i++) {
        // no error handling for now ...
        for (let j = 0; j < didDocsArray[i].service.length; j++) {
            let p = instance.get(didDocsArray[i].service[j].serviceEndpoint)
            promises.push(p);
        }
        // if there's no serviceEndpoint, return a promise that resolves to
        // a notice that there is none to maintain consistency in indices ... ??
    }

    try {
        let responses = await Promise.all(promises)
        let resData = responses.map((res) => {
            return res.data
        });

        let ijson = 0;

        for (let i = 0; i < didDocsArray.length; i++) {
            // no error handling for now ...
            for (let j = 0; j < didDocsArray[i].service.length; j++) {
                didDocsArray[i].service[j].geojson = resData[ijson];
                ijson++;
            }
            // if there's no serviceEndpoint, return a promise that resolves to
            // a notice that there is none to maintain consistency in indices ... ??
        }

        return didDocsArray;


    } catch (err) {
        console.log('error', err)
    }
}
