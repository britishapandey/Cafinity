import React, { useState } from 'react';

function SearchFilter({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [wifi, setWifi] = useState(false);
  const [powerOutlets, setPowerOutlets] = useState(false); // Keeping Power Outlets option for now

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch({
      searchTerm,
      wifi,
      powerOutlets, // Still passing powerOutlets for consistency
      // Removed: openNow, wheelchairAccessible, streetPrivateSeating
    });
  };

  return (
    <div className="bg-[#F0ECE3] p-5 rounded-lg mb-5 font-sans">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center mb-4">
          <div className="bg-white rounded-lg p-2 flex-grow flex items-center border border-[#A07855]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#A07855" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name"
              className="border-none outline-none text-base text-[#3D2B1F] w-full bg-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="bg-[#A07855] text-white p-2 rounded-lg border-none ml-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M12.75 6a2.25 2.25 0 01-2.25 2.25c0 .414.175.78.476 1.08l-2.81 2.81m-1.975 1.975L14.25 14.25m0 0a2.25 2.25 0 012.25 2.25c0 .414-.175.78-.476 1.08l-2.81 2.81M15.75 17.25H6M15.75 17.25a2.25 2.25 0 01-2.25-2.25c0-.414.175-.78.476-.1.08l2.81-2.81m2.81 2.81L9.75 9.75M9 6h3.75m-3.75 6h7.5m-7.5 6h3.75m3-13.5a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
            </svg>
          </button>
        </div>

        <div className="mb-4 text-[#3D2B1F] text-base">
          <label className="mr-4 inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-[#A07855] rounded mr-2 focus:ring-0 focus:ring-offset-0"
              checked={wifi}
              onChange={(e) => setWifi(e.target.checked)}
            />
            <span>Free Wi-Fi</span>
          </label>
          <label className="mr-4 inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-[#A07855] rounded mr-2 focus:ring-0 focus:ring-offset-0"
              checked={powerOutlets} // Keeping Power Outlets checkbox
              onChange={(e) => setPowerOutlets(e.target.checked)} // Keeping Power Outlets checkbox
            />
            <span>Power outlets</span>
          </label>
          {/* Removed checkboxes for Open now, Wheelchair accessible, Street & private seating */}
        </div>

        <button type="submit" className="bg-[#A07855] text-white py-2 px-6 rounded-lg border-none text-base cursor-pointer">
          Submit
        </button>
      </form>
    </div>
  );
}

export default SearchFilter;