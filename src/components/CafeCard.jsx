import React from 'react';
import { useNavigate } from "react-router-dom";

function CafeCard({ cafe }) {
  
  // navigation for going to cafeview
  const navigate = useNavigate();

  // oh wow all of this needs work. good info to almost all have here tho
  return (
    <div 
      className="max-w-sm w-full bg-white rounded-lg shadow-lg overflow-hidden m-4" 
      onClick={() => navigate(`/cafe/${cafe.id}`)}
    >
      
      {/* Cafe Image */}
      <img
            className="w-full h-48 object-cover"
            src={cafe.image || '/path/to/local/placeholder.jpg'}
            alt={`Cafe ${cafe.name}`}
        />

      {/* Cafe Details */}
      <div className="p-6">
            {/* Cafe Name */}
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{cafe.name}</h3>

            {/* Rating */}
            <div className="flex items-center mb-4">
            <span className="text-yellow-500">★</span>
            <span className="ml-1 text-gray-800">{cafe.stars}</span>
            <span className="ml-2 text-gray-600">({cafe.review_count} reviews)</span>
            </div>

            {/* Categories */}
            <p className="text-gray-800 mb-4">
            <strong>Categories:</strong> {cafe.categories}
            </p>

            {/* Amenities */}
            <div className="mb-4">
            <p className="text-gray-800 font-medium mb-2">Amenities:</p>
            <ul className="list-disc list-inside text-gray-600">
                {cafe.attributes &&
                Object.entries(cafe.attributes).map(([key, value]) => (
                    <li key={key}>
                    <strong>{key}:</strong> {value}
                    </li>
                ))}
            </ul>
            </div>

            {/* Hours */}
            <div className="mb-4">
            <p className="text-gray-800 font-medium mb-2">Hours:</p>
            <ul className="list-disc list-inside text-gray-600">
                {cafe.hours &&
                Object.entries(cafe.hours).map(([day, hours]) => (
                    <li key={day}>
                    <strong>{day}:</strong> {hours}
                    </li>
                ))}
            </ul>
            </div>
        </div>
    </div>
  );
}

export default CafeCard;