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