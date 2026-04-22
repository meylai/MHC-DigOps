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

    //create a formData object to handle file uploads
    const formData = new FormData();

    //add text filds to formData
    formData.append("formType", document.getElementById("formType").value);
    formData.append("sellerName", document.getElementById("sellerName").value);
    formData.append("region", document.getElementById("region").value);
    formData.append("landLocation", document.getElementById("landLocation").value);
    formData.append("landSize", document.getElementById("landSize").value);    
    formData.append("purpose", document.getElementById("purpose").value);
    formData.append("notes", document.getElementById("notes").value);
    
    
    // add file fields (use .files[0] to get the actual file object)
    if (document.getElementById("idCopy").files.length > 0) {
        formData.append("nationalId", document.getElementById("idCopy").files[0]);
    }

    if (document.getElementById("ownershipProof").files.length > 0) {
        formData.append("ownershipProof", document.getElementById("ownershipProof").files[0]);
    }

    if (document.getElementById("landMap").files.length > 0) {
        formData.append("landMap", document.getElementById("landMap").files[0]);
    }

    if (document.getElementById("valuationReport").files.length > 0) {
        formData.append("valuationReport", document.getElementById("valuationReport").files[0]);
    }

    //conditional fields
    formData.append("villageChief", document.getElementById("villageChief")?.value || "");
    formData.append("chiefSignature", document.getElementById("chiefSignature")?.value || "");
    formData.append("witnessName", document.getElementById("witnessName")?.value || "");
    formData.append("leaseDuration", document.getElementById("leaseDuration")?.value || "");
    formData.append("agriculturalPlan", document.getElementById("agriculturalPlan")?.value || "");   
    formData.append("ministryApproval", document.getElementById("ministryApproval")?.value || "");
    
    try {
        const res = await fetch("http://localhost:3000/api/land-acquisition", {
            method: "POST",
            body: formData,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();

        if (res.ok) {
            // Show success message using SweetAlert2
            Swal.fire({
                title: "Success!",
                text: "Form submitted successfully!",
                icon: "success",
                confirm: "OK"
            }).then(() => {
                // Reset the form after user clicks "OK"
                window.location.href = "user-dashboard.html";
            }); 

            document.getElementById("landForm").reset();

            customaryFields.classList.add("hidden");
            leaseFields.classList.add("hidden");
            agriculturalFields.classList.add("hidden");
            governmentFields.classList.add("hidden");

            
        } else {
            alert(data.message || "Submission failed");
        }

        document.getElementById("message").innerText =
            data.message || "Submitted successfully";

    } catch (error) {
        console.error(error);
        alert("Server error. Please try again.");
    }

});