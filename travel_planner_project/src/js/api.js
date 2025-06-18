// Mock flight search
function searchFlights(searchParams) {
  // In a real app, this would call Skyscanner/Amadeus API
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockFlights = [
        {
          id: generateId(),
          airline: "Delta Airlines",
          flightNumber: "DL123",
          departure: {
            airport: "JFK",
            time: "08:00",
            date: searchParams.departureDate,
          },
          arrival: {
            airport: "LAX",
            time: "11:00",
            date: searchParams.departureDate,
          },
          duration: "5h 0m",
          price: 249.99,
          stops: 0,
        },
        {
          id: generateId(),
          airline: "American Airlines",
          flightNumber: "AA456",
          departure: {
            airport: "JFK",
            time: "12:30",
            date: searchParams.departureDate,
          },
          arrival: {
            airport: "LAX",
            time: "16:45",
            date: searchParams.departureDate,
          },
          duration: "6h 15m",
          price: 199.99,
          stops: 1,
        },
        {
          id: generateId(),
          airline: "United Airlines",
          flightNumber: "UA789",
          departure: {
            airport: "JFK",
            time: "18:00",
            date: searchParams.departureDate,
          },
          arrival: {
            airport: "LAX",
            time: "21:15",
            date: searchParams.departureDate,
          },
          duration: "5h 15m",
          price: 229.99,
          stops: 0,
        },
      ];

      if (searchParams.returnDate) {
        mockFlights.push(
          {
            id: generateId(),
            airline: "Delta Airlines",
            flightNumber: "DL124",
            departure: {
              airport: "LAX",
              time: "12:00",
              date: searchParams.returnDate,
            },
            arrival: {
              airport: "JFK",
              time: "20:00",
              date: searchParams.returnDate,
            },
            duration: "5h 0m",
            price: 249.99,
            stops: 0,
          },
          {
            id: generateId(),
            airline: "American Airlines",
            flightNumber: "AA457",
            departure: {
              airport: "LAX",
              time: "08:00",
              date: searchParams.returnDate,
            },
            arrival: {
              airport: "JFK",
              time: "16:15",
              date: searchParams.returnDate,
            },
            duration: "6h 15m",
            price: 199.99,
            stops: 1,
          }
        );
      }

      resolve(mockFlights);
    }, 1000);
  });
}

// Mock hotel search
function searchHotels(searchParams) {
  // In a real app, this would call a hotel API
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockHotels = [
        {
          id: generateId(),
          name: "Grand Plaza Hotel",
          location: searchParams.location,
          checkIn: searchParams.checkIn,
          checkOut: searchParams.checkOut,
          pricePerNight: 129.99,
          rating: 4.5,
          amenities: ["Free WiFi", "Pool", "Fitness Center"],
          image: "https://via.placeholder.com/300x200?text=Grand+Plaza+Hotel",
        },
        {
          id: generateId(),
          name: "Seaside Resort",
          location: searchParams.location,
          checkIn: searchParams.checkIn,
          checkOut: searchParams.checkOut,
          pricePerNight: 199.99,
          rating: 4.8,
          amenities: ["Free WiFi", "Beach Access", "Spa", "Restaurant"],
          image: "https://via.placeholder.com/300x200?text=Seaside+Resort",
        },
        {
          id: generateId(),
          name: "Budget Inn",
          location: searchParams.location,
          checkIn: searchParams.checkIn,
          checkOut: searchParams.checkOut,
          pricePerNight: 59.99,
          rating: 3.2,
          amenities: ["Free WiFi"],
          image: "https://via.placeholder.com/300x200?text=Budget+Inn",
        },
      ];

      resolve(mockHotels);
    }, 1000);
  });
}

// Flight search form handler
document.addEventListener("DOMContentLoaded", function () {
  const flightSearchForm = document.getElementById("flightSearchForm");
  if (flightSearchForm) {
    flightSearchForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const origin = document.getElementById("flightOrigin").value;
      const destination = document.getElementById("flightDestination").value;
      const departureDate = document.getElementById(
        "flightDepartureDate"
      ).value;
      const returnDate = document.getElementById("flightReturnDate").value;
      const passengers = document.getElementById("flightPassengers").value;

      if (!origin || !destination || !departureDate) {
        showAlert("Please fill in required fields", "danger");
        return;
      }

      // Show loading state
      const submitBtn = flightSearchForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin me-1"></i> Searching...';
      submitBtn.disabled = true;

      // Perform search
      searchFlights({
        origin,
        destination,
        departureDate,
        returnDate,
        passengers,
      }).then((flights) => {
        // Restore button
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;

        // Display results
        displayFlightResults(flights);
      });
    });
  }

  // Hotel search form handler
  const hotelSearchForm = document.getElementById("hotelSearchForm");
  if (hotelSearchForm) {
    hotelSearchForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const location = document.getElementById("hotelLocation").value;
      const checkIn = document.getElementById("hotelCheckIn").value;
      const checkOut = document.getElementById("hotelCheckOut").value;
      const guests = document.getElementById("hotelGuests").value;
      const rooms = document.getElementById("hotelRooms").value;

      if (!location || !checkIn || !checkOut) {
        showAlert("Please fill in required fields", "danger");
        return;
      }

      // Show loading state
      const submitBtn = hotelSearchForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin me-1"></i> Searching...';
      submitBtn.disabled = true;

      // Perform search
      searchHotels({
        location,
        checkIn,
        checkOut,
        guests,
        rooms,
      }).then((hotels) => {
        // Restore button
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;

        // Display results
        displayHotelResults(hotels);
      });
    });
  }
});

