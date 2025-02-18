import React, { useState, useEffect } from "react";
import CafeCard from "./CafeCard";
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

function CafeList({ cafes, showMap }) {
  const cafesPerPage = 50;
  const [currentPage, setCurrentPage] = useState(1);
  const [showInput, setShowInput] = useState(false);
  const [inputPage, setInputPage] = useState("");

  const totalPages = Math.ceil(cafes.length / cafesPerPage);
  const indexOfLastCafe = currentPage * cafesPerPage;
  const indexOfFirstCafe = indexOfLastCafe - cafesPerPage;
  const currentCafes = cafes.slice(indexOfFirstCafe, indexOfLastCafe);

  const GetLocation = () => {
    const map = useMap();

    useEffect(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.setCenter(pos);
        }, showError);
      } else {
        console.log("Geolocation is not supported by this browser.");
      }
    }, [map]);

    return <></>;
  };

  const showError = (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.log("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        console.log("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        console.log("The request to get user location timed out.");
        break;
      case error.UNKNOWN_ERROR:
        console.log("An unknown error occurred.");
        break;
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 9) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 5) {
        for (let i = 1; i <= 7; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 4) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 6; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setShowInput(false);
      setInputPage("");
    }
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    const pageNum = parseInt(inputPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      handlePageChange(pageNum);
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-row h-screen relative pb-20 gap-4">
      {/* Scrollable cafe list */}
      <div className={`flex-1 overflow-y-auto pr-4 ${showMap ? "" : "w-full"}`}>
        <div className="flex flex-wrap gap-4 justify-center">
          {currentCafes.map((cafe) => (
            <CafeCard key={cafe.id || cafe.business_id} cafe={cafe} />
          ))}
        </div>
      </div>

      {/* Map */}
      {showMap && (
        <div className="w-[400px] h-screen">
          <APIProvider
            apiKey={API_KEY}
            onLoad={() => console.log("Google Maps API loaded")}
          >
            <Map
              style={{ height: "100%", borderRadius: "20px" }}
              defaultZoom={13}
              defaultCenter={{ lat: 34.0522, lng: -118.2437 }}
              gestureHandling={"greedy"}
            >
              <GetLocation />
            </Map>
          </APIProvider>
        </div>
      )}

      {/* Pagination */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4">
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Previous
          </button>

          {pageNumbers.map((number, index) => (
            <div key={index}>
              {number === "..." ? (
                showInput ? (
                  <form onSubmit={handleInputSubmit} className="inline">
                    <input
                      type="number"
                      value={inputPage}
                      onChange={(e) => setInputPage(e.target.value)}
                      className="w-16 px-2 py-1 border rounded"
                      min="1"
                      max={totalPages}
                    />
                  </form>
                ) : (
                  <button
                    onClick={() => setShowInput(true)}
                    className="px-2 py-1"
                  >
                    ...
                  </button>
                )
              ) : (
                <button
                  onClick={() => handlePageChange(number)}
                  className={`px-3 py-1 rounded ${
                    currentPage === number
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-200"
                  }`}
                >
                  {number}
                </button>
              )}
            </div>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default CafeList;
