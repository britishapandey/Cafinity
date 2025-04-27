// src/components/admin/FeedbackDashboard.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import FeedbackChart from './FeedbackChart';
import FeedbackList from './FeedbackList';
import SentimentSummary from './SentimentSummary';

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
  const [reportedReviews, setReportedReviews] = useState([
    {
      "dateReported": "2025-04-27T04:18:04.626Z",
      "id": "BpUiUfWq5GGvQyVOmtgF",
      "reason": "Flagged by Sinnamon Bunnii",
      "reportedUser": "Anonymous",
      "reviewContent": "sdfsdcSDVSDv"
    },
    {
      "dateReported": {
        "seconds": 1745650800,
        "nanoseconds": 297000000
      },
      "id": "K5lXkrYmlAdqAPG4lhuj",
      "reason": "Flagged by user",
      "reportedUser": "jubby",
      "reviewContent": "BARKABKARKKABRK GRGRR RBARK"
    },
    {
      "dateReported": "2025-04-27T04:16:22.180Z",
      "id": "aERWqhQb1fn0fSXGqr4l",
      "reason": "Flagged by [object Object]",
      "reportedUser": "jubby",
      "reviewContent": "test"
    },
    {
      "dateReported": "2025-04-27T04:17:33.890Z",
      "id": "z5L21UqyHWekUMbxp58w",
      "reason": "Flagged by [object Object]",
      "reportedUser": "Anonymous",
      "reviewContent": "sdfsdcSDVSDv"
    }
  ]);

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
        console.log(reports);
        
        // Simple sentiment analysis
        const sentiment = analyzeSentiment(allReviews);
        setSentimentData(sentiment);
      } catch (error) {
        console.error("Error fetching feedback data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

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
        <SentimentSummary sentimentData={sentimentData} />
        <div className="md:col-span-2">
          <FeedbackChart reviews={reviews} cafes={cafes} />
        </div>
      </div>
      
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
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Flagged Reviews</h2>
          <div>
          {reportedReviews && reportedReviews.map((report) => (
              <div key={report.uid} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow mb-4">
                  <h3>User: {report.reportedUser}</h3>
                  <p>Review: {report.reviewContent}</p>
                  <p>Reason: {report.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    
  );
}

export default FeedbackDashboard;