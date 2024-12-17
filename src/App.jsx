import { useState, useEffect } from 'react';
import { db, auth } from './config/firebase'; // Firebase config
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Firebase methods
import CafeForm from './components/CafeForm';
import CafeList from './components/CafeList';
import Login from './components/login';
import Register from './components/register';
import './index.css';

function App() {
  const [cafeList, setCafeList] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe; // Cleanup on component unmount
  }, []);

  const cafesCollectionRef = collection(db, "cafes");

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
      getCafeList();
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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      alert("Signed out successfully!");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Router>
      <div className="">
        <header>
          {user ? (
            <button onClick={handleSignOut}>Sign Out</button>
          ) : (
            <Link to="/login"></Link>
          )}
        </header>

        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <>
                  <CafeForm onSubmitCafe={onSubmitCafe} />
                  <CafeList cafes={cafeList} />
                </>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" /> : <Register />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
