import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../config/firebase';
import { collection, getDocs, getFirestore, doc, updateDoc } from 'firebase/firestore';
import { Star, ArrowLeft, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';



function CafeView({ }) {

  const cafesCollectionRef = collection(db, "cafes"); // Firebase collection ref
  const [cafeList, setCafeList] = useState([]); // State for cafe list
  const { id } = useParams();

  // main merge:
  // const { cafeId } = useParams();
  // const [cafe, setCafe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]); // State for reviews
  const [newReview, setNewReview] = useState({ // State for new review form
    user: '',
    rating: 5,
    text: '',
  });
  // main merge:
  // Add new state variables for amenity ratings
  const [noiseRating, setNoiseRating] = useState(null);
  const [seatingRating, setSeatingRating] = useState(null);
  const [wifiRating, setWifiRating] = useState(null);
  // main merge:
  const navigate = useNavigate();


  // Fetch cafe list from Firebase
  useEffect(() => {
      const getCafeList = async () => {
        // setLoading(true);
        try {
            const data = await getDocs(cafesCollectionRef);
            const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            setCafeList(filteredData);
            const db = getFirestore();
  //       const cafesCollectionRef = collection(db, "cafes");
  //       const data = await getDocs(cafesCollectionRef);
  //       const cafeListFromFirebase = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  //       const foundCafe = cafeListFromFirebase.find((c) => c.id === cafeId);
        
  //       if (foundCafe) {
  //         setCafe(foundCafe);
  //         setReviews(foundCafe.reviews || []); // Initialize with existing reviews from cafe object
  //       } else {
  //         setError("Cafe not found");
  //       }
        } catch (err) {
            console.error(err);
  //       console.error("Error fetching cafe:", err);
  //       setError("Error loading cafe data");
  //     } finally {
  //       setLoading(false);
  //     }
        }
      };
      getCafeList();
  //   if (cafeId) {
  //     getCafe();
  //   }
  // }, [cafeId]);

  }, []); // empty dependency array → runs once when component mounts

  const formatHours = (hoursString) => {
    if (!hoursString || typeof hoursString !== 'string') return 'Closed';

    //split the range (ex "16:30-21:0" -> ["16:30", "21:0"])
    const [start, end] = hoursString.split('-');

    const formatTime = (time) => {
      // handle cases like "8:0" by adding "0" if needed
      const [hours, minutes] = time.split(':');
      const hourNum = parseInt(hours)
      const minNum = parseInt(minutes) || 0;

      const period = hourNum >= 12 ? 'PM' : 'AM';
      const hour12 = hourNum % 12 || 12; // conver to 12hour format
      const minuteStr = minNum < 10 ? `0${minNum}` : minNum;

      return `${hour12}:${minuteStr}${period}`;
    };

    return `${formatTime(start)}-${formatTime(end)}`;
  };

  // big main merge:
  // const handleBack = () => {
  //   navigate(-1); // Go back to previous page
  // };
  // Function to handle new review input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview((prevReview) => ({
      ...prevReview,
      [name]: value,
    }));
  };
  const handleNoiseRatingChange = (e) => {
        setNoiseRating(parseInt(e.target.value));
    };
  const handleSeatingRatingChange = (e) => {
        setSeatingRating(parseInt(e.target.value));
    };
  const handleWifiRatingChange = (e) => {
        setWifiRating(parseInt(e.target.value));
    };
  const handleReviewSubmit = async (e) => {
      e.preventDefault(); // Prevent default form submission
     try {
         const db = getFirestore();
         const cafeDocRef = doc(db, "cafes", cafeId);
         // Create new review object
         const reviewToAdd = {
             user: newReview.user || "Anonymous", // Default to "Anonymous" if no name
             rating: parseInt(newReview.rating),
             text: newReview.text,
             noiseRating: noiseRating,
             seatingRating: seatingRating,
             wifiRating: wifiRating,
         };
         // Add the new review to the existing reviews or create a new array with one review
         const updatedReviews = [...(cafe.reviews || []), reviewToAdd];
         // Update the reviews array in the Firebase document
         await updateDoc(cafeDocRef, { reviews: updatedReviews });
         // Update local state with the new review data
         setReviews(updatedReviews);
         setCafe((prevCafe) => ({
             ...prevCafe,
             reviews: updatedReviews,
         }));
         // Clear the form
         setNewReview({
             user: "",
             rating: 5,
             text: "",
         });
          // Clear the amenity ratings
          setNoiseRating(null);
          setSeatingRating(null);
          setWifiRating(null);
     } catch (error) {
         console.error("Error submitting review:", error);
         setError("Error submitting review: " + error.message);
     }
  };
  // // if (loading) {
  // //   return (
  // //     <div className="bg-[#F0ECE3] min-h-screen flex items-center justify-center">
  // //       <div className="bg-white p-6 rounded-lg shadow-lg">
  // //         <p className="text-xl">Loading cafe details...</p>
  // //       </div>
  // //     </div>
  // //   );
  // // }
  // if (error || !cafe) {
  //   return (
  //     <div className="bg-[#F0ECE3] min-h-screen flex items-center justify-center">
  //       <div className="bg-white p-6 rounded-lg shadow-lg">
  //         <p className="text-xl text-red-500">{error || "Cafe not found"}</p>
  //         <button 
  //           onClick={handleBack}
  //           className="mt-4 bg-[#A07855] text-white py-2 px-4 rounded hover:bg-[#8C6A50]"
  //         >
  //           Go Back
  //         </button>
  //       </div>
  //     </div>
  //   );
  // } 
  // end of that big main merge



  const cafe = cafeList.find((c) => c.id === id); // console.log(cafe)
  console.log("Cafe Schema:", cafe); // Log the entire cafe object to inspect its structure

  // error handling logic
  if (!cafe) return <h1>Loading...</h1>;
  

  return (
  <div className="bg-[#F0ECE3] min-h-screen flex flex-col">

  {/* <header className="bg-[#5B4A43] p-4 flex items-center justify-between">
    <button onClick={handleBack} className="text-white">
      <ArrowLeft color="#FFFFFF" size={24} />
    </button>
    <h1 className="text-white text-xl font-semibold">View Cafe Reviews</h1>
    <div></div>
  </header> */}

  
    {/* placeholder img */}
    {cafe.images && cafe.images.length > 0 ? (
      <img
        className="w-full h-64 object-cover"
        src={cafe.images[0]}
        alt={`Cafe ${cafe.name}`}
      />
    ) : (
      <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
        <ImageIcon color="#A07855" size={48} />
        <p className="ml-2 text-gray-500">No Images Available</p>
      </div>
    )}


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
              <strong>{day}:</strong> {formatHours(hours)}
              </li>
          ))}
      </ul>
      </div>

      {/* Hours - Placeholder for now */}
      {/* <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Open now until 6:00PM | <button className="text-[#007BFF] text-sm hover:underline">See hours</button>
        </h3>
      </div> */}

      {/* Amenities */}
      <div className="mb-4">
        <p className="text-gray-800 font-medium mb-2">Amenities:</p>
        {cafe.attributes ? (
          <ul className="list-none text-gray-600 space-y-1">
            {Object.entries(cafe.attributes)
              .map(([key, rawValue]) => {
                // Parse JSON-like strings and clean up 'u' prefixes
                let value = rawValue;
                if (typeof value === "string") {
                  try {
                    value = value
                      .replace(/'/g, '"')
                      .replace(/\bTrue\b/g, "true")
                      .replace(/\bFalse\b/g, "false")
                      .replace(/\bNone\b/g, "null")
                      .replace(/u"([^"]+)"/g, '"$1"');
                    value = JSON.parse(value);
                  } catch (e) {
                    value = rawValue.replace(/u'/g, "").replace(/'/g, "");
                  }
                }

                // Skip irrelevant or falsy values
                if (value === null || value === false || value === "None") return null;

                // User-friendly formatting
                let displayText = "";
                switch (key) {
                  case "RestaurantsPriceRange2":
                    displayText = `Price Range: ${"💲".repeat(parseInt(value))} (out of 4)`;
                    break;
                  case "RestaurantsTakeOut":
                    displayText = value ? "Takeout Available" : "No Takeout";
                    break;
                  case "RestaurantsDelivery":
                    displayText = value ? "Delivery Available" : "No Delivery";
                    break;
                  case "BusinessParking":
                    if (typeof value === "object") {
                      const parkingOptions = Object.entries(value)
                        .filter(([_, v]) => v === true)
                        .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
                        .join(", ");
                      displayText = parkingOptions ? `Parking: ${parkingOptions}` : "No Parking Info";
                    }
                    break;
                  case "NoiseLevel":
                    displayText = `Noise Level: ${value.charAt(0).toUpperCase() + value.slice(1)}`;
                    break;
                  case "BusinessAcceptsCreditCards":
                    displayText = value ? "Accepts Credit Cards" : "Cash Only";
                    break;
                  case "BikeParking":
                    displayText = value ? "Bike Parking Available" : "No Bike Parking";
                    break;
                  case "OutdoorSeating":
                    displayText = value ? "Outdoor Seating Available" : "No Outdoor Seating";
                    break;
                  case "WiFi":
                    displayText = `WiFi: ${value.charAt(0).toUpperCase() + value.slice(1)}`;
                    break;
                  case "Caters":
                    displayText = value ? "Catering Available" : "No Catering";
                    break;
                  case "HasTV":
                    displayText = value ? "TV Available" : "No TV";
                    break;
                  case "RestaurantsAttire":
                    displayText = `Dress Code: ${value.charAt(0).toUpperCase() + value.slice(1)}`;
                    break;
                  case "Alcohol":
                    displayText = `Alcohol: ${value === "none" ? "None" : value.charAt(0).toUpperCase() + value.slice(1)}`;
                    break;
                  case "GoodForKids":
                    displayText = value ? "Good for Kids" : "Not Kid-Friendly";
                    break;
                  case "RestaurantsGoodForGroups":
                    displayText = value ? "Good for Groups" : "Not Ideal for Groups";
                    break;
                  case "GoodForMeal":
                    if (typeof value === "object") {
                      const meals = Object.entries(value)
                        .filter(([_, v]) => v === true)
                        .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
                        .join(", ");
                      displayText = meals ? `Good for: ${meals}` : null;
                    }
                    break;
                  case "Ambience":
                    if (typeof value === "object") {
                      const ambiences = Object.entries(value)
                        .filter(([_, v]) => v === true)
                        .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
                        .join(", ");
                      displayText = ambiences ? `Ambience: ${ambiences}` : null;
                    }
                    break;
                  default:
                    displayText = `${key}: ${value}`; // Fallback
                }

                return displayText ? (
                  <li key={key} className="flex items-center">
                    <CheckCircle size={16} color="#A07855" className="mr-2" />
                    {displayText}
                  </li>
                ) : null;
              })
              .filter(Boolean)}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No amenities information available.</p>
        )}
      </div>

    </div>


    {/* Cafe Reviews Card (Right Side)*/}
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex-1">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Cafe Reviews</h3>

        {/* Write a Review Form */}
        <form onSubmit={handleReviewSubmit} className="mb-4">
          {/* User Name Input */}
          <div className="mb-2">
            <label htmlFor="user" className="block text-gray-700 text-sm font-bold mb-1">
              Your Name:
            </label>
            <input
              type="text"
              id="user"
              name="user"
              value={newReview.user}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
              placeholder="Enter your name (optional)"
            />
          </div>

          {/* Overall Rating Select */}
          <div className="mb-2">
            <label htmlFor="rating" className="block text-gray-700 text-sm font-bold mb-1">
              Overall Rating:
            </label>
            <select
              id="rating"
              name="rating"
              value={newReview.rating}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
            >
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {/* Amenity Ratings */}
        <div className="mb-2">
          <label className="block text-gray-700 text-sm font-bold mb-1">
            Rate Amenities:
          </label>
          {/* Noise Rating */}
          <div className="flex items-center mb-1">
            <label htmlFor="noiseRating" className="mr-2 text-gray-700 text-sm">Noise:</label>
            <select
              id="noiseRating"
              name="noiseRating"
              value={noiseRating === null ? '' : noiseRating}
              onChange={handleNoiseRatingChange}
              className="shadow appearance-none border rounded py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
            >
              <option value="">Select</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {/* Seating Rating */}
          <div className="flex items-center mb-1">
            <label htmlFor="seatingRating" className="mr-2 text-gray-700 text-sm">Seating:</label>
            <select
              id="seatingRating"
              name="seatingRating"
              value={seatingRating === null ? '' : seatingRating}
              onChange={handleSeatingRatingChange}
              className="shadow appearance-none border rounded py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
            >
              <option value="">Select</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {/* Wifi Rating */}
          <div className="flex items-center mb-1">
            <label htmlFor="wifiRating" className="mr-2 text-gray-700 text-sm">Wifi:</label>
            <select
              id="wifiRating"
              name="wifiRating"
              value={wifiRating === null ? '' : wifiRating}
              onChange={handleWifiRatingChange}
              className="shadow appearance-none border rounded py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
            >
              <option value="">Select</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

          {/* Review Textarea */}
          <div className="mb-4">
            <label htmlFor="text" className="block text-gray-700 text-sm font-bold mb-1">
              Your Review:
            </label>
            <textarea
              id="text"
              name="text"
              value={newReview.text}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm h-24 resize-none"
              placeholder="Write your review here"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-[#A07855] hover:bg-[#8C6A50] text-white font-semibold py-2 px-4 rounded-md block w-full text-center focus:outline-none focus:ring-2 focus:ring-[#A07855] focus:ring-opacity-50"
          >
            Submit Review
          </button>
        </form>

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <ul className="space-y-6">
            {reviews.map((review, index) => (
              <li key={index} className={`${index < reviews.length - 1 ? 'border-b pb-4' : ''}`}>
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
                    </div>
                    {/* Display Amenity Ratings */}
                    {review.noiseRating && <div className="text-gray-600 text-xs">Noise: {review.noiseRating}/5</div>}
                    {review.seatingRating && <div className="text-gray-600 text-xs">Seating: {review.seatingRating}/5</div>}
                    {review.wifiRating && <div className="text-gray-600 text-xs">Wifi: {review.wifiRating}/5</div>}
                  </div>
                </div>
                <p className="text-gray-700 text-sm">{review.text}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>
    </div>


  </div>
  );
}
        

export default CafeView;