function isUserLoggedIn() {
  return localStorage.getItem("authToken") !== null;
}

function updateNavigation() {
  const nav = document.getElementById("mainNav");

  if (isUserLoggedIn()) {
    nav.innerHTML = `
      <a href="profile.html">Profile</a>
      <a href="#" id="logoutLink">Logout</a>
    `;

    document
      .getElementById("logoutLink")
      .addEventListener("click", function (e) {
        e.preventDefault();
        logoutUser();
      });
  } else {
    nav.innerHTML = `
      <a href="auth.html?action=login">Login</a>
      <a href="auth.html?action=register">Register</a>
    `;
  }
}

function logoutUser() {
  localStorage.removeItem("authToken");

  window.location.href = "auth.html?action=login";
}

document.addEventListener("DOMContentLoaded", updateNavigation);

// Toggle mobile menu
document.getElementById("navbarToggler").addEventListener("click", function () {
  const navbarCollapse = document.getElementById("navbarCollapse");
  navbarCollapse.classList.toggle("show");
});

// Toggle dropdown (keep your existing function)
function toggleDropdown() {
  const dropdownMenu = document.getElementById("dropdownMenu");
  dropdownMenu.classList.toggle("show");
}

// Close dropdown when clicking outside
window.addEventListener("click", function (e) {
  if (!e.target.matches(".dropdown-toggle")) {
    const dropdowns = document.getElementsByClassName("dropdown-menu");
    for (let i = 0; i < dropdowns.length; i++) {
      dropdowns[i].classList.remove("show");
    }
  }
});
