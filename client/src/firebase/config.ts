import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCJX8nuTOIjp_bgoLvTcIZojtRy1q3lMA0",
    authDomain: "waterlily-survey.firebaseapp.com",
    projectId: "waterlily-survey",
    storageBucket: "waterlily-survey.firebasestorage.app",
    messagingSenderId: "861161079874",
    appId: "1:861161079874:web:3bbb0ba7400e6dc54a99db",
    measurementId: "G-CP8F0ZVSNV"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 