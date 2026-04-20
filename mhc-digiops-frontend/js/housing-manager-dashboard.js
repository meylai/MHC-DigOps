let currentHouseId = null;
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (role !== "housing_manager") {
    alert("Access denied");
    window.location.href = "index.html";
}

const map = L.map("map").setView([-13.9626, 33.7741], 6);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

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
    })
    .catch(error => console.error("House map error:", error));

function loadHouseDetails(houseId) {
    currentHouseId = houseId;
    fetch(`http://localhost:3000/api/houses/${houseId}/details`, {
        headers: { Authorization: `Bearer ${token}` }
    })
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
                    ${data.sensorData?.map(alert => `
                        <li>${alert.type} - ${new Date(alert.timestamp).toLocaleString()}</li>
                    `).join("") || "<li>No alerts</li>"}
                </ul>
                <p><strong>Payments:</strong> ${data.payments?.length || 0}</p>
                <p><strong>Maintenance Requests:</strong></p>
                <ul>
                    ${data.maintenanceRequests?.length > 0
                    ? data.maintenanceRequests.map(request => `
                        <li>
                            ${request.description} - ${request.status}
                            <button onclick="approveMaintenance(${request.id})">Approve</button>
                        </li>
                    `).join("")
                    : "<li>No maintenance requests</li>"
                }
                </ul>
                <hr>
                <h4>House Actions</h4>
                <button onclick="markRentPaid(${data.tenants?.[0]?.id || 0})">Mark Rent Paid</button>
                <button onclick="escalateVandalism(${houseId})">Escalate Vandalism</button>
            `;
        })
        .catch(error => console.error("Details error:", error));
}

function approveMaintenance(requestId) {
    fetch(`http://localhost:3000/api/maintenance/${requestId}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(() => {
            alert("Maintenance request approved!");
            loadHouseDetails(currentHouseId);
            loadMaintenanceRequests();
        })
        .catch(error => console.error("Maintenance approval error:", error));
}

function markRentPaid(tenantId) {
    if (!tenantId) {
        alert("No tenant selected for rent payment.");
        return;
    }

    fetch(`http://localhost:3000/api/payments/${tenantId}/pay`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(() => {
            alert("Rent updated!");
            loadHouseDetails(currentHouseId);
        })
        .catch(error => console.error("Payment error:", error));
}

function escalateVandalism(houseId) {
    fetch(`http://localhost:3000/api/alerts/${houseId}/escalate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(() => {
            alert("Vandalism escalated!");
            loadHouseDetails(currentHouseId);
        })
        .catch(error => console.error("Alert error:", error));
}

async function loadMaintenanceRequests() {
    try {
        const res = await fetch("http://localhost:3000/api/maintenance/requests", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const requests = await res.json();
        const tbody = document.querySelector("#maintenanceRequestsTable tbody");
        tbody.innerHTML = "";

        if (!Array.isArray(requests) || requests.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No maintenance requests</td></tr>';
            return;
        }

        requests.forEach(request => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${request.id}</td>
                <td>${request.tenant?.name || request.tenantId}</td>
                <td>${request.house?.address || request.houseId}</td>
                <td>${request.description}</td>
                <td>${request.status}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Load maintenance requests error:", error);
    }
}

async function loadTenants() {
    try {
        const res = await fetch("http://localhost:3000/api/tenants", {
            headers: { Authorization: `Bearer ${token}` }
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
                    <button onclick="sendRentDueNotification(${tenant.id})">Notify Rent Due</button>
                    <button onclick="removeTenant(${tenant.id})">Remove</button>
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
            headers: { Authorization: `Bearer ${token}` }
        });
        const houses = await res.json();
        const select = document.getElementById("tenantHouseId");
        select.innerHTML = '<option value="">Select House</option>';

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
            loadMaintenanceRequests();
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
            headers: { Authorization: `Bearer ${token}` }
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

async function removeTenant(tenantId) {
    if (!confirm("Are you sure you want to remove this tenant?")) return;

    try {
        const res = await fetch(`http://localhost:3000/api/tenants/${tenantId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
            alert("Tenant removed successfully!");
            loadTenants();
            loadMaintenanceRequests();
        } else {
            const error = await res.json();
            alert("Error: " + error.error);
        }
    } catch (error) {
        console.error("Remove tenant error:", error);
        alert("Failed to remove tenant");
    }
}

loadMaintenanceRequests();
loadTenants();
