const map = L.map('map').setView([-13.9833, 33.7833], 13); // Malawi coords

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

async function loadMapData() {
  const res = await fetch("http://localhost:3000/api/applications", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await res.json();

  data.forEach(app => {
    if (app.latitude && app.longitude) {
      L.marker([app.latitude, app.longitude])
        .addTo(map)
        .bindPopup(`Location: ${app.location}`);
    }
  });
}