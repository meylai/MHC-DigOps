//KPI vlaues
dopcument.getElementById("applicationsCount").tectContent = 25;
document.getElementById("tenantsCount").textContent = 18;
document.getElementById("alertsCount").textContent = 3;

//Live alerts
const alertsContainer = document.getElementById("alertsContainer");

const alerts = [
    "Door removed at House 12",
    "Unauthorized movement detected",
    "Sensor tampering alert"
];

alerts.forEach(alert => {
    alertsContainer.innerHTML += `<p>${alert}</p>`;
});

//GIS map
const map = L.map("map").setView([-13.9626, 33.7741], 6);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

L.marker([-13.9833, 33.7833])
    .addTo(map)
    .bindPopup("MHC House 1");

L.marker([-15.7861, 35.0058])
    .addTo(map)
    .bindPopup("MHC House 2");

    const applications = [
    { id: 1, location: "Lilongwe Area 49", status: "Pending" },
    { id: 2, location: "Blantyre CBD", status: "Approved" }
];

//recent application table
const tbody = document.querySelector("#applicationsTable tbody");

applications.forEach(app => {
    tbody.innerHTML += `
        <tr>
            <td>${app.id}</td>
            <td>${app.location}</td>
            <td>${app.status}</td>
        </tr>
    `;
});

//Chart analytics
const ctx = document.getElementById("kpiChart");

new Chart(ctx, {
    type: "bar",
    data: {
        labels: ["Applications", "Tenants", "Alerts"],
        datasets: [{
            label: "System KPIs",
            data: [25, 18, 3]
        }]
    },
    options: {
        responsive: true
    }
});

//connection to backend for real data
fetch("http://localhost:3000/api/admin/dashboard")
    .then(res => res.json())
    .then(data => {
        document.getElementById("applicationsCount").textContent = data.applications;
        document.getElementById("tenantsCount").textContent = data.tenants;
        document.getElementById("alertsCount").textContent = data.alerts;
    })
    .catch(error => console.error("Dashboard error:", error));


const token = localStorage.getItem("token");

async function loadApplications() {
    try {
        const res = await fetch("http://localhost:3000/api/applications", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        const tbody = document.querySelector("#applicationsTable tbody");
        tbody.innerHTML = "";

        data.forEach(app => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
        <td>${app.user.name}</td>
        <td>${app.location}</td>
        <td>${app.status}</td>
        <td>
          <button onclick="approve('${app.id}')">Approve</button>
          <button onclick="reject('${app.id}')">Reject</button>
        </td>
      `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Error fetching applications", err);
    }

    async function approve(id) {
        await fetch(`http://localhost:3000/api/applications/${id}/approve`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        alert("Approved!");
        loadApplications();
    }

    async function reject(id) {
        await fetch(`http://localhost:3000/api/applications/${id}/reject`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        alert("Rejected!");
        loadApplications();
    }
}

const table = document.querySelector("tbody");

data.forEach(app => {
    const row = document.createElement("tr");

    row.innerHTML = `
    <td>${app.location}</td>
    <td>${app.status}</td>
  `;

    table.appendChild(row);
});

const role = localStorage.getItem("role");

if (role !== "admin") {
    alert("Access denied");
    window.location.href = "index.html";
}

async function loadAlerts() {
    const res = await fetch("http://localhost:3000/api/alerts", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const alerts = await res.json();
    const list = document.getElementById("alertsList");
    list.innerHTML = "";

    alerts.forEach(alert => {
        const item = document.createElement("li");
        item.innerText = `${alert.type} detected at House ${alert.houseId}`;
        list.appendChild(item);
    });
}

//socket.io real-time listener
const socket = io("http://localhost:3000");

socket.on("newAlert", (alert) => {
    const alertsDiv = document.getElementById("alertsContainer");

    alertsDiv.innerHTML += `
    <p>🚨 ${alert.type} detected at House ${alert.houseId}</p>
    `;
});

loadApplications();