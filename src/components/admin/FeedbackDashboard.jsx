// src/components/admin/FeedbackDashboard.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  collectionGroup,
  getDoc,
  doc
} from 'firebase/firestore';
import FeedbackList from './FeedbackList';
import ReportedReviews from './ReportedReviews';
import { useQuery } from 'react-query';

function FeedbackDashboard() {
  const [reviews, setReviews] = useState([]);
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sentimentData, setSentimentData] = useState({
    positive: 0,
    neutral: 0,
    negative: 0
  });
  const [reportedReviews, setReportedReviews] = useState([]);
  const [lastReview, setLastReview] = useState(null);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  
  const REVIEWS_PER_PAGE = 15;
  const cafeLookup = {};

  // Sentiment analysis function
  const analyzeSentiment = (reviews) => {
    const sentiment = { positive: 0, neutral: 0, negative: 0 };
    
    reviews.forEach(review => {
      if (review.rating >= 4) {
        sentiment.positive++;
      } else if (review.rating === 3) {
        sentiment.neutral++;
      } else {
        sentiment.negative++;
      }
    });
    
    return sentiment;
  };

  // Fetch initial data
  useEffect(() => {
    fetchReviews();
    fetchReportedReviews();
  }, []);

  // Fetch reviews with filter
  useEffect(() => {
    // Reset pagination when filter changes
    setLastReview(null);
    setHasMoreReviews(true);
    setReviews([]);
    fetchReviews(true);
  }, [selectedFilter]);

  // Fetch reported reviews
  const fetchReportedReviews = async () => {
    try {
      const reportSnapshot = await getDocs(collection(db, "reported"));
      const reports = reportSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReportedReviews(reports);
    } catch (error) {
      console.error("Error fetching reported reviews:", error);
    }
  };

  // Create a query based on filter
  const createReviewsQuery = (isReset = false) => {
    let reviewsQuery;
    
    // Base query - get reviews from all cafes
    reviewsQuery = query(
      collectionGroup(db, "reviews"),
      orderBy("date", "desc"),
      limit(REVIEWS_PER_PAGE)
    );
    
    // Add filter if needed
    switch (selectedFilter) {
      case 'positive':
        reviewsQuery = query(
          collectionGroup(db, "reviews"),
          where("rating", ">=", 4),
          orderBy("rating", "desc"),
          orderBy("date", "desc"),
          limit(REVIEWS_PER_PAGE)
        );
        break;
      case 'neutral':
        reviewsQuery = query(
          collectionGroup(db, "reviews"),
          where("rating", "==", 3),
          orderBy("date", "desc"),
          limit(REVIEWS_PER_PAGE)
        );
        break;
      case 'negative':
        reviewsQuery = query(
          collectionGroup(db, "reviews"),
          where("rating", "<", 3),
          orderBy("rating", "desc"),
          orderBy("date", "desc"),
          limit(REVIEWS_PER_PAGE)
        );
        break;
      default:
        reviewsQuery = query(
          collectionGroup(db, "reviews"),
          orderBy("date", "desc"),
          limit(REVIEWS_PER_PAGE)
        );
    }
    
    // Add startAfter for pagination if we have a last review and it's not a reset
    if (lastReview && !isReset) {
      reviewsQuery = query(
        reviewsQuery,
        startAfter(lastReview)
      );
    }
    
    return reviewsQuery;
  };

  // Fetch initial or more reviews
  const fetchReviews = async (isReset = false) => {
    if (isReset) {
      setLoading(true);
    } else if (!isReset && !hasMoreReviews) {
      return; // Don't fetch if there are no more reviews
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      const reviewsQuery = createReviewsQuery(isReset);
      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      // Check if we've reached the end
      if (reviewsSnapshot.docs.length < REVIEWS_PER_PAGE) {
        setHasMoreReviews(false);
      }
      
      // Set last document for pagination
      if (reviewsSnapshot.docs.length > 0) {
        setLastReview(reviewsSnapshot.docs[reviewsSnapshot.docs.length - 1]);
      }
      
      // Extract and process reviews
      const reviewsData = [];
      const cafeCache = {};
      const processedCafes = new Set();
      
      for (const reviewDoc of reviewsSnapshot.docs) {
        // Get parent info (cafe) from reference path
        const cafeId = reviewDoc.ref.parent.parent.id;
        let cafeName = "Unknown Cafe";
        
        // Get cafe data if not already fetched
        if (!cafeCache[cafeId]) {
          const cafeDocRef = doc(db, "cafes", cafeId);
          const cafeDoc = await getDoc(cafeDocRef);
          
          if (cafeDoc.exists()) {
            const cafeData = cafeDoc.data();
            cafeCache[cafeId] = cafeData;
            cafeName = cafeData.name;
            
            // Add to cafes list if not already added
            if (!processedCafes.has(cafeId)) {
              processedCafes.add(cafeId);
            }
          }
        } else {
          cafeName = cafeCache[cafeId].name;
        }
        
        // Add review with cafe info
        reviewsData.push({
          ...reviewDoc.data(),
          id: reviewDoc.id,
          cafeId,
          cafeName
        });
      }
      
      // Update cafes list from cache
      const cafesList = [];
      for (const cafeId of processedCafes) {
        cafesList.push({
          id: cafeId,
          ...cafeCache[cafeId]
        });
      }
      
      // Update state
      if (isReset) {
        setReviews(reviewsData);
        setCafes(prevCafes => {
          // Merge new cafes with existing ones
          const cafeIds = new Set(prevCafes.map(cafe => cafe.id));
          const newCafes = cafesList.filter(cafe => !cafeIds.has(cafe.id));
          return [...prevCafes, ...newCafes];
        });
      } else {
        setReviews(prevReviews => [...prevReviews, ...reviewsData]);
        setCafes(prevCafes => {
          // Merge new cafes with existing ones
          const cafeIds = new Set(prevCafes.map(cafe => cafe.id));
          const newCafes = cafesList.filter(cafe => !cafeIds.has(cafe.id));
          return [...prevCafes, ...newCafes];
        });
      }
      
      // Update sentiment data for all reviews
      if (reviews.length > 0) {
        const sentiment = analyzeSentiment([...reviews, ...reviewsData]);
        setSentimentData(sentiment);
      }
      
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Handle loading more reviews
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMoreReviews) {
      fetchReviews();
    }
  };

  // Review skeleton for loading state
  const ReviewSkeleton = () => (
    <div className="border border-gray-200 rounded-lg p-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 w-24 bg-gray-100 rounded"></div>
        </div>
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
      </div>
      <div className="mt-3 h-3 w-full bg-gray-100 rounded mb-2"></div>
      <div className="h-3 w-3/4 bg-gray-100 rounded"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Review Feedback</h2>
            
            {/* Modern filter buttons */}
            <div className="bg-gray-100 p-1 rounded-lg inline-flex">
              <button 
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedFilter === 'all' 
                    ? 'bg-white shadow-sm text-[#6B7AEE]' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setSelectedFilter('positive')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedFilter === 'positive' 
                    ? 'bg-white shadow-sm text-green-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Positive
              </button>
              <button 
                onClick={() => setSelectedFilter('neutral')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedFilter === 'neutral' 
                    ? 'bg-white shadow-sm text-yellow-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Neutral
              </button>
              <button 
                onClick={() => setSelectedFilter('negative')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedFilter === 'negative' 
                    ? 'bg-white shadow-sm text-red-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Negative
              </button>
            </div>
          </div>
          
          <div className="relative">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <ReviewSkeleton key={i} />
                ))}
              </div>
            ) : (
              <>
                {isLoadingMore && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                    <div className="h-8 w-8 border-2 border-[#6B7AEE] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg 
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <p className="mt-2">No reviews found with the selected filter.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review, index) => (
                      <div 
                        key={index} 
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group"
                      >
                        <div className="flex justify-between items-start cursor-pointer">
                          <div>
                            <a className="font-medium text-[#B07242]" href={'/cafe/'+review.cafeId}>
                              {review.cafeName}
                            </a>
                            <p className="text-sm text-gray-500">
                              By {review.user || 'Anonymous'} • {new Date(review.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <div className="flex mr-2">
                              {[...Array(5)].map((_, i) => (
                                <svg 
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                  xmlns="http://www.w3.org/2000/svg" 
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm font-medium">{review.rating}/5</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-3">
                          <p className="text-gray-700">{review.text}</p>
                          
                          {(review.noiseRating || review.seatingRating || review.wifiRating) && (
                            <div className="flex flex-wrap gap-2">
                              {review.noiseRating && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  Noise: {review.noiseRating}/5
                                </span>
                              )}
                              {review.seatingRating && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  Seating: {review.seatingRating}/5
                                </span>
                              )}
                              {review.wifiRating && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  WiFi: {review.wifiRating}/5
                                </span>
                              )}
                            </div>
                          )}
                          
                          <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200">
                              Respond
                            </button>
                            <button className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200">
                              Flag
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Load more button */}
                    {hasMoreReviews && (
                      <div className="flex justify-center mt-6">
                        <button 
                          onClick={handleLoadMore}
                          disabled={isLoadingMore}
                          className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          {isLoadingMore ? 'Loading...' : 'Load More Reviews'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <ReportedReviews reviews={reportedReviews}/>
      </div>
    </div>
  );
}

export default FeedbackDashboard;