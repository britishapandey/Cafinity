import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore"; // ENSURE THIS LINE IS EXACT
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBajomjEOuQpUl4exCs7UyYz3MeaoRDyig",
  authDomain: "cafinity-b5a39.firebaseapp.com",
  projectId: "cafinity-b5a39",
  storageBucket: "cafinity-b5a39.firebasestorage.app",
  messagingSenderId: "635086287802",
  appId: "1:635086287802:web:a112dca96648adfc39a383",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);
export const storage = getStorage(app);
export { collection, getDocs, addDoc }; 