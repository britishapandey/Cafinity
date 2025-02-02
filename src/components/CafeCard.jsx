import React from 'react';
import { Link } from 'react-router-dom'; // Import Link

function CafeCard({ cafe }) {
  return (
    <Link to={`/cafe/${cafe.id}`} className="block"> {/* Wrap the card in a Link */}
      <div className="max-w-xs w-full bg-white rounded-lg shadow-lg overflow-hidden m-4 hover:scale-105 transition-transform duration-200 hover:shadow-xl"> {/* Hover animation added here */}
        <img
          className="w-full h-48 object-cover"
          src={cafe.images && cafe.images.length > 0 ? cafe.images[0] : 'https://via.placeholder.com/400x200'}
          alt={`Cafe ${cafe.name}`}
        />
        <div className="p-4">
          <h3 className="text-xl font-semibold text-gray-800">{cafe.name}</h3>
          <p className="text-gray-600">{cafe.address}</p>
          {/* ... rest of your CafeCard content */}
          <p className="mt-2 text-gray-800">Rating: {cafe.rating}</p> {/* Keep rating for now */}
          <p className="mt-2 text-gray-800">Amenities:</p> {/* Keep amenities for now */}
          <ul className="list-inside text-gray-600">
            <li>Noise: {cafe.amenities.noise}</li>
            <li>Seating: {cafe.amenities.seatingAvailability}</li>
            <li>Wi-Fi: {cafe.amenities.wifi ? 'Available' : 'Not Available'}</li>
          </ul>
        </div>
      </div>
    </Link>
  );
}

export default CafeCard;