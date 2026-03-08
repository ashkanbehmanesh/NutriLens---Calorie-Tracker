
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// Your verified web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGXHaTB-zZ5eScf-sz8B6ZLUKf7uiNCm8",
  authDomain: "caloriecounter-412ed.firebaseapp.com",
  projectId: "caloriecounter-412ed",
  storageBucket: "caloriecounter-412ed.firebasestorage.app",
  messagingSenderId: "463427648784",
  appId: "1:463427648784:web:8ee20a8e80bdfb919cb995",
  measurementId: "G-9MMQ52CGNV"
};

const app = initializeApp(firebaseConfig);

// Initialize analytics safely
try {
  getAnalytics(app);
} catch (error) {
  console.warn("Analytics initialization failed, likely due to environment restrictions.");
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, orderBy };
export type { User };
