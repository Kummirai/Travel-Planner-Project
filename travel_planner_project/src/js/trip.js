document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem("currentUser")) {
    window.location.href = "auth.html?action=login";
    return;
  }

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser && currentUser.name) {
    document.querySelector(
      ".dropdown-toggle"
    ).innerHTML = `<i class="fas fa-user-circle"></i> ${currentUser.name}`;
  }

  document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem("currentUser");
    window.location.href = "auth.html?action=login";
  });

  // Save Trip button handler
  document.getElementById("saveTripBtn").addEventListener("click", saveTrip);

  // Budget handlers
  document
    .getElementById("addExpenseBtn")
    .addEventListener("click", showAddExpenseModal);

  initTabSystem();

  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get("id");
  const action = urlParams.get("action");

  if (action === "new") {
    initializeNewTrip();
  } else if (tripId) {
    loadTrip(tripId);
  } else {
    window.location.href = "dashboard.html";
  }

  initializeBudgetChart();
});

function initTabSystem() {
  const tabLinks = document.querySelectorAll(".tab-link");

  tabLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      document.querySelectorAll(".tab-link").forEach((tab) => {
        tab.classList.remove("active");
      });
      document.querySelectorAll(".tab-pane").forEach((pane) => {
        pane.classList.remove("active");
      });

      this.classList.add("active");
      const tabId = this.getAttribute("data-tab");
      document.getElementById(tabId).classList.add("active");

      localStorage.setItem("lastActiveTab", tabId);
    });
  });

  const lastActiveTab = localStorage.getItem("lastActiveTab");
  if (lastActiveTab) {
    const tabToActivate = document.querySelector(
      `[data-tab="${lastActiveTab}"]`
    );
    if (tabToActivate) {
      tabToActivate.click();
    }
  }
}

