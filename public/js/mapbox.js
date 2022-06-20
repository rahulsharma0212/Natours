export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoicmFodWxzaGFybWEwMjEyIiwiYSI6ImNsNG1la2s1cTB2NmkzaXFwdTM3ODgwNjkifQ.sqcIFQPAHhK-qLil4zCZNg';
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/rahulsharma0212/cl4mj5b21003i14mqs8mc7upd', // style URL
    center: [-118.113491, 34.111475], // starting position [lng, lat]
    zoom: 10, // starting zoom
    // interactive: false,
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    //create marker
    const el = document.createElement('div');
    el.className = 'marker';

    //Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bound to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: { top: 200, bottom: 200, left: 100, right: 100 },
  });
};
