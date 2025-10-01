// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBa5cJd9ohrN9Cp4TWvw78nJx5wEAZyFno",
  authDomain: "re-hardware-store.firebaseapp.com",
  projectId: "re-hardware-store",
  storageBucket: "re-hardware-store.firebasestorage.app",
  messagingSenderId: "527829643677",
  appId: "1:527829643677:web:e4a0269f413df08f14ff74",
  measurementId: "G-6NDP6F14HN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };