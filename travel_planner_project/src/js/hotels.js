const AMADEUS_HOTEL_CONFIG = {
  baseUrl: "https://test.api.amadeus.com/v3",
  searchUrl: "https://test.api.amadeus.com/v3/shopping/hotel-offers",
  listUrl:
    "https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city",
  authUrl: "https://test.api.amadeus.com/v1/security/oauth2/token",
  clientId: "",
  clientSecret: "",
};

// City code mappings for hotel searches
const CITY_CODE_MAPPINGS = {
  // South Africa
  JOHANNESBURG: "JNB",
  JHB: "JNB",
  JOBURG: "JNB",
  "CAPE TOWN": "CPT",
  CAPETOWN: "CPT",
  DURBAN: "DUR",
  "PORT ELIZABETH": "PLZ",
  PE: "PLZ",
  BLOEMFONTEIN: "BFN",
  PRETORIA: "JNB", // Close to Johannesburg

  // Zimbabwe
  HARARE: "HRE",
  ZIMBABWE: "HRE",
  BULAWAYO: "BUQ",

  // Popular African Cities
  LAGOS: "LOS",
  ABUJA: "ABV",
  NAIROBI: "NBO",
  "ADDIS ABABA": "ADD",
  ADDIS: "ADD",
  CAIRO: "CAI",
  KAMPALA: "EBB",
  ACCRA: "ACC",
  MAPUTO: "MPM",
  "DAR ES SALAAM": "DAR",
  LUSAKA: "LUN",
  WINDHOEK: "WDH",

  // Europe
  LONDON: "LON",
  PARIS: "PAR",
  AMSTERDAM: "AMS",
  BERLIN: "BER",
  MADRID: "MAD",
  ROME: "ROM",
  VIENNA: "VIE",
  ZURICH: "ZUR",
  GENEVA: "GVA",
  FRANKFURT: "FRA",
  MUNICH: "MUC",
  BARCELONA: "BCN",
  MILAN: "MIL",
  VENICE: "VCE",
  FLORENCE: "FLR",
  LISBON: "LIS",
  PORTO: "OPO",
  ATHENS: "ATH",
  ISTANBUL: "IST",
  MOSCOW: "MOW",
  "ST PETERSBURG": "LED",

  // North America
  "NEW YORK": "NYC",
  NEWYORK: "NYC",
  "LOS ANGELES": "LAX",
  LA: "LAX",
  CHICAGO: "CHI",
  ATLANTA: "ATL",
  MIAMI: "MIA",
  "LAS VEGAS": "LAS",
  VEGAS: "LAS",
  "SAN FRANCISCO": "SFO",
  TORONTO: "YTO",
  MONTREAL: "YMQ",
  VANCOUVER: "YVR",

  // Asia
  DUBAI: "DXB",
  "ABU DHABI": "AUH",
  DELHI: "DEL",
  MUMBAI: "BOM",
  BANGALORE: "BLR",
  CHENNAI: "MAA",
  KOLKATA: "CCU",
  BEIJING: "BJS",
  SHANGHAI: "SHA",
  "HONG KONG": "HKG",
  SINGAPORE: "SIN",
  TOKYO: "TYO",
  OSAKA: "OSA",
  KYOTO: "KIX", // Using nearby Osaka airport code
  SEOUL: "SEL",
  BANGKOK: "BKK",
  "HO CHI MINH": "SGN",
  HANOI: "HAN",
  "KUALA LUMPUR": "KUL",
  JAKARTA: "JKT",
  MANILA: "MNL",

  // Oceania
  SYDNEY: "SYD",
  MELBOURNE: "MEL",
  BRISBANE: "BNE",
  PERTH: "PER",
  ADELAIDE: "ADL",
  AUCKLAND: "AKL",
  WELLINGTON: "WLG",
  CHRISTCHURCH: "CHC",

  // South America
  "SAO PAULO": "SAO",
  SAOPAULO: "SAO",
  "RIO DE JANEIRO": "RIO",
  RIO: "RIO",
  "BUENOS AIRES": "BUE",
  SANTIAGO: "SCL",
  LIMA: "LIM",
  BOGOTA: "BOG",
  CARACAS: "CCS",

  // Middle East
  DOHA: "DOH",
  RIYADH: "RUH",
  JEDDAH: "JED",
  "TEL AVIV": "TLV",
  JERUSALEM: "JRS",
  AMMAN: "AMM",
  BEIRUT: "BEY",
  KUWAIT: "KWI",
};

