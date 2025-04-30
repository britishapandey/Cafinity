import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../../config/firebase';
import { doc, getDoc, setDoc, getDocs, collection, updateDoc } from 'firebase/firestore';
import CafeList from '../cafes/CafeList';
import SentimentSummary from '../admin/SentimentSummary';
import FeedbackChart from '../admin/FeedbackChart';
import { onAuthStateChanged } from "firebase/auth";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const OwnerDashboard = () => {
  // currently borrowing from Profile.jsx + using CafeList component
  // FIXME: Cafelist does not display user's owned cafes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cafes, setCafes] = useState([]); // State for cafe list
  const [reviews, setReviews] = useState([]);
  const cafesCollectionRef = collection(db, "cafes");
  const [sentimentData, setSentimentData] = useState({
    positive: 0,
    neutral: 0,
    negative: 0
  });
  const [user, setUser] = useState(null);
  const [ownerName, setOwnerName] = useState('');
  // const user = auth.currentUser;
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe; // Cleanup subscription
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B7AEE]"></div>
      </div>
    );
  }

  // Simple sentiment analysis function
  const analyzeSentiment = (reviews) => {
    const sentiment = { positive: 0, neutral: 0, negative: 0 };
    
    reviews.forEach(review => {
      if (review.rating >= 4) {
        sentiment.positive++;
      } else if (review.rating >= 3) {
        sentiment.neutral++;
      } else {
        sentiment.negative++;
      }
    });
    
    return sentiment;
  };

      // Fetch all cafes and their reviews
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const userDocRef = doc(db, "profiles", user.uid);
        const userSnapshot = await getDoc(userDocRef);
        const profile = userSnapshot.data();
        setOwnerName(profile.name);
        const cafesSnapshot = await getDocs(collection(db, "cafes"));
        const cafesData = cafesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).filter((cafe) => cafe.ownerId === user.uid);
        setCafes(cafesData);
        
        // Collect all reviews from all cafes
        let allReviews = [];
        cafesData.forEach(cafe => {
          if (cafe.reviews && Array.isArray(cafe.reviews)) {
            const cafeReviews = cafe.reviews.map(review => ({
              ...review,
              cafeName: cafe.name,
              cafeId: cafe.id
            }));
            allReviews = [...allReviews, ...cafeReviews];
          }
        });
        
        // Sort reviews by date (newest first)
        allReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
        setReviews(allReviews);
        
        // Simple sentiment analysis
        const sentiment = analyzeSentiment(allReviews);
        setSentimentData(sentiment);
      } catch (error) {
        console.error("Error fetching feedback data:", error);
      } finally {
      }
    };
    fetchData();
    setLoading(false);
  }, [user]);

    return(
        <>
          <h1 className="text-2xl lg:text-3xl font-bold m-4 lg:m-8 mb-0">{ownerName}'s Business Dashboard</h1>
          <div className="lg:flex my-6 mx-4 md:mx-12">
            <div className="lg:mr-8">
              <h2 className="text-xl font-bold">Your Cafes ({cafes.length})</h2>
              <div>
                <CafeList cafes={cafes}/>
              </div>
            </div>
            <div className="w-full">
            <h2 className="text-xl font-bold mb-4">Your Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                <SentimentSummary sentimentData={sentimentData} />
                <div className="md:col-span-2">
                  <FeedbackChart reviews={reviews} cafes={cafes} />
                </div>
              </div>
            </div>  
          </div>
        </>
    )
}

export default OwnerDashboard;