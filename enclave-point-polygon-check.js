

SecureWorker.importScripts('bundled-enclave-imports.js')

SecureWorker.onMessage(function (message) {
    if (message.type === 'pointInPolygonCheck') {
        let { points, turfPolygons, samplePolygons, counter } = message
        let index = counter % points.length
        let newPositions = points[index]

        for (var j = 0; j < newPositions.length; j++) {
            let newPosition = newPositions[j];

            for (var i = 0; i < turfPolygons.length; i++) {

                let turfPolygon = turfPolygons[i];

                let turfPt = turf.point(newPosition.coords)
                let within = booleanContains(turfPolygon, turfPt);

                // If it wasn't already in, send notification
                if (within && !newPosition.vehicle.within) {
                    newPosition.vehicle['within'] = samplePolygons[i].features[0].properties.tezosAddress
                    newPosition.vehicle['enterTime'] = new Date()

                    SecureWorker.postMessage({
                        type: 'enteringNotification',
                        notification: {vehicleDetails: newPosition.vehicle,
                        jurisdictionAddress: samplePolygons[i].features[0].properties.tezosAddress,
                        type: 'enter'}
                    })

                    newPosition.owner = samplePolygons[i].features[0].properties.name;
                    newPosition.address = samplePolygons[i].features[0].properties.tezosAddress;
                    break;

                    // If it was already in, but isn't anymore, slash and send exit notification
                } else if (!within && newPosition.vehicle.within === samplePolygons[i].features[0].properties.tezosAddress) {
                    console.log("Invoking iotx slash() fn for", newPosition.vehicle.id);
                    newPosition.vehicle['within'] = false
                    newPosition.vehicle['exitTime'] = new Date()
                    SecureWorker.postMessage({
                        type: 'exitingNotification',
                        notification: {vehicleDetails: newPosition.vehicle,
                        jurisdictionAddress: samplePolygons[i].features[0].properties.tezosAddress,
                        type: 'exit'}
                    })
                }
            }
            ;
            newPositions[j] = newPosition
        }

        // For each vehicle..
        for (let i in newPositions) {
            // Loop through entire points array and overwrite vehicle info so that at every point in the array we know
            // that the vehicle was previously detected as inside (or outside).
            for (let r in points) {
                for (let s in points[index+1]) {
                    if (points[r][s].vehicle.id === newPositions[i].vehicle.id) {
                        points[r][s].vehicle = newPositions[i].vehicle
                    }
                }
            }
        }

        SecureWorker.postMessage(
            {   type: 'updatePositions',
                newPositions,
                points
            })
    }
})