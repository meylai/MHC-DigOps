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