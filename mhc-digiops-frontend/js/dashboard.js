let currentHouseId = null;
//KPI vlaues
document.getElementById("applicationsCount").textContent = 25;
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

//let currentHouseId = null;

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

//fetching map houses from backend
fetch("http://localhost:3000/api/houses/map")
    .then(response => response.json())
    .then(houses => {
        houses.forEach(house => {
            const marker = L.marker([house.latitude, house.longitude])
                .addTo(map)
                .bindPopup(`<b>${house.address}</b>`);

            marker.on("click", () => {
                loadHouseDetails(house.id);
            });
        });
    });

//load house details function
function loadHouseDetails(houseId) {
    currentHouseId = houseId;
    fetch(`http://localhost:3000/api/houses/${houseId}/details`)
        .then(res => res.json())
        .then(data => {
            const detailsDiv = document.getElementById("houseDetails");

            detailsDiv.innerHTML = `
                <p><strong>Address:</strong> ${data.address}</p>
                <p><strong>Status:</strong> ${data.status}</p>
                <p><strong>Tenant:</strong> ${data.tenants?.[0]?.name || "N/A"}</p>
                <p><strong>Rent Status:</strong> ${data.tenants?.[0]?.rentStatus || "N/A"}</p>
                <p><strong>Alerts History:</strong></p>
                <ul>
                    ${data.sensorData.map(alert => `
                        <li>${alert.type} - ${new Date(alert.timestamp).toLocaleString()}</li>
                    `).join("")}
                </ul>
                <p><strong>Payments:</strong> ${data.payments.length}</p>
                <p><strong>Maintenance Requests:</strong></p>
                <ul>
                    ${data.maintenanceRequests.length > 0
                    ? data.maintenanceRequests.map(request => `
                        <li>
                            ${request.description} - ${request.status}
                            <button onclick="approveMaintenance(${request.id})">
                                Approve
                            </button>
                        </li>
                    `).join("")
                    : "<li>No maintenance requests</li>"
                }
                </ul>

                <hr>

                <h4>Admin Actions</h4>
                <button onclick="markRentpaid(${data.tenants?.[0]?.id})">
                    Mark Rent Paid
                </button>

                <button onclick="escalateVandalism(${data.id})">
                    Escalate Vandalism
                </button>
            `;
        })
        .catch(error => console.error("Details error:", error));
}

//approve maintenance request
function approveMaintenance(requestId) {
    fetch(`http://localhost:3000/api/maintenance/${requestId}/approve`, {
        method: "PUT",
    })
        .then(res => res.json())
        .then(() => {
            alert("Maintenance request approved!");
            loadHouseDetails(currentHouseId);
        })
        .catch(error => console.error("Maintenance Approval error:", error));
}

//mark rent paid
function markRentPaid(tenantId) {
    fetch(`http://localhost:3000/api/payments/${tenantId}/pay`, {
        method: "PUT",
    })
        .then(res => res.json())
        .then(() => {
            alert("Rent updated!");
            loadHouseDetails(currentHouseId);
        })
        .catch(error => console.error("Payment error:", error));
}

//escalate vandalism
function escalateVandalism(houseId) {
    fetch(`http://localhost:3000/api/alerts/${houseId}/escalate`, {
        method: "POST",
    })
        .then(res => res.json())
        .then(() => {
            alert("Vandalism escalated!");
            loadHouseDetails(currentHouseId);
        })
        .catch(error => console.error("Alert error:", error));
}


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
        <td>${app.id.name}</td>
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