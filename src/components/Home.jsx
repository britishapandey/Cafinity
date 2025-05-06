import React, { useState, useEffect } from "react";
import { db } from "../config/firebase";
import {collection, getDocs, query, where} from "firebase/firestore";
import CafeList from "./cafes/CafeList";
import { Filter } from "lucide-react";
import { useFloating, useInteractions, useClick, useDismiss } from "@floating-ui/react";

const Home = ({ user }) => {
  const [cafeList, setCafeList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCafes, setFilteredCafes] = useState([]);
  const [showMap, setShowMap] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteCafeIds, setFavoriteCafeIds] = useState([]);
  // toggle sort menu open
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [cafeCreditCard, setCafeCreditCard] = useState(false);
  const [cafeBikeParking, setCafeBikeParking] = useState(false);
  const [cafeNoiseLevel, setCafeNoiseLevel] = useState(false);
  const [cafeGoodForGroups, setCafeGoodForGroups] = useState(false);
  const [cafeOutdoorSeating, setCafeOutdoorSeating] = useState(false);
  const [cafeDriveThru, setCafeDriveThru] = useState(false);
  const [cafeWiFi, setCafeWiFi] = useState(false);
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

  const cafesCollectionRef = collection(db, "cafes");

  const fetchUserFavorites = async () => {
    if (!user) return;

    try {
      const favoritesRef = collection(db, "favorites");
      const q = query(favoritesRef, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      const favoriteIds = querySnapshot.docs.map(doc => doc.data().cafeId);
      setFavoriteCafeIds(favoriteIds);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const getCafeList = async () => {
    try {
      setIsLoading(true);
      const data = await getDocs(cafesCollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setCafeList(filteredData);
      setFilteredCafes(filteredData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getCafeList();
      fetchUserFavorites();
    }
  }, [user]);

  
  const handleSearchSubmit = (filters) => {
    const term = filters.searchTerm.toLowerCase();
    let tempFilteredCafes = [...cafeList];

    if (filters.favorites) {
      tempFilteredCafes = tempFilteredCafes.filter(cafe => favoriteCafeIds.includes(cafe.id));
    }

    if (term) {
      tempFilteredCafes = tempFilteredCafes.filter(cafe => cafe.name.toLowerCase().includes(term));
    }
    
    if (filters.creditCard) {
      tempFilteredCafes = tempFilteredCafes.filter(cafe => cafe.attributes?.BusinessAcceptsCreditCards == "True");
    }
    if (filters.bikeParking) {
      tempFilteredCafes = tempFilteredCafes.filter(cafe => cafe.attributes?.BikeParking == "True");
    }
    if (filters.noiseLevel) {
      tempFilteredCafes = tempFilteredCafes.filter(cafe => cafe.attributes?.NoiseLevel == "u'quiet'");
    }
    if (filters.goodForGroups) {
      tempFilteredCafes = tempFilteredCafes.filter(cafe => cafe.attributes?.RestaurantsGoodForGroups == "True");
    }
    if (filters.outdoorSeating) {
      tempFilteredCafes = tempFilteredCafes.filter(cafe => cafe.attributes?.OutdoorSeating == "True");
    }
    if (filters.driveThru) {
      tempFilteredCafes = tempFilteredCafes.filter(cafe => cafe.attributes?.DriveThru == "True");
    }
    if (filters.wifi) {
      tempFilteredCafes = tempFilteredCafes.filter(cafe => cafe.attributes?.WiFi == "u'free'");
    }

    setFilteredCafes(tempFilteredCafes);
  };


  useEffect(() => {
    const filtered = cafeList.filter((cafe) =>
      cafe.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCafes(filtered);
  }, [searchTerm, cafeList]);

  return (
    <>
        <div className="my-4 px-4 flex gap-2 items-center w-full">
        <button 
          ref={filterRef} {...filterProps}
          className="px-4 py-2 text-white rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
          <Filter />
        </button>
        {filterOpen && (
          <div
            className="flex flex-col z-10 ml-14"
            ref={filterRefs.setFloating}
            style={{
              ...filterFloatingStyles,
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              padding: "0.5rem",
            }}
            {...getFilterFloatingProps()}>
              <form onSubmit={(e) => {e.preventDefault();
              handleSearchSubmit({ searchTerm,
                creditCard: cafeCreditCard,
                favorites: showFavorites,
                bikeParking: cafeBikeParking,
                noiseLevel: cafeNoiseLevel,
                goodForGroups: cafeGoodForGroups,
                outdoorSeating: cafeOutdoorSeating,
                driveThru: cafeDriveThru,
                wifi: cafeWiFi })}}>
              <div className="flex flex-col">
                <label className="flex items-center space-x-2 p-2 bg-gray-100 rounded mb-2">
                  <input
                      type="checkbox"
                      checked={showFavorites}
                      onChange={(e) => setShowFavorites(e.target.checked)}
                      className="h-4 w-4 text-blue-600"
                  />
                  <span className="font-medium">Show only favorites</span>
                </label>
                <label className="flex items-center space-x-2 p-2 bg-gray-100 rounded mb-2">
                  <input
                    type="checkbox"
                    checked={cafeCreditCard}
                    onChange={(e) => setCafeCreditCard(e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="font-medium">Accepts Credit Card</span>
                </label>
                <label className="flex items-center space-x-2 p-2 bg-gray-100 rounded mb-2">
                  <input
                    type="checkbox"
                    checked={cafeBikeParking}
                    onChange={(e) => setCafeBikeParking(e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="font-medium">Bike Parking</span>
                </label>
                <label className="flex items-center space-x-2 p-2 bg-gray-100 rounded mb-2">
                  <input
                    type="checkbox"
                    checked={cafeNoiseLevel}
                    onChange={(e) => setCafeNoiseLevel(e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="font-medium">Quiet</span>
                </label>
                <label className="flex items-center space-x-2 p-2 bg-gray-100 rounded mb-2">
                  <input
                    type="checkbox"
                    checked={cafeGoodForGroups}
                    onChange={(e) => setCafeGoodForGroups(e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="font-medium">Good for Groups</span>
                </label>
                <label className="flex items-center space-x-2 p-2 bg-gray-100 rounded mb-2">
                  <input
                    type="checkbox"
                    checked={cafeOutdoorSeating}
                    onChange={(e) => setCafeOutdoorSeating(e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="font-medium">Outdoor Seating</span>
                </label>
                <label className="flex items-center space-x-2 p-2 bg-gray-100 rounded mb-2">
                  <input
                    type="checkbox"
                    checked={cafeDriveThru}
                    onChange={(e) => setCafeDriveThru(e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="font-medium">Drive Thru</span>
                </label>
                <label className="flex items-center space-x-2 p-2 bg-gray-100 rounded mb-2">
                  <input
                    type="checkbox"
                    checked={cafeWiFi}
                    onChange={(e) => setCafeWiFi(e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="font-medium">WiFi</span>
                </label>
              </div>

              <button type="submit">
                Submit
              </button>
              </form>
            </div>
          )}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search cafes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <button
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {showMap ? (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                ></path>
              </svg>
              Hide Map
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                ></path>
              </svg>
              Show Map
            </>
          )}
        </button>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B7AEE]"></div>
            <p className="text-gray-500">Loading cafes...</p>
          </div>
        </div>
      ) : (
        <CafeList className="z-0" cafes={filteredCafes} showMap={showMap} showNav={true}/>
      )}
    </>
  );
};

export default Home;
