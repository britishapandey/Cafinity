import React, { useState, useEffect } from 'react';
import { db, auth } from './config/firebase'; // Firebase config
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/NavBar'; // Updated NavBar import
import './index.css';
import Profile from './components/profile';
import SearchFilter from './components/SearchFilter';
import CafeList from './components/CafeList'; // Import CafeList (if you have a separate component)
import CafeView from './components/CafeView';
import CafeCard from './components/CafeCard';
import CafeForm from './components/CafeForm';


function App() {
  const [user, setUser] = useState(null); // State for logged-in user
  const [userRole, setUserRole] = useState("user");
  const [cafeList, setCafeList] = useState([]); // State for cafe list in App.js (Firebase data)
  const [filteredCafes, setFilteredCafes] = useState([]);
  const cafesCollectionRef = collection(db, "cafes"); // Firebase collection ref

  const getCafeList = async () => {
    try {
      const data = await getDocs(cafesCollectionRef);
      const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setCafeList(filteredData);
      setFilteredCafes(filteredData); // Initialize filteredCafes with all cafes
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

  const handleSearchSubmit = (filters) => {
    const term = filters.searchTerm.toLowerCase();
    let tempFilteredCafes = [...cafeList];

    if (term) {
      tempFilteredCafes = tempFilteredCafes.filter(cafe => cafe.name.toLowerCase().includes(term));
    }

    if (filters.wifi || filters.powerOutlets) { // Using wifi for both filters for now
      tempFilteredCafes = tempFilteredCafes.filter(cafe => cafe.amenities && cafe.amenities.wifi === true); // Filter for wifi: true
    }

    setFilteredCafes(tempFilteredCafes);
  };


  const onSubmitCafe = async (newCafe) => {
    try {
      await addDoc(cafesCollectionRef, newCafe);
      getCafeList(); // Refresh cafe list after adding
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
                {/* <div className="h-8">
                  <APIProvider apiKey={API_KEY} onLoad={() => console.log('Google Maps API loaded')}>
                  <Map
                    style={{ borderRadius: "20px" }}
                    defaultZoom={13}
                    defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
                    gestureHandling={"greedy"}
                  >

                  </Map>
                  </APIProvider>
                </div>
                <CafeList cafes={cafeList} />
                <CafeForm onSubmitCafe={onSubmitCafe} /> */}
                <Home user={user}/>
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

        <Route
          path="/search"
          element={
            user ? (
              <>
                <SearchFilter onSearch={handleSearchSubmit} />
                <CafeList cafes={filteredCafes} /> {/* Use filteredCafes here */}
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        {/* <Route
          path="/cafe/:cafeId"
          element={user ? <CafeView /> : <Navigate to="/login" />} 
        />
         */}
        <Route 
          path="/addcafe"
          element={<CafeForm onSubmitCafe={onSubmitCafe}/>}/>
      </Routes>
    </div>
  );
}

export default App;
