document.addEventListener("DOMContentLoaded", function () {
  // Initialize the add day modal
  const addDayModal = document.createElement("div");
  addDayModal.className = "modal-overlay";
  addDayModal.id = "addDayModal";
  addDayModal.style.display = "none";
  addDayModal.innerHTML = `
    <div class="modal-content">
      <h3>Add New Day</h3>
      <form id="addDayForm">
        <div class="form-group">
          <label for="dayDate">Date</label>
          <input type="date" class="form-control" id="dayDate" required>
        </div>
        <div class="form-group">
          <label for="dayTitle">Day Title (optional)</label>
          <input type="text" class="form-control" id="dayTitle" placeholder="e.g., Arrival Day">
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="cancelDayBtn">Cancel</button>
          <button type="submit" class="btn btn-primary">Add Day</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(addDayModal);

  // Add Day button click handler
  const addDayBtn = document.getElementById("addDayBtn");
  if (addDayBtn) {
    addDayBtn.addEventListener("click", function () {
      document.getElementById("addDayModal").style.display = "flex";

      // Set default date to trip start date or today
      const tripStartDate = document.getElementById("tripStartDate").value;
      document.getElementById("dayDate").value =
        tripStartDate || new Date().toISOString().split("T")[0];
    });
  }

  // Cancel button handler
  document
    .getElementById("cancelDayBtn")
    .addEventListener("click", function () {
      document.getElementById("addDayModal").style.display = "none";
      document.getElementById("addDayForm").reset();
    });

  // Save Day form handler
  document
    .getElementById("addDayForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const dayDate = document.getElementById("dayDate").value;
      const dayTitle =
        document.getElementById("dayTitle").value ||
        `Day ${document.querySelectorAll(".accordion-item").length + 1}`;

      if (!dayDate) {
        showAlert("Please select a date", "danger");
        return;
      }

      // Create new day object
      const newDay = {
        id: generateId(),
        date: dayDate,
        title: dayTitle,
        activities: [],
      };

      // Add to itinerary
      addDayToItinerary(newDay);

      // Save to trip data
      saveDayToTrip(newDay);

      // Close modal and reset form
      document.getElementById("addDayModal").style.display = "none";
      document.getElementById("addDayForm").reset();
    });

  // Add similar modal for activities
  const addActivityModal = document.createElement("div");
  addActivityModal.className = "modal-overlay";
  addActivityModal.id = "addActivityModal";
  addActivityModal.style.display = "none";
  addActivityModal.innerHTML = `
    <div class="modal-content">
      <h3>Add Activity</h3>
      <form id="addActivityForm">
        <div class="form-group">
          <label for="activityName">Activity Name</label>
          <input type="text" class="form-control" id="activityName" required>
        </div>
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label for="activityTime">Time</label>
              <input type="time" class="form-control" id="activityTime" required>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label for="activityDuration">Duration (hours)</label>
              <input type="number" class="form-control" id="activityDuration" min="0.5" max="24" step="0.5" value="1">
            </div>
          </div>
        </div>
        <div class="form-group">
          <label for="activityLocation">Location</label>
          <input type="text" class="form-control" id="activityLocation">
        </div>
        <div class="form-group">
          <label for="activityCost">Estimated Cost (ZAR)</label>
          <input type="number" class="form-control" id="activityCost" min="0" step="0.01" value="0">
        </div>
        <div class="form-group">
          <label for="activityNotes">Notes</label>
          <textarea class="form-control" id="activityNotes" rows="2"></textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="cancelActivityBtn">Cancel</button>
          <button type="submit" class="btn btn-primary">Add Activity</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(addActivityModal);

  // Activity button handlers
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("add-activity-btn")) {
      const dayId = e.target.closest(".accordion-item").id.replace("day-", "");
      document.getElementById("addActivityForm").dataset.dayId = dayId;
      document.getElementById("addActivityModal").style.display = "flex";
    }
  });

  document
    .getElementById("cancelActivityBtn")
    .addEventListener("click", function () {
      document.getElementById("addActivityModal").style.display = "none";
      document.getElementById("addActivityForm").reset();
    });

  document
    .getElementById("addActivityForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const dayId = document.getElementById("addActivityForm").dataset.dayId;
      const activityName = document.getElementById("activityName").value;
      const activityTime = document.getElementById("activityTime").value;
      const activityDuration =
        document.getElementById("activityDuration").value;
      const activityLocation =
        document.getElementById("activityLocation").value;
      const activityCost =
        parseFloat(document.getElementById("activityCost").value) || 0;
      const activityNotes = document.getElementById("activityNotes").value;

      if (!activityName || !activityTime) {
        showAlert("Please fill in required fields", "danger");
        return;
      }

      // Create activity object
      const activity = {
        id: generateId(),
        name: activityName,
        time: activityTime,
        duration: activityDuration,
        location: activityLocation,
        cost: activityCost,
        notes: activityNotes,
      };

      // Add activity to the day
      addActivityToDay(dayId, activity);

      // Save to trip data
      saveActivityToDay(dayId, activity);

      // Close modal and reset form
      document.getElementById("addActivityModal").style.display = "none";
      document.getElementById("addActivityForm").reset();
    });
});

// Enhance the saveDayToTrip function
function saveDayToTrip(dayData) {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get("id");
  const trips = JSON.parse(localStorage.getItem("trips")) || [];
  const tripIndex = trips.findIndex((t) => t.id === tripId);

  if (tripIndex === -1) return;

  // Initialize days array if it doesn't exist
  if (!trips[tripIndex].days) {
    trips[tripIndex].days = [];
  }

  // Check if day already exists
  const dayIndex = trips[tripIndex].days.findIndex((d) => d.id === dayData.id);

  if (dayIndex === -1) {
    // Add new day
    trips[tripIndex].days.push(dayData);

    // Update trip days count
    trips[tripIndex].days = getDaysBetweenDates(
      trips[tripIndex].startDate,
      trips[tripIndex].endDate
    );
  } else {
    // Update existing day
    trips[tripIndex].days[dayIndex] = dayData;
  }

  // Save back to localStorage
  localStorage.setItem("trips", JSON.stringify(trips));
}

