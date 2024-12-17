import React from 'react';

function CafeCard({ cafe }) {
  return (
    <div className="max-w-xs w-full bg-white rounded-lg shadow-lg overflow-hidden m-4">
      <img 
        className="w-full h-48 object-cover"
        src={cafe.images && cafe.images.length > 0 ? cafe.images[0] : 'https://via.placeholder.com/400x200'}
        alt={`Cafe ${cafe.name}`}
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800">{cafe.name}</h3>
        <p className="text-gray-600">{cafe.address}</p>
        <p className="mt-2 text-gray-800">Rating: {cafe.rating}</p>
        <p className="mt-2 text-gray-800">Amenities:</p>
        <ul className="list-inside text-gray-600">
          <li>Noise: {cafe.amenities.noise}</li>
          <li>Seating: {cafe.amenities.seatingAvailability}</li>
          <li>Wi-Fi: {cafe.amenities.wifi ? 'Available' : 'Not Available'}</li>
        </ul>
        
        <div className="mt-4">
          <h4 className="font-medium text-gray-800">Hours:</h4>
          <ul className="list-disc pl-5 text-gray-600">
            {Object.keys(cafe.hours).map((day) => (
              <li key={day}>
                {day.charAt(0).toUpperCase() + day.slice(1)}: {cafe.hours[day].open} - {cafe.hours[day].close}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4">
          <h4 className="font-medium text-gray-800">Images:</h4>
          <div className="flex space-x-2">
            {cafe.images && cafe.images.slice(0, 3).map((image, index) => (
              <img 
                key={index}
                className="w-16 h-16 object-cover rounded-md"
                src={image}
                alt={`Cafe ${cafe.name} Image ${index}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CafeCard;
