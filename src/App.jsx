import { useState, useEffect } from 'react';
import { db } from './config/firebase';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'; // Import Navigate for redirection
import CafeForm from './components/CafeForm';
import CafeList from './components/CafeList';
import Login from './components/login';
import Register from './components/register';
import { auth } from './config/firebase'; // Import auth from Firebase
import { onAuthStateChanged } from 'firebase/auth'; // Import Firebase auth state change listener

function App() {
  const [cafeList, setCafeList] = useState([]);
  const [user, setUser] = useState(null); // Store the authenticated user
  const cafesCollectionRef = collection(db, "cafes");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Set user when authentication state changes
    });

    return unsubscribe; // Cleanup on component unmount
  }, []);

  const getCafeList = async () => {
    try {
      const data = await getDocs(cafesCollectionRef);
      const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setCafeList(filteredData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      getCafeList(); // Get cafe list when the user is logged in
    }
  }, [user]);

  const onSubmitCafe = async (newCafe) => {
    try {
      await addDoc(cafesCollectionRef, newCafe);
      getCafeList();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Router>
      <div className="App">
        <div>
          <h1>Cafinity</h1>
        </div>

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Route for cafe pages */}
          <Route
            path="/"
            element={user ? (
              <>
                <CafeForm onSubmitCafe={onSubmitCafe} />
                <CafeList cafes={cafeList} />
              </>
            ) : (
              <Navigate to="/login" /> // Redirect to login if not authenticated
            )}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
