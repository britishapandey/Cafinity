import React, { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import CafeCard from "./CafeCard";
import { APIProvider, Map, useMap, AdvancedMarker } from "@vis.gl/react-google-maps";
import { Filter } from "lucide-react";
import { useFloating, useInteractions, useClick, useDismiss } from "@floating-ui/react";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID;

function LongBeachCafes() {
  const [cafes, setCafes] = useState([]);
  const [filteredCafes, setFilteredCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMap, setShowMap] = useState(true);
  const [hoveredCafe, setHoveredCafe] = useState(null);
  
  // Filter options
  const [filterOpen, setFilterOpen] = useState(false);
  const [onlyHighRated, setOnlyHighRated] = useState(false);
  const [hasWifi, setHasWifi] = useState(false);
  const [hasOutdoorSeating, setHasOutdoorSeating] = useState(false);
  
  // Filtering UI component
  const {
    refs: filterRefs,
    floatingStyles: filterFloatingStyles,
    context: filterContext
  } = useFloating({
    open: filterOpen,
    onOpenChange: setFilterOpen,
  });
  
  const {
    getReferenceProps: getFilterReferenceProps,
    getFloatingProps: getFilterFloatingProps
  } = useInteractions([useClick(filterContext), useDismiss(filterContext)]);
  
  const filterRef = filterRefs.setReference;
  const filterProps = getFilterReferenceProps();

  // Load cafes from googleCafes collection
  useEffect(() => {
    const fetchGoogleCafes = async () => {
      setLoading(true);
      try {
        // Query the googleCafes collection directly
        const cafesRef = collection(db, "googleCafes");
        // You could add ordering or additional filters here
        const cafesQuery = query(cafesRef, orderBy("stars", "desc"));
        const querySnapshot = await getDocs(cafesQuery);
        
        const cafesData = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id
        }));
        
        setCafes(cafesData);
        setFilteredCafes(cafesData);
      } catch (error) {
        console.error("Error fetching cafes:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGoogleCafes();
  }, []);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, onlyHighRated, hasWifi, hasOutdoorSeating, cafes]);

  // Filter function
  const applyFilters = () => {
    let filtered = [...cafes];
    
    // Apply search term filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(cafe => 
        cafe.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        cafe.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply rating filter
    if (onlyHighRated) {
      filtered = filtered.filter(cafe => cafe.stars >= 4.0);
    }
    
    // Apply WiFi filter (this is an approximation - can adjust based on your data)
    if (hasWifi) {
      filtered = filtered.filter(cafe => 
        cafe.attributes?.WiFi === "u'free'" || 
        cafe.attributes?.WiFi === "True"
      );
    }
    
    // Apply outdoor seating filter
    if (hasOutdoorSeating) {
      filtered = filtered.filter(cafe => 
        cafe.attributes?.OutdoorSeating === "True"
      );
    }
    
    setFilteredCafes(filtered);
  };

  // Handle filter form submission
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    applyFilters();
    setFilterOpen(false);
  };

  // Map component with location tracking
  const CafeMap = () => {
    const map = useMap();

    useEffect(() => {
      if (map && hoveredCafe) {
        map.setCenter({ 
          lat: Number(hoveredCafe.latitude), 
          lng: Number(hoveredCafe.longitude) 
        });
        map.setZoom(15);
      }
    }, [map, hoveredCafe]);

    useEffect(() => {
      if (navigator.geolocation && !hoveredCafe) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = { 
              lat: position.coords.latitude, 
              lng: position.coords.longitude 
            };
            map.setCenter(pos);
            map.setZoom(13);
          },
          (error) => {
            console.error("Error getting location:", error);
            // Default to Long Beach center
            map.setCenter({ lat: 33.7701, lng: -118.1937 });
            map.setZoom(13);
          }
        );
      }
    }, [map, hoveredCafe]);

    return (
      <>
        {filteredCafes
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
              onClick={() => navigate(`/cafe/${cafe.id}`)}
            />
          ))}
      </>
    );
  };

  const handleCafeHover = (cafe) => setHoveredCafe(cafe);
  const handleCafeLeave = () => setHoveredCafe(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B7AEE]"></div>
          <p className="text-gray-500">Loading Long Beach cafes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Coffee Shops in Long Beach</h1>
      
      {/* Search and Filter Bar */}
      <div className="mb-6 flex items-center gap-4">
        <button 
          ref={filterRef} {...filterProps}
          className="p-2 bg-[#5B4A43] text-white rounded-lg hover:bg-[#4A3C36] transition-colors"
        >
          <Filter size={20} />
        </button>
        
        {/* Filter Popover */}
        {filterOpen && (
          <div
            ref={filterRefs.setFloating}
            style={filterFloatingStyles}
            {...getFilterFloatingProps()}
            className="bg-white p-4 rounded-lg shadow-lg z-50 min-w-[250px]"
          >
            <h3 className="font-semibold mb-3">Filter Options</h3>
            <form onSubmit={handleFilterSubmit}>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={onlyHighRated}
                    onChange={(e) => setOnlyHighRated(e.target.checked)}
                    className="h-4 w-4 text-[#5B4A43]"
                  />
                  <span>4+ Star Rating</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={hasWifi}
                    onChange={(e) => setHasWifi(e.target.checked)}
                    className="h-4 w-4 text-[#5B4A43]"
                  />
                  <span>Has WiFi</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={hasOutdoorSeating}
                    onChange={(e) => setHasOutdoorSeating(e.target.checked)}
                    className="h-4 w-4 text-[#5B4A43]"
                  />
                  <span>Outdoor Seating</span>
                </label>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#5B4A43] text-white rounded-lg hover:bg-[#4A3C36] transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search cafes in Long Beach..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4A43]"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        
        {/* Toggle Map Button */}
        <button
          onClick={() => setShowMap(!showMap)}
          className="px-4 py-2 bg-[#5B4A43] text-white rounded-lg hover:bg-[#4A3C36] transition-colors"
        >
          {showMap ? "Hide Map" : "Show Map"}
        </button>
      </div>
      
      {/* Results Count */}
      <p className="mb-4 text-gray-600">
        Found {filteredCafes.length} {filteredCafes.length === 1 ? 'cafe' : 'cafes'} in Long Beach
      </p>
      
      {/* Cafe List and Map */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Cafe Cards */}
        <div className={`${showMap ? 'lg:w-2/3' : 'w-full'} grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6`}>
          {filteredCafes.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No cafes match your search criteria.</p>
            </div>
          ) : (
            filteredCafes.map(cafe => (
              <CafeCard 
                key={cafe.id || cafe.place_id}
                cafe={cafe}
                onHover={() => handleCafeHover(cafe)}
                onLeave={handleCafeLeave}
              />
            ))
          )}
        </div>
        
        {/* Map */}
        {showMap && (
          <div className="lg:w-1/3 h-[600px] sticky top-4">
            <APIProvider apiKey={API_KEY} libraries={["marker"]}>
              <Map
                style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
                defaultZoom={12}
                defaultCenter={{ lat: 33.7701, lng: -118.1937 }}
                mapId={MAP_ID}
              >
                <CafeMap />
              </Map>
            </APIProvider>
          </div>
        )}
      </div>
    </div>
  );
}

export default LongBeachCafes;