// Reuse functions from api.js
function formatDate(dateString) {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

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

function generateId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
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

// Validate and convert city name to IATA code
function validateCityCode(cityName) {
  if (!cityName) return null;

  const upperCity = cityName.toUpperCase().trim();

  // Check direct mapping
  if (CITY_CODE_MAPPINGS[upperCity]) {
    return CITY_CODE_MAPPINGS[upperCity];
  }

  if (/^[A-Z]{3}$/.test(upperCity)) {
    const isValidCode = Object.values(CITY_CODE_MAPPINGS).includes(upperCity);
    return isValidCode ? upperCity : null;
  }

  // Try partial matching for common variations
  const partialMatch = Object.keys(CITY_CODE_MAPPINGS).find(
    (key) => key.includes(upperCity) || upperCity.includes(key)
  );

  return partialMatch ? CITY_CODE_MAPPINGS[partialMatch] : null;
}

// Get Amadeus token (reuse from main API file)
async function getAmadeusTokenForHotels() {
  if (amadeusAccessToken && tokenExpiration && new Date() < tokenExpiration) {
    return amadeusAccessToken;
  }

  try {
    const response = await fetch(AMADEUS_HOTEL_CONFIG.authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: AMADEUS_HOTEL_CONFIG.clientId,
        client_secret: AMADEUS_HOTEL_CONFIG.clientSecret,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `Hotel API Authentication failed: ${response.status} - ${errorData}`
      );
    }

    const data = await response.json();
    console.log(data);

    amadeusAccessToken = data.access_token;
    tokenExpiration = new Date(Date.now() + (data.expires_in - 300) * 1000);
    return amadeusAccessToken;
  } catch (error) {
    console.error("Error getting Amadeus token for hotels:", error);
    throw error;
  }
}

// Calculate number of nights between two dates
function calculateNights(checkIn, checkOut) {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const timeDifference = checkOutDate.getTime() - checkInDate.getTime();
  return Math.ceil(timeDifference / (1000 * 3600 * 24));
}

// Format hotel amenities
function formatAmenities(amenities) {
  if (!amenities || !Array.isArray(amenities)) return [];

  const amenityMap = {
    WIFI: "Free WiFi",
    PARKING: "Parking",
    RESTAURANT: "Restaurant",
    BAR: "Bar",
    FITNESS: "Fitness Center",
    POOL: "Swimming Pool",
    SPA: "Spa",
    BUSINESS_CENTER: "Business Center",
    ROOM_SERVICE: "Room Service",
    CONCIERGE: "Concierge",
    LAUNDRY: "Laundry Service",
    PET_FRIENDLY: "Pet Friendly",
    ACCESSIBLE: "Wheelchair Accessible",
    AIR_CONDITIONING: "Air Conditioning",
    ELEVATOR: "Elevator",
  };

  return amenities.map((amenity) => amenityMap[amenity] || amenity).slice(0, 5);
}

// Generate hotel placeholder image URL that actually works
function getHotelImageUrl(hotelName, location) {
  const text = encodeURIComponent(`${hotelName}`);
  return `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop&crop=entropy&auto=format&q=60&txt=${text}`;
}

