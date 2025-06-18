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
