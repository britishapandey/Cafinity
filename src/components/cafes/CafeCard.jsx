import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useMatch } from "react-router-dom";
import { db, auth } from '../../config/firebase';
import { doc, query, addDoc, deleteDoc, collection, where, getDocs } from 'firebase/firestore';

function CafeCard({ cafe, onHover, onLeave, onMapView }) {
  const navigate = useNavigate();
  const [showHours, setShowHours] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteDocId, setFavoriteDocId] = useState(null);
  const [user, setUser] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Get current user on component mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
      if (currentUser) {
        checkIfFavorite(currentUser.uid, cafe.id);
      }
    });

    return () => unsubscribe();
  }, [cafe.id]);

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

  // Handle favorite toggle with Firebase
  const handleFavoriteToggle = async (e) => {
    e.stopPropagation(); // Prevent navigation

    if (!user) {
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
          userId: user.uid,
          cafeId: cafe.id,
          cafeName: cafe.name,
          addedAt: new Date()
        });
      }

      // Update state
      setIsFavorite(!isFavorite);

      // If we just favorited, we need to get the new doc ID
      if (!isFavorite) {
        checkIfFavorite(user.uid, cafe.id);
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  };

  const handleMapView = (e, cafeData) => {
    e.stopPropagation(); // Prevent navigation
    if (onMapView) {
      onMapView(cafeData);
    } else {
      // Fallback to simply hovering if onMapView not provided
      onHover(cafeData);
    }
  };

  // Share functionality
  const toggleShareMenu = (e) => {
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  const shareMessage = `Hey, check out ${cafe.name}! Located at ${cafe.address}, ${cafe.city}, ${cafe.state}. Please visit them, they are so good!`;

  const shareOnFacebook = (e) => {
    e.stopPropagation();
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const shareOnTwitter = (e) => {
    e.stopPropagation();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const shareOnInstagram = (e) => {
    e.stopPropagation();
    // Instagram doesn't have a direct web sharing API like Facebook or Twitter
    // Common approach is to copy to clipboard and suggest sharing manually
    navigator.clipboard.writeText(shareMessage)
        .then(() => {
          alert("Message copied to clipboard! Open Instagram to share manually.");
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    setShowShareMenu(false);
  };

  if (!cafe) return null;
  const cafeId = cafe.id || cafe.cafeId;
  const isOwner = useMatch("/business");

  // define the order of days
  const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday','Sunday'];

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

  const getColorFromName = (name) => {
    const colors = [
      "bg-[#FF6B6B]", "bg-[#4ECDC4]", "bg-[#45B7D1]", "bg-[#96CEB4]",
      "bg-[#6B7AEE]", "bg-[#9D65C9]", "bg-[#FF9671]", "bg-[#59C9A5]",
      "bg-[#6C88C4]",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name) => {
    return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
  };


  return (
      <div
          className="w-80 flex-shrink-0 bg-white rounded-lg shadow-lg overflow-hidden m-4 flex flex-col"
          onMouseEnter={onHover} // Hover only on the card
          onMouseLeave={onLeave} // Leave only on the card
      >
        {/* Header with Image and Rating */}
        <div className="relative">
          <div
              className={`${getColorFromName(cafe.name)} h-[100px] flex items-center justify-center`}
              onClick={() => navigate(`/cafe/${cafe.id}`)} // Clickable header
          >
            <span className="text-4xl font-bold text-white">
              {getInitials(cafe.name)}
            </span>
          </div>

          {/* Share Button */}
          <div className="absolute top-4 left-4">
            <div className="relative">
              <button
                  onClick={toggleShareMenu}
                  className="bg-white p-2 rounded-full shadow-md flex items-center justify-center hover:bg-gray-100"
                  aria-label="Share cafe"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>

              {/* Share Menu Dropdown */}
              {showShareMenu && (
                  <div className="absolute top-full left-0 mt-2 w-[250px] bg-white rounded-md shadow-lg z-10">
                    <ul className="py-1">
                      <li>
                        <button
                            onClick={shareOnFacebook}
                            className="flex items-center w-full px-4 py-2 text-sm bg-white text-gray-700 hover:bg-gray-100"
                        >
                        <span className="w-6 h-6 mr-2 text-blue-600">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        </span>
                          Facebook
                        </button>
                      </li>
                      <li>
                        <button
                            onClick={shareOnTwitter}
                            className="flex items-center w-full px-4 py-2 text-sm bg-white text-gray-700 hover:bg-gray-100"
                        >
                        <span className="w-6 h-6 mr-2 text-blue-400">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        </span>
                          Twitter
                        </button>
                      </li>
                      <li>
                        <button
                            onClick={shareOnInstagram}
                            className="flex items-center w-full px-4 py-2 text-sm bg-white text-gray-700 hover:bg-gray-100"
                        >
                        <span className="w-6 h-6 mr-2 text-pink-500">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                          </svg>
                        </span>
                          Instagram
                        </button>
                      </li>
                    </ul>
                  </div>
              )}
            </div>
          </div>

          <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-md flex items-center">
            <span className="text-yellow-500 mr-1">★</span>
            <span className="font-semibold">{Number(cafe.stars).toFixed(1)}</span>
            <span className="text-xs text-gray-600 ml-1">({cafe.review_count})</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {/* Modified: Added flex container for name and favorite icon */}
            <div className="flex justify-between items-center mb-2">
              <h3
                  className="text-xl font-semibold text-gray-800"
                  onClick={() => navigate(`/cafe/${cafe.id}`)}
              >
                {cafe.name}
              </h3>
              <div className="flex items-center">
                <svg
                    onClick={handleFavoriteToggle}
                    className={`w-6 h-6 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'} cursor-pointer mr-2`}
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
            </div>

            <div className="text-gray-600 mb-4 flex items-start cursor-pointer" onClick={(e) => handleMapView(e, cafe)}>
              <svg className="w-5 h-5 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="leading-snug">
                {cafe.address}<br />
                {cafe.city}, {cafe.state} {cafe.postal_code}
              </p>
            </div>

            {cafe.hours && (
                <div className={`border ${!showHours ? "border-none" : "border-gray-50"} rounded-lg`}>
                  <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent navigation
                        setShowHours(!showHours);
                      }}
                      className="w-[90%] py-2 flex justify-between items-center text-left bg-gray-50 hover:bg-gray-100 border-none transition-colors rounded-lg"
                  >
                    <div className="flex items-center w-full justify-center gap-2">
                      <span className="text-gray-600">Opening Hours</span>
                      <svg
                          className={`w-5 h-5 text-gray-400 transform transition-transform ${showHours ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  {showHours && (
                      <div className="px-4 pb-3 text-sm text-gray-600 bg-white">
                        {Object.entries(cafe.hours)
                            .sort(([dayA], [dayB]) => DAY_ORDER.indexOf(dayA) - DAY_ORDER.indexOf(dayB))
                            .map(([day, hours]) => (
                                <div key={day} className="flex justify-between py-1">
                                  <span className="font-medium">{day}:</span>
                                  <span>{formatHours(hours)}</span>
                                </div>
                            ))}
                      </div>
                  )}
                </div>
            )}
          </div>
        </div>

        {isOwner && (<Link to={`/editcafe/${cafeId}`} className="block no-underline">
          <div className="p-4 border-t">
            <button
                className="w-full bg-[#6B7AEE] text-white px-4 py-2 m-auto rounded-lg hover:bg-[#5563d3] transition-colors"
                onClick={(e) => e.stopPropagation()} // Prevent outer div click
            >
              Manage Cafe
            </button>
          </div>
        </Link>)}

      </div>
  );
}

export default CafeCard;
