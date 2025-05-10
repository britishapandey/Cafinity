// src/utils/cafeCollection.js
import { collection } from 'firebase/firestore';
import { db } from '../config/firebase';

// Use this function to get the cafe collection reference throughout the app
export const getCafesCollection = () => {
  return collection(db, "googleCafes");
};

export default getCafesCollection;