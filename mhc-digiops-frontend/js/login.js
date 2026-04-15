document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

/*const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;*/

  const selectedRole = document.getElementById("role").value;

  try {
    const res = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify
      ({ 
        email: email, 
        password: password 
      })
    });

    const data = await res.json();

    if (res.ok) {
      // Save JWT token in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", selectedRole);
      // Redirect based on role
      if (selectedRole === "admin") {
        window.location.href = "dashboard.html";
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