import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js"
import { getFirestore, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAt3YPKOy9h_0IhtzWu3Wr2eXekADwOJoY",
    authDomain: "muse-f11xter.firebaseapp.com",
    projectId: "muse-f11xter",
    storageBucket: "muse-f11xter.appspot.com",
    messagingSenderId: "93147944612",
    appId: "1:93147944612:web:e3589684cb717d16f2f831"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const authProvider = new GoogleAuthProvider();

if (location.hostname === "localhost") {
    connectFirestoreEmulator(db, "localhost", 8080);
    connectAuthEmulator(auth, "http://localhost:9099");
}
