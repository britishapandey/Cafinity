import React from 'react';

function CafeCard({ cafe }) {
  return (
    <div className="cafe-card">
      <h3>{cafe.name}</h3>
      <p>{cafe.address}</p>
      <p>Rating: {cafe.rating}</p>
      <p>Amenities: {cafe.amenities.noise}, {cafe.amenities.seatingAvailability}, Wi-Fi: {cafe.amenities.wifi ? 'Available' : 'Not Available'}</p>
      <div>
        <h4>Hours:</h4>
        <ul>
          {Object.keys(cafe.hours).map((day) => (
            <li key={day}>
              {day.charAt(0).toUpperCase() + day.slice(1)}: {cafe.hours[day].open} - {cafe.hours[day].close}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4>Images:</h4>
        {cafe.images && cafe.images.map((image, index) => (
          <img key={index} src={image} alt={`Cafe ${cafe.name} Image ${index}`} />
        ))}
      </div>
    </div>
  );
}

export default CafeCard;
