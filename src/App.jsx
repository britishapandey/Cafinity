import React, { useState, useEffect } from 'react';
import { db, auth } from './config/firebase'; // Firebase config
import { addDoc, collection, getDocs, getDoc, doc, updateDoc } from 'firebase/firestore';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import Home from './components/Home';
import Login from './components/auth/login';
import Register from './components/auth/register';
import Navbar from './components/NavBar'; // Updated NavBar import
import './index.css';
import Profile from './components/user/profile';
import SearchFilter from './components/search/SearchFilter';
import CafeList from './components/cafes/CafeList'; // Import CafeList (if you have a separate component)
import OwnerDashboard from './components/business/OwnerDashboard';
import CafeForm from './components/cafes/CafeForm';
import CafeView from './components/cafes/CafeView';
import UpdateCafe from './components/cafes/updateCafe';
import CafeRecommender from './components/reccomendations/CafeRecommender'; 
import AdminPanel from './components/admin/AdminPanel';
import { NotificationsProvider } from './context/NotificationsContext';


function App() {
  const [user, setUser] = useState(null); // State for logged-in user
  const [userRole, setUserRole] = useState(""); // State for user role
  const [cafeList, setCafeList] = useState([]); // State for cafe list in App.js (Firebase data)
  const [filteredCafes, setFilteredCafes] = useState([]);
  const cafesCollectionRef = collection(db, "cafes"); // Firebase collection ref

  const [isAuthLoading, setIsAuthLoading] = useState(true); // Add loading state for auth

  // Updated auth state listener with email verification handling
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      // only attempt to get user role if there is a current user
      if (currentUser) {
        try {
          const userDoc = doc(db, "profiles", currentUser.uid);
          const docSnap = await getDoc(userDoc);
          
          if (docSnap.exists()) {
            // If user is now verified but profile doesn't reflect it
            if (currentUser.emailVerified && !docSnap.data().emailVerified) {
              await updateDoc(userDoc, {
                emailVerified: true
              });
            }
            
            setUserRole(docSnap.data().role);
            console.log("User role:", docSnap.data().role);
          } else {
            console.log("No such document!");
            setUserRole("user"); // default role
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole("user"); // default role on error
        }
      } else {
        setUserRole(""); // reset role when logged out
      }

      setIsAuthLoading(false);
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
    <NotificationsProvider>
      <div>
        <header>
          {/* Pass the user state to the Navbar */}
          <Navbar user={user} userRole={userRole}/>
        </header>

        {/* Add email verification banner */}
        {user && !user.emailVerified && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-2" role="alert">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-yellow-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium text-sm">Email not verified.</span>
              <button 
                onClick={async () => {
                  try {
                    await sendEmailVerification(user);
                    alert("Verification email sent!");
                  } catch (err) {
                    console.error("Error sending verification email:", err);
                  }
                }} 
                className="underline ml-2 text-sm text-white-800 hover:text-yellow-900"
              >
                Resend verification email
              </button>
            </div>
          </div>
        )}

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
            element={user && user.emailVerified ? <Navigate to="/" /> : <Login />}
          />

          {/* Register route */}
          <Route
            path="/register"
            element={user && user.emailVerified ? <Navigate to="/" /> : <Register />}
          />

          {/* Profile route - visible only to authenticated users */}
          <Route
            path="/profile"
            element={user ? 
              <Profile setUserRole={setUserRole} />: <Navigate to="/login" />}
          />

          <Route
            path="/admin"
            element={user && userRole === "admin" ? <AdminPanel /> : <Navigate to="/" />}
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
            path="/caferecommender"
            element={user ? <CafeRecommender /> : <Navigate to="/login" />}
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
      </NotificationsProvider>
  );
}

export default App;