function displayFlightResults(flights) {
  const resultsContainer = document.getElementById("flightResultsContainer");
  const resultsList = document.getElementById("flightResultsList");

  // Clear previous results
  resultsList.innerHTML = "";

  // Add new results
  flights.forEach((flight) => {
    const flightElement = document.createElement("a");
    flightElement.href = "#";
    flightElement.className = "list-group-item list-group-item-action";
    flightElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">${flight.airline} - ${
      flight.flightNumber
    }</h6>
                    <small class="text-muted">
                        ${flight.departure.airport} → ${
      flight.arrival.airport
    } • 
                        ${flight.duration} • ${
      flight.stops === 0
        ? "Nonstop"
        : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`
    }
                    </small>
                </div>
                <div class="text-end">
                    <h5 class="mb-1">${formatCurrency(flight.price)}</h5>
                    <button class="btn btn-sm btn-outline-primary save-flight-btn" data-flight-id="${
                      flight.id
                    }">
                        <i class="far fa-save me-1"></i> Save
                    </button>
                </div>
            </div>
            <div class="mt-2">
                <small>
                    <strong>Depart:</strong> ${formatDate(
                      flight.departure.date
                    )} at ${flight.departure.time} • 
                    <strong>Arrive:</strong> ${formatDate(
                      flight.arrival.date
                    )} at ${flight.arrival.time}
                </small>
            </div>
        `;

    resultsList.appendChild(flightElement);
  });

  // Show results container
  resultsContainer.style.display = "block";

  // Add event listeners to save buttons
  document.querySelectorAll(".save-flight-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const flightId = this.getAttribute("data-flight-id");
      const flight = flights.find((f) => f.id === flightId);

      if (flight) {
        saveFlightToTrip(flight);
      }
    });
  });
}

function displayHotelResults(hotels) {
  const resultsContainer = document.getElementById("hotelResultsContainer");
  const resultsList = document.getElementById("hotelResultsList");

  // Clear previous results
  resultsList.innerHTML = "";

  // Add new results
  hotels.forEach((hotel) => {
    const hotelElement = document.createElement("div");
    hotelElement.className = "col-md-6 col-lg-4";
    hotelElement.innerHTML = `
            <div class="card h-100">
                <img src="${hotel.image}" class="card-img-top" alt="${
      hotel.name
    }">
                <div class="card-body">
                    <h5 class="card-title">${hotel.name}</h5>
                    <div class="d-flex align-items-center mb-2">
                        <div class="text-warning me-2">
                            ${"★".repeat(Math.floor(hotel.rating))}${"☆".repeat(
      5 - Math.floor(hotel.rating)
    )}
                        </div>
                        <small class="text-muted">${hotel.rating}</small>
                    </div>
                    <p class="card-text">
                        <small class="text-muted">
                            <i class="fas fa-map-marker-alt me-1"></i> ${
                              hotel.location
                            }
                        </small>
                    </p>
                    <ul class="list-unstyled small mb-3">
                        ${hotel.amenities
                          .map(
                            (a) =>
                              `<li><i class="fas fa-check text-success me-1"></i> ${a}</li>`
                          )
                          .join("")}
                    </ul>
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">${formatCurrency(
                          hotel.pricePerNight
                        )}<small class="text-muted">/night</small></h5>
                        <button class="btn btn-sm btn-primary save-hotel-btn" data-hotel-id="${
                          hotel.id
                        }">
                            <i class="far fa-save me-1"></i> Save
                        </button>
                    </div>
                </div>
            </div>
        `;

    resultsList.appendChild(hotelElement);
  });

  // Show results container
  resultsContainer.style.display = "block";

  // Add event listeners to save buttons
  document.querySelectorAll(".save-hotel-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const hotelId = this.getAttribute("data-hotel-id");
      const hotel = hotels.find((h) => h.id === hotelId);

      if (hotel) {
        saveHotelToTrip(hotel);
      }
    });
  });
}

