# Hyperaware : Key Tasks

Tasks to complete to finish development of MVP.

## Site-wide

- Merge `johnx25bd/LBL-Future-LBL-FutureOfBlockchain2020/merge-fetch-geometries`
- Merge `johnx25bd/LBL-Future-LBL-FutureOfBlockchain2020/dev-pages`
- Deploy on hyperaware.io

## Home

- ~~Connect Topbar "About" and "Learn more" buttons to About section on homepage (Where Things Happen Matters)~
- ~~Connect Topbar "Use Cases" button to Use Cases section on homepage~
- ~~Connect FooterLight buttons to appropriate pages / anchors~
- ~~Connect email sign up and subscribe to capture email addresses~


## DID Creation

- ~~Test to ensure it is functional!~~ Although we still need proper unit tests!

## Vehicle Registration

- ~~Test to make sure it works!~~ Although still want to make minor edits to variable names etc
- Make sure registered vehicles appear on the map

## Jurisdiction Registration

- Drop in interface from geolocker
- See [./src/pages/dashboard/README.md](./src/pages/dashboard/README.md) for more info.
- Test and make sure new zones appear on map!!

## Documentation

- Write explainer on how to test the app.
- Also use this copy on the Github

## Github

- Create README that explains what is happening and how to use the app.
- Clean up
- Mask any private scripts etc?
- Create and put on hyperaware github account

## Dashboard

- ~~Build loading indicators like spinners etc to make sure users know things are working - and, ideally, what is happening behind the scenes.~~ Loading spinners have been added to did creation and vehicle registration
- ~Reorder so menu dropdown appears in front of cards rather than behind.~
- ~~Flip chevron arrows depending on expanded or collapsed.~
- ~~Move navbar a bit to the left so it doesn't bump against cards. Make it white background?~
- ~~Make sure server.js testing is pushing notifications into the dashboard.~
- Clean up console.log so user can see what's happening in browser console.
- Test to make sure it all works - consistently!
- If time: Look at dashboard/README.md for a longer wishlist.
- Register a good number of vehicles with high stake amounts and turn on slashing

### Zones

- Make sure righthand card is pulling accurate counts for Jurisdictions, Vehicles in Zones, Policy Zones and Charges Collected.
- Dynamically build array of zone divs in card so they actually reflect the ones on the map. Zoom to on click?
- Register several demo zones. Make sure this looks visually appealing.
- Test and confirm that zones are working!!
- Develop contracts so admins can remove addresses - so we can clean up the system if need be.

### Vehicles

- Make rendered vehicles start somewhere outside of zone boundaries not directly on 
- On card click - zoom to car?
- Confirm that all vehicles are being pulled in a visualized properly


## server.js

- Restructure vehicle route generation setup
  - Fetch vehicles once.
  - Generate routes once.
  - Test each point and attach 'inside' or 'outside' flag. Make sure this adds notifications in the dashboard.
  - Push to browser, on advance move to the next point in the array.
- Implement zone geometry fetch functionality - pull array of addresses from JurisdictionRegistry, DID documents from ethr did method, GeoJSON from service endpoints, then feed into logic.
  - Do we want to re-check for zones on an interval? If not we will need to restart server to re-fetch after a new zone is registered.
- Clean up console.log statements so testers can see what is going on in terminal console
