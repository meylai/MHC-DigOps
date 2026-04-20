// House data
const houses = [
    // Lilongwe - 4 Occupied (Blue)
    {
        id: 1,
        name: "House in Area 49",
        address: "Plot 123, Area 49, Lilongwe",
        city: "Lilongwe",
        status: "occupied",
        latitude: -13.9833,
        longitude: 33.7833,
        rent: "MWK 25,000",
        bedrooms: 3,
        bathrooms: 2
    },
    {
        id: 2,
        name: "House in Area 47",
        address: "Plot 456, Area 47, Lilongwe",
        city: "Lilongwe",
        status: "occupied",
        latitude: -13.9700,
        longitude: 33.7900,
        rent: "MWK 30,000",
        bedrooms: 4,
        bathrooms: 2
    },
    {
        id: 3,
        name: "House in Old Town",
        address: "Plot 789, Old Town, Lilongwe",
        city: "Lilongwe",
        status: "occupied",
        latitude: -13.9600,
        longitude: 33.7700,
        rent: "MWK 22,000",
        bedrooms: 2,
        bathrooms: 1
    },
    {
        id: 4,
        name: "House in Capital Hill",
        address: "Plot 321, Capital Hill, Lilongwe",
        city: "Lilongwe",
        status: "occupied",
        latitude: -13.9900,
        longitude: 33.8000,
        rent: "MWK 35,000",
        bedrooms: 5,
        bathrooms: 3
    },
    // Lilongwe - 2 Available (Green)
    {
        id: 5,
        name: "Modern House in Area 2",
        address: "Plot 654, Area 2, Lilongwe",
        city: "Lilongwe",
        status: "available",
        latitude: -13.9500,
        longitude: 33.8100,
        rent: "MWK 28,000",
        bedrooms: 3,
        bathrooms: 2
    },
    {
        id: 6,
        name: "Apartment in Town Centre",
        address: "Plot 987, Town Centre, Lilongwe",
        city: "Lilongwe",
        status: "available",
        latitude: -13.9750,
        longitude: 33.7850,
        rent: "MWK 20,000",
        bedrooms: 2,
        bathrooms: 1
    },
    // Blantyre - 3 Occupied (Blue)
    {
        id: 7,
        name: "House in Limbe",
        address: "Plot 111, Limbe, Blantyre",
        city: "Blantyre",
        status: "occupied",
        latitude: -15.7861,
        longitude: 35.0058,
        rent: "MWK 26,000",
        bedrooms: 3,
        bathrooms: 2
    },
    {
        id: 8,
        name: "House in Blantyre CBD",
        address: "Plot 222, Blantyre CBD, Blantyre",
        city: "Blantyre",
        status: "occupied",
        latitude: -15.7900,
        longitude: 35.0100,
        rent: "MWK 32,000",
        bedrooms: 4,
        bathrooms: 2
    },
    {
        id: 9,
        name: "House in Bangwe",
        address: "Plot 333, Bangwe, Blantyre",
        city: "Blantyre",
        status: "occupied",
        latitude: -15.8000,
        longitude: 35.0200,
        rent: "MWK 24,000",
        bedrooms: 2,
        bathrooms: 1
    },
    // Blantyre - 2 Available (Green)
    {
        id: 10,
        name: "House in Chilomoni",
        address: "Plot 444, Chilomoni, Blantyre",
        city: "Blantyre",
        status: "available",
        latitude: -15.8100,
        longitude: 35.0050,
        rent: "MWK 27,000",
        bedrooms: 3,
        bathrooms: 2
    },
    {
        id: 11,
        name: "House in Ndirande",
        address: "Plot 555, Ndirande, Blantyre",
        city: "Blantyre",
        status: "available",
        latitude: -15.7750,
        longitude: 34.9950,
        rent: "MWK 19,000",
        bedrooms: 2,
        bathrooms: 1
    }
];

// Initialize map
const map = L.map("housesMap").setView([-14.75, 33.90], 8);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19
}).addTo(map);

// Function to create custom icon based on status
function getMarkerIcon(status) {
    const color = status === "occupied" ? "#3b82f6" : "#10b981";
    return L.icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}"><path d="M12 0C7.6 0 4 3.6 4 8c0 6 8 16 8 16s8-10 8-16c0-4.4-3.6-8-8-8z"/></svg>`)}`,
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        popupAnchor: [0, -40]
    });
}

// Add markers to map
houses.forEach(house => {
    const marker = L.marker(
        [house.latitude, house.longitude],
        { icon: getMarkerIcon(house.status) }
    ).addTo(map);

    const statusText = house.status === "occupied" ? "Occupied" : "Available";
    const popupContent = `
        <div style="font-weight: bold; margin-bottom: 5px;">${house.name}</div>
        <div style="font-size: 0.9em; margin-bottom: 5px;">${house.address}</div>
        <div style="color: ${house.status === "occupied" ? "#1e40af" : "#15803d"}; font-weight: bold;">${statusText}</div>
        <div style="margin-top: 5px; font-size: 0.9em;">Rent: ${house.rent}</div>
    `;
    marker.bindPopup(popupContent);
});

// Display houses in list format
function displayHouses() {
    const lilongweContainer = document.getElementById("lilongweHouses");
    const blantyreContainer = document.getElementById("blantyreHouses");

    const lilongweHouses = houses.filter(h => h.city === "Lilongwe");
    const blantyreHouses = houses.filter(h => h.city === "Blantyre");

    lilongweContainer.innerHTML = lilongweHouses.map(house => createHouseCard(house)).join("");
    blantyreContainer.innerHTML = blantyreHouses.map(house => createHouseCard(house)).join("");
}

// Create HTML card for each house
function createHouseCard(house) {
    const statusClass = house.status === "occupied" ? "occupied" : "available";
    const statusText = house.status === "occupied" ? "Occupied" : "Available";

    return `
        <div class="house-card">
            <h3>${house.name}</h3>
            <div class="house-info">
                <strong>Address:</strong> ${house.address}
            </div>
            <div class="house-info">
                <strong>City:</strong> ${house.city}
            </div>
            <div class="house-info">
                <strong>Bedrooms:</strong> ${house.bedrooms}
            </div>
            <div class="house-info">
                <strong>Bathrooms:</strong> ${house.bathrooms}
            </div>
            <div class="house-info">
                <strong>Monthly Rent:</strong> ${house.rent}
            </div>
            <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
    `;
}

// Display houses on page load
displayHouses();
