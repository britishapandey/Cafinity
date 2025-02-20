import React, { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import CafeList from "./CafeList";

const Home = ({ user }) => {
  const [cafeList, setCafeList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCafes, setFilteredCafes] = useState([]);
  const [showMap, setShowMap] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const cafesCollectionRef = collection(db, "cafes");

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
    }
  }, [user]);

  useEffect(() => {
    const filtered = cafeList.filter((cafe) =>
      cafe.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCafes(filtered);
  }, [searchTerm, cafeList]);

  return (
    <>
      <div className="my-4 px-4 flex gap-4 items-center">
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
        <CafeList cafes={filteredCafes} showMap={showMap} />
      )}
    </>
  );
};

export default Home;
