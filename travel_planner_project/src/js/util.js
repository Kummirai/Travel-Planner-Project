
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

// Generate a unique ID
function generateId() {
  return "id-" + Math.random().toString(36).substr(2, 9);
}

// Calculate the number of days between two dates
function getDaysBetweenDates(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// Debounce function for limiting API calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Validate email format
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Show alert message
function showAlert(message, type = "success") {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.role = "alert";
  alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

  const container = document.querySelector(".container") || document.body;
  container.prepend(alertDiv);

  setTimeout(() => {
    alertDiv.classList.remove("show");
    setTimeout(() => alertDiv.remove(), 150);
  }, 3000);
}

// Scroll Animation Utility
document.addEventListener("DOMContentLoaded", function () {
  // Configure the Intersection Observer
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  // Animation function
  const animateOnScroll = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate");
        observer.unobserve(entry.target);
      }
    });
  };

  // Initialize observer
  const observer = new IntersectionObserver(animateOnScroll, observerOptions);

  // Elements to animate
  const animatedElements = document.querySelectorAll("[data-animate]");

  animatedElements.forEach((element) => {
    observer.observe(element);
  });
});

// Enhanced scroll animation with different effects
const scrollAnimations = () => {
  const elements = document.querySelectorAll("[data-animate]");

  elements.forEach((el) => {
    const effect = el.getAttribute("data-animate");
    const delay = el.getAttribute("data-delay") || 0;

    el.style.transitionDelay = `${delay}s`;

    switch (effect) {
      case "fade-in":
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        break;
      case "slide-left":
        el.style.opacity = "0";
        el.style.transform = "translateX(-50px)";
        break;
      case "slide-right":
        el.style.opacity = "0";
        el.style.transform = "translateX(50px)";
        break;
      case "scale-up":
        el.style.opacity = "0";
        el.style.transform = "scale(0.8)";
        break;
      case "rotate":
        el.style.opacity = "0";
        el.style.transform = "rotate(-10deg)";
        break;
      default:
        el.style.opacity = "0";
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  elements.forEach((el) => observer.observe(el));
};

document.addEventListener("DOMContentLoaded", scrollAnimations);