// Enhance the saveActivityToDay function
function saveActivityToDay(dayId, activity) {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get("id");
  const trips = JSON.parse(localStorage.getItem("trips")) || [];
  const tripIndex = trips.findIndex((t) => t.id === tripId);

  if (tripIndex === -1) return;

  // Find the day
  const dayIndex = trips[tripIndex].days.findIndex((d) => d.id === dayId);
  if (dayIndex === -1) return;

  // Initialize activities array if it doesn't exist
  if (!trips[tripIndex].days[dayIndex].activities) {
    trips[tripIndex].days[dayIndex].activities = [];
  }

  // Check if activity already exists
  const activityIndex = trips[tripIndex].days[dayIndex].activities.findIndex(
    (a) => a.id === activity.id
  );

  if (activityIndex === -1) {
    // Add new activity
    trips[tripIndex].days[dayIndex].activities.push(activity);
  } else {
    // Update existing activity
    trips[tripIndex].days[dayIndex].activities[activityIndex] = activity;
  }

  // Update budget
  trips[tripIndex].budget.estimated.Activities += activity.cost;
  trips[tripIndex].budget.estimatedTotal += activity.cost;

  // Save back to localStorage
  localStorage.setItem("trips", JSON.stringify(trips));

  // Update budget display
  updateBudgetDisplay(trips[tripIndex].budget);
}

function saveActivityToDay(dayId, activity) {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get("id");
  const trips = JSON.parse(localStorage.getItem("trips")) || [];
  const tripIndex = trips.findIndex((t) => t.id === tripId);

  if (tripIndex === -1) return;

  // Find the day
  const dayIndex = trips[tripIndex].days.findIndex((d) => d.id === dayId);
  if (dayIndex === -1) return;

  // Add the activity
  trips[tripIndex].days[dayIndex].activities.push(activity);

  // Update budget
  trips[tripIndex].budget.estimated.Activities += activity.cost;
  trips[tripIndex].budget.estimatedTotal += activity.cost;

  // Save back to localStorage
  localStorage.setItem("trips", JSON.stringify(trips));

  // Update budget display
  updateBudgetDisplay(trips[tripIndex].budget);
}

function addDayToItinerary(dayData) {
  const accordion = document.getElementById("itineraryAccordion");
  const noDaysMessage = document.getElementById("noDaysMessage");

  // Hide "no days" message if it's visible
  if (!noDaysMessage.classList.contains("d-none")) {
    noDaysMessage.classList.add("d-none");
  }

  // Create accordion item for the day
  const accordionItem = document.createElement("div");
  accordionItem.className = "accordion-item";
  accordionItem.id = `day-${dayData.id}`;

  accordionItem.innerHTML = `
        <h2 class="accordion-header" id="heading-${dayData.id}">
            <button class="accordion-button" type="button" data-bs-toggle="collapse" 
                data-bs-target="#collapse-${dayData.id}" aria-expanded="true" 
                aria-controls="collapse-${dayData.id}">
                ${dayData.title} - ${formatDate(dayData.date)}
            </button>
        </h2>
        <div id="collapse-${
          dayData.id
        }" class="accordion-collapse collapse show" 
            aria-labelledby="heading-${
              dayData.id
            }" data-bs-parent="#itineraryAccordion">
            <div class="accordion-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="mb-0">Activities</h6>
                    <button class="btn btn-sm btn-outline-primary add-activity-btn">
                        <i class="fas fa-plus me-1"></i> Add Activity
                    </button>
                </div>
                <div class="list-group" id="activities-${dayData.id}">
                    <!-- Activities will be added here -->
                    <div class="text-center py-3 text-muted" id="noActivities-${
                      dayData.id
                    }">
                        No activities added yet
                    </div>
                </div>
            </div>
        </div>
    `;

  accordion.appendChild(accordionItem);

  // Add existing activities if they exist
  if (dayData.activities && dayData.activities.length > 0) {
    dayData.activities.forEach((activity) => {
      addActivityToDay(dayData.id, activity);
    });
  }
}

function addActivityToDay(dayId, activity) {
  const activitiesContainer = document.getElementById(`activities-${dayId}`);
  const noActivitiesMessage = document.getElementById(`noActivities-${dayId}`);

  // Hide "no activities" message if it's visible
  if (
    noActivitiesMessage &&
    !noActivitiesMessage.classList.contains("d-none")
  ) {
    noActivitiesMessage.classList.add("d-none");
  }

  // Create activity element
  const activityElement = document.createElement("div");
  activityElement.className = "list-group-item";
  activityElement.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div class="me-3">
                <div class="fw-bold">${activity.name}</div>
                <small class="text-muted">${activity.time} • ${
    activity.duration
  } hrs</small>
            </div>
            <div>
                <small class="text-muted me-2">${formatCurrency(
                  activity.cost
                )}</small>
                <button class="btn btn-sm btn-outline-danger">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        ${
          activity.location
            ? `<div class="mt-2"><i class="fas fa-map-marker-alt me-1"></i> ${activity.location}</div>`
            : ""
        }
        ${
          activity.notes
            ? `<div class="mt-2"><i class="fas fa-sticky-note me-1"></i> ${activity.notes}</div>`
            : ""
        }
    `;

  activitiesContainer.appendChild(activityElement);
}

function loadItineraryDays(days) {
  days.forEach((day) => {
    addDayToItinerary(day);
  });
}