function showAddExpenseModal() {
  const modal = `
    <div class="modal-overlay" id="expenseModal">
      <div class="modal-content">
        <h3>Add New Expense</h3>
        <form id="expenseForm">
          <div class="form-group">
            <label>Category</label>
            <select class="form-control" id="expenseCategory">
              <option value="Flights">Flights</option>
              <option value="Hotels">Hotels</option>
              <option value="Food">Food</option>
              <option value="Activities">Activities</option>
              <option value="Transportation">Transportation</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label>Amount</label>
            <input type="number" class="form-control" id="expenseAmount" step="0.01" min="0">
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" class="form-control" id="expenseDate">
          </div>
          <div class="form-group">
            <label>Description (Optional)</label>
            <input type="text" class="form-control" id="expenseDescription">
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" id="cancelExpense">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Expense</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modal);

  document
    .getElementById("expenseForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      saveExpense();
    });

  document
    .getElementById("cancelExpense")
    .addEventListener("click", function () {
      document.getElementById("expenseModal").remove();
    });
}

function saveExpense() {
  const category = document.getElementById("expenseCategory").value;
  const amount = parseFloat(document.getElementById("expenseAmount").value);
  const date = document.getElementById("expenseDate").value;
  const description = document.getElementById("expenseDescription").value;

  if (!category || isNaN(amount) || !date) {
    alert("Please fill in all required fields");
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get("id");
  const trips = JSON.parse(localStorage.getItem("trips")) || [];
  const tripIndex = trips.findIndex((t) => t.id === tripId);

  if (tripIndex === -1) return;

  trips[tripIndex].budget.actual[category] += amount;
  trips[tripIndex].budget.actualTotal += amount;

  localStorage.setItem("trips", JSON.stringify(trips));

  updateBudgetDisplay(trips[tripIndex].budget);

  document.getElementById("expenseModal").remove();
}

function initializeNewTrip() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  // Set default dates
  document.getElementById("tripStartDate").valueAsDate = today;
  document.getElementById("tripEndDate").valueAsDate = tomorrow;
  document.getElementById("flightDepartureDate").valueAsDate = today;
  document.getElementById("flightReturnDate").valueAsDate = tomorrow;
  document.getElementById("hotelCheckIn").valueAsDate = today;
  document.getElementById("hotelCheckOut").valueAsDate = tomorrow;

  // Set default trip name
  document.getElementById("tripNameInput").value = "My New Trip";

  // Initialize empty budget structure
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  return {
    id: generateId(),
    name: "My New Trip",
    destination: "",
    startDate: today.toISOString().split("T")[0],
    endDate: tomorrow.toISOString().split("T")[0],
    description: "",
    status: "Planning",
    userId: currentUser.id,
    days: [],
    flights: [],
    hotels: [],
    budget: {
      estimatedTotal: 0,
      actualTotal: 0,
      estimated: {
        Flights: 0,
        Hotels: 0,
        Food: 0,
        Activities: 0,
        Transportation: 0,
        Other: 0,
      },
      actual: {
        Flights: 0,
        Hotels: 0,
        Food: 0,
        Activities: 0,
        Transportation: 0,
        Other: 0,
      },
    },
    progress: 0,
    days: getDaysBetweenDates(today, tomorrow),
  };
}

// New saveTrip function
function saveTrip() {
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get("action");
  const tripId = urlParams.get("id");

  const trips = JSON.parse(localStorage.getItem("trips")) || [];
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  let trip;

  if (action === "new") {
    // Create new trip
    trip = {
      id: generateId(),
      name: document.getElementById("tripNameInput").value,
      destination: document.getElementById("tripDestination").value,
      startDate: document.getElementById("tripStartDate").value,
      endDate: document.getElementById("tripEndDate").value,
      description: document.getElementById("tripDescription").value,
      status: document.getElementById("tripStatus").value,
      userId: currentUser.id,
      days: [],
      flights: [],
      hotels: [],
      budget: {
        estimatedTotal: 0,
        actualTotal: 0,
        estimated: {
          Flights: 0,
          Hotels: 0,
          Food: 0,
          Activities: 0,
          Transportation: 0,
          Other: 0,
        },
        actual: {
          Flights: 0,
          Hotels: 0,
          Food: 0,
          Activities: 0,
          Transportation: 0,
          Other: 0,
        },
      },
      progress: 0,
      days: getDaysBetweenDates(
        document.getElementById("tripStartDate").value,
        document.getElementById("tripEndDate").value
      ),
    };

    trips.push(trip);
  } else if (tripId) {
    // Update existing trip
    const tripIndex = trips.findIndex((t) => t.id === tripId);
    if (tripIndex !== -1) {
      trip = trips[tripIndex];
      trip.name = document.getElementById("tripNameInput").value;
      trip.destination = document.getElementById("tripDestination").value;
      trip.startDate = document.getElementById("tripStartDate").value;
      trip.endDate = document.getElementById("tripEndDate").value;
      trip.description = document.getElementById("tripDescription").value;
      trip.status = document.getElementById("tripStatus").value;
      trip.days = getDaysBetweenDates(trip.startDate, trip.endDate);
    }
  }

  // Save to localStorage
  localStorage.setItem("trips", JSON.stringify(trips));

  // Update UI
  document.getElementById("tripName").textContent = trip.name;
  document.getElementById("tripDates").textContent = `${formatDate(
    trip.startDate
  )} - ${formatDate(trip.endDate)}`;

  showAlert("Trip saved successfully!", "success");

  // If this was a new trip, update the URL to include the ID
  if (action === "new" && !tripId) {
    window.history.replaceState({}, "", `trip.html?id=${trip.id}`);
  }

  // Update budget display
  updateBudgetDisplay(trip.budget);
}

function loadTrip(tripId) {
  const trips = JSON.parse(localStorage.getItem("trips")) || [];
  const trip = trips.find((t) => t.id === tripId);

  if (!trip) {
    alert("Trip not found");
    window.location.href = "dashboard.html";
    return;
  }

  document.getElementById("tripName").textContent = trip.name;
  document.getElementById("tripNameInput").value = trip.name;
  document.getElementById("tripDestination").value = trip.destination;
  document.getElementById("tripStartDate").valueAsDate = new Date(
    trip.startDate
  );
  document.getElementById("tripEndDate").valueAsDate = new Date(trip.endDate);
  document.getElementById("tripDescription").value = trip.description || "";
  document.getElementById("tripStatus").value = trip.status || "Planning";

  const startDate = formatDate(trip.startDate);
  const endDate = formatDate(trip.endDate);
  document.getElementById(
    "tripDates"
  ).textContent = `${startDate} - ${endDate}`;

  if (!trip.budget) {
    trip.budget = {
      estimatedTotal: 0,
      actualTotal: 0,
      estimated: {
        Flights: 0,
        Hotels: 0,
        Food: 0,
        Activities: 0,
        Transportation: 0,
        Other: 0,
      },
      actual: {
        Flights: 0,
        Hotels: 0,
        Food: 0,
        Activities: 0,
        Transportation: 0,
        Other: 0,
      },
    };

    const tripIndex = trips.findIndex((t) => t.id === tripId);
    if (tripIndex !== -1) {
      trips[tripIndex] = trip;
      localStorage.setItem("trips", JSON.stringify(trips));
    }
  }

  if (trip.days && trip.days.length > 0) {
    document.getElementById("noDaysMessage").classList.add("d-none");
    loadItineraryDays(trip.days);
  } else {
    document.getElementById("noDaysMessage").classList.remove("d-none");
  }

  if (trip.flights && trip.flights.length > 0) {
    loadSavedFlights(trip.flights);
  } else {
    document.getElementById("savedFlightsContainer").innerHTML =
      '<p class="text-muted mb-0">No flights saved yet</p>';
  }

  if (trip.hotels && trip.hotels.length > 0) {
    loadSavedHotels(trip.hotels);
  } else {
    document.getElementById("savedHotelsContainer").innerHTML =
      '<p class="text-muted mb-0">No hotels saved yet</p>';
  }

  updateBudgetDisplay(trip.budget);

  initializeBudgetChart();
  setupBudgetHandlers();
}

function initializeBudgetChart() {
  const ctx = document.getElementById("budgetChart").getContext("2d");
  const budgetChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: [
        "Flights",
        "Hotels",
        "Food",
        "Activities",
        "Transportation",
        "Other",
      ],
      datasets: [
        {
          data: [0, 0, 0, 0, 0, 0],
          backgroundColor: [
            "#4FC3F7",
            "#FF7043",
            "#66BB6A",
            "#FFEE58",
            "#26A69A",
            "#BDBDBD",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "right",
        },
      },
    },
  });
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

function updateBudgetDisplay(budgetData) {
  // Update the budget summary
  document.getElementById("estimatedBudget").textContent = formatCurrency(
    budgetData.estimatedTotal
  );
  document.getElementById("actualExpenses").textContent = formatCurrency(
    budgetData.actualTotal
  );

  const remaining = budgetData.estimatedTotal - budgetData.actualTotal;
  document.getElementById("remainingBudget").textContent =
    formatCurrency(remaining);

  // Update progress bar
  const progressPercentage =
    budgetData.estimatedTotal > 0
      ? (budgetData.actualTotal / budgetData.estimatedTotal) * 100
      : 0;
  document.getElementById("budgetProgressBar").style.width = `${Math.min(
    progressPercentage,
    100
  )}%`;

  // Update the expense table
  const categories = [
    "Flights",
    "Hotels",
    "Food",
    "Activities",
    "Transportation",
    "Other",
  ];
  const tableBody = document.getElementById("expenseTableBody");
  tableBody.innerHTML = "";

  categories.forEach((category) => {
    const estimated = budgetData.estimated[category] || 0;
    const actual = budgetData.actual[category] || 0;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${category}</td>
      <td class="text-end">${formatCurrency(estimated)}</td>
      <td class="text-end">${formatCurrency(actual)}</td>
    `;
    tableBody.appendChild(row);
  });

  // Update the chart
  updateBudgetChart([
    budgetData.actual.Flights || 0,
    budgetData.actual.Hotels || 0,
    budgetData.actual.Food || 0,
    budgetData.actual.Activities || 0,
    budgetData.actual.Transportation || 0,
    budgetData.actual.Other || 0,
  ]);
}

