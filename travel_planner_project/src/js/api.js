// Utility Functions
function formatDateForAPI(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

function initializeTripsData() {
  if (!localStorage.getItem("trips")) {
    const initialData = [
      {
        id: "default-trip",
        name: "My Trip",
        flights: [],
        hotels: [],
        budget: {
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
        },
      },
    ];
    localStorage.setItem("trips", JSON.stringify(initialData));
  }
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

function validateAirportCode(code) {
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

  if (airportMappings[upperCode]) {
    return airportMappings[upperCode];
  }

  if (/^[A-Z]{3}$/.test(upperCode)) {
    return upperCode;
  }

  return null;
}

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
    console.log(data);
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

let tripsData = [];

function initializeTripsData() {
  if (tripsData.length === 0) {
    tripsData = [
      {
        id: "sample-trip-1",
        name: "Sample Trip",
        flights: [],
        hotels: [],
        budget: {
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
        },
      },
    ];
  }
}

function saveFlightToTrip(flight) {
  initializeTripsData();

  const trips = JSON.parse(localStorage.getItem("trips"));
  const tripId =
    new URLSearchParams(window.location.search).get("id") || trips[0].id;

  const tripIndex = trips.findIndex((t) => t.id === tripId);
  if (tripIndex === -1) {
    showAlert("Trip not found", "danger");
    return;
  }

  if (!trips[tripIndex].flights) {
    trips[tripIndex].flights = [];
  }

  const existingIndex = trips[tripIndex].flights.findIndex(
    (f) => f.id === flight.id
  );

  if (existingIndex >= 0) {
    const oldPrice = trips[tripIndex].flights[existingIndex].price;
    trips[tripIndex].flights[existingIndex] = flight;

    trips[tripIndex].budget.estimated.Flights += flight.price - oldPrice;
    trips[tripIndex].budget.estimatedTotal += flight.price - oldPrice;
  } else {
    trips[tripIndex].flights.push(flight);

    trips[tripIndex].budget.estimated.Flights += flight.price;
    trips[tripIndex].budget.estimatedTotal += flight.price;
  }

  localStorage.setItem("trips", JSON.stringify(trips));

  loadSavedFlights(trips[tripIndex].flights);
  updateBudgetDisplay(trips[tripIndex].budget);
  showAlert(
    existingIndex >= 0 ? "Flight updated!" : "Flight saved!",
    "success"
  );

  updateTripProgress(tripId);
}

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

function displayFlightResults(flights) {
  const resultsContainer = document.getElementById("flightResultsContainer");
  const resultsList = document.getElementById("flightResultsList");

  const savedTrips = JSON.parse(localStorage.getItem("trips")) || [];
  const allSavedFlights = savedTrips.flatMap((trip) => trip.flights || []);

  resultsList.innerHTML = "";

  if (flights.length === 0) {
    resultsList.innerHTML =
      '<div class="text-center py-4"><p class="text-muted">No flights found. Please try different dates or destinations.</p></div>';
    resultsContainer.style.display = "block";
    return;
  }

  flights.forEach((flight) => {
    const flightElement = document.createElement("div");
    flightElement.className = "list-group-item";
    flightElement.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h6 class="mb-1">${flight.airline} - ${flight.flightNumber}</h6>
          <small class="text-muted">
            ${flight.departure.airport} → ${flight.arrival.airport} • 
            ${flight.duration} • ${
      flight.stops === 0
        ? "Nonstop"
        : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`
    }
          </small>
        </div>
        <div class="text-end">
          <h2 class="mb-1">${formatCurrency(flight.price, flight.currency)}</h2>
          <button class="btn btn-sm btn-outline-primary save-flight-btn" 
                  data-flight-id="${flight.id}"
                  type="button">
            <i class="far fa-save me-1"></i> Save
          </button>
        </div>
      </div>
      <div class="mt-2">
        <small>
          <strong>Depart:</strong> ${formatDate(flight.departure.date)} at ${
      flight.departure.time
    } • 
          <strong>Arrive:</strong> ${formatDate(flight.arrival.date)} at ${
      flight.arrival.time
    }
        </small>
      </div>
    `;

    resultsList.appendChild(flightElement);
  });

  resultsContainer.style.display = "block";

  resultsList.removeEventListener("click", handleSaveFlightClick);
  resultsList.addEventListener("click", handleSaveFlightClick);

  resultsList.flightsData = flights;
}

function handleSaveFlightClick(event) {
  const saveBtn = event.target.closest(".save-flight-btn");
  if (!saveBtn) return;

  event.preventDefault();
  event.stopPropagation();

  const flightId = saveBtn.getAttribute("data-flight-id");
  const flights = event.currentTarget.flightsData || [];
  const flight = flights.find((f) => f.id === flightId);

  if (flight) {
    saveFlightToTrip(flight);
  } else {
    showAlert("Flight data not found", "danger");
  }
}

function updateSavedFlightsDisplay(flights) {
  const container = document.getElementById("savedFlightsContainer");
  if (container) {
    loadSavedFlights(flights);
  }
}

function updateBudgetDisplay(budget) {
  const budgetElements = document.querySelectorAll("[data-budget-category]");
  budgetElements.forEach((element) => {
    const category = element.getAttribute("data-budget-category");
    if (budget.estimated[category] !== undefined) {
      element.textContent = formatCurrency(budget.estimated[category]);
    }
  });

  const totalElement = document.getElementById("budgetTotal");
  if (totalElement) {
    totalElement.textContent = formatCurrency(budget.estimatedTotal);
  }
}

// Initialize the system when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeTripsData();

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

function loadSavedFlights(flights) {
  const container = document.getElementById("savedFlightsContainer");
  if (!container) return;

  container.innerHTML =
    flights && flights.length > 0
      ? flights
          .map(
            (flight) => `
        <div class="mb-2">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <small class="fw-bold">${flight.airline}</small>
              <small class="d-block text-muted">
                ${flight.departure.airport} → ${flight.arrival.airport}
              </small>
            </div>
            <small class="text-end">
              <span class="d-block fw-bold">${formatCurrency(
                flight.price
              )}</span>
              <span class="text-muted">${flight.departure.time}</span>
            </small>
          </div>
        </div>
      `
          )
          .join("")
      : '<p class="text-muted mb-0">No flights saved yet</p>';
}

document.addEventListener("DOMContentLoaded", function () {
  initializeTripsData();

  const trips = JSON.parse(localStorage.getItem("trips"));
  const tripId =
    new URLSearchParams(window.location.search).get("id") || trips[0].id;
  const trip = trips.find((t) => t.id === tripId);

  if (trip) {
    loadSavedFlights(trip.flights);
    if (trip.budget) {
      updateBudgetDisplay(trip.budget);
    }
  }
});
