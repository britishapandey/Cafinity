import React, { useState, useEffect } from 'react';
import { db, auth } from './config/firebase'; // Firebase config
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import CafeForm from './components/CafeForm';
import CafeList from './components/CafeList';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/NavBar'; // Updated NavBar import
import './index.css';
import Profile from './components/profile';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

function App() {
  const [cafeList, setCafeList] = useState([]); // State for cafe list
  const [user, setUser] = useState(null); // State for logged-in user

  // Monitor user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe; // Cleanup subscription
  }, []);

  const cafesCollectionRef = collection(db, "cafes");

  // Fetch cafe list from Firebase
  const getCafeList = async () => {
    try {
      const data = await getDocs(cafesCollectionRef);
      const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setCafeList(filteredData);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch cafe list when user is logged in
  useEffect(() => {
    if (user) {
      getCafeList();
    }
  }, [user]);

  // Add a new cafe to Firebase
  const onSubmitCafe = async (newCafe) => {
    try {
      await addDoc(cafesCollectionRef, newCafe);
      getCafeList();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <header>
        {/* Pass the user state to the Navbar */}
        <Navbar user={user} />
      </header>

      <Routes>
        {/* Home route - visible only to authenticated users */}
        <Route
          path="/"
          element={
            user ? (
              <>
                <div className="h-8">
                  <APIProvider apiKey={API_KEY} onLoad={() => console.log('Google Maps API loaded')}>
                  <Map
                    style={{ borderRadius: "20px" }}
                    defaultZoom={13}
                    defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
                    gestureHandling={"greedy"}
                  ></Map>
                  </APIProvider>
                </div>
                <CafeForm onSubmitCafe={onSubmitCafe} />
                <CafeList cafes={cafeList} />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Login route */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <Login />}
        />

        {/* Register route */}
        <Route
          path="/register"
          element={user ? <Navigate to="/" /> : <Register />}
        />

        {/* Profile route - visible only to authenticated users */}
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
}

export default App;
