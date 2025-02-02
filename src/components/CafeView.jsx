import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Star, ArrowLeft, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react'; // Import Image icon
import { db, collection, getDocs } from '../config/firebase';

function CafeView() {
  const { cafeId } = useParams();
  const [cafe, setCafe] = useState(null);
  const [loading, setLoading] = useState(true);

  const cafesCollectionRef = collection(db, "cafes");

  useEffect(() => {
    const getCafe = async () => {
      setLoading(true);
      try {
        const data = await getDocs(cafesCollectionRef);
        const cafeListFromFirebase = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        const foundCafe = cafeListFromFirebase.find((c) => c.id === cafeId);
        if (foundCafe) {
          setCafe(foundCafe);
        } else {
          console.error("Cafe not found with ID:", cafeId);
        }
      } catch (err) {
        console.error("Error fetching cafe:", err);
      } finally {
        setLoading(false);
      }
    };

    getCafe();
  }, [cafeId]);

  if (loading) {
    return <div>Loading cafe details...</div>;
  }

  if (!cafe) {
    return <div>Cafe not found.</div>;
  }

  // Placeholder review data (same as before)
  const reviews = [
    {
      user: 'matchalover',
      rating: 5,
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    },
    {
      user: 'enjoyerofmatcha',
      rating: 4,
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    },
  ];

  return (
    <div className="bg-[#F0ECE3] min-h-screen flex flex-col">
      {/* Header (same as before) */}
      <header className="bg-[#5B4A43] p-4 flex items-center justify-between">
        <Link to="/" className="text-white">
          <ArrowLeft color="#FFFFFF" size={24} />
        </Link>
        <h1 className="text-white text-xl font-semibold">View Cafe Reviews</h1> {/* Updated Header Text */}
        <div></div>
      </header>

      {/* Main Content Area - Flex Container for Side-by-Side Layout */}
      <div className="flex flex-col md:flex-row p-4 space-y-4 md:space-y-0 md:space-x-4">
        {/* Cafe Content Card (Left Side) */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex-1"> {/* flex-1 makes it take available space */}
          {/* Image */}
          {cafe.images && cafe.images.length > 0 ? (
            <img
              className="w-full h-64 object-cover"
              src={cafe.images[0]}
              alt={`Cafe ${cafe.name}`}
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
              No Images Available
            </div>
          )}
          {/* See Photos Link */}
          <div className="p-6 pb-4 flex justify-end"> {/* Added justify-end to right-align */}
            <Link to="#" className="text-[#A07855] text-sm flex items-center hover:underline">
              <ImageIcon color="#A07855" size={16} className="mr-1" /> {/* Image Icon */}
              See photos
            </Link>
          </div>


          <div className="px-6 pb-6"> {/* Reduced padding at bottom */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{cafe.name}</h2>
            <p className="text-gray-600 mb-4">{cafe.address}</p>

            {/* Rating and Reviews Link */}
            <div className="flex items-center mb-4">
              <div className="flex items-center mr-2">
                {cafe.rating && [...Array(cafe.rating)].map((_, index) => (
                  <Star key={index} color="#FFC107" fill="#FFC107" size={20} />
                ))}
                {cafe.rating && [...Array(5 - cafe.rating)].map((_, index) => (
                  <Star key={index} color="#FFC107" size={20} />
                ))}
              </div>
              <Link to="#" className="text-gray-500 hover:text-gray-700 text-sm ml-1">
                2 reviews
              </Link>
            </div>

            {/* Available Amenities */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Available amenities</h3>
              <ul className="space-y-2 text-sm"> {/* Reduced font size for amenities */}
                {cafe.amenities && cafe.amenities.noise && (
                  <li className="flex items-center">
                    <CheckCircle color="#4CAF50" className="mr-2" size={16} /> {/* Reduced icon size */}
                    Noise Level: {cafe.amenities.noise}
                  </li>
                )}
                {cafe.amenities && cafe.amenities.seatingAvailability && (
                  <li className="flex items-center">
                    <CheckCircle color="#4CAF50" className="mr-2" size={16} />
                    Seating: {cafe.amenities.seatingAvailability}
                  </li>
                )}
                {cafe.amenities && cafe.amenities.wifi !== undefined && (
                  <li className="flex items-center">
                    {cafe.amenities.wifi ? (
                      <CheckCircle color="#4CAF50" className="mr-2" size={16} />
                    ) : (
                      <XCircle color="#F44336" className="mr-2" size={16} />
                    )}
                    Wi-Fi: {cafe.amenities.wifi ? 'Available' : 'Not Available'}
                  </li>
                )}
              </ul>
            </div>

            {/* Hours */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Open now until 6:00PM | <Link to="#" className="text-[#007BFF] text-sm hover:underline">See hours</Link></h3> {/* Added hover:underline */}
            </div>
          </div>
        </div>

        {/* Cafe Reviews Card (Right Side) */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex-1"> {/* flex-1 makes it take available space */}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Cafe Reviews</h3> {/* Reduced font size */}

            {/* Write a Review Button - Styled to match image */}
            <button className="bg-[#A07855] hover:bg-[#8C6A50] text-white font-semibold py-2 px-4 rounded-md block w-full text-center mb-4 focus:outline-none focus:ring-2 focus:ring-[#A07855] focus:ring-opacity-50"> {/* Styled Button */}
              Write a Review
            </button>

            {/* Reviews List */}
            <ul className="space-y-6">
              {reviews.map((review, index) => (
                <li key={index} className="border-b pb-4 last:border-b-0"> {/* Removed border from last item */}
                  <div className="flex items-start mb-2">
                    <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center overflow-hidden">
                      <span className="text-xl font-semibold text-gray-700">{review.user.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{review.user}</h4>
                      <div className="flex items-center">
                        {[...Array(review.rating)].map((_, index) => (
                          <Star key={index} color="#FFC107" fill="#FFC107" size={16} />
                        ))}
                        {[...Array(5 - review.rating)].map((_, index) => (
                          <Star key={index} color="#FFC107" size={16} />
                        ))}
                        <span className="text-gray-500 text-sm ml-1">2 reviews</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">{review.text}</p> {/* Reduced font size for review text */}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CafeView;