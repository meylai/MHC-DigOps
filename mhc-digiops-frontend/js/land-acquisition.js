const token = localStorage.getItem("token");
const applicationForm = document.getElementById("applicationForm");

const formType = document.getElementById("formType");

const customaryFields = document.getElementById("customaryFields");
const leaseFields = document.getElementById("leaseFields");
const agriculturalFields = document.getElementById("agriculturalFields");
const governmentFields = document.getElementById("governmentFields");

formType.addEventListener("change", function () {
    // Hide all sections first
    customaryFields.classList.add("hidden");
    leaseFields.classList.add("hidden");
    agriculturalFields.classList.add("hidden");
    governmentFields.classList.add("hidden");

    const selected = this.value;

    if (selected === "customary") {
        customaryFields.classList.remove("hidden");
    }

    if (selected === "lease") {
        leaseFields.classList.remove("hidden");
    }

    if (selected === "agricultural") {
        leaseFields.classList.remove("hidden");
        agriculturalFields.classList.remove("hidden");
    }

    if (selected === "government") {
        governmentFields.classList.remove("hidden");
    }
});

document.getElementById("landForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
        formType: document.getElementById("formType").value,
        sellerName: document.getElementById("sellerName").value,
        nationalId: document.getElementById("nationalId").value,
        region: document.getElementById("region").value,
        landLocation: document.getElementById("landLocation").value,
        landSize: document.getElementById("landSize").value,
        ownershipProof: document.getElementById("ownershipProof").value,
        purpose: document.getElementById("purpose").value,
        landMap: document.getElementById("landMap").value,

        VillageChief: document.getElementById("VillageChief")?.value || "",
        chiefSignature: document.getElementById("chiefSignature")?.value || "",
        winessName: document.getElementById("witnessName")?.value || "",

        leaseDuration: document.getElementById("leaseDuration")?.value || "",
        agriculturalPlan: document.getElementById("agriculturalPlan")?.value || "",

        valuationReport: document.getElementById("valuationReport")?.value || "",
        ministryApproval: document.getElementById("ministryApproval")?.value || "",

        notes: document.getElementById("notes").value
    };

    const res = await fetch("http://localhost:3000/api/land-acquisition", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const data = await res.json();

    document.getElementById("message").innerText =
        data.message || "Submitted successfully";
});