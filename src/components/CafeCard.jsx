import React, { useState } from 'react';

function CafeCard({ cafe }) {
  const [showHours, setShowHours] = useState(false);

  const getColorFromName = (name) => {
    const colors = [
      "bg-[#FF6B6B]",
      "bg-[#4ECDC4]",
      "bg-[#45B7D1]",
      "bg-[#96CEB4]",
      "bg-[#6B7AEE]",
      "bg-[#9D65C9]",
      "bg-[#FF9671]",
      "bg-[#59C9A5]",
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
    <div className="w-80 flex-shrink-0 bg-white rounded-lg shadow-lg overflow-hidden m-4 flex flex-col">
      {/* Header with Image and Rating */}
      <div className="relative">
        <div
          className={`${getColorFromName(
            cafe.name
          )} h-[100px] flex items-center justify-center`}
        >
          <span className="text-4xl font-bold text-white">
            {getInitials(cafe.name)}
          </span>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-md flex items-center">
          <span className="text-yellow-500 mr-1">★</span>
          <span className="font-semibold">{Number(cafe.stars).toFixed(1)}</span>
          <span className="text-xs text-gray-600 ml-1">
            ({cafe.review_count})
          </span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Cafe Name */}
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {cafe.name}
          </h3>

          {/* Address */}
          <div className="text-gray-600 mb-4 flex items-start">
            <svg
              className="w-5 h-5 mr-2 mt-1 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="leading-snug">
              {cafe.address}
              <br />
              {cafe.city}, {cafe.state} {cafe.postal_code}
            </p>
          </div>

          {/* Hours Accordion */}
          {cafe.hours && (
            <div
              className={`border ${
                !showHours ? "border-none" : "border-gray-50"
              } rounded-lg`}
            >
              <button
                onClick={() => setShowHours(!showHours)}
                className=" w-[90%] py-2 flex justify-between items-center text-left bg-gray-50 hover:bg-gray-100 border-none transition-colors rounded-lg"
              >
                <div className="flex items-center w-full justify-center gap-2">
                  <span className="text-gray-600">Opening Hours</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transform transition-transform ${
                      showHours ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {showHours && (
                <div className="px-4 pb-3 text-sm text-gray-600 bg-white">
                  {Object.entries(cafe.hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between py-1">
                      <span className="font-medium">{day}:</span>
                      <span>{hours}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Button at Bottom */}
      <div className="p-4 border-t">
        <button className="w-full bg-[#6B7AEE] text-white px-4 py-2 rounded-lg hover:bg-[#5563d3] transition-colors">
          View Cafe
        </button>
=======
import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react'; // Import Star icon for consistency

function CafeCard({ cafe }) {
  // Handle missing data gracefully
  if (!cafe) return null;
  
  // Make sure cafe.id exists
  const cafeId = cafe.id || '';
  
  // Safely access nested properties
  const address = cafe.address || '';
  const city = cafe.city || '';
  const state = cafe.state || '';
  const postal_code = cafe.postal_code || '';
  
  // Get the first image or use placeholder
  const image = cafe.images && cafe.images.length > 0 
    ? cafe.images[0] 
    : '/placeholder.png';
  
  // Handle rating and review count safely
  const rating = cafe.rating || 0;
  const reviewCount = cafe.reviewCount || 0;

  return (
    <Link to={`/cafe/${cafeId}`} className="block no-underline"> 
      <div className="w-80 flex-shrink-0 bg-white rounded-lg shadow-lg overflow-hidden max-h-[22rem] m-4 hover:scale-105 transition-transform duration-200 hover:shadow-xl">
        {/* Cafe Image */}
        <img
          className="w-full h-48 object-cover"
          src={image}
          alt={`Cafe ${cafe.name || 'Unknown'}`}
        />
        
        {/* Cafe Details */}
        <div className="p-6">
          {/* Cafe Name */}
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{cafe.name || 'Unnamed Cafe'}</h3>
          
          {/* Address - only show parts that exist */}
          <p className="text-gray-600 mb-4">
            {[address, city, state, postal_code].filter(Boolean).join(', ')}
          </p>
          
          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex items-center mr-2">
              {[...Array(Math.floor(rating))].map((_, index) => (
                <Star key={index} color="#FFC107" fill="#FFC107" size={18} />
              ))}
              {[...Array(5 - Math.floor(rating))].map((_, index) => (
                <Star key={index} color="#FFC107" size={18} />
              ))}
            </div>
            <span className="ml-1 text-gray-600 text-sm">
              {reviewCount > 0 ? `(${reviewCount} reviews)` : '(No reviews yet)'}
            </span>
          </div>
          
          {/* Hours - if available */}
          {cafe.hours && Object.keys(cafe.hours).length > 0 && (
            <div className="mb-4">
              <p className="text-gray-800 font-medium mb-2">Hours:</p>
              <ul className="list-disc list-inside text-gray-600 text-sm">
                {Object.entries(cafe.hours).map(([day, hours]) => (
                  <li key={day}>
                    <strong>{day}:</strong> {hours}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Available Amenities - if available */}
          {cafe.amenities && (
            <div className="text-xs text-gray-500 mt-2">
              {cafe.amenities.wifi ? 'WiFi • ' : ''}
              {cafe.amenities.noise ? `${cafe.amenities.noise} noise • ` : ''}
              {cafe.amenities.seatingAvailability ? cafe.amenities.seatingAvailability : ''}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default CafeCard;