function saveFlightToTrip(flight) {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get("id");

  if (!tripId) {
    showAlert("No trip selected", "danger");
    return;
  }

  // Get trips from localStorage
  const trips = JSON.parse(localStorage.getItem("trips")) || [];
  const tripIndex = trips.findIndex((t) => t.id === tripId);

  if (tripIndex === -1) {
    showAlert("Trip not found", "danger");
    return;
  }

  // Add flight to trip
  if (!trips[tripIndex].flights) {
    trips[tripIndex].flights = [];
  }

  // Check if this flight already exists
  const existingIndex = trips[tripIndex].flights.findIndex(
    (f) => f.id === flight.id
  );

  if (existingIndex >= 0) {
    // Update existing flight
    trips[tripIndex].flights[existingIndex] = flight;
  } else {
    // Add new flight
    trips[tripIndex].flights.push(flight);
  }

  // Update budget
  if (!trips[tripIndex].budget) {
    trips[tripIndex].budget = {
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
      estimatedTotal: 0,
      actualTotal: 0,
    };
  }

  trips[tripIndex].budget.estimated.Flights += flight.price;
  trips[tripIndex].budget.estimatedTotal += flight.price;

  // Save trips
  localStorage.setItem("trips", JSON.stringify(trips));

  // Update UI
  loadSavedFlights(trips[tripIndex].flights);
  updateBudgetDisplay(trips[tripIndex].budget);

  showAlert("Flight saved to trip!", "success");
}

function saveHotelToTrip(hotel) {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get("id");

  if (!tripId) {
    showAlert("No trip selected", "danger");
    return;
  }

  // Get trips from localStorage
  const trips = JSON.parse(localStorage.getItem("trips")) || [];
  const tripIndex = trips.findIndex((t) => t.id === tripId);

  if (tripIndex === -1) {
    showAlert("Trip not found", "danger");
    return;
  }

  // Add hotel to trip
  if (!trips[tripIndex].hotels) {
    trips[tripIndex].hotels = [];
  }

  // Check if this hotel already exists
  const existingIndex = trips[tripIndex].hotels.findIndex(
    (h) => h.id === hotel.id
  );

  if (existingIndex >= 0) {
    // Update existing hotel
    trips[tripIndex].hotels[existingIndex] = hotel;
  } else {
    // Add new hotel
    trips[tripIndex].hotels.push(hotel);
  }

  // Calculate total price for the stay
  const checkIn = new Date(hotel.checkIn);
  const checkOut = new Date(hotel.checkOut);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  const totalPrice = hotel.pricePerNight * nights;

  // Update budget
  if (!trips[tripIndex].budget) {
    trips[tripIndex].budget = {
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
      estimatedTotal: 0,
      actualTotal: 0,
    };
  }

  trips[tripIndex].budget.estimated.Hotels += totalPrice;
  trips[tripIndex].budget.estimatedTotal += totalPrice;

  // Save trips
  localStorage.setItem("trips", JSON.stringify(trips));

  // Update UI
  loadSavedHotels(trips[tripIndex].hotels);
  updateBudgetDisplay(trips[tripIndex].budget);

  showAlert("Hotel saved to trip!", "success");
}

function loadSavedFlights(flights) {
  const container = document.getElementById("savedFlightsContainer");

  if (!flights || flights.length === 0) {
    container.innerHTML = '<p class="text-muted mb-0">No flights saved yet</p>';
    return;
  }

  container.innerHTML = "";

  flights.forEach((flight) => {
    const flightElement = document.createElement("div");
    flightElement.className = "mb-2";
    flightElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <small class="fw-bold">${flight.airline}</small>
                    <small class="d-block text-muted">${
                      flight.departure.airport
                    } → ${flight.arrival.airport}</small>
                </div>
                <small class="text-end">
                    <span class="d-block fw-bold">${formatCurrency(
                      flight.price
                    )}</span>
                    <span class="text-muted">${flight.departure.time}</span>
                </small>
            </div>
        `;
    container.appendChild(flightElement);
  });
}

function loadSavedHotels(hotels) {
  const container = document.getElementById("savedHotelsContainer");

  if (!hotels || hotels.length === 0) {
    container.innerHTML = '<p class="text-muted mb-0">No hotels saved yet</p>';
    return;
  }

  container.innerHTML = "";

  hotels.forEach((hotel) => {
    const hotelElement = document.createElement("div");
    hotelElement.className = "mb-2";
    hotelElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <small class="fw-bold">${hotel.name}</small>
                    <small class="d-block text-muted">
                        ${formatDate(hotel.checkIn)} - ${formatDate(
      hotel.checkOut
    )}
                    </small>
                </div>
                <small class="text-end">
                    <span class="d-block fw-bold">${formatCurrency(
                      hotel.pricePerNight
                    )}</span>
                    <span class="text-muted">/night</span>
                </small>
            </div>
        `;
    container.appendChild(hotelElement);
  });
}
