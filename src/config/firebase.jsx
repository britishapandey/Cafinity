// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBajomjEOuQpUl4exCs7UyYz3MeaoRDyig",
  authDomain: "cafinity-b5a39.firebaseapp.com",
  projectId: "cafinity-b5a39",
  storageBucket: "cafinity-b5a39.firebasestorage.app",
  messagingSenderId: "635086287802",
  appId: "1:635086287802:web:c4a99724a8a582c439a383",
  measurementId: "G-CLL221BF1V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// const analytics = getAnalytics(app);