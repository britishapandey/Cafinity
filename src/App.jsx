import React, { useState, useEffect } from 'react';
import { db, auth } from './config/firebase'; // Firebase config
import { addDoc, collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import Home from './components/Home';
import Login from './components/login';
import Register from './components/Register';
import Navbar from './components/NavBar'; // Updated NavBar import
import './index.css';
import Profile from './components/profile';
import SearchFilter from './components/SearchFilter';
import CafeList from './components/CafeList'; // Import CafeList (if you have a separate component)
import OwnerDashboard from './components/OwnerDashboard';
import CafeCard from './components/CafeCard';
import CafeForm from './components/CafeForm';
import CafeView from './components/CafeView'; 
import UpdateCafe from './components/updateCafe';


function App() {
  const [user, setUser] = useState(null); // State for logged-in user
  const [userRole, setUserRole] = useState(""); // State for user role
  const [cafeList, setCafeList] = useState([]); // State for cafe list in App.js (Firebase data)
  const [filteredCafes, setFilteredCafes] = useState([]);
  const cafesCollectionRef = collection(db, "cafes"); // Firebase collection ref

  const [isAuthLoading, setIsAuthLoading] = useState(true); // Add loading state for auth


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

  const getUserRole = async () => {
    if (user) {
      const userDoc = doc(db, "profiles", user.uid); // Assuming you have a users collection
      const docSnap = await getDoc(userDoc);
      if (docSnap) {
        setUserRole(docSnap.data().role); // Set user role based on Firestore data
        console.log("User role:", docSnap.data().role);
      } else {
        console.log("No such document!");
      }
    }
  }


  // Monitor user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      getUserRole(); // Fetch user role when auth state changes
      setIsAuthLoading(false); // Set loading to false once we have the auth state
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

  if (isAuthLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B7AEE]"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header>
      {/* Pass the user state to the Navbar */}
      <Navbar user={user} userRole={userRole}/>
      </header>

      <Routes>
        {/* Home route - visible only to authenticated users */}
        <Route
          path="/"
          element={
            user ? (
              <>
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
          element={user ? 
            <Profile setUserRole={setUserRole} />: <Navigate to="/login" />}
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

        {/* Cafe view route */}
        <Route
          path="/cafe/:id"
          element={
            <CafeView/> 
          } 
        />
        <Route
          path="/business"
          element={<OwnerDashboard />}
          />

        <Route 
          path="/addcafe"
          element={<CafeForm onSubmitCafe={onSubmitCafe}/>}/>

        <Route
          path="/cafe/:cafeId"
          element={user ? <CafeView /> : <Navigate to="/login" />}
        />

        <Route
          path="/editcafe/:id"
          element={user ? <UpdateCafe onSubmitCafe={onSubmitCafe} /> : <Navigate to="/login" />}
        />

      </Routes>


    </div>
  );
}

export default App;
