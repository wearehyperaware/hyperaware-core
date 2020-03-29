// This code runs inside a secure enclave

SecureWorker.importScripts('bundled-enclave-imports.js')

SecureWorker.onMessage(function (message) {
    if (message.type === 'pointInPolygonCheck') {
        let {points, dids, counter} = message
        let index = counter % points.length
        let newPositions = points[index]

        for (var j = 0; j < newPositions.length; j++) {
            let newPosition = newPositions[j];

            for (var i = 0; i < dids.length; i++) {
                for (var k = 0; k < dids[i].service.length; k++) {
                    let turfPolygon = turf.polygon(dids[i].service[k].geojson.features[0].geometry.coordinates)
                    let beneficiary = dids[i].service[k].policies.beneficiary
                    let turfPt = turf.point(newPosition.coords)
                    let within = booleanContains(turfPolygon, turfPt);
    
                    // If it wasn't already in, send notification
                    if (within && !newPosition.vehicle.within) {
                        newPosition.vehicle['within'] = beneficiary
                        newPosition.vehicle['enterTime'] = new Date()
    
                        SecureWorker.postMessage({
                            type: 'enteringNotification',
                            notification: {
                                vehicleDetails: newPosition.vehicle,
                                jurisdictionAddress: beneficiary,
                                type: 'enter'
                            }
                        })
    
                        newPosition.owner = dids[i].service[k].name
                        newPosition.address = beneficiary
                        break;
    
                        // If it was already in, but isn't anymore, slash and send exit notification
                    } else if (!within && newPosition.vehicle.within === beneficiary) {
                        console.log("Invoking iotx slash() fn for", newPosition.vehicle.id);
                        newPosition.vehicle['within'] = false
                        newPosition.vehicle['exitTime'] = new Date()
                        SecureWorker.postMessage({
                            type: 'exitingNotification',
                            notification: {
                                vehicleDetails: newPosition.vehicle,
                                jurisdictionAddress: beneficiary,
                                rate: dids[i].service[k].policies.chargePerMinute,
                                type: 'exit'
                            }
                        })
                    }
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
                for (let s in points[index + 1]) {
                    if (points[r][s].vehicle.id === newPositions[i].vehicle.id) {
                        points[r][s].vehicle = newPositions[i].vehicle
                    }
                }
            }
        }

        SecureWorker.postMessage(
            {
                type: 'updatePositions',
                newPositions,
                points
            })
    }
})