

mapboxgl.accessToken = 'pk.eyJ1Ijoicm9iaXNvbml2IiwiYSI6ImNqbjM5eXEwdjAyMnozcW9jMzdpbGk5emoifQ.Q_S2qL8UW-UyVLikG_KqQA';

var map = new mapboxgl.Map({
  container: 'zone-map',
  style: 'mapbox://styles/mapbox/light-v10',
  center: [0, 0],
  zoom: 0,
});

map.fitBounds(
  [[-203.3918141040816, -57.18619367347134],
  [197.79512520959958, 75.88099857497434]]
)