// Search hotels using Amadeus API
async function searchHotelsFromAmadeus(params) {
  try {
    // Validate city code
    const validCityCode = validateCityCode(params.location);
    if (!validCityCode) {
      throw new Error(
        `Invalid city: "${params.location}". Please use a major city name (e.g., Johannesburg, Cape Town, Harare)`
      );
    }

    // Validate dates - Fixed date validation logic
    const checkInDate = new Date(params.checkIn);
    const checkOutDate = new Date(params.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for proper comparison

    // Set check-in date to start of day for comparison
    const checkInDateOnly = new Date(checkInDate);
    checkInDateOnly.setHours(0, 0, 0, 0);

    if (checkInDateOnly < today) {
      throw new Error("Check-in date cannot be in the past");
    }

    if (checkOutDate <= checkInDate) {
      throw new Error("Check-out date must be after check-in date");
    }

    const nights = calculateNights(params.checkIn, params.checkOut);
    if (nights > 30) {
      throw new Error("Maximum stay is 30 nights");
    }

    console.log(`Searching hotels in ${validCityCode} for ${nights} nights`);

    const token = await getAmadeusTokenForHotels();

    // First, get hotels in the city
    const hotelListUrl = new URL(AMADEUS_HOTEL_CONFIG.listUrl);
    hotelListUrl.searchParams.append("cityCode", validCityCode);

    const hotelListResponse = await fetch(hotelListUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!hotelListResponse.ok) {
      const errorText = await hotelListResponse.text();
      throw new Error(
        `Failed to get hotels list: ${hotelListResponse.status} - ${errorText}`
      );
    }

    const hotelListData = await hotelListResponse.json();

    if (!hotelListData.data || hotelListData.data.length === 0) {
      throw new Error(
        `No hotels found in ${params.location}. Please try a different city or check your spelling.`
      );
    }

    // Get hotel IDs (limit to first 20 for performance)
    const hotelIds = hotelListData.data
      .slice(0, 20)
      .map((hotel) => hotel.hotelId);

    // Search for offers
    const searchUrl = new URL(AMADEUS_HOTEL_CONFIG.searchUrl);
    searchUrl.searchParams.append("hotelIds", hotelIds.join(","));
    searchUrl.searchParams.append("checkInDate", params.checkIn);
    searchUrl.searchParams.append("checkOutDate", params.checkOut);
    searchUrl.searchParams.append("adults", params.guests || 1);
    searchUrl.searchParams.append("rooms", params.rooms || 1);
    searchUrl.searchParams.append("currency", "ZAR");

    console.log(`Searching offers for ${hotelIds.length} hotels`);

    const offersResponse = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!offersResponse.ok) {
      const errorText = await offersResponse.text();
      throw new Error(
        `Failed to get hotel offers: ${offersResponse.status} - ${errorText}`
      );
    }

    const offersData = await offersResponse.json();

    if (!offersData.data || offersData.data.length === 0) {
      throw new Error(
        `No hotel offers available for the selected dates in ${params.location}. Please try different dates.`
      );
    }

    console.log(`Found ${offersData.data.length} hotel offers`);

    // Process and format hotel offers
    return offersData.data
      .map((offer) => {
        const hotel = offer.hotel;
        const roomOffer = offer.offers[0];
        const price = roomOffer.price;

        // Convert price to ZAR if needed
        const pricePerNight =
          price.currency === "ZAR"
            ? parseFloat(price.total) / nights
            : convertToZAR(parseFloat(price.total) / nights, price.currency);

        return {
          id: generateId(),
          hotelId: hotel.hotelId,
          name: hotel.name || `Hotel in ${params.location}`,
          location: params.location,
          checkIn: params.checkIn,
          checkOut: params.checkOut,
          nights: nights,
          pricePerNight: pricePerNight,
          totalPrice: pricePerNight * nights,
          currency: "ZAR",
          originalPrice: parseFloat(price.total),
          originalCurrency: price.currency,
          rating: hotel.rating || Math.random() * 2 + 3,
          amenities: formatAmenities(hotel.amenities),
          roomType: roomOffer.room?.type?.description || "Standard Room",
          boardType: roomOffer.boardType || "ROOM_ONLY",
          cancellationPolicy:
            roomOffer.policies?.cancellation?.type || "NON_REFUNDABLE",
          image: getHotelImageUrl(hotel.name || "Hotel", params.location),
          address: hotel.address || `${params.location} City Center`,
        };
      })
      .sort((a, b) => a.pricePerNight - b.pricePerNight);
  } catch (error) {
    console.error("Amadeus hotel search error:", error);
    // Re-throw all errors - no fallback to sample data
    throw error;
  }
}

// Main hotel search function
async function searchHotels(searchParams) {
  try {
    const submitBtn = document.querySelector(
      '#hotelSearchForm button[type="submit"]'
    );
    if (submitBtn) {
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin me-1"></i> Searching...';
      submitBtn.disabled = true;
    }

    const hotels = await searchHotelsFromAmadeus(searchParams);

    if (submitBtn) {
      submitBtn.innerHTML = '<i class="fas fa-search me-2"></i>Search Hotels';
      submitBtn.disabled = false;
    }

    return hotels;
  } catch (error) {
    console.error("Hotel search error:", error);

    // Reset button state
    const submitBtn = document.querySelector(
      '#hotelSearchForm button[type="submit"]'
    );
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="fas fa-search me-2"></i>Search Hotels';
      submitBtn.disabled = false;
    }

    // Show specific error message to user
    showAlert(`Error searching for hotels: ${error.message}`, "danger");
    throw error;
  }
}

