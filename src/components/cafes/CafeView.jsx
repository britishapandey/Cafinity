import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, auth } from '../../config/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Star, ArrowLeft, ArrowRight, Image as ImageIcon } from 'lucide-react';
import Reviews from "../reviews/Review.jsx"

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [reviewError, setReviewError] = useState(null);

  const { id } = useParams();
  const cafesCollectionRef = collection(db, "cafes");

  useEffect(() => {
    const getCafeList = async () => {
      try {
        const data = await getDocs(cafesCollectionRef);
        const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setCafeList(filteredData);

         // Find the current cafe and set its reviews
        const currentCafe = filteredData.find((c) => c.id === id);
        if (currentCafe && currentCafe.reviews) {
          setReviews(currentCafe.reviews);
      
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load cafe data");
      } finally {
        setLoading(false);
      }
    };
    getCafeList();
  }, [id]);

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

  const nextImage = () => {
    setCurrentImageIndex(prev => 
      prev === cafe.images.length - 1 ? 0 : prev + 1
    );
  };
  
  const prevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? cafe.images.length - 1 : prev - 1
    );
  };

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
        date: new Date().toISOString(),
        userID: currentUser.uid
      };

      // Use arrayUnion to add the new review without overwriting existing ones
      await updateDoc(cafeDocRef, {
        reviews: arrayUnion(reviewToAdd)
      });

      // updating review count and star upon (re)loading the page
      const data = await getDocs(cafesCollectionRef);
      const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      const currentCafe = filteredData.find((c) => c.id === id);
      await updateDoc(cafeDocRef, {
        review_count: currentCafe.reviews.length
      });

      const totalRating = currentCafe.reviews.length > 0? currentCafe.reviews.reduce((sum, review) => sum + review.rating, 0) : 0;
      const starNum = (totalRating / currentCafe.reviews.length).toFixed(1); // Return average rounded to 1 decimal place

      await updateDoc(cafeDocRef, {
        stars: starNum
      });

      // Update local state
      setReviews(prev => [...prev, reviewToAdd]);
      setNewReview({ user: "", rating: 5, text: "" });
      setNoiseRating(null);
      setSeatingRating(null);
      setWifiRating(null);
      setError(null);
      setReviewError(null);
    } catch (error) {
      console.error("Error submitting review:", error);
      setReviewError("Error submitting review: " + error.message);
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

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Cafe Hero Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          {cafe.images && cafe.images.length > 0 ? (
            <div className="relative h-64 sm:h-80 md:h-96">
              <img
                className="w-full h-full object-cover"
                src={cafe.images[currentImageIndex].url}
                alt={`Cafe ${cafe.name} - Image ${currentImageIndex + 1}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              
              {/* Navigation arrows (only show if multiple images exist) */}
              {cafe.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    aria-label="Previous image"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    aria-label="Next image"
                  >
                    <ArrowRight size={24} />
                  </button>
                </>
              )}
              
              {/* Image counter (only show if multiple images exist) */}
              {cafe.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {cafe.images.length}
                </div>
              )}
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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column - Cafe Info */}
          <div className="lg:col-span-3 space-y-6">
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
                  {cafe.categories && cafe.categories.split(', ')[0]}
                </span>
              </div>

              {/* Hours Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Hours</h3>
                <div className="grid grid-cols-1 gap-2">
                  {cafe.hours && 
                    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                      .map((day) => {
                        if (cafe.hours[day]) {
                          return (
                            <div key={day} className="flex justify-between">
                              <span className="font-medium text-gray-700">{day}:</span>
                              <span className="text-gray-600">{formatHours(cafe.hours[day])}</span>
                            </div>
                          );
                        }
                        return null;
                      })
                      .filter(Boolean) 
                  }
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
            <Reviews
            reviews={reviews}
            newReview={newReview}
            handleInputChange={handleInputChange}
            noiseRating={noiseRating}
            setNoiseRating={setNoiseRating}
            seatingRating={seatingRating}
            setSeatingRating={setSeatingRating}
            wifiRating={wifiRating}
            setWifiRating={setWifiRating}
            handleReviewSubmit={handleReviewSubmit}
            currentUser={currentUser}
            reviewError={reviewError}
            cafe={cafe}
          />
        </div>
      </main>
    </div>
  );
}

export default CafeView;