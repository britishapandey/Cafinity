import React from 'react';
import { useParams } from "react-router-dom";

function CafeView({ cafes }) {

  // idk how to put these two lines of logic in App.jsx so they are here
  const { id } = useParams();
  var cafe = cafes.find((c) => c.id === id); // not currently working

  // error handling logic (it is always an error rn)
  if (!cafe) return <h1>Cafe Not Found</h1>;

  
  return (
    <div>

        {/*
        big photo 
        name
        address
        hours
        stars and reviews
        available amenities

        make it like. available to press backwards button on top left. 
        it's its own page not layered. but back arrow will bring u back to where u were before

        basically copy pasted from cafecard rn bc i cannot load this yet to work on
        */}

        <img classname="" src={cafe.image} alt={cafe.name}></img>
        
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
        

export default CafeView;