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

loadApplications();