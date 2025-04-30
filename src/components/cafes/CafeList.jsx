import React, { useState, useEffect } from "react";
import CafeCard from "./CafeCard";
import ListNavigation from "../search/ListNavigation";
import { APIProvider, Map, useMap, AdvancedMarker } from "@vis.gl/react-google-maps";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID;

function CafeList({ cafes, showMap, showNav }) {
  const cafesPerPage = 50;
  const [currentPage, setCurrentPage] = useState(1);
  const [showInput, setShowInput] = useState(false);
  const [inputPage, setInputPage] = useState("");
  const [hoveredCafe, setHoveredCafe] = useState(null);

  const totalPages = Math.ceil(cafes.length / cafesPerPage);
  const indexOfLastCafe = currentPage * cafesPerPage;
  const indexOfFirstCafe = indexOfLastCafe - cafesPerPage;
  const currentCafes = cafes.slice(indexOfFirstCafe, indexOfLastCafe);

  const GetLocation = () => {
    const map = useMap();

    useEffect(() => {
      if (map && hoveredCafe) {
        map.setCenter({ lat: Number(hoveredCafe.latitude), lng: Number(hoveredCafe.longitude) });
        map.setZoom(15);
      }
    }, [map, hoveredCafe]);

    useEffect(() => {
      if (navigator.geolocation && !hoveredCafe) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
            map.setCenter(pos);
            map.setZoom(13);
          },
          showError
        );
      }
    }, [map, hoveredCafe]);

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
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 5) {
        for (let i = 1; i <= 7; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 4) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 6; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
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
      setHoveredCafe(null);
    }
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    const pageNum = parseInt(inputPage);
    if (pageNum >= 1 && pageNum <= totalPages) handlePageChange(pageNum);
  };

  const handleCafeHover = (cafe) => setHoveredCafe(cafe);
  const handleCafeLeave = () => setHoveredCafe(null);

  const pageNumbers = window.innerWidth > 768 ? getPageNumbers() : getPageNumbers().slice(0, 3).concat("...").concat(totalPages);

  return (
    <div className="flex flex-row max-h-screen pb-20 gap-4">
      <div className={`flex-1 overflow-y-auto pr-4 ${showMap ? "" : "w-full"}`}>
        <div className="flex flex-wrap gap-4 justify-center">
          {currentCafes.map((cafe) => (
            <CafeCard
              key={cafe.id || cafe.business_id}
              cafe={cafe}
              onHover={() => handleCafeHover(cafe)}
              onLeave={handleCafeLeave}
            />
          ))}
        </div>
      </div>

      {showMap && (
        <div className="w-[400px] h-screen">
          <APIProvider apiKey={API_KEY} libraries={["marker"]} onLoad={() => console.log("Google Maps API loaded")}>
            <Map
              style={{ height: "100%", borderRadius: "20px" }}
              defaultZoom={13}
              defaultCenter={{ lat: 34.0522, lng: -118.2437 }}
              gestureHandling={"greedy"}
              mapId={MAP_ID}
            >
              <GetLocation />
              {currentCafes
                .filter((cafe) => 
                  cafe.latitude !== undefined && 
                  cafe.longitude !== undefined && 
                  !isNaN(Number(cafe.latitude)) && 
                  !isNaN(Number(cafe.longitude))
                )
                .map((cafe) => (
                  <AdvancedMarker
                    key={cafe.id || cafe.business_id}
                    position={{ lat: Number(cafe.latitude), lng: Number(cafe.longitude) }}
                    title={cafe.name}
                  />
                ))}
            </Map>
          </APIProvider>
        </div>
      )}

      { showNav && (
        <ListNavigation
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        showInput={showInput}
        setShowInput={setShowInput}
        inputPage={inputPage}
        setInputPage={setInputPage}
        handlePageChange={handlePageChange}
        handleInputSubmit={handleInputSubmit} 
        pageNumbers={pageNumbers}/>)}
    </div>
  );
}

export default CafeList;