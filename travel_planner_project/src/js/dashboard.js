document.addEventListener("DOMContentLoaded", function () {
  // Check if user is logged in
  if (!localStorage.getItem("currentUser")) {
    window.location.href = "auth.html?action=login";
    return;
  }

  // Load user's trips
  loadTrips();

  // Logout functionality
  document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem("currentUser");
    window.location.href = "auth.html?action=login";
  });

  // Display user name in navbar
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser && currentUser.name) {
    document.querySelector(
      ".dropdown-toggle"
    ).innerHTML = `<i class="fas fa-user-circle me-1"></i> ${currentUser.name}`;
  }
});

// In dashboard.html, enhance the loadTrips function:
function loadTrips() {
  const trips = JSON.parse(localStorage.getItem("trips")) || [];
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) return;

  // Filter trips for current user
  const userTrips = trips.filter((trip) => trip.userId === currentUser.id);
  const container = document.getElementById("tripCardsContainer");
  const noTripsMessage = document.getElementById("noTripsMessage");

  if (userTrips.length > 0) {
    noTripsMessage.classList.add("d-none");
    container.innerHTML = "";

    userTrips.forEach((trip) => {
      // Calculate progress based on completion
      const progress = calculateTripProgress(trip);

      const tripCard = document.createElement("div");
      tripCard.className = "col-md-6 col-lg-4";
      tripCard.innerHTML = `
        <div class="card h-100 trip-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title mb-0">${trip.name}</h5>
              <span class="badge bg-${getTripStatusClass(trip.status)}">
                ${trip.status}
              </span>
            </div>
            <p class="card-text text-muted small mb-2">
              <i class="fas fa-map-marker-alt me-1"></i> ${trip.destination}
            </p>
            <p class="card-text text-muted small mb-3">
              <i class="far fa-calendar-alt me-1"></i> 
              ${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}
            </p>
            
            <!-- Enhanced trip summary -->
            <div class="trip-summary mb-3">
              ${
                trip.flights.length > 0
                  ? `<div class="d-flex align-items-center mb-1">
                  <i class="fas fa-plane me-2 text-primary"></i>
                  <small>${trip.flights.length} flight${
                      trip.flights.length !== 1 ? "s" : ""
                    }</small>
                </div>`
                  : ""
              }
              
              ${
                trip.hotels.length > 0
                  ? `<div class="d-flex align-items-center mb-1">
                  <i class="fas fa-hotel me-2 text-primary"></i>
                  <small>${trip.hotels.length} hotel${
                      trip.hotels.length !== 1 ? "s" : ""
                    }</small>
                </div>`
                  : ""
              }
              
              ${
                trip.days && trip.days.length > 0
                  ? `<div class="d-flex align-items-center mb-1">
                  <i class="fas fa-calendar-day me-2 text-primary"></i>
                  <small>${trip.days.length} day${
                      trip.days.length !== 1 ? "s" : ""
                    }</small>
                </div>`
                  : ""
              }
            </div>
            
            <div class="progress mb-3" style="height: 8px;">
              <div class="progress-bar" style="width: ${progress}%"></div>
            </div>
            <div class="d-flex justify-content-between">
              <a href="trip.html?id=${
                trip.id
              }" class="btn btn-sm btn-outline-primary">View Details</a>
              <small class="text-muted">${trip.days} days</small>
            </div>
          </div>
        </div>
      `;
      container.appendChild(tripCard);
    });
  } else {
    noTripsMessage.classList.remove("d-none");
  }
}

function toggleDropdown() {
  const dropdownMenu = document.getElementById("dropdownMenu");
  dropdownMenu.classList.toggle("show");
}

window.onclick = function (event) {
  if (!event.target.matches(".dropdown-toggle")) {
    const dropdowns = document.getElementsByClassName("dropdown-menu");
    for (let i = 0; i < dropdowns.length; i++) {
      const openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};

function getTripStatusClass(status) {
  const statusClasses = {
    Planning: "info",
    "In Progress": "warning",
    Completed: "success",
    Cancelled: "secondary",
  };
  return statusClasses[status] || "secondary";
}

// Helper function to calculate trip progress
function calculateTripProgress(trip) {
  if (trip.status === "Completed") return 100;
  if (trip.status === "Cancelled") return 0;

  // Calculate progress based on completed items
  let completedItems = 0;
  const totalItems = 6;

  if (trip.flights.length > 0) completedItems++;
  if (trip.hotels.length > 0) completedItems++;
  if (trip.days && trip.days.length > 0) completedItems++;
  if (trip.budget && trip.budget.estimatedTotal > 0) completedItems++;

  return Math.round((completedItems / totalItems) * 100);
}
