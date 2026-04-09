const token = localStorage.getItem("token");
const applicationForm = document.getElementById("applicationForm");

applicationForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const location = document.getElementById("location").value;

  try {
    const res = await fetch("http://localhost:3000/api/applications", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ location })
    });

    const data = await res.json();
    document.getElementById("formMessage").innerText = res.ok 
      ? "Application submitted successfully!" 
      : data.message;
  } catch (err) {
    document.getElementById("formMessage").innerText = "Error submitting application.";
  }
});



const res = await fetch("http://localhost:3000/api/applications", {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${token}`
  }
});

const data = await res.json();
console.log(data);