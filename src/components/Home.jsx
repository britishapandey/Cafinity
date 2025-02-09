import React, { useState, useEffect } from 'react';
import Navbar from './NavBar';
import { APIProvider, Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
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
  

    // hooks to use Google Maps API and its libraries in React
    // function to get user location
    const GetLocation = () => {
      const map = useMap();
      
      useEffect(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            map.setCenter(pos);
          }, showError); 
        } else { 
          console.log("Geolocation is not supported by this browser.");
        }
      }, [map]);

      // Must be returned as a component
      // in order for libraries to work with context.
      return <></>;
    }

    // standard error handling function for Geolocation
    const showError = (error) => {
      switch(error.code) {
        case error.PERMISSION_DENIED:
          console.log("User denied the request for Geolocation.")
          break;
        case error.POSITION_UNAVAILABLE:
          console.log("Location information is unavailable.")
          break;
        case error.TIMEOUT:
          console.log("The request to get user location timed out.")
          break;
        case error.UNKNOWN_ERROR:
          console.log("An unknown error occurred.")
          break;
      }
    }

return(
    <>
        <div className="h-64">
          {/* Google Maps React API component. */}
            <APIProvider apiKey={API_KEY} onLoad={() => console.log('Google Maps API loaded')}>
            <Map
            style={{ borderRadius: "20px" }}
            defaultZoom={13}
            defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
            gestureHandling={"greedy"}
            >

            </Map>
            {/* Used to obtain user location upon site load. */}
            <GetLocation />
            </APIProvider>
        </div>
        <CafeList cafes={cafeList} />
        {/* <CafeForm onSubmitCafe={onSubmitCafe} />         */}
    </>
)
}

export default Home;