function updateBudgetChart(data) {
  const chart = Chart.getChart("budgetChart");
  if (chart) {
    chart.data.datasets[0].data = data;
    chart.update();
  }
}

// Enhanced budget functions
function setupBudgetHandlers() {
  const expenseCategories = [
    "Flights",
    "Hotels",
    "Food",
    "Activities",
    "Transportation",
    "Other",
  ];

  expenseCategories.forEach((category) => {
    const input = document.getElementById(`estimated${category}`);
    if (input) {
      input.addEventListener("change", function () {
        updateTripBudget();
      });
    }
  });
}

function updateTripBudget() {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get("id");
  const trips = JSON.parse(localStorage.getItem("trips")) || [];
  const tripIndex = trips.findIndex((t) => t.id === tripId);

  if (tripIndex === -1) return;

  const expenseCategories = [
    "Flights",
    "Hotels",
    "Food",
    "Activities",
    "Transportation",
    "Other",
  ];

  let estimatedTotal = 0;

  expenseCategories.forEach((category) => {
    const input = document.getElementById(`estimated${category}`);
    if (input) {
      const value = parseFloat(input.value) || 0;
      trips[tripIndex].budget.estimated[category] = value;
      estimatedTotal += value;
    }
  });

  // Add flight and hotel costs
  trips[tripIndex].flights.forEach((flight) => {
    estimatedTotal += flight.price;
    trips[tripIndex].budget.estimated.Flights += flight.price;
  });

  trips[tripIndex].hotels.forEach((hotel) => {
    estimatedTotal += hotel.totalPrice;
    trips[tripIndex].budget.estimated.Hotels += hotel.totalPrice;
  });

  trips[tripIndex].budget.estimatedTotal = estimatedTotal;
  localStorage.setItem("trips", JSON.stringify(trips));

  updateBudgetDisplay(trips[tripIndex].budget);
}

