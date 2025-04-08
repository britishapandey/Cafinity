import React, { useState } from 'react';
import { useNavigate, Link, useMatch } from "react-router-dom";

function CafeCard({ cafe, onHover, onLeave }) {
  const navigate = useNavigate();
  const [showHours, setShowHours] = useState(false);
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
      className="w-80 flex-shrink-0 bg-white rounded-lg shadow-lg overflow-hidden m-4 flex flex-col cursor-pointer"
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
        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-md flex items-center">
          <span className="text-yellow-500 mr-1">★</span>
          <span className="font-semibold">{Number(cafe.stars).toFixed(1)}</span>
          <span className="text-xs text-gray-600 ml-1">({cafe.review_count})</span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2" onClick={() => navigate(`/cafe/${cafe.id}`)}>
            {cafe.name}
          </h3>
          <div className="text-gray-600 mb-4 flex items-start">
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