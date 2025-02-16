import React, { useState, useEffect } from 'react';
import { db, auth } from './config/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/NavBar';
import './index.css';
import Profile from './components/profile';
import SearchFilter from './components/SearchFilter';
import CafeList from './components/CafeList';
import CafeView from './components/CafeView';

function App() {
  const [user, setUser] = useState(null); // State for logged-in user
  const [userRole, setUserRole] = useState("user"); // State for user role
  const [cafeList, setCafeList] = useState([]); // State for cafe list
  const [filteredCafes, setFilteredCafes] = useState([]); // State for filtered cafes
  const cafesCollectionRef = collection(db, "cafes"); // Firebase collection ref

  // Fetch cafe list from Firestore
  const getCafeList = async () => {
    try {
      const fiveCafes = query(cafesCollectionRef, limit(5));
      const data = await getDocs(fiveCafes);
      const allCafes = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      console.log("All Cafes:", allCafes);
  
      const californiaCafes = allCafes.filter((cafe) => cafe.state === "CA");
      console.log("California Cafes:", californiaCafes);
  
      const randomizedCafes = [...californiaCafes].sort(() => Math.random() - 0.5);
      console.log("Randomized Cafes:", randomizedCafes);
  
      setCafeList(randomizedCafes);
      setFilteredCafes(randomizedCafes);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getCafeList(); // Fetch data on initial load
  }, []);

  // Monitor user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe; // Cleanup subscription
  }, []);

  // Handle search filter submission
  const handleSearchSubmit = (filters) => {
    const term = filters.searchTerm.toLowerCase();
    let tempFilteredCafes = [...cafeList];

    // Filter by search term
    if (term) {
      tempFilteredCafes = tempFilteredCafes.filter((cafe) =>
        cafe.name.toLowerCase().includes(term)
      );
    }

    // Filter by amenities (Wi-Fi or power outlets)
    if (filters.wifi || filters.powerOutlets) {
      tempFilteredCafes = tempFilteredCafes.filter(
        (cafe) =>
          cafe.attributes &&
          (cafe.attributes.WiFi === "True" || cafe.attributes.WiFi === true)
      );
    }

    setFilteredCafes(tempFilteredCafes);
  };

  return (
    <div>
      <header>
        {/* Pass the user and userRole state to the Navbar */}
        <Navbar user={user} userRole={userRole} />
      </header>

      <Routes>
        {/* Home route - visible only to authenticated users */}
        <Route
          path="/"
          element={
            user ? (
              <>
                <Home user={user} />
                <CafeList cafes={filteredCafes} />
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
          element={
            user ? (
              <Profile setUserRole={setUserRole} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Search route - visible only to authenticated users */}
        <Route
          path="/search"
          element={
            user ? (
              <>
                <SearchFilter onSearch={handleSearchSubmit} />
                <CafeList cafes={filteredCafes} />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/cafe/:id"
          element={
            <>
            <CafeView/> 
            <CafeList cafes={filteredCafes} />
            </>
          } 
        />

      </Routes>
    </div>
  );
}

export default App;