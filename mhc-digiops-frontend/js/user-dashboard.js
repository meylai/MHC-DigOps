const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) {
    window.location.href = "index.html";
}

if (role !== "user") {
    window.location.href = "dashboard.html";
}

function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });

    document.getElementById(sectionId).classList.add("active");
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    window.location.href = "index.html";
}

async function loadTenantProfile() {
    try {
        let tenantId = localStorage.getItem("tenantId");

        if (!tenantId && token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                tenantId = payload.userId;
            } catch (error) {
                console.error("Failed to parse token for tenantId:", error);
            }
        }

        if (!tenantId) {
            document.getElementById("tenantName").textContent = "Not set";
            document.getElementById("tenantHouse").textContent = "Not assigned";
            document.getElementById("tenantRentStatus").textContent = "Unknown";
            return;
        }

        const response = await fetch(`http://localhost:3000/api/tenants/${tenantId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const tenant = await response.json();
            document.getElementById("tenantName").textContent = tenant.name;
            document.getElementById("tenantHouse").textContent = tenant.house?.address || "Not assigned";
            document.getElementById("tenantRentStatus").textContent = tenant.rentStatus;
        } else {
            console.error("Failed to load tenant profile");
        }
    } catch (error) {
        console.error("Tenant profile load error:", error);
    }
}

async function loadProfile() {
    try {
        const response = await fetch("http://localhost:3000/api/profile", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 401) {
            logout();
            return;
        }

        if (!response.ok) {
            throw new Error("Unable to load profile");
        }

        const user = await response.json();
        document.getElementById("profileName").textContent = user.name;
        document.getElementById("profileEmail").textContent = user.email;
        document.getElementById("profilePhone").textContent = user.phone || "Not set";
        document.getElementById("profileGender").textContent = user.gender || "Not set";

        // Store in localStorage for edit form
        localStorage.setItem("name", user.name);
        localStorage.setItem("email", user.email);
        localStorage.setItem("phone", user.phone || "");
        localStorage.setItem("gender", user.gender || "");
    } catch (error) {
        console.error("Profile load error:", error);
    }
}

async function loadNotifications() {
    try {
        const response = await fetch("http://localhost:3000/api/notifications", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 401) {
            logout();
            return;
        }

        if (!response.ok) {
            throw new Error("Unable to load notifications");
        }

        const user = await response.json();
        document.getElementById("profileName").textContent = user.name;
        document.getElementById("profileEmail").textContent = user.email;
        document.getElementById("profilePhone").textContent = user.phone || "Not set";
        document.getElementById("profileGender").textContent = user.gender || "Not set";

        // Store in localStorage for edit form
        localStorage.setItem("name", user.name);
        localStorage.setItem("email", user.email);
        localStorage.setItem("phone", user.phone || "");
        localStorage.setItem("gender", user.gender || "");
    } catch (error) {
        console.error("Profile load error:", error);
    }
}

function showTenantProfileForm() {
    document.getElementById("tenantProfileEdit").hidden = false;
    document.getElementById("tenantProfileView").hidden = true;

    document.getElementById("tenantNameInput").value = document.getElementById("tenantName").textContent;
}

function cancelTenantProfileEdit() {
    document.getElementById("tenantProfileEdit").hidden = true;
    document.getElementById("tenantProfileView").hidden = false;
}

async function saveTenantProfile() {
    const name = document.getElementById("tenantNameInput").value.trim();
    let tenantId = localStorage.getItem("tenantId");

    if (!name) {
        alert("Please enter tenant name.");
        return;
    }

    if (!tenantId && token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            tenantId = payload.userId;
        } catch (error) {
            console.error("Failed to parse token for tenantId:", error);
        }
    }

    if (!tenantId) {
        alert("Tenant ID not found. Please contact administrator.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/tenants/${tenantId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name }),
        });

        if (response.ok) {
            alert("Tenant profile updated successfully!");
            cancelTenantProfileEdit();
            loadTenantProfile();
        } else {
            const error = await response.json();
            alert("Error: " + error.error);
        }
    } catch (error) {
        console.error("Save tenant profile error:", error);
        alert("Failed to update tenant profile");
    }
}

function showProfileForm() {
    document.getElementById("profileEdit").hidden = false;
    document.getElementById("profileView").hidden = true;

    document.getElementById("profileNameInput").value = document.getElementById("profileName").textContent;
    document.getElementById("profileEmailInput").value = document.getElementById("profileEmail").textContent;
    document.getElementById("profilePhoneInput").value = localStorage.getItem("phone") || "";
    document.getElementById("profileGenderInput").value = localStorage.getItem("gender") || "";
}

function cancelProfileEdit() {
    document.getElementById("profileEdit").hidden = true;
    document.getElementById("profileView").hidden = false;
}

async function saveProfile() {
    const name = document.getElementById("profileNameInput").value.trim();
    const email = document.getElementById("profileEmailInput").value.trim();
    const phone = document.getElementById("profilePhoneInput").value.trim();
    const gender = document.getElementById("profileGenderInput").value;

    if (!name || !email) {
        alert("Please enter both name and email.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name, email, phone, gender }),
        });

        if (response.status === 401) {
            logout();
            return;
        }

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Unable to update profile");
        }

        const data = await response.json();
        document.getElementById("profileName").textContent = data.user.name;
        document.getElementById("profileEmail").textContent = data.user.email;
        document.getElementById("profilePhone").textContent = data.user.phone || "Not set";
        document.getElementById("profileGender").textContent = data.user.gender || "Not set";
        localStorage.setItem("email", data.user.email);
        localStorage.setItem("name", data.user.name);
        localStorage.setItem("phone", data.user.phone || "");
        localStorage.setItem("gender", data.user.gender || "");

        cancelProfileEdit();
        alert("Profile updated successfully.");
    } catch (error) {
        console.error("Profile save error:", error);
        alert(error.message || "Unable to update profile.");
    }
}

async function loadPaymentHistory() {
    try {
        const response = await fetch("http://localhost:3000/api/payments/history", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 401) {
            logout();
            return;
        }

        if (!response.ok) {
            throw new Error("Unable to load payment history");
        }

        const payments = await response.json();
        const tbody = document.getElementById("paymentTable");
        tbody.innerHTML = "";

        if (payments.length === 0) {
            document.getElementById("user-paymentHistory").textContent = "No payments yet";
            return;
        }

        document.getElementById("user-paymentHistory").textContent = "";

        payments.forEach(payment => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${new Date(payment.date).toLocaleDateString()}</td>
                <td>MWK ${payment.amount.toLocaleString()}</td>
                <td>${payment.method || "PayChangu"}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Payment history error:", error);
    }
}

async function loadRecentActivity() {
    try {
        const [maintenanceRes, paymentRes, applicationRes] = await Promise.all([
            fetch("http://localhost:3000/api/maintenance/user", {
                headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("http://localhost:3000/api/payments/history", {
                headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("http://localhost:3000/api/applications", {
                headers: { Authorization: `Bearer ${token}` },
            }),
        ]);

        if (maintenanceRes.status === 401 || paymentRes.status === 401 || applicationRes.status === 401) {
            logout();
            return;
        }

        const maintenance = maintenanceRes.ok ? await maintenanceRes.json() : [];
        const payments = paymentRes.ok ? await paymentRes.json() : [];
        const applications = applicationRes.ok ? await applicationRes.json() : [];

        const activities = [];

        // Add maintenance requests
        maintenance.forEach(req => {
            activities.push({
                date: new Date(req.createdAt),
                activity: "Maintenance Request",
                status: req.status,
            });
        });

        // Add payments
        payments.forEach(payment => {
            activities.push({
                date: new Date(payment.date),
                activity: "Rent Payment",
                status: payment.status || "Completed",
            });
        });

        // Add land applications
        applications.forEach(app => {
            activities.push({
                date: new Date(app.createdAt || Date.now()), // Assuming createdAt exists
                activity: "Land Application",
                status: app.status,
            });
        });

        // Sort by date descending
        activities.sort((a, b) => b.date - a.date);

        // Take recent 10
        const recentActivities = activities.slice(0, 10);

        const tbody = document.getElementById("user-activityTable");
        tbody.innerHTML = "";

        if (recentActivities.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">No recent activity</td></tr>';
            return;
        }

        recentActivities.forEach(activity => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${activity.date.toLocaleDateString()}</td>
                <td>${activity.activity}</td>
                <td>${activity.status}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Recent activity error:", error);
    }
}

async function submitMaintenance() {
    const description = document.getElementById("maintenanceText").value.trim();
    const token = localStorage.getItem("token");
    let tenantId = localStorage.getItem("tenantId");

    if (!description) {
        alert("Please describe the issue before submitting.");
        return;
    }

    if (!tenantId && token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            tenantId = payload.userId;
        } catch (error) {
            console.error("Failed to parse token for tenantId:", error);
        }
    }
    
    console.log("tenantId:", tenantId, "token:", token);

    const response = await fetch(
        "http://localhost:3000/api/maintenance",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                description,
                tenantId,
                houseId,
            }),
        }
    );

    const data = await response.json();

    if (response.ok) {
        alert(data.message);
        document.getElementById("maintenanceText").value = "";
    } else {
        console.log("Status:", response.status);
        console.log("Response:", data);
        alert(data.error || "Failed to submit maintenance request.");
    }
}

function payRent() {
    const amount = Number(document.getElementById("rentAmount").value);
    let email = localStorage.getItem("email");

    if (!amount || amount <= 0) {
        alert("Please enter a valid rent amount.");
        return;
    }

    if (!email) {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                email = payload.email;
            } catch (error) {
                console.error("Failed to parse token email:", error);
            }
        }
    }

    if (!email) {
        alert("Unable to determine your email. Please log in again.");
        window.location.href = "login.html";
        return;
    }

    fetch("http://localhost:3000/api/pay-rent", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            amount,
            email,
            method: "PayChangu",
        }),
    })
        .then(async (response) => {
            const data = await response.json();
            if (response.ok && data.paymentUrl) {
                window.location.href = data.paymentUrl;
                return;
            }

            throw new Error(data.error || "Failed to initiate payment");
        })
        .catch((error) => {
            console.error("Rent payment error:", error);
            alert(`Payment failed: ${error.message}`);
        });
}

function showSuccessMessage() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
        alert("Your rent payment was successful. A receipt has been sent to your email.");
        history.replaceState(null, "", window.location.pathname);
    }
}

loadProfile();
loadTenantProfile();
loadPaymentHistory();
loadNotifications();
loadRecentActivity();
showSuccessMessage();