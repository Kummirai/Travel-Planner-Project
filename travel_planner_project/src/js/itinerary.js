document.addEventListener("DOMContentLoaded", function () {
  const addDayBtn = document.getElementById("addDayBtn");
  if (addDayBtn) {
    addDayBtn.addEventListener("click", function () {
      const addDayModal = new bootstrap.Modal(
        document.getElementById("addDayModal")
      );
      addDayModal.show();

      const tripStartDate = document.getElementById("tripStartDate").value;
      document.getElementById("dayDate").value =
        tripStartDate || new Date().toISOString().split("T")[0];
    });
  }

  const saveDayBtn = document.getElementById("saveDayBtn");
  if (saveDayBtn) {
    saveDayBtn.addEventListener("click", function () {
      const dayDate = document.getElementById("dayDate").value;
      const dayTitle =
        document.getElementById("dayTitle").value ||
        `Day ${document.querySelectorAll(".accordion-item").length + 1}`;

      if (!dayDate) {
        showAlert("Please select a date", "danger");
        return;
      }

      addDayToItinerary({
        id: generateId(),
        date: dayDate,
        title: dayTitle,
        activities: [],
      });

      bootstrap.Modal.getInstance(
        document.getElementById("addDayModal")
      ).hide();
      document.getElementById("addDayForm").reset();
    });
  }

  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("add-activity-btn")) {
      const dayId = e.target.closest(".accordion-item").id.replace("day-", "");
      document.getElementById("addActivityForm").dataset.dayId = dayId;

      const addActivityModal = new bootstrap.Modal(
        document.getElementById("addActivityModal")
      );
      addActivityModal.show();
    }
  });

  const saveActivityBtn = document.getElementById("saveActivityBtn");
  if (saveActivityBtn) {
    saveActivityBtn.addEventListener("click", function () {
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

      const activity = {
        id: generateId(),
        name: activityName,
        time: activityTime,
        duration: activityDuration,
        location: activityLocation,
        cost: activityCost,
        notes: activityNotes,
      };

      addActivityToDay(dayId, activity);

      bootstrap.Modal.getInstance(
        document.getElementById("addActivityModal")
      ).hide();
      document.getElementById("addActivityForm").reset();
    });
  }
});

function addDayToItinerary(dayData) {
  const accordion = document.getElementById("itineraryAccordion");
  const noDaysMessage = document.getElementById("noDaysMessage");

  if (!noDaysMessage.classList.contains("d-none")) {
    noDaysMessage.classList.add("d-none");
  }

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

  if (dayData.activities && dayData.activities.length > 0) {
    dayData.activities.forEach((activity) => {
      addActivityToDay(dayData.id, activity);
    });
  }
}

function addActivityToDay(dayId, activity) {
  const activitiesContainer = document.getElementById(`activities-${dayId}`);
  const noActivitiesMessage = document.getElementById(`noActivities-${dayId}`);

  if (
    noActivitiesMessage &&
    !noActivitiesMessage.classList.contains("d-none")
  ) {
    noActivitiesMessage.classList.add("d-none");
  }

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