let budgetChart = null; // Store chart instance globally

function initializeBudgetChart() {
  const ctx = document.getElementById("budgetChart");

  // Destroy previous chart if it exists
  if (budgetChart) {
    budgetChart.destroy();
  }

  budgetChart = new Chart(ctx, {
    // your chart configuration
  });
}

function showAddExpenseModal() {
  // Check if modal already exists
  if (document.getElementById("expenseModal")) {
    document.getElementById("expenseModal").style.display = "flex";
    return;
  }

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "expenseModal";
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Add New Expense</h3>
      <form id="expenseForm">
        <div class="form-group">
          <label>Category</label>
          <select class="form-control" id="expenseCategory" required>
            <option value="">Select a category</option>
            <option value="Flights">Flights</option>
            <option value="Hotels">Hotels</option>
            <option value="Food">Food</option>
            <option value="Activities">Activities</option>
            <option value="Transportation">Transportation</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label>Amount (ZAR)</label>
          <input type="number" class="form-control" id="expenseAmount" step="0.01" min="0" required>
        </div>
        <div class="form-group">
          <label>Date</label>
          <input type="date" class="form-control" id="expenseDate" required>
        </div>
        <div class="form-group">
          <label>Description (Optional)</label>
          <input type="text" class="form-control" id="expenseDescription">
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="cancelExpense">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Expense</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Set default date to today
  document.getElementById("expenseDate").valueAsDate = new Date();

  // Form submission handler
  document
    .getElementById("expenseForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      saveExpense();
    });

  // Cancel button handler
  document
    .getElementById("cancelExpense")
    .addEventListener("click", function () {
      modal.style.display = "none";
    });

  // Show the modal
  modal.style.display = "flex";
}

function saveExpense() {
  const category = document.getElementById("expenseCategory").value;
  const amount = parseFloat(document.getElementById("expenseAmount").value);
  const date = document.getElementById("expenseDate").value;
  const description = document.getElementById("expenseDescription").value;

  if (!category || isNaN(amount) || !date) {
    showAlert("Please fill in all required fields", "danger");
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get("id");
  const trips = JSON.parse(localStorage.getItem("trips")) || [];
  const tripIndex = trips.findIndex((t) => t.id === tripId);

  if (tripIndex === -1) {
    showAlert("Trip not found", "danger");
    return;
  }

  // Create expense object
  const expense = {
    id: generateId(),
    category,
    amount,
    date,
    description: description || "",
    createdAt: new Date().toISOString(),
  };

  // Initialize expenses array if it doesn't exist
  if (!trips[tripIndex].expenses) {
    trips[tripIndex].expenses = [];
  }

  // Add the expense
  trips[tripIndex].expenses.push(expense);

  // Update budget
  trips[tripIndex].budget.actual[category] += amount;
  trips[tripIndex].budget.actualTotal += amount;

  // Save to localStorage
  localStorage.setItem("trips", JSON.stringify(trips));

  // Update UI
  updateBudgetDisplay(trips[tripIndex].budget);

  // Close modal
  document.getElementById("expenseModal").style.display = "none";

  // Show success message
  showAlert("Expense added successfully!", "success");
}