// Display hotel results (enhanced version)
function displayHotelResults(hotels) {
  const resultsContainer = document.getElementById("hotelResultsContainer");
  const resultsList = document.getElementById("hotelResultsList");

  if (!resultsContainer || !resultsList) {
    console.error("Hotel results container not found");
    return;
  }

  // Clear previous results
  resultsList.innerHTML = "";

  if (hotels.length === 0) {
    resultsList.innerHTML =
      '<div class="col-12"><div class="text-center py-4"><p class="text-muted">No hotels found. Please try different dates or location.</p></div></div>';
    resultsContainer.style.display = "block";
    return;
  }

  // Display hotel results
  hotels.forEach((hotel) => {
    const hotelElement = document.createElement("div");
    hotelElement.className = "col-md-6 col-lg-4 mb-4";

    const starsDisplay =
      "★".repeat(Math.floor(hotel.rating)) +
      "☆".repeat(5 - Math.floor(hotel.rating));

    hotelElement.innerHTML = `

    <div class="hotel-card">
  <div class="hotel-card-body">
    <h2 class="hotel-name">${hotel.name}</h2>
    
    <div class="rating-container">
      <div class="star-rating">${starsDisplay}</div>
      <small class="rating-value">${hotel.rating.toFixed(1)}</small>
    </div>
    
    <p class="hotel-address">
      <span class="address-icon"></span> ${hotel.address}
    </p>
    
    <div class="date-room-container">
      <div class="date-info">
        <span class="date-icon"></span> 
        ${formatDate(hotel.checkIn)} - ${formatDate(hotel.checkOut)} 
        (${hotel.nights} night${hotel.nights > 1 ? "s" : ""})
      </div>
      <div class="room-info">
        <span class="room-icon">🛏️</span> ${hotel.roomType}
      </div>
    </div>
    
    ${
      hotel.amenities.length > 0
        ? `
    <ul class="amenities-list">
      ${hotel.amenities
        .slice(0, 4)
        .map(
          (amenity) =>
            `<li><span class="amenity-check">✓</span> ${amenity}</li>`
        )
        .join("")}
      ${
        hotel.amenities.length > 4
          ? `<li class="more-amenities">+ ${
              hotel.amenities.length - 4
            } more</li>`
          : ""
      }
    </ul>
    `
        : ""
    }
    
    <div class="pricing-container">
      <div class="price-section">
        <div class="price-per-night">${formatCurrency(
          hotel.pricePerNight
        )}</div>
        <small class="price-label">per night</small>
      </div>
      <div class="total-section">
        <div class="total-price">${formatCurrency(hotel.totalPrice)}</div>
        <small class="price-label">total</small>
      </div>
    </div>
    
    <button class="save-button save-hotel-btn" 
                    data-hotel-id="${hotel.id}"" data-hotel-id="${hotel.id}">
      <span class="save-icon"></span> Save to Trip
    </button>
  </div>
</div>
      `;

    resultsList.appendChild(hotelElement);
  });

  // Show results container
  resultsContainer.style.display = "block";

  resultsList.removeEventListener("click", handleSaveHotelClick);
  resultsList.addEventListener("click", handleSaveHotelClick);

  // Store hotels data for access in click handler
  resultsList.hotelsData = hotels;
}

function handleSaveHotelClick(event) {
  const saveBtn = event.target.closest(".save-hotel-btn");
  if (!saveBtn) return;

  event.preventDefault();
  event.stopPropagation();

  const hotelId = saveBtn.getAttribute("data-hotel-id");
  const hotels = event.currentTarget.hotelsData || [];
  const hotel = hotels.find((h) => h.id === hotelId);

  if (hotel) {
    saveHotelToTrip(hotel);
  } else {
    showAlert("Hotel data not found", "danger");
  }
}

