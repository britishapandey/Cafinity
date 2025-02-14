import React, { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import CafeList from './CafeList';

const OwnerDashboard = () => {

  const [profileData, setProfileData] = useState({
    name: '',
    role: 'user', // Default role
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = auth.currentUser; // Get the currently logged-in user

  useEffect(() => {
    if (user) {
      initializeProfile(); // Create or fetch profile on mount
    }
  }, [user]);

  const initializeProfile = async () => {
    setLoading(true);
    try {
      const userDocRef = doc(db, 'profiles', user.uid); // Reference to the document
      const userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists()) {
        // If profile exists, set the data
        setProfileData(userSnapshot.data());
      } else {
        // If no profile exists, create a new one
        const newProfile = {
          name: user.displayName || '', // Use Firebase Auth displayName if available
          role: 'user',
        };
        await setDoc(userDocRef, newProfile); // Create document in Firestore
        setProfileData(newProfile); // Update state with default profile
      }
    } catch (err) {
      console.error('Error initializing profile:', err);
      setError('Failed to load or create profile.');
    } finally {
      setLoading(false);
    }
  };

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
    


    return(
        <>
            <CafeList cafes={cafeList}/>
        </>
    )
}

export default OwnerDashboard;