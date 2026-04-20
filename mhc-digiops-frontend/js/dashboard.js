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

const token = localStorage.getItem("token");

//connection to backend for real data
fetch("http://localhost:3000/api/admin/dashboard", {
    headers: {
        Authorization: `Bearer ${token}`
    }
})
    .then(res => res.json())
    .then(data => {
        document.getElementById("applicationsCount").textContent = data.totalApplications;
        document.getElementById("tenantsCount").textContent = data.totalUsers;
        document.getElementById("alertsCount").textContent = data.totalNotifications;
    })
    .catch(error => console.error("Dashboard error:", error));

fetch("http://localhost:3000/api/admin/dashboard/stats", {
    headers: {
        Authorization: `Bearer ${token}`
    }
})
    .then(res => res.json())
    .then(data => {
        console.log(data);
    });

async function loadMaintenanceRequests() {
    try {
        const res = await fetch("http://localhost:3000/api/maintenance/requests", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const requests = await res.json();
        const tbody = document.querySelector("#maintenanceRequestsTable tbody");
        tbody.innerHTML = "";

        if (!Array.isArray(requests) || requests.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No maintenance requests</td></tr>';
            return;
        }

        requests.forEach(request => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${request.id}</td>
                <td>${request.tenant?.name || request.tenantId}</td>
                <td>${request.description}</td>
                <td>${request.status}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Load maintenance requests error:", error);
    }
}
//load dashboardstats
async function loadDashboardStats() {
    try {
        const res = await fetch("http://localhost:3000/api/admin/dashboard/stats"),
        const data = await res.json();

        document.getElementById("totalApplications").textContent = data.totalApplications;
        document.getElementById("availableHouses").textContent = data.availableHouses;
        document.getElementById("occupiedHouses").textContent = data.occupiedHouses;
    } catch (error) {
        console.error("Load dashboard stats error:", error);
    }
}

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

const role = localStorage.getItem("role");

if (role !== "admin" && role !== "housing_manager") {
    alert("Access denied");
    window.location.href = "index.html";
}

// Show/hide role-specific UI elements
if (role === "admin") {
    document.getElementById("housingManagerActions").style.display = "none";
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

async function loadMaintenanceRequests() {
    try {
        const res = await fetch("http://localhost:3000/api/maintenance", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const requests = await res.json();
        const tbody = document.querySelector("#maintenanceRequestsTable tbody");
        tbody.innerHTML = "";

        if (!Array.isArray(requests) || requests.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No maintenance requests</td></tr>';
            return;
        }

        requests.forEach(request => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${request.id}</td>
                <td>${request.tenant?.name || request.tenantId}</td>
                <td>${request.house?.name || request.houseId}</td>
                <td>${request.description}</td>
                <td>${request.status}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Load maintenance requests error:", error);
    }
}

//maintenance get route
export const getAllMaintenanceRequests = async (req, res) => {
    try {
        const requests = await prisma.maintenanceRequest.findMany({
            include: {
            tenant: true,
            house: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });
        res.json(requests);
    } catch (error) {
        console.error("Get all maintenance requests error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


//socket.io real-time listener
const socket = io("http://localhost:3000");

socket.on("newAlert", (alert) => {
    const alertsDiv = document.getElementById("alertsContainer");

    alertsDiv.innerHTML += `
    <p>🚨 ${alert.type} detected at House ${alert.houseId}</p>
    `;
});

const socket = io("http://localhost:3000");
socket.on("newRequest", (data) => {
    alert("New maintenance request recieved: " + data.description);
    console.log("New maintenance request:", data);
});

//admin dasboard lister
socket.on("newMaintenanceRequest", (request) => {
    alert(`New maintenance request from ${request.tenant.name} for House ${request.house.name}: ${request.description}`);
});

loadApplications();
loadMaintenanceRequests();
loadDashboardStats();
loadTenants();

// Tenant Management Functions
async function loadTenants() {
    try {
        const res = await fetch("http://localhost:3000/api/tenants", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const tenants = await res.json();
        const tbody = document.querySelector("#tenantsTable tbody");
        tbody.innerHTML = "";

        if (!Array.isArray(tenants) || tenants.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No tenants found</td></tr>';
            return;
        }

        tenants.forEach(tenant => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${tenant.id}</td>
                <td>${tenant.name}</td>
                <td>${tenant.house?.address || 'N/A'}</td>
                <td>${tenant.rentStatus}</td>
                <td>
                    ${role === 'housing_manager' ?
                        `<button onclick="sendRentDueNotification(${tenant.id})">Notify Rent Due</button>
                         <button onclick="removeTenant(${tenant.id})">Remove</button>` :
                        `<button onclick="viewTenantDetails(${tenant.id})">View</button>`
                    }
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Load tenants error:", error);
    }
}

async function loadAvailableHouses() {
    try {
        const res = await fetch("http://localhost:3000/api/houses/map", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const houses = await res.json();
        const select = document.getElementById("tenantHouseId");
        select.innerHTML = '<option value="">Select House</option>';

        // Allow adding tenants to any house (available or occupied)
        houses.forEach(house => {
            const option = document.createElement("option");
            option.value = house.id;
            option.textContent = `${house.address} (${house.location}) - ${house.status}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Load available houses error:", error);
    }
}

function showAddTenantForm() {
    document.getElementById("addTenantForm").style.display = "block";
    loadAvailableHouses();
}

function hideAddTenantForm() {
    document.getElementById("addTenantForm").style.display = "none";
    document.getElementById("tenantName").value = "";
    document.getElementById("tenantHouseId").value = "";
    document.getElementById("tenantRentStatus").value = "pending";
}

async function addTenant(event) {
    event.preventDefault();

    const name = document.getElementById("tenantName").value;
    const houseId = document.getElementById("tenantHouseId").value;
    const rentStatus = document.getElementById("tenantRentStatus").value;

    try {
        const res = await fetch("http://localhost:3000/api/tenants", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name, houseId, rentStatus })
        });

        if (res.ok) {
            alert("Tenant added successfully!");
            hideAddTenantForm();
            loadTenants();
            loadDashboardStats(); // Refresh stats
        } else {
            const error = await res.json();
            alert("Error: " + error.error);
        }
    } catch (error) {
        console.error("Add tenant error:", error);
        alert("Failed to add tenant");
    }
}

async function sendRentDueNotification(tenantId) {
    try {
        const res = await fetch(`http://localhost:3000/api/tenants/${tenantId}/notify-rent-due`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (res.ok) {
            alert("Rent due notification sent successfully!");
        } else {
            const error = await res.json();
            alert("Error: " + error.error);
        }
    } catch (error) {
        console.error("Send rent due notification error:", error);
        alert("Failed to send notification");
    }
}

async function viewTenantDetails(tenantId) {
    try {
        const res = await fetch(`http://localhost:3000/api/tenants/${tenantId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (res.ok) {
            const tenant = await res.json();
            alert(`Tenant Details:\nName: ${tenant.name}\nHouse: ${tenant.house?.address || 'N/A'}\nRent Status: ${tenant.rentStatus}`);
        } else {
            const error = await res.json();
            alert("Error: " + error.error);
        }
    } catch (error) {
        console.error("View tenant details error:", error);
        alert("Failed to load tenant details");
    }
}

async function removeTenant(tenantId) {
    if (!confirm("Are you sure you want to remove this tenant?")) return;

    try {
        const res = await fetch(`http://localhost:3000/api/tenants/${tenantId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (res.ok) {
            alert("Tenant removed successfully!");
            loadTenants();
            loadDashboardStats(); // Refresh stats
        } else {
            const error = await res.json();
            alert("Error: " + error.error);
        }
    } catch (error) {
        console.error("Remove tenant error:", error);
        alert("Failed to remove tenant");
    }
}
loadAlerts();