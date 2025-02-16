import React from 'react';

function CafeCard({ cafe }) {
  return (
    <div className="w-80 flex-shrink-0 bg-white rounded-lg shadow-lg overflow-auto no-scrollbar max-h-[22rem] m-4">
      {/* Cafe Image */}
      <img
        className="w-full h-48 object-cover"
        src={cafe.image || '/placeholder.png'}
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
          <span className="ml-1 text-gray-800">{cafe.stars}</span>
          <span className="ml-2 text-gray-600">({cafe.review_count} reviews on Yelp)</span>
        </div>

        {/* Below content is temporarily commented out while we fix UI & database */}

        {/* Categories */}
        {/* <p className="text-gray-800 mb-4">
          <strong>Categories:</strong> {cafe.categories}
        </p> */}

        {/* Amenities */}
        {/* <div className="mb-4">
          <p className="text-gray-800 font-medium mb-2">Amenities:</p>
          <ul className="list-disc list-inside text-gray-600">
            {cafe.attributes &&
              Object.entries(cafe.attributes).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {value}
                </li>
              ))}
          </ul>
        </div> */}

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
  );
}

export default CafeCard;