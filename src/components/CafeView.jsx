import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Star, ArrowLeft, Image as ImageIcon } from 'lucide-react';

function CafeView() {
  const [cafeList, setCafeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    user: '',
    rating: 5,
    text: '',
  });
  const [noiseRating, setNoiseRating] = useState(null);
  const [seatingRating, setSeatingRating] = useState(null);
  const [wifiRating, setWifiRating] = useState(null);
  
  const { id } = useParams();
  const cafesCollectionRef = collection(db, "cafes");

  useEffect(() => {
    const getCafeList = async () => {
      try {
        const data = await getDocs(cafesCollectionRef);
        const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setCafeList(filteredData);
      } catch (err) {
        console.error(err);
        setError("Failed to load cafe data");
      } finally {
        setLoading(false);
      }
    };
    getCafeList();
  }, []);

  const formatHours = (hoursString) => {
    if (!hoursString || typeof hoursString !== 'string') return 'Closed';
    const [start, end] = hoursString.split('-');

    const formatTime = (time) => {
      const [hours, minutes] = time.split(':');
      const hourNum = parseInt(hours);
      const minNum = parseInt(minutes) || 0;
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const hour12 = hourNum % 12 || 12;
      const minuteStr = minNum < 10 ? `0${minNum}` : minNum;
      return `${hour12}:${minuteStr}${period}`;
    };

    return `${formatTime(start)}-${formatTime(end)}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview((prevReview) => ({
      ...prevReview,
      [name]: value,
    }));
  };

  const [currentUser, setCurrentUser] = useState(null);

  // Add auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if(!currentUser) {
      setError("Please sign in to submit a review");
      return;
    }

    try {
      const cafeDocRef = doc(db, "cafes", id);
      const reviewToAdd = {
        user: newReview.user || "Anonymous",
        rating: parseInt(newReview.rating),
        text: newReview.text,
        noiseRating: noiseRating,
        seatingRating: seatingRating,
        wifiRating: wifiRating,
        date: new Date().toISOString()
      };
      const updatedReviews = [...(reviews || []), reviewToAdd];
      await updateDoc(cafeDocRef, { reviews: updatedReviews });
      setReviews(updatedReviews);
      setNewReview({ user: "", rating: 5, text: "" });
      setNoiseRating(null);
      setSeatingRating(null);
      setWifiRating(null);
    } catch (error) {
      console.error("Error submitting review:", error);
      setError("Error submitting review: " + error.message);
    }
  };

  const cafe = cafeList.find((c) => c.id === id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500">Loading cafe details...</div>
      </div>
    );
  }

  if (error || !cafe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <p className="text-red-500 mb-4">{error || "Cafe not found"}</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-[#5B4A43] text-white py-2 px-6 rounded-md hover:bg-[#4A3C36] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center">
          <button 
            onClick={() => window.history.back()}
            className="text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">{cafe.name}</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Cafe Hero Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          {cafe.images && cafe.images.length > 0 ? (
            <div className="relative h-64 sm:h-80 md:h-96">
              <img
                className="w-full h-full object-cover"
                src={cafe.images[0].url}
                alt={`Cafe ${cafe.name}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          ) : (
            <div className="h-64 sm:h-80 md:h-96 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="mx-auto text-gray-400" size={48} />
                <p className="mt-2 text-gray-500">No images available</p>
              </div>
            </div>
          )}
        </div>

        {/* Cafe Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cafe Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{cafe.name}</h2>
              <p className="text-gray-600 mb-4">
                {cafe.address}, {cafe.city}, {cafe.state} {cafe.postal_code}
              </p>

              <div className="flex items-center mb-6">
                <div className="flex items-center mr-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < Math.floor(cafe.stars) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                  <span className="ml-2 text-gray-700 font-medium">
                    {cafe.stars} ({cafe.review_count} reviews)
                  </span>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {cafe.categories.split(', ')[0]}
                </span>
              </div>

              {/* Hours Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Hours</h3>
                <div className="grid grid-cols-2 gap-2">
                  {cafe.hours &&
                    Object.entries(cafe.hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="font-medium text-gray-700">{day}:</span>
                        <span className="text-gray-600">{formatHours(hours)}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Amenities Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {cafe.attributes &&
                    Object.entries(cafe.attributes)
                      .filter(([_, value]) => {
                        if (typeof value === 'string') {
                          try {
                            const parsed = JSON.parse(
                              value
                                .replace(/'/g, '"')
                                .replace(/\bTrue\b/g, 'true')
                                .replace(/\bFalse\b/g, 'false')
                                .replace(/\bNone\b/g, 'null')
                                .replace(/u"([^"]+)"/g, '"$1"')
                            );
                            return parsed !== false && parsed !== null;
                          } catch (e) {
                            return value !== 'False' && value !== 'None';
                          }
                        }
                        return value !== false && value !== null;
                      })
                      .map(([key, rawValue]) => {
                        let value = rawValue;
                        if (typeof value === 'string') {
                          try {
                            value = JSON.parse(
                              value
                                .replace(/'/g, '"')
                                .replace(/\bTrue\b/g, 'true')
                                .replace(/\bFalse\b/g, 'false')
                                .replace(/\bNone\b/g, 'null')
                                .replace(/u"([^"]+)"/g, '"$1"')
                            );
                          } catch (e) {
                            // Not JSON, use as-is
                          }
                        }

                        let displayValue = '';
                        if (typeof value === 'object' && value !== null) {
                          displayValue = Object.entries(value)
                            .filter(([_, v]) => v === true)
                            .map(([subKey]) => subKey)
                            .join(', ');
                        } else if (value === true) {
                          displayValue = 'Yes';
                        } else {
                          displayValue = value;
                        }

                        return (
                          <div key={key} className="flex items-start">
                            <div className="flex-shrink-0 h-5 w-5 text-green-500 mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <span className="text-gray-600 ml-1">{displayValue}</span>
                            </div>
                          </div>
                        );
                      })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Reviews */}
          <div className="space-y-6">
            {/* Review Form */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name (optional)
                  </label>
                  <input
                    type="text"
                    id="user"
                    name="user"
                    value={newReview.user}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5B4A43] focus:border-[#5B4A43]"
                    placeholder="Anonymous"
                  />
                </div>

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

                {/* Amenity Ratings */}
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

              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((review, index) => (
                      <div key={index} className={`pb-4 ${index < reviews.length - 1 ? 'border-b border-gray-200' : ''}`}>
                        <div className="flex items-start mb-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                            <span className="text-lg font-medium text-gray-600 uppercase">
                              {review.user.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-gray-900">
                                {review.user || 'Anonymous'}
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
                            {/* Amenity Ratings */}
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
                            <p className="text-gray-700 text-sm">{review.text}</p>
                          </div>
                        </div>
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
        </div>
      </main>
    </div>
  );
}

export default CafeView;