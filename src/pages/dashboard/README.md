# Dashboard Feature Wishlist

[] On hover popup showing vehicle ID, amount staked, status (inside or outside).

[] On hover popup showing zone name, owner, num vehicles inside.

[] What happens when you click on features in the map? zoom to? Scroll to? Maybe that is when the popup appears?

[] What happens when you click on a Vehicle or Zone card? I say the map zooms to that features, with significant padding.

[] What happens when you hover on a Vehicle or Zone card? The map highlights that feature.

[] Bootstrapify right cards so they are col-4

[] Mobile modal saying optimized for desktop.

[] Make it so map remains full window width when developer tools are opened

[] Change white "expand" / "collapse" right card buttons to blue circles

[] Expand cards to expose all Zones or Vehicles, have white card scroll rather than small scrolling div within card .

[] Make it so right div with cards scrolls while map is fixed

[] Do we like the transparent navbar? Check out white background - but transparent might be good too

[] Place .overlay div under card panel. (Note the svg circles appear over the cards when you pan)

[] Improve loading UX - show that things are happening, explain what. Use that time as an opportunity to explain to the user what is happening behind the scenes.

[] Something I did made the map sometimes load very slowly, or not load ...

[] Set demo up so vehicles are placed randomly in an area buffering the polygons. (Random with => random perimeter? Deserves some experimentation.)

[] Make it so demo is ongoing by randomly extending routes? Or making them return the way they came?

[] Zoom map to extent of all policy zones on load complete. (Calculate bounding box in server.js)

[] Add policy zones that look better - fuller.

[] Include "drones" ?

[] How to handle generating routes for ships? Obvs mapbox routing API won't work ...

[] Define zoom styling - borders, svgs etc. (in dashboard.js:updateMap());

[] Are we happy with that notifications ticker over the map? Do they disappear after some time?
