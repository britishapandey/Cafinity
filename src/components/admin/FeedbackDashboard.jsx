// src/components/admin/FeedbackDashboard.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import FeedbackChart from './FeedbackChart';
import FeedbackList from './FeedbackList';
import SentimentSummary from './SentimentSummary';
import ReportedReviews from './ReportedReviews';

function FeedbackDashboard() {
  const [reviews, setReviews] = useState([]);
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sentimentData, setSentimentData] = useState({
    positive: 0,
    neutral: 0,
    negative: 0
  });
  const [reportedReviews, setReportedReviews] = useState([]);
  
  // Fetch all cafes and their reviews
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const cafesSnapshot = await getDocs(collection(db, "cafes"));
        const cafesData = cafesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
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
        
        // fetching reported reviews
        const reportSnapshot = await getDocs(collection(db, "reported"));
        const reports = reportSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReportedReviews(reports);
        
      } catch (error) {
        console.error("Error fetching feedback data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);



  // Filter reviews based on selection
  const getFilteredReviews = () => {
    switch (selectedFilter) {
      case 'positive':
        return reviews.filter(review => review.rating >= 4);
      case 'neutral':
        return reviews.filter(review => review.rating === 3);
      case 'negative':
        return reviews.filter(review => review.rating < 3);
      default:
        return reviews;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B7AEE]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Review Feedback</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 rounded-lg ${selectedFilter === 'all' ? 'bg-[#6B7AEE] text-white' : 'bg-gray-200'}`}
              >
                All
              </button>
              <button 
                onClick={() => setSelectedFilter('positive')}
                className={`px-4 py-2 rounded-lg ${selectedFilter === 'positive' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
              >
                Positive
              </button>
              <button 
                onClick={() => setSelectedFilter('neutral')}
                className={`px-4 py-2 rounded-lg ${selectedFilter === 'neutral' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
              >
                Neutral
              </button>
              <button 
                onClick={() => setSelectedFilter('negative')}
                className={`px-4 py-2 rounded-lg ${selectedFilter === 'negative' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
              >
                Negative
              </button>
            </div>
          </div>
          
          <FeedbackList reviews={getFilteredReviews()} />
        </div>
        <ReportedReviews reviews={reportedReviews}/>
      </div>
    </div>
    
  );
}

export default FeedbackDashboard;