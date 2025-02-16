import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { db, auth } from '../config/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

function CafeView({ }) {

  const cafesCollectionRef = collection(db, "cafes"); // Firebase collection ref
  const [cafeList, setCafeList] = useState([]); // State for cafe list
  const { id } = useParams();

    // Fetch cafe list from Firebase
    useEffect(() => {
        const getCafeList = async () => {
        try {
            const data = await getDocs(cafesCollectionRef);
            const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            setCafeList(filteredData);
        } catch (err) {
            console.error(err);
        }
        };

        getCafeList();
    }, []); // empty dependency array → runs once when component mounts

  // console.log(cafeList);
  // console.log(id);
  const cafe = cafeList.find((c) => c.id === id); 

  // error handling logic
  if (!cafe) return <h1>Loading...</h1>;
  

  return (
  <div>

  {/* need to add placeholder img */}

  <img className="" src={cafe.image} alt={cafe.name}></img> 

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

    {/* Amenities */}
    <div className="mb-4">
    <p className="text-gray-800 font-medium mb-2">Amenities:</p>
    <ul className="list-disc list-inside text-gray-600">
    {cafe.attributes &&
    Object.entries(cafe.attributes)
      .map(([key, rawValue]) => {
        let value = rawValue;

        // convert json like strings into real objects
        if (typeof value === "string") {
          try {
            value = value
            .replace(/'/g, '"') // Convert single quotes to double quotes
            .replace(/\bTrue\b/g, "true")
            .replace(/\bFalse\b/g, "false")
            .replace(/\bNone\b/g, "null")
            .replace(/u"([^"]+)"/g, '"$1"'); // Handle u'...' strings
            value = JSON.parse(value);
          } catch (e) {
            console.error("JSON Parse Error:", rawValue);
            return null; // skip invalid values
          }
        }

        if (typeof value === "object" && value !== null) { // skip false/empty values
            if (!Object.values(value).some((v) => v === true)) return null;
            } else if (value === false) {
            return null;
        }

        return (
        <li key={key}>
            <strong>{key}:</strong>{" "}
            {typeof value === "object"
            ? Object.entries(value)
                .filter(([_, v]) => v === true)
                .map(([subKey]) => subKey)
                .join(", ")
            : value}
        </li>
        );
    })}

    </ul>
    </div>

  </div>
  </div>
  );
}
        

export default CafeView;