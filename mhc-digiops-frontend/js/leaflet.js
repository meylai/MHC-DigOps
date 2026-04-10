const map = L.map('map').setView([-13.9833, 33.7833], 13); // Malawi coords

/*L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);
*/

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

L.marker([-13.9833, 33.7833])
  .addTo(map)
  .bindPopup("<b>House 1:</b><br>Status: Occupied");

L.marker([-15.7861, 35.0058])
  .addTo(map)
  .bindPopup("<b>House 2:</b><br>Status: Available");

fetch("http://localhost:3000/api/houses/map")
  .then(response => response.json())
  .then(houses => {
    houses.forEach(house => {
      L.marker([house.latitude, house.longitude])
        .addTo(map)
        .bindPopup(`
                    <b>${house.address}</b><br>
                    Status: ${house.status}
                `);
    });
  });

socket.on("newAlert", (alert) => {
  L.marker([alert.latitude, alert.longitude])
    .addTo(map)
    .bindPopup(`
            <b>ALERT</b><br>
            ${alert.type}
        `);
});

const availableIcon = L.icon({
  iconUrl: "available-marker,png",
  iconSize: [25, 41]
});

const occupiedIcon = L.icon({
  iconUrl: "occupied-marker.png",
  iconSize: [25, 41]
});

const alertIcon = L.icon({
  iconUrl: "alert-marker.png",
  iconSize: [25, 41]
});

L.marker([lat, lng], { icon: alertIcon })

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