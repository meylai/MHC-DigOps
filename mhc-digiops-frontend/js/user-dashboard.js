const token = localStorage.getItem("token");

if (!token) {   
    window.location.href = "index.html";
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
    window.location.href = "index.html";
}

async function submitMaintenance() {
    const describe = 
        document.getElementById("maintenanceText").value;
    const responce = await fetch(
        "http://localhost:3000/api/maintenance", 
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },        
            body: JSON.stringify({ 
                issue: describe,
                tenantId: tenantId
            })
        }
    );
    const data = await responce.json();


    alert(data.issue);
}

async function payRent() {
    
    const amount = 
        document.getElementById("rentAmount").value;

        localStorage.setItem("rentAmount", amount);

        window.location.href = "payment-method.html";

    const responce = await fetch(
        "http://localhost:3000/api/payments/rent", 
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                amount: amount,
                method: method,
                tenantId: tenantId,
                houseId: houseId
            })
        }
    );

    const data = await responce.json();


    alert(data.amount);
}