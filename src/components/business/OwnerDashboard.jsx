import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../../config/firebase';
import { doc, getDoc, setDoc, getDocs, collection, updateDoc } from 'firebase/firestore';
import CafeList from '../cafes/CafeList';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const OwnerDashboard = () => {
  // currently borrowing from Profile.jsx + using CafeList component
  // FIXME: Cafelist does not display user's owned cafes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cafeList, setCafeList] = useState([]); // State for cafe list
  const cafesCollectionRef = collection(db, "cafes");

  const user = auth.currentUser;

  // Fetch cafe list from Firebase
  const getOwnerCafes = async () => {
    setLoading(true);
    try {
      const data = await getDocs(cafesCollectionRef);
      let filteredData = data.docs.map((doc) => ({ ...doc.data(),id: doc.id }));
      filteredData = filteredData.filter((cafe) => cafe.ownerId === user.uid); // Filter cafes by ownerId
      setCafeList(filteredData);
    } catch (err) {
      console.error("Error fetching cafes:", err);
    } finally {
      setLoading(false);
    }
    };

  // Fetch cafe list when user is logged in
  useEffect(() => {
    if (user) {
      getOwnerCafes();
    }
  }, [user]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

    return(
        <>
          <div className="">
            <div className="">
              <h2 className="text-xl font-bold m-4">Your Cafes ({cafeList.length})</h2>
                <div>
                  <CafeList cafes={cafeList}/>
                </div>
            </div>
          </div>
        </>
    )
}

export default OwnerDashboard;