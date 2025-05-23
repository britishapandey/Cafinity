// Updates to CafeView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../../config/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, updateDoc, addDoc, query, where, deleteDoc, getDoc } from 'firebase/firestore';
import { Star, ArrowLeft, ArrowRight, Image as ImageIcon, Store } from 'lucide-react';
import Reviews from "../reviews/Review.jsx";
import getCafesCollection from '../../utils/cafeCollection';

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
  const [attributeRatings, setAttributeRatings] = useState({
    BikeParking: null,
    BusinessAcceptsCreditCards: null,
    OutdoorSeating: null,
    RestaurantsGoodForGroups: null,
    DriveThru: null,
    WiFi: null,
    NoiseLevel: null,
  })
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteDocId, setFavoriteDocId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  
  const [reviewError, setReviewError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  
  useEffect(() => {
    const getCafeList = async () => {
      try {
        const cafesCollectionRef = getCafesCollection();
        const data = await getDocs(cafesCollectionRef);
        const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setCafeList(filteredData);
  
        // Find the current cafe
        const currentCafe = filteredData.find((c) => c.id === id);
        if (currentCafe) {
          // Fetch reviews from subcollection
          const reviewsCollectionRef = collection(db, "googleCafes", id, "reviews");
          const reviewsSnapshot = await getDocs(reviewsCollectionRef);
          const reviewsData = reviewsSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id // Include the review ID
          }));
          
          setReviews(reviewsData);
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

  // Add auth state listener and get user role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Check if cafe is favorite
        checkIfFavorite(user.uid, id);
        
        // Get user role
        try {
          const userDocRef = doc(db, "profiles", user.uid);
          const userSnapshot = await getDoc(userDocRef);
          
          if (userSnapshot.exists()) {
            setUserRole(userSnapshot.data().role);
          }
        } catch (err) {
          console.error("Error getting user role:", err);
        }
      }
    });
    
    return () => unsubscribe();
  }, [id]);

  const checkIfFavorite = async (userId, cafeId) => {
    try {
      // Using a top-level "favorites" collection with queries
      const favoritesRef = collection(db, "favorites");
      const q = query(
          favoritesRef,
          where("userId", "==", userId),
          where("cafeId", "==", cafeId)
      );

      const querySnapshot = await getDocs(q);
      const isFav = !querySnapshot.empty;
      setIsFavorite(isFav);

      // Save the document ID for deletion later if needed
      if (isFav) {
        setFavoriteDocId(querySnapshot.docs[0].id);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const handleFavoriteToggle = async (e) => {
    e.stopPropagation(); // Prevent navigation

    if (!currentUser) {
      // Optionally redirect to login or show a message
      alert("Please log in to save favorites");
      return;
    }

    try {
      if (isFavorite && favoriteDocId) {
        // Remove from favorites
        await deleteDoc(doc(db, "favorites", favoriteDocId));
      } else {
        // Add to favorites
        await addDoc(collection(db, "favorites"), {
          userId: currentUser.uid,
          cafeId: cafe.id,
          cafeName: cafe.name,
          addedAt: new Date()
        });
      }

      // Update state
      setIsFavorite(!isFavorite);

      // If we just favorited, we need to get the new doc ID
      if (!isFavorite) {
        checkIfFavorite(currentUser.uid, cafe.id);
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  };

  // Handle claiming cafe
  const handleClaimCafe = async () => {
    if (!currentUser || userRole !== 'owner') {
      alert("Only cafe owners can claim cafes.");
      return;
    }
    
    setIsClaiming(true);
    
    try {
      const cafeDocRef = doc(db, "googleCafes", id);
      
      // Check if cafe is already claimed
      const cafeDoc = await getDoc(cafeDocRef);
      if (cafeDoc.exists() && cafeDoc.data().ownerId) {
        const currentOwnerId = cafeDoc.data().ownerId;
        
        // If already claimed by this user
        if (currentOwnerId === currentUser.uid) {
          alert("You already own this cafe!");
          setIsClaiming(false);
          return;
        }
        
        // If claimed by someone else
        alert("This cafe has already been claimed by another owner.");
        setIsClaiming(false);
        return;
      }
      
      // Update cafe with owner information
      await updateDoc(cafeDocRef, {
        ownerId: currentUser.uid,
        ownerSince: new Date().toISOString()
      });
      
      // Show success message
      setClaimSuccess(true);
      
      // Redirect to business dashboard after a short delay
      setTimeout(() => {
        navigate('/business');
      }, 3000);
      
    } catch (err) {
      console.error("Error claiming cafe:", err);
      alert("Failed to claim cafe. Please try again later.");
    } finally {
      setIsClaiming(false);
    }
  };

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

  const nextImage = () => {
    const cafe = cafeList.find((c) => c.id === id);
    if (cafe?.images && cafe.images.length > 0) {
      setCurrentImageIndex(prev => 
        prev === cafe.images.length - 1 ? 0 : prev + 1
      );
    }
  };
  
  const prevImage = () => {
    const cafe = cafeList.find((c) => c.id === id);
    if (cafe?.images && cafe.images.length > 0) {
      setCurrentImageIndex(prev => 
        prev === 0 ? cafe.images.length - 1 : prev - 1
      );
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
  
    if(!currentUser) {
      setError("Please sign in to submit a review");
      return;
    }
  
    try {
      const reviewsCollectionRef = collection(db, "googleCafes", id, "reviews");
      const reviewToAdd = {
        user: currentUser.displayName, // Use displayName instead of name
        userId: currentUser.uid,
        rating: parseInt(newReview.rating),
        attributeRatings: attributeRatings,
        text: newReview.text,

        date: new Date().toISOString()
      };
  
      // Add review to subcollection
      const docRef = await addDoc(reviewsCollectionRef, reviewToAdd);

      // add ID to review object for notif purposes
      const reviewWithId = {
        ...reviewToAdd,
        id: docRef.id
      };
  
      // Update review count and stars in the cafe document
      await updateCafeRatingStats(id);
  
      // Update local state with the new review (including the document ID)
      setReviews(prev => [...prev, { ...reviewToAdd, id: docRef.id }]);
      
      // Reset form
      setNewReview({ user: "", rating: 5, text: "" });
      setError(null);
      setReviewError(null);

      return reviewWithId; // return the new review with ID for notif purposes
    } catch (err) { // Use err instead of error for the caught exception
      console.error("Error submitting review:", err);
      setReviewError("Error submitting review: " + (err?.message || "Unknown error"));
      throw err; // Rethrow error for notification handling
    }
  };

  const updateCafeRatingStats = async (cafeId) => {
    try {
      const reviewsCollectionRef = collection(db, "googleCafes", cafeId, "reviews");
      const reviewsSnapshot = await getDocs(reviewsCollectionRef);
      const reviews = reviewsSnapshot.docs.map(doc => doc.data());
      
      const cafeDocRef = doc(db, "googleCafes", cafeId);
      
      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;
      
      // Update cafe document with new stats
      await updateDoc(cafeDocRef, {
        review_count: reviews.length,
        stars: parseFloat(averageRating)
      });
    } catch (err) {
      console.error("Error updating cafe rating stats:", err);
    }
  };

  const cafe = cafeList.find((c) => c.id === id);
  
  // Get array of all image URLs
  const getImageUrls = () => {
    if (!cafe || !cafe.images) return [];
    
    return cafe.images.map(image => {
      if (typeof image === 'string') {
        return image;
      }
      return image.url || null;
    }).filter(url => url !== null);
  };
  

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

  // Get the image URLs once at the component level
  const imageUrls = getImageUrls();

  // Check if cafe already has an owner
  const hasCafeOwner = Boolean(cafe.ownerId);
  // Check if current user owns this cafe
  const isCurrentUserOwner = currentUser && cafe.ownerId === currentUser.uid;

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Show claim success message */}
        {claimSuccess && (
          <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md">
            <p className="font-semibold">Congratulations!</p>
            <p>You've successfully claimed this cafe. Redirecting to your business dashboard...</p>
          </div>
        )}
        
        {/* Cafe Hero Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          {imageUrls.length > 0 ? (
            <div className="relative h-64 sm:h-80 md:h-96">
              <img
                className="w-full h-full object-cover"
                src={imageUrls[currentImageIndex]}
                alt={`Cafe ${cafe.name} - Image ${currentImageIndex + 1}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              
              {/* Navigation arrows (only show if multiple images exist) */}
              {imageUrls.length > 1 && (
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
              {imageUrls.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {imageUrls.length}
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
              <div className="flex justify-between w-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{cafe.name}</h2>
                <svg
                  onClick={handleFavoriteToggle}
                  className={`w-6 h-6 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'} cursor-pointer ml-2`}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  fill={isFavorite ? "currentColor" : "none"}
                  strokeWidth="2"
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  role="button"
                  tabIndex="0"
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              </div>
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

              {/* Cafe ownership status */}
              {hasCafeOwner && (
                <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Store className="text-blue-500 mr-2" size={20} />
                    <span className="text-sm font-medium text-blue-800">
                      {isCurrentUserOwner 
                        ? "You own this cafe" 
                        : "This cafe has been claimed by an owner"}
                    </span>
                  </div>
                </div>
              )}

              {/* Claim Cafe Button - only shown for owners who haven't claimed this cafe */}
              {userRole === 'owner' && !hasCafeOwner && !isCurrentUserOwner && (
                <div className="mb-6">
                  <button
                    onClick={handleClaimCafe}
                    disabled={isClaiming}
                    className="flex items-center justify-center w-full p-3 bg-[#A07855] text-white rounded-lg hover:bg-[#8A6744] transition-colors"
                  >
                    {isClaiming ? (
                      <>
                        <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Store className="mr-2" size={18} />
                        Claim This Cafe
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Claiming this cafe will allow you to manage its details and respond to reviews.
                  </p>
                </div>
              )}

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
            attributeRatings={attributeRatings}
            setAttributeRatings={setAttributeRatings}
            originalHandleReviewSubmit={handleReviewSubmit}
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