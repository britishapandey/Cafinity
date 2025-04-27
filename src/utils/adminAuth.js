// src/utils/adminAuth.js
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const checkAdminAccess = async (userId) => {
  if (!userId) return false;
  
  try {
    const userDoc = doc(db, "profiles", userId);
    const userSnapshot = await getDoc(userDoc);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      return userData.role === "admin";
    }
    return false;
  } catch (error) {
    console.error("Error checking admin access:", error);
    return false;
  }
};