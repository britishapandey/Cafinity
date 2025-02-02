import React, { useState } from 'react';
import CafeCard from './CafeCard';

function CafeList({ cafes }) {
  const [visibleCafes, setVisibleCafes] = useState(5); // Number of cafes to display initially

  // Function to handle dropdown change
  const handleLoadMore = (e) => {
    setVisibleCafes(Number(e.target.value)); // Update the number of visible cafes
  };

  return (
    <div>
      {/* Display the visible cafes */}
      <div className="cafe-list flex flex-wrap justify-center">
        {cafes.slice(0, visibleCafes).map((cafe) => (
          <CafeCard key={cafe.id || cafe.business_id} cafe={cafe} />
        ))}
      </div>

      {/* Dropdown to load more cafes */}
      <div className="flex justify-center mt-4">
        <select
          onChange={handleLoadMore}
          value={visibleCafes}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <option value={5}>Show 5 Cafes</option>
          <option value={10}>Show 10 Cafes</option>
          <option value={20}>Show 20 Cafes</option>
          <option value={cafes.length}>Show All Cafes</option>
        </select>
      </div>
    </div>
  );
}

export default CafeList;