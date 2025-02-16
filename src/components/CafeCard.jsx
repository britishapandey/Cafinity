import React from 'react';
import { Link } from 'react-router-dom';

function CafeCard({ cafe }) {
  return (
    <Link to={`/cafe/${cafe.id}`} className="block">
      <div className="w-80 flex-shrink-0 bg-white rounded-lg shadow-lg overflow-auto no-scrollbar max-h-[22rem] m-4 hover:scale-105 transition-transform duration-200 hover:shadow-xl">
        {/* Cafe Image */}
        <img
          className="w-full h-48 object-cover"
          src={
            cafe.images && cafe.images.length > 0 
              ? cafe.images[0] 
              : cafe.image || '/placeholder.png'
          }
          alt={`Cafe ${cafe.name}`}
        />

        {/* Cafe Details */}
        <div className="p-6">
          {/* Cafe Name */}
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{cafe.name}</h3>

          {/* Address */}
          <p className="text-gray-600 mb-4">
            {cafe.address}, {cafe.city}, {cafe.state} {cafe.postal_code}
          </p>

          {/* Rating */}
          <div className="flex items-center mb-4">
            <span className="text-yellow-500">★</span>
            <span className="ml-1 text-gray-800">{cafe.stars || cafe.rating}</span>
            <span className="ml-2 text-gray-600">
              ({cafe.review_count} reviews on Yelp)
            </span>
          </div>

          {/* Categories (Commented out for future use) */}
          {/* <p className="text-gray-800 mb-4">
            <strong>Categories:</strong> {cafe.categories}
          </p> */}

          {/* Amenities */}
          <div className="mb-4">
            <p className="text-gray-800 font-medium mb-2">Amenities:</p>
            <ul className="list-disc list-inside text-gray-600">
              <li>Noise: {cafe.amenities?.noise || 'Unknown'}</li>
              <li>Seating: {cafe.amenities?.seatingAvailability || 'Unknown'}</li>
              <li>Wi-Fi: {cafe.amenities?.wifi ? 'Available' : 'Not Available'}</li>
              {/* Merged Additional Attributes */}
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

          {/* Call to Action Button */}
          <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            View Cafe
          </button>
        </div>
      </div>
    </Link>
  );
}

export default CafeCard;
