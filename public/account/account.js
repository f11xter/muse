import { deleteUser, onAuthStateChanged, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { auth } from "/muse/firebase.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("email").textContent = user.email;
  }
  else {
    window.location.href = "/muse/login?redirect=true";
  }
});

const msg = document.getElementById("msg");

document.getElementById("signout").addEventListener("click", () => {
  signOut(auth);
});

document.getElementById("password").addEventListener("click", () => {
  sendPasswordResetEmail(auth, auth.currentUser.email)
    .then(() => {
      msg.textContent = "Check your email to reset your password";
      msg.style.display = "block";
    })
    .catch(() => {
      msg.textContent = "An error occurred";
      msg.style.display = "block";
    });
});

document.getElementById("delete").addEventListener("click", () => {
  if (confirm("Delete account and all data permanently?")) {
    deleteUser(auth.currentUser)
      .catch(() => {
        msg.innerHTML = `Please <a href="/muse/login">log in</a> again to delete account.`;
        msg.style.display = "block";
      });
  }
});