// Enhanced save hotel function
function saveHotelToTrip(hotel) {
  initializeTripsData(); // Ensure data exists

  // Get current trips data
  const trips = JSON.parse(localStorage.getItem("trips"));
  const tripId =
    new URLSearchParams(window.location.search).get("id") || trips[0].id;

  // Find the trip
  const tripIndex = trips.findIndex((t) => t.id === tripId);
  if (tripIndex === -1) {
    showAlert("Trip not found", "danger");
    return;
  }

  // Initialize hotels array if needed
  if (!trips[tripIndex].hotels) {
    trips[tripIndex].hotels = [];
  }

  // Check if hotel exists
  const existingIndex = trips[tripIndex].hotels.findIndex(
    (h) => h.id === hotel.id
  );

  if (existingIndex >= 0) {
    trips[tripIndex].hotels[existingIndex] = hotel; // Update
    showAlert("Hotel updated!", "info");
  } else {
    trips[tripIndex].hotels.push(hotel);
    trips[tripIndex].budget.estimated.Hotels += hotel.totalPrice;
    trips[tripIndex].budget.estimatedTotal += hotel.totalPrice;
    showAlert("Hotel saved to trip!", "success");
  }

  // Save back to localStorage
  localStorage.setItem("trips", JSON.stringify(trips));

  // Update UI
  updateSavedHotelsDisplay(trips[tripIndex].hotels);
  updateBudgetDisplay(trips[tripIndex].budget);

  // Update the button to show it's saved
  const saveBtn = document.querySelector(`[data-hotel-id="${hotel.id}"]`);
  if (saveBtn) {
    saveBtn.innerHTML = '<i class="fas fa-check me-1"></i> Saved';
    saveBtn.classList.remove("btn-primary");
    saveBtn.classList.add("btn-success");
    saveBtn.disabled = true;
  }
}

// Helper function to update saved hotels display
function updateSavedHotelsDisplay(hotels) {
  const container = document.getElementById("savedHotelsContainer");
  if (container) {
    loadSavedHotels(hotels);
  }
}

// Load saved hotels into the UI
function loadSavedHotels(hotels) {
  const container = document.getElementById("savedHotelsContainer");
  if (!container) return;

  container.innerHTML =
    hotels && hotels.length > 0
      ? hotels
          .map(
            (hotel) => `
        <div class="mb-3">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <small class="fw-bold">${hotel.name}</small>
              <small class="d-block text-muted">
                ${formatDate(hotel.checkIn)} - ${formatDate(hotel.checkOut)}
                (${hotel.nights} nights)
              </small>
            </div>
            <small class="text-end">
              <span class="d-block fw-bold">${formatCurrency(
                hotel.totalPrice
              )}</span>
              <span class="text-muted">${formatCurrency(
                hotel.pricePerNight
              )}/night</span>
            </small>
          </div>
        </div>
      `
          )
          .join("")
      : '<p class="text-muted mb-0">No hotels saved yet</p>';
}

// Export functions for use in main application
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    searchHotels,
    displayHotelResults,
    saveHotelToTrip,
    validateCityCode,
    searchHotelsFromAmadeus,
  };
}

// Handle hotel search form submission
document.addEventListener("DOMContentLoaded", function () {
  const hotelSearchForm = document.getElementById("hotelSearchForm");

  if (hotelSearchForm) {
    hotelSearchForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      console.log("Hotel search form submit event fired!");

      const location = document.getElementById("hotelLocation").value.trim();
      const checkIn = document.getElementById("hotelCheckIn").value;
      const checkOut = document.getElementById("hotelCheckOut").value;
      const guests = document.getElementById("hotelGuests").value;
      const rooms = document.getElementById("hotelRooms").value;

      // Basic validation
      if (!location || !checkIn || !checkOut) {
        showAlert("Please fill in all required fields", "danger");
        return;
      }

      const searchButton = hotelSearchForm.querySelector(
        'button[type="submit"]'
      );

      try {
        // Show loading state
        if (searchButton) {
          searchButton.innerHTML =
            '<i class="fas fa-spinner fa-spin me-1"></i> Searching...';
          searchButton.disabled = true;
        }

        const hotels = await searchHotels({
          location,
          checkIn,
          checkOut,
          guests,
          rooms,
        });

        displayHotelResults(hotels);
      } catch (error) {
        console.error("Hotel search error:", error);
        showAlert(`Error searching for hotels: ${error.message}`, "danger");
      } finally {
        // Reset button state
        if (searchButton) {
          searchButton.innerHTML = '<i class="fas fa-search me-1"></i> Search';
          searchButton.disabled = false;
        }
      }
    });
  }
});
