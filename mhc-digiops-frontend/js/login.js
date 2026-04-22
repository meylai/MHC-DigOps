document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const selectedRole = document.getElementById("role").value;

    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", data.email);
        localStorage.setItem("name", data.name);
        localStorage.setItem("role", data.role);
        localStorage.setItem("phone", data.phone || "");
        localStorage.setItem("gender", data.gender || "");

        const userRole = (data.role || selectedRole).toLowerCase();
        if (userRole === "admin") {
          window.location.href = "dashboard.html";
        } else if (userRole === "housing_manager" || userRole === "housing manager") {
          window.location.href = "housing-manager-dashboard.html";
        } else {
          window.location.href = "user-dashboard.html";
        }
      } else {
        document.getElementById("loginError").innerText = data.message;
      }
  } catch (err) {
    document.getElementById("loginError").innerText = "Server error. Try again.";
  }
});