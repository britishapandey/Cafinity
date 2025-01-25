import React, { useState, useEffect } from 'react';
import Navbar from './NavBar';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
import CafeForm from './CafeForm';
import CafeList from './CafeList';
import { db, auth } from '../config/firebase'; // Firebase config
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { Routes, Route, Link, Navigate } from 'react-router-dom';

const Home = ({ user }) => {

    const [cafeList, setCafeList] = useState([]); // State for cafe list
  
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

return(
    <>
        <header>
        {/* Pass the user state to the Navbar */}
        <Navbar user={user} />
        </header>
        <div className="h-8">
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
        <CafeForm onSubmitCafe={onSubmitCafe} />        
    </>
)
}

export default Home;