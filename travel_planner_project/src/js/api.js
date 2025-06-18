// Utility Functions
function formatDateForAPI(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

const EXCHANGE_RATES = {
  USD: 18.5,
  EUR: 20.1,
  GBP: 23.5,
  ZAR: 1.0,
};

// Convert any currency to ZAR
function convertToZAR(amount, fromCurrency) {
  const rate = EXCHANGE_RATES[fromCurrency.toUpperCase()];
  if (!rate) {
    console.warn(
      `Exchange rate not found for ${fromCurrency}, using 1:1 ratio`
    );
    return amount;
  }
  return amount * rate;
}

function formatCurrency(amount, currency = "ZAR") {
  // Always convert to ZAR first
  const zarAmount =
    currency.toUpperCase() === "ZAR" ? amount : convertToZAR(amount, currency);

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(zarAmount);
}

function generateId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

function showAlert(message, type = "info") {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.prepend(alertDiv);
  setTimeout(() => alertDiv.remove(), 5000);
}

// Airport code validation helper
function validateAirportCode(code) {
  // Common airport code mappings for your region
  const airportMappings = {
    // South Africa
    JHB: "JNB",
    JOHANNESBURG: "JNB",
    TAMBO: "JNB",
    ORTIA: "JNB",
    "O.R. TAMBO": "JNB",
    "CAPE TOWN": "CPT",
    CAPETOWN: "CPT",
    DURBAN: "DUR",
    "KING SHAKA": "DUR",
    "PORT ELIZABETH": "PLZ",
    PE: "PLZ",
    BLOEMFONTEIN: "BFN",
    BFN: "BFN",

    // Zimbabwe
    HARARE: "HRE",
    ZIMBABWE: "HRE",
    HRE: "HRE",

    // Africa
    LAGOS: "LOS",
    NIGERIA: "LOS",
    ABUJA: "ABV",
    NAIROBI: "NBO",
    KENYA: "NBO",
    ADDISABABA: "ADD",
    ADDIS: "ADD",
    ETHIOPIA: "ADD",
    CAIRO: "CAI",
    EGYPT: "CAI",
    KAMPALA: "EBB",
    UGANDA: "EBB",
    ACCRA: "ACC",
    GHANA: "ACC",
    MAPUTO: "MPM",
    MOZAMBIQUE: "MPM",

    // Europe
    LONDON: "LHR",
    HEATHROW: "LHR",
    GATWICK: "LGW",
    UK: "LHR",
    PARIS: "CDG",
    FRANCE: "CDG",
    AMSTERDAM: "AMS",
    NETHERLANDS: "AMS",
    BERLIN: "BER",
    GERMANY: "BER",
    MADRID: "MAD",
    SPAIN: "MAD",
    ROME: "FCO",
    ITALY: "FCO",

    // North America
    NEWYORK: "JFK",
    "NEW YORK": "JFK",
    JFK: "JFK",
    "LOS ANGELES": "LAX",
    LA: "LAX",
    LAX: "LAX",
    CHICAGO: "ORD",
    ATLANTA: "ATL",
    CANADA: "YYZ",
    TORONTO: "YYZ",
    MONTREAL: "YUL",

    // Asia
    DUBAI: "DXB",
    UAE: "DXB",
    DELHI: "DEL",
    INDIA: "DEL",
    MUMBAI: "BOM",
    BEIJING: "PEK",
    CHINA: "PEK",
    TOKYO: "HND",
    JAPAN: "HND",
    BANGKOK: "BKK",
    THAILAND: "BKK",
    SINGAPORE: "SIN",

    // Oceania
    SYDNEY: "SYD",
    AUSTRALIA: "SYD",
    MELBOURNE: "MEL",
    NEWZEALAND: "AKL",
    AUCKLAND: "AKL",

    // South America
    SAO: "GRU",
    SAOPAULO: "GRU",
    RIO: "GIG",
    BRAZIL: "GRU",
    BUENOSAIRES: "EZE",
    ARGENTINA: "EZE",
  };

  const upperCode = code.toUpperCase().trim();

  // Check if it's a mapped code
  if (airportMappings[upperCode]) {
    return airportMappings[upperCode];
  }

  // Return as-is if it's already a valid 3-letter IATA code
  if (/^[A-Z]{3}$/.test(upperCode)) {
    return upperCode;
  }

  // If it's not recognized, return null to trigger validation error
  return null;
}

// Amadeus API Configuration
const AMADEUS_CONFIG = {
  baseUrl: "https://test.api.amadeus.com/v2",
  authUrl: "https://test.api.amadeus.com/v1/security/oauth2/token",
  clientId: "xxyJOp6MsTG5aVE88cXJAPrzt30B28iK",
  clientSecret: "hMptf8cl16y64mV6",
};

let amadeusAccessToken = null;
let tokenExpiration = null;

// Amadeus Token Function
async function getAmadeusToken() {
  if (amadeusAccessToken && tokenExpiration && new Date() < tokenExpiration) {
    return amadeusAccessToken;
  }

  try {
    const response = await fetch(AMADEUS_CONFIG.authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: AMADEUS_CONFIG.clientId,
        client_secret: AMADEUS_CONFIG.clientSecret,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `Authentication failed: ${response.status} - ${errorData}`
      );
    }

    const data = await response.json();
    amadeusAccessToken = data.access_token;
    tokenExpiration = new Date(Date.now() + (data.expires_in - 300) * 1000);
    return amadeusAccessToken;
  } catch (error) {
    console.error("Error getting Amadeus token:", error);
    throw error;
  }
}

