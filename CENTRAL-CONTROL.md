# The Node Central Command

Key functionality for the central node program to successfully manage the system:

## On START

Fetch active Zone GeoJSON objects

>   Grab Arweave URLs from Zone Registry
>   `var zones = [{}, {}, /* Fetch GeoJSON files from Arweave */ {}]`

Fetch registered vehicle IDs

>   Grab necessary information from Vehicle Registry
>   `var vehicles = ...;` Fetch most recent Pebble reading for each vehicle, including location. (Right? This is an interesting data management challenge - do we persist Pebble data on the server in memory? Write to another db? etc)

## On BROWSER DASHBOARD CONNECTION

Send `zones` array and `vehicles` information to browser to display state of the system.

## On INTERVAL

### Check for new points

Hit the S3 bucket to see if any new points have arrived.

If yes, for each point:

>   Loop through the `zones` array and test if the point is inside the polygon using  `turf.js`.

>   If inside:

>>       Invoke `slash(vehicleDID, zoneJurisdiction, durationInside);` smart contract method.

>>       Note: we may want to only execute this kind of code on state changes - an enter and exit event. (Upon enter - mark down time. Upon exit - invoke with duration inside.)

Push the updated vehicle positions and statuses to all browser dashboards, invoking `updatePoint()`. This should include some aggregated statistics like "Fees paid" (since when? Logging on? The past week? Today? hmm...), Total Vehicles Registered, Total Vehicles in Zones, etc.

### Check for new vehicles? Zones?

If new vehicles or zones are registered, update `zones`, `vehicles` and all browsers.

What if vehicles or zones are deregistered?

## On BROWSER DASHBOARD DISCONNECT

Nothing.

##
