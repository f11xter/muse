import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { auth } from "/firebase.js";

const params = new URLSearchParams(window.location.search);
const isRedirect = params.get("redirect") === "true";
const isReauthenticate = params.get("reauthenticate") === "true";

// redirect to account page when logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (!isReauthenticate) {
      redirect();
    }
    else {
      document.getElementById("nav-account").style.display = "";
      document.getElementById("nav-login").style.display = "none";
    }
  }
  else {
    document.getElementById("nav-account").style.display = "none";
    document.getElementById("nav-login").style.display = "";
  }
});

const email = document.getElementById("email");
const password = document.getElementById("password");

const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const error = document.getElementById("error");

const isValidEmail = () => email.checkValidity() && email.value !== "";
const isValidPassword = () => password.checkValidity() && password.value !== "";

document.getElementById("signup").addEventListener("click", () => {
  if (isValidEmail() && isValidPassword()) {
    createUserWithEmailAndPassword(auth, email.value, password.value)
      .catch((error) => {
        showError(error.code);
      });
  }
});

document.getElementById("login").addEventListener("click", () => {
  if (isValidEmail() && isValidPassword()) {
    signInWithEmailAndPassword(auth, email.value, password.value)
      .then(() => {
        redirect();
      })
      .catch((error) => {
        showError(error.code);
      });
  }
});

document.getElementById("forgot").addEventListener("click", () => {
  if (isValidEmail()) {
    sendPasswordResetEmail(auth, email.value)
      .then(() => {
        error.textContent = "Check your email to reset your password";
        error.style.display = "block";
      })
      .catch((error) => {
        showError(error.code);
      });
  }
  else {
    showError("auth/invalid-email");
  }
});

function showError(code) {
  error.style.display = "none";
  console.log(code);

  switch (code) {
    case "auth/wrong-password":
      passwordError.textContent = "Incorrect password";
      email.classList.remove("invalid");
      password.classList.add("invalid");
      break;

    case "auth/invalid-email":
      emailError.textContent = "Please enter a valid email address";
      email.classList.add("invalid");
      password.classList.remove("invalid");
      break;

    case "auth/email-already-in-use":
      emailError.textContent = "Email already in use";
      email.classList.add("invalid");
      password.classList.remove("invalid");
      break;

    case "auth/user-not-found":
      emailError.textContent = "User not found";
      email.classList.add("invalid");
      password.classList.remove("invalid");
      break;

    default:
      error.textContent = "An unkown error occurred"
      error.style.display = "block";
      break;
  }
}

function redirect() {
  if (isRedirect) {
    history.back();
  }
  else {
    window.location.href = "/account";
  }
}
