// REGISTER
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const registerMessage = document.getElementById("message");
        registerMessage.innerText = "";

        const payload = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            phone: document.getElementById("phone").value,
            gender: document.getElementById("gender").value,
            role: document.getElementById("role").value,
        };

        try {
            const response = await fetch("http://localhost:3000/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            const message = data.message || data.error || "Registration failed";
            registerMessage.innerText = message;

            if (response.ok) {
                window.location.href = "login.html";
            }
        } catch (error) {
            console.error("Registration error:", error);
            registerMessage.innerText = "Unable to complete registration. Check your network or backend server.";
        }
    });
}


// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            email: document.getElementById("loginEmail").value,
            password: document.getElementById("loginPassword").value
        };

        const response = await fetch("http://localhost:3000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Login response:", data);

        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("email", data.email);
            localStorage.setItem("name", data.name);
            localStorage.setItem("role", data.role);
            localStorage.setItem("phone", data.phone || "");
            localStorage.setItem("gender", data.gender || "");
            if (data.tenantId) {
                localStorage.setItem("tenantId", data.tenantId);
            }

            console.log("TOKEN SAVED:", data.token);

            const userRole = data.role.toLowerCase();
            if (userRole === "admin") {
                window.location.href = "dashboard.html";
            } else if (userRole === "housing_manager" || userRole === "housing manager") {
                window.location.href = "housing-manager-dashboard.html";
            } else if (userRole === "tenant") {
                window.location.href = "user-dashboard.html";
            } else {
                window.location.href = "user-dashboard.html";
            }
        } else {
            document.getElementById("loginMessage").innerText =
                data.error || "Login failed";
        }
    });
}