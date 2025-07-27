// src/firebase.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBTdksPSQfBBJ6rz03wJzDH-53MNUFwNZI",
  authDomain: "healthdigilocker.firebaseapp.com",
  projectId: "healthdigilocker",
  storageBucket: "healthdigilocker.appspot.com", // ✅ corrected here
  messagingSenderId: "218510282966",
  appId: "1:218510282966:web:3764fecb633a21a46d7977",
  measurementId: "G-EC8NNKQ9XB"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
