
let currentHouseId = null;
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

// Role check
if (!role || (role.toLowerCase() !== "housing_manager" && role.toLowerCase() !== "housing manager")) {
    alert("Access denied");
    window.location.href = "index.html";
}

// Load houses from houses.js

const housesData = typeof window.availableHouses !== 'undefined' ? window.availableHouses : [];


const map = L.map("map").setView([-14.75, 33.90], 8);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

fetch("http://localhost:3000/api/houses/map")
    .then(response => response.json())
    .then(data => {
        data.forEach(house => {
            const marker = L.marker([house.latitude, house.longitude]).addTo(map)
                .bindPopup(`<b>${house.address}</b>`);
            marker.on("click", () => loadHouseDetails(house.id));
        });
    })
    .catch(error => console.error("Map error:", error));

function loadHouseDetails(houseId) {
    currentHouseId = houseId;
    fetch(`http://localhost:3000/api/houses/${houseId}/details`, {
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => {
            document.getElementById("houseDetails").innerHTML = `
                <p><strong>Address:</strong> ${data.address}</p>
                <p><strong>Status:</strong> ${data.status}</p>
                <p><strong>Tenant:</strong> ${data.tenants?.[0]?.name || "N/A"}</p>
                <p><strong>Rent Status:</strong> ${data.tenants?.[0]?.rentStatus || "N/A"}</p>
                <button onclick="markRentPaid(${data.tenants?.[0]?.id || 0})">Mark Rent Paid</button>
            `;
        });
}

function markRentPaid(id) {
    fetch(`http://localhost:3000/api/payments/${id}/pay`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
    }).then(() => loadHouseDetails(currentHouseId));
}

async function loadMaintenanceRequests() {
    const res = await fetch("http://localhost:3000/api/maintenance/requests", {
        headers: { Authorization: `Bearer ${token}` }
    });
    const requests = await res.json();
    const tbody = document.querySelector("#maintenanceRequestsTable tbody");
    tbody.innerHTML = requests.map(r => `<tr><td>${r.id}</td><td>${r.tenant?.name}</td><td>${r.house?.address}</td><td>${r.description}</td><td>${r.status}</td></tr>`).join('') || '<tr><td colspan="5">No requests</td></tr>';
}

async function loadTenants() {
    const res = await fetch("http://localhost:3000/api/tenants", {
        headers: { Authorization: `Bearer ${token}` }
    });
    const tenants = await res.json();
    const tbody = document.querySelector("#tenantsTable tbody");
    tbody.innerHTML = tenants.map(t => `<tr><td>${t.id}</td><td>${t.name}</td><td>${t.house?.address}</td><td>${t.rentStatus}</td><td><button onclick="removeTenant(${t.id})">Remove</button></td></tr>`).join('') || '<tr><td colspan="5">No tenants</td></tr>';
}

async function loadTenantUsers() {
    console.log('Loading tenant users from API...');
    const res = await fetch("http://localhost:3000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
    });
    const users = await res.json();
    const tenantUsers = users.filter(u => u.role && u.role.toLowerCase() === 'tenant');
    const select = document.getElementById("tenantUserId");
    select.innerHTML = '<option value="">Select User Account</option>';
    tenantUsers.forEach(u => {
        const option = document.createElement("option");
        option.value = u.id;
        option.text = `${u.name} (${u.email})`;
        select.appendChild(option);
    });
    console.log(`Loaded ${tenantUsers.length} tenant users`);
}

function loadAvailableHouses() {
    console.log('Loading houses from houses-data.js');
    const availableHouses = housesData;
    const select = document.getElementById("tenantHouseId");
    select.innerHTML = '<option value="">Select House</option>';
    availableHouses.forEach(h => {
        const option = document.createElement("option");
        option.value = JSON.stringify(h);
        option.text = `${h.name} - ${h.address}`;
        select.appendChild(option);
    });
    console.log(`Loaded ${availableHouses.length} houses from static data`);
}

function showAddTenantForm() {
    console.log("showAddTenantForm - Button clicked");
    document.getElementById("addTenantForm").style.display = "block";
    loadTenantUsers();
    loadAvailableHouses();
}

function hideAddTenantForm() {
    document.getElementById("addTenantForm").style.display = "none";
    document.querySelectorAll("#addTenantForm input, #addTenantForm select").forEach(el => el.value = '');
}

async function addTenant(e) {
    e.preventDefault();
    const houseSelectValue = document.getElementById("tenantHouseId").value;
    let houseData;
    try {
        houseData = JSON.parse(houseSelectValue);
    } catch {
        alert("Invalid house selected");
        return;
    }
    const formData = {
        name: document.getElementById("tenantName").value,
        house: houseData,
        userId: parseInt(document.getElementById("tenantUserId").value),
        rentStatus: document.getElementById("tenantRentStatus").value
    };
    const res = await fetch("http://localhost:3000/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
    });
    if (res.ok) {
        alert("Tenant added!");
        hideAddTenantForm();
        loadTenants();
    } else {
        const err = await res.json();
        alert(err.error || "Error adding tenant");
    }
}

function removeTenant(id) {
    if (confirm("Remove tenant?")) {
        fetch(`http://localhost:3000/api/tenants/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        }).then(() => loadTenants());
    }
}

// Init
loadMaintenanceRequests();
loadTenants();
console.log("Housing Manager Dashboard loaded - housesData:", housesData.length);

