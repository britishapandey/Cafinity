import React, {useState} from 'react';
import { FlagIcon, Star } from 'lucide-react';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../config/firebase.js';
import getCafesCollection from '../../utils/cafeCollection';
import { createNotification, createReviewNotification, createFlaggedReviewNotification } from '../../models/NotificationModel';
import filter from 'leo-profanity';
import OpenAI from 'openai';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // testing only
});

function Reviews({
    reviews,
    newReview,
    handleInputChange,
    noiseRating,
    setNoiseRating,
    seatingRating,
    setSeatingRating,
    wifiRating,
    setWifiRating,
    handleReviewSubmit: originalHandleReviewSubmit,
    currentUser,
    reviewError,
    cafe
  }){
    const [loadingAISummary, setLoadingAISummary] = useState(false);
    const [aiSummary, setAISummary] = useState("");
    // Handler to generate an AI summary of reviews using the OpenAI package
    const handleAISummarize = async () => {
      setLoadingAISummary(true);
      // Concatenate review texts into one prompt
      const reviewsText = reviews.map((r) => r.text).join("\n");
      const prompt = `Summarize the following cafe reviews in a concise paragraph, no more than 3 sentences:\n\n${reviewsText}`;
      
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 100,
        });
      
        if (response.choices && response.choices.length > 0) {
          setAISummary(response.choices[0].message.content.trim());
        } else {
          setAISummary("No summary generated.");
        }
      } catch (error) {
        console.error("Error summarizing reviews:", error);
        setAISummary("Error generating summary.");
      } finally {
        setLoadingAISummary(false);
      }
    };

    // Wrapper for the review submission to handle notifications
    const handleReviewSubmit = async (e) => {
      try {
        // Call the original handler first
        await originalHandleReviewSubmit(e);
        
        // After successful review submission, create a notification for the cafe owner
        if (cafe && cafe.ownerId) {
          // Get the latest review (the one just added)
          const reviewsCollectionRef = collection(db, "cafes", cafe.id, "reviews");
          const reviewsQuery = query(
            reviewsCollectionRef,
            where("userId", "==", currentUser.uid),
            where("date", ">=", new Date(Date.now() - 60000).toISOString()) // Last minute
          );
          
          const reviewsSnapshot = await getDocs(reviewsQuery);
          
          if (!reviewsSnapshot.empty) {
            const latestReview = {
              id: reviewsSnapshot.docs[0].id,
              ...reviewsSnapshot.docs[0].data()
            };
            
            // Create notification for cafe owner
            await createReviewNotification(
              latestReview,
              cafe.id,
              cafe.name,
              cafe.ownerId
            );
          }
        }
      } catch (error) {
        console.error("Error handling review submission with notifications:", error);
      }
    };

    const handleReportReview = async (review) => {
      try {
        // Check if user is authenticated
        if (!auth.currentUser) {
          alert("You need to be logged in to report a review.");
          return;
        }
        
        const reportsRef = collection(db, "reported");
        const reportedReview = {
          // Review details
          reviewId: review.id,
          reviewContent: review.text,
          reviewRating: review.rating,
          
          // Cafe details
          cafeId: cafe.id,
          cafeName: cafe.name,
          
          // Original reviewer info
          reportedUser: review.user || "Anonymous",
          
          // Reporting user info
          reportedBy: auth.currentUser.displayName || auth.currentUser.email || "Unknown user",
          reporterUid: auth.currentUser.uid,
          
          // Meta info
          reason: `Flagged by ${auth.currentUser.displayName || auth.currentUser.email || "a user"}`,
          dateReported: new Date().toISOString(),
          read: false // Initialize as unread
        };
        
        // Add the report
        const reportDocRef = await addDoc(reportsRef, reportedReview);
        
        // Get all admin users to notify them
        const adminQuery = query(
          collection(db, "profiles"),
          where("role", "==", "admin")
        );
        
        const adminSnapshot = await getDocs(adminQuery);
        const adminIds = adminSnapshot.docs.map(doc => doc.id);
        
        // If there are admins, create notifications for them
        if (adminIds.length > 0) {
          await createFlaggedReviewNotification(
            { ...reportedReview, id: reportDocRef.id },
            adminIds
          );
        }
        
        alert("Report sent to admin successfully.");
      } catch (err) {
        console.error("Error reporting review:", err);
        alert("Could not report review. Please try again later.");
      }
    };

    return (
        <div className="space-y-6 lg:col-span-2">
          {/* Review Form */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
            {reviewError && <p className="text-red-500 mb-4">{reviewError}</p>}
            <form onSubmit={handleReviewSubmit} className="space-y-4">
    
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                  Overall Rating
                </label>
                <select
                  id="rating"
                  name="rating"
                  value={newReview.rating}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5B4A43] focus:border-[#5B4A43]"
                >
                  <option value="5">5 Stars - Excellent</option>
                  <option value="4">4 Stars - Very Good</option>
                  <option value="3">3 Stars - Average</option>
                  <option value="2">2 Stars - Below Average</option>
                  <option value="1">1 Star - Poor</option>
                </select>
              </div>
    
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate Amenities
                </label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Noise Level:</span>
                  <select
                    value={noiseRating || ''}
                    onChange={(e) => setNoiseRating(e.target.value ? parseInt(e.target.value) : null)}
                    className="ml-2 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#5B4A43]"
                  >
                    <option value="">Select</option>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={`noise-${num}`} value={num}>
                        {num} Star{num !== 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Seating Comfort:</span>
                  <select
                    value={seatingRating || ''}
                    onChange={(e) => setSeatingRating(e.target.value ? parseInt(e.target.value) : null)}
                    className="ml-2 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#5B4A43]"
                  >
                    <option value="">Select</option>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={`seating-${num}`} value={num}>
                        {num} Star{num !== 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">WiFi Quality:</span>
                  <select
                    value={wifiRating || ''}
                    onChange={(e) => setWifiRating(e.target.value ? parseInt(e.target.value) : null)}
                    className="ml-2 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#5B4A43]"
                  >
                    <option value="">Select</option>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={`wifi-${num}`} value={num}>
                        {num} Star{num !== 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
    
              <div>
                <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Review
                </label>
                <textarea
                  id="text"
                  name="text"
                  value={newReview.text}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5B4A43] focus:border-[#5B4A43]"
                  placeholder="Share your experience..."
                />
              </div>
    
              <button
                type="submit"
                className="w-full bg-[#5B4A43] hover:bg-[#4A3C36] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Submit Review
              </button>
            </form>
          </div>
    
          {/* Reviews List */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Reviews {reviews.length > 0 && `(${reviews.length})`}
            </h3>

            {/* AI Review Summarizer */}
            <div className="mb-4">
              <button
                onClick={handleAISummarize}
                className="bg-[#A07855] hover:bg-[#8C6A50] m-auto text-white font-semibold py-2 px-4 rounded-md block w-full text-center focus:outline-none focus:ring-2 focus:ring-[#A07855] focus:ring-opacity-50"
              >
                {loadingAISummary ? "Generating Summary..." : "Ask for AI Review Summary"}
              </button>
            </div>
            {aiSummary && (
              <div className="bg-gray-100 p-4 rounded-md mb-4">
                <h4 className="font-bold text-gray-800 mb-2">AI Summary:</h4>
                <p className="text-gray-700">{aiSummary}</p>
              </div>
            )}
    
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((review, index) => (
                    <div key={index} className={`pb-4 relative group ${index < reviews.length - 1 ? 'border-b border-gray-200' : ''}`}>
                      <div className="flex items-start mb-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                          <span className="text-lg font-medium text-gray-600 uppercase">
                            {review.user?.charAt(0) || 'A'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-900">
                              {review.user}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center mt-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                          {(review.noiseRating || review.seatingRating || review.wifiRating) && (
                            <div className="flex flex-wrap gap-2 mb-2">
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
                          <p className="text-gray-700 text-sm">{filter.clean(review.text)}</p>
                        </div>
                      </div>
                      <button className="absolute bottom-0 right-0 group-hover:opacity-100 opacity-0 transition-opacity ease-in-out p-0 bg-white border-none"
                          onClick={() => handleReportReview(review)}>
                          <FlagIcon 
                            className="text-red-500 cursor-pointer m-0"/>
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
              </div>
            )}
          </div>
        </div>
      );
}

export default Reviews;