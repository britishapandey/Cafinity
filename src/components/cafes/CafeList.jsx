import React, { useState, useEffect, useCallback, useRef } from "react";
import CafeCard from "./CafeCard";
import ListNavigation from "../search/ListNavigation";
import { useNavigate } from "react-router-dom";
import { APIProvider, Map, useMap, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID;

function CafeList({ cafes, showMap, showNav }) {
  const navigate = useNavigate();
  const cafesPerPage = 50;
  const [currentPage, setCurrentPage] = useState(1);
  const [showInput, setShowInput] = useState(false);
  const [inputPage, setInputPage] = useState("");
  const [hoveredCafe, setHoveredCafe] = useState(null);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef(null);

  const totalPages = Math.ceil(cafes.length / cafesPerPage);
  const indexOfLastCafe = currentPage * cafesPerPage;
  const indexOfFirstCafe = indexOfLastCafe - cafesPerPage;
  const currentCafes = cafes.slice(indexOfFirstCafe, indexOfLastCafe);

  // Function to calculate distance between two coordinates in miles
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3958.8; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in miles
    return distance.toFixed(1);
  };

  const handleMapView = useCallback((cafe) => {
    setSelectedCafe(cafe);
    
    // Calculate distance if we have user location
    if (userLocation && cafe.latitude && cafe.longitude) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        Number(cafe.latitude),
        Number(cafe.longitude)
      );
      setDistanceInfo({
        cafeName: cafe.name,
        distance: distance
      });
    }
  }, [userLocation]);

  const MapComponent = () => {
    const map = useMap();
    
    // Store map reference for external access
    useEffect(() => {
      if (map) {
        mapRef.current = map;
      }
    }, [map]);

    // One-time init effect - gets user location and initializes map
    useEffect(() => {
      if (map && !mapInitialized) {
        // Get user location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userPos = { 
                lat: position.coords.latitude, 
                lng: position.coords.longitude 
              };
              setUserLocation(userPos);
              map.setCenter(userPos);
              map.setZoom(13);
              setMapInitialized(true);
            },
            (error) => {
              console.error("Error getting location:", error);
              map.setCenter({ lat: 33.7701, lng: -118.1937 }); // Default to Long Beach
              map.setZoom(13);
              setMapInitialized(true);
            },
            { 
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            }
          );
        } else {
          // Browser doesn't support geolocation
          map.setCenter({ lat: 33.7701, lng: -118.1937 });
          map.setZoom(13);
          setMapInitialized(true);
        }
      }
    }, [map]);

    // Update map center when a cafe is selected (but respect user's manual panning)
    useEffect(() => {
      if (map && selectedCafe && selectedCafe.latitude && selectedCafe.longitude) {
        map.setCenter({ 
          lat: Number(selectedCafe.latitude), 
          lng: Number(selectedCafe.longitude) 
        });
        map.setZoom(15);
      }
    }, [map, selectedCafe]);

    return null;
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
      setSelectedCafe(null);
      setDistanceInfo(null);
    }
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    const pageNum = parseInt(inputPage);
    if (pageNum >= 1 && pageNum <= totalPages) handlePageChange(pageNum);
  };

  const handleCafeHover = (cafe) => setHoveredCafe(cafe);
  const handleCafeLeave = () => setHoveredCafe(null);
  
  const handleMarkerClick = (cafe) => {
    setSelectedCafe(cafe);
    if (userLocation && cafe.latitude && cafe.longitude) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        Number(cafe.latitude),
        Number(cafe.longitude)
      );
      setDistanceInfo({
        cafeName: cafe.name,
        distance: distance
      });
    }
  };

  const pageNumbers = window.innerWidth > 768 ? getPageNumbers() : getPageNumbers().slice(0, 3).concat("...").concat(totalPages);

  return (
    <div className="flex flex-row max-h-screen pb-20 gap-4">
      <div className={`flex-1 overflow-y-auto pr-4 ${showMap ? "" : "w-full"}`}>
        {/* Results Count */}
        <p className="mb-4 ml-8 text-gray-600">
          Found {currentCafes.length} {currentCafes.length === 1 ? 'cafe' : 'cafes'}
        </p>

        {/* Distance Info when showing on map */}
        {distanceInfo && (
          <div className="mx-8 mb-4 p-3 bg-[#F0ECE3] border border-[#B07242] rounded-lg shadow-sm">
            <p className="text-[#5B4A43] flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#B07242]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <strong className="font-medium text-[#B07242]">{distanceInfo.cafeName}</strong>
              <span className="mx-1">is</span>
              <strong className="font-medium text-[#B07242]">{distanceInfo.distance} miles</strong>
              <span className="ml-1">from your current location</span>
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-4 justify-center">
          {currentCafes.map((cafe) => (
            <CafeCard
              key={cafe.id || cafe.business_id}
              cafe={cafe}
              onHover={handleCafeHover}
              onLeave={handleCafeLeave}
              onMapView={handleMapView}
            />
          ))}
        </div>
      </div>

      {showMap && (
        <div className="lg:w-1/3 h-[600px]">
          <APIProvider 
            apiKey={API_KEY} 
            libraries={["marker"]}
          >
            <Map
              style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
              defaultZoom={12}
              defaultCenter={{ lat: 33.7701, lng: -118.1937 }}
              mapId={MAP_ID}
              gestureHandling="greedy"
              disableDefaultUI={false}
              zoomControl={true}
              streetViewControl={false}
              mapTypeControl={false}
              fullscreenControl={true}
              clickableIcons={false}
            >
              <MapComponent />
              
              {/* User location marker with pulsing effect */}
              {userLocation && (
                <AdvancedMarker
                  position={userLocation}
                  title="Your Location"
                >
                  <div className="relative">
                    {/* Pulsing circle animation */}
                    <div className="absolute -inset-2 rounded-full bg-blue-400 opacity-30 animate-ping"></div>
                    {/* Static outer circle */}
                    <div className="absolute -inset-1 rounded-full bg-blue-400 opacity-50"></div>
                    {/* Main marker */}
                    <div className="relative w-5 h-5 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center shadow-md">
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                  </div>
                </AdvancedMarker>
              )}
              
              {/* Cafe markers */}
              {currentCafes
                .filter(cafe => 
                  cafe.latitude && 
                  cafe.longitude && 
                  !isNaN(Number(cafe.latitude)) && 
                  !isNaN(Number(cafe.longitude))
                )
                .map(cafe => (
                  <AdvancedMarker
                    key={cafe.id || cafe.place_id}
                    position={{ 
                      lat: Number(cafe.latitude), 
                      lng: Number(cafe.longitude) 
                    }}
                    title={cafe.name}
                    onClick={() => handleMarkerClick(cafe)}
                  >
                    {/* Custom styled marker */}
                    <div className={`w-8 h-8 ${selectedCafe && selectedCafe.id === cafe.id ? 'bg-red-500' : 'bg-[#B07242]'} rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform`}>
                      {cafe.name.charAt(0)}
                    </div>
                  </AdvancedMarker>
                ))}
              
              {/* Info window for selected cafe */}
              {selectedCafe && (
                <InfoWindow
                  position={{ 
                    lat: Number(selectedCafe.latitude), 
                    lng: Number(selectedCafe.longitude) 
                  }}
                  onCloseClick={() => {
                    setSelectedCafe(null);
                    setDistanceInfo(null);
                  }}
                >
                  <div className="p-3 max-w-xs">
                   <h3 
                      onClick={() => navigate(`/cafe/${selectedCafe.id}`)}
                      className="font-bold text-[#5B4A43] text-lg cursor-pointer hover:text-[#B07242] flex items-center group transition-colors"
                      title="View café details"
                    >
                      {selectedCafe.name}
                      <svg xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 ml-1 text-gray-400 group-hover:text-[#B07242] transition-colors" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </h3>
                    <p className="text-sm text-gray-600">{selectedCafe.address}</p>
                    {selectedCafe.stars && (
                      <div className="flex items-center mt-1">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span className="text-sm font-medium">{Number(selectedCafe.stars).toFixed(1)}</span>
                        <span className="text-xs text-gray-500 ml-1">({selectedCafe.review_count || 0})</span>
                      </div>
                    )}
                    {distanceInfo && (
                      <div className="mt-2 bg-blue-50 p-2 rounded-md">
                        <p className="text-sm font-semibold text-blue-800">
                          <span className="inline-block mr-1">📍</span> {distanceInfo.distance} miles from your location
                        </p>
                      </div>
                    )}
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${Number(selectedCafe.latitude)},${Number(selectedCafe.longitude)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block text-center bg-[#B07242] text-white text-sm py-1 px-2 rounded hover:bg-[#A06030] transition-colors"
                    >
                      Get Directions
                    </a>
                  </div>
                </InfoWindow>
              )}
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
          pageNumbers={pageNumbers}
        />
      )}
    </div>
  );
}

export default CafeList;