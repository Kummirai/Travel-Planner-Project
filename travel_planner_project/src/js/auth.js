document.addEventListener("DOMContentLoaded", function () {
  // Initialize forms
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }
});

function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!isValidEmail(email)) {
    showAlert("Please enter a valid email address", "danger");
    return;
  }

  if (password.length < 6) {
    showAlert("Password must be at least 6 characters", "danger");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];

  const user = users.find((u) => u.email === email);

  if (!user) {
    showAlert("User not found. Please register.", "danger");
    return;
  }

  if (user.password !== password) {
    showAlert("Incorrect password", "danger");
    return;
  }

  localStorage.setItem(
    "currentUser",
    JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
    })
  );

  window.location.href = "dashboard.html";
}

function handleRegister(e) {
  e.preventDefault();

  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById(
    "registerConfirmPassword"
  ).value;

  if (!name || !email || !password || !confirmPassword) {
    showAlert("Please fill in all fields", "danger");
    return;
  }

  if (!isValidEmail(email)) {
    showAlert("Please enter a valid email address", "danger");
    return;
  }

  if (password.length < 6) {
    showAlert("Password must be at least 6 characters", "danger");
    return;
  }

  if (password !== confirmPassword) {
    showAlert("Passwords do not match", "danger");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];

  const userExists = users.some((u) => u.email === email);

  if (userExists) {
    showAlert("User with this email already exists", "danger");
    return;
  }

  const newUser = {
    id: generateId(),
    name,
    email,
    password,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  localStorage.setItem(
    "currentUser",
    JSON.stringify({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    })
  );

  showAlert("Registration successful!", "success");
  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 1500);
}