// Duration formatting helper
function formatDuration(duration) {
  const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  const hours = matches[1] ? `${matches[1]}h` : "";
  const minutes = matches[2] ? `${matches[2]}m` : "";
  return `${hours} ${minutes}`.trim();
}

// Enhanced error handling for API responses
async function handleApiResponse(response, url) {
  if (!response.ok) {
    let errorMessage = `API request failed with status ${response.status}`;

    try {
      const errorData = await response.json();
      if (errorData.errors && errorData.errors.length > 0) {
        const error = errorData.errors[0];
        errorMessage += `: ${error.title || error.detail || "Unknown error"}`;

        // Specific handling for common errors
        if (error.code === "INVALID_AIRPORT_CODE") {
          errorMessage = `Invalid airport code. Please use valid 3-letter IATA codes (e.g., JNB for Johannesburg, HRE for Harare)`;
        } else if (error.code === "INVALID_DATE") {
          errorMessage = `Invalid date format. Please use YYYY-MM-DD format`;
        }
      }
    } catch (parseError) {
      // If we can't parse the error response, use the original message
      console.error("Error parsing API error response:", parseError);
    }

    console.error(`API Error for ${url}:`, errorMessage);
    throw new Error(errorMessage);
  }

  return response.json();
}

// Fetch flights from Amadeus API with enhanced error handling
async function fetchFlightsFromAmadeus(params) {
  try {
    // Validate airport codes
    const validOrigin = validateAirportCode(params.origin);
    const validDestination = validateAirportCode(params.destination);

    if (!validOrigin) {
      throw new Error(
        `Invalid origin airport code: "${params.origin}". Please use valid 3-letter IATA codes (e.g., JNB for Johannesburg)`
      );
    }

    if (!validDestination) {
      throw new Error(
        `Invalid destination airport code: "${params.destination}". Please use valid 3-letter IATA codes (e.g., HRE for Harare)`
      );
    }

    const url = new URL(`${AMADEUS_CONFIG.baseUrl}/shopping/flight-offers`);
    url.searchParams.append("originLocationCode", validOrigin);
    url.searchParams.append("destinationLocationCode", validDestination);
    url.searchParams.append("departureDate", params.departureDate);
    url.searchParams.append("adults", params.passengers || 1);
    url.searchParams.append("max", 10);

    console.log(
      `Searching flights: ${validOrigin} → ${validDestination} on ${params.departureDate}`
    );

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${params.token}`,
      },
    });

    const data = await handleApiResponse(response, url.toString());

    if (!data.data || data.data.length === 0) {
      showAlert(
        `No flights found from ${validOrigin} to ${validDestination} on ${params.departureDate}`,
        "info"
      );
      return [];
    }

    console.log(`Found ${data.data.length} flight offers`);

    return data.data.map((offer) => {
      const flight = offer.itineraries[0].segments[0];
      const pricing = offer.price;

      // Convert price to ZAR
      const originalPrice = parseFloat(pricing.total);
      const zarPrice = convertToZAR(originalPrice, pricing.currency);

      return {
        id: offer.id,
        airline: flight.carrierCode,
        flightNumber: flight.number,
        departure: {
          airport: flight.departure.iataCode,
          time: flight.departure.at.split("T")[1].substring(0, 5),
          date: flight.departure.at.split("T")[0],
        },
        arrival: {
          airport: flight.arrival.iataCode,
          time: flight.arrival.at.split("T")[1].substring(0, 5),
          date: flight.arrival.at.split("T")[0],
        },
        duration: formatDuration(offer.itineraries[0].duration),
        price: zarPrice,
        originalPrice: originalPrice,
        originalCurrency: pricing.currency,
        currency: "ZAR",
        stops: offer.itineraries[0].segments.length - 1,
      };
    });
  } catch (error) {
    console.error("Amadeus API fetch error:", error);
    throw error;
  }
}

// Main flight search function
async function searchFlights(searchParams) {
  const formattedDepartureDate = formatDateForAPI(searchParams.departureDate);
  let formattedReturnDate = null;

  if (searchParams.returnDate) {
    formattedReturnDate = formatDateForAPI(searchParams.returnDate);
  }

  try {
    const submitBtn = document.querySelector(
      '#flightSearchForm button[type="submit"]'
    );
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin me-1"></i> Searching...';
    submitBtn.disabled = true;

    const token = await getAmadeusToken();

    const departureFlights = await fetchFlightsFromAmadeus({
      origin: searchParams.origin,
      destination: searchParams.destination,
      departureDate: formattedDepartureDate,
      passengers: searchParams.passengers,
      token,
    });

    let returnFlights = [];
    if (formattedReturnDate) {
      returnFlights = await fetchFlightsFromAmadeus({
        origin: searchParams.destination,
        destination: searchParams.origin,
        departureDate: formattedReturnDate,
        passengers: searchParams.passengers,
        token,
      });
    }

    const allFlights = [...departureFlights, ...returnFlights];
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;

    return allFlights;
  } catch (error) {
    console.error("Flight search error:", error);

    // Reset button state
    const submitBtn = document.querySelector(
      '#flightSearchForm button[type="submit"]'
    );
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="fas fa-search me-2"></i>Search Flights';
      submitBtn.disabled = false;
    }

    showAlert(`Error searching for flights: ${error.message}`, "danger");
    return [];
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const flightSearchForm = document.getElementById("flightSearchForm");
  if (flightSearchForm) {
    flightSearchForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const origin = document
        .getElementById("flightOrigin")
        .value.trim()
        .toUpperCase();
      const destination = document
        .getElementById("flightDestination")
        .value.trim()
        .toUpperCase();
      const departureDate = document.getElementById(
        "flightDepartureDate"
      ).value;
      const returnDate = document.getElementById("flightReturnDate").value;
      const passengers = document.getElementById("flightPassengers").value;

      // Basic validation
      if (!origin || !destination || !departureDate) {
        showAlert("Please fill in required fields", "danger");
        return;
      }

      // Validate airport codes before making API call
      const validOrigin = validateAirportCode(origin);
      const validDestination = validateAirportCode(destination);

      if (!validOrigin) {
        showAlert(
          `Invalid origin airport code: "${origin}". Please use valid 3-letter IATA codes (e.g., JNB for Johannesburg)`,
          "danger"
        );
        return;
      }

      if (!validDestination) {
        showAlert(
          `Invalid destination airport code: "${destination}". Please use valid 3-letter IATA codes (e.g., HRE for Harare)`,
          "danger"
        );
        return;
      }

      try {
        const flights = await searchFlights({
          origin,
          destination,
          departureDate,
          returnDate,
          passengers,
        });

        displayFlightResults(flights);
      } catch (error) {
        console.error("Search error:", error);
        showAlert(`Error searching for flights: ${error.message}`, "danger");
      }
    });
  }
});

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

// Hotel search form handler
document.addEventListener("DOMContentLoaded", function () {
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

  if (flights.length === 0) {
    resultsList.innerHTML =
      '<div class="text-center py-4"><p class="text-muted">No flights found. Please try different dates or destinations.</p></div>';
    resultsContainer.style.display = "block";
    return;
  }

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
                    <h5 class="mb-1">${formatCurrency(
                      flight.price,
                      flight.currency
                    )}</h5>
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
                      flight.price,
                      flight.currency
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
