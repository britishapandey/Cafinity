import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';
import { collection, getDocs, getFirestore, doc, updateDoc } from 'firebase/firestore';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '', // Ensure your API key is set in your .env file
  dangerouslyAllowBrowser: true, // Only for development/testing – do not expose your API key in production!
});

function CafeView() {
  const { cafeId } = useParams();
  const [cafe, setCafe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]); // State for reviews
  const [newReview, setNewReview] = useState({ // State for new review form
    user: '',
    rating: 5,
    text: '',
  });

  // Amenity rating state variables
  const [noiseRating, setNoiseRating] = useState(null);
  const [seatingRating, setSeatingRating] = useState(null);
  const [wifiRating, setWifiRating] = useState(null);

  // State for AI summary
  const [aiSummary, setAISummary] = useState('');
  const [loadingAISummary, setLoadingAISummary] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const getCafe = async () => {
      setLoading(true);
      try {
        const db = getFirestore();
        const cafesCollectionRef = collection(db, "cafes");
        const data = await getDocs(cafesCollectionRef);
        const cafeListFromFirebase = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        const foundCafe = cafeListFromFirebase.find((c) => c.id === cafeId);
        
        if (foundCafe) {
          setCafe(foundCafe);
          setReviews(foundCafe.reviews || []); // Initialize with existing reviews
        } else {
          setError("Cafe not found");
        }
      } catch (err) {
        console.error("Error fetching cafe:", err);
        setError("Error loading cafe data");
      } finally {
        setLoading(false);
      }
    };

    if (cafeId) {
      getCafe();
    }
  }, [cafeId]);

  const handleBack = () => {
    navigate(-1);
  };

  // Form handlers for new review
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
    e.preventDefault();
    try {
      const db = getFirestore();
      const cafeDocRef = doc(db, "cafes", cafeId);
      const reviewToAdd = {
        user: newReview.user || "Anonymous",
        rating: parseInt(newReview.rating),
        text: newReview.text,
        noiseRating: noiseRating,
        seatingRating: seatingRating,
        wifiRating: wifiRating,
      };
      const updatedReviews = [...(cafe.reviews || []), reviewToAdd];
      await updateDoc(cafeDocRef, { reviews: updatedReviews });
      setReviews(updatedReviews);
      setCafe((prevCafe) => ({
        ...prevCafe,
        reviews: updatedReviews,
      }));
      // Clear the review form
      setNewReview({
        user: "",
        rating: 5,
        text: "",
      });
      setNoiseRating(null);
      setSeatingRating(null);
      setWifiRating(null);
    } catch (error) {
      console.error("Error submitting review:", error);
      setError("Error submitting review: " + error.message);
    }
  };

  // Handler to generate an AI summary of reviews using the OpenAI package
  const handleAISummarize = async () => {
    setLoadingAISummary(true);
    // Concatenate review texts into one prompt
    const reviewsText = reviews.map((r) => r.text).join("\n");
    const prompt = `Summarize the following cafe reviews in a concise paragraph:\n\n${reviewsText}`;
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
      });
    
      if (response.choices && response.choices.length > 0) {
        setAISummary(response.choices[0].message.content.trim());
      } else {
        setAISummary("No summary generated.");
      }
    } catch (error) {
      console.error("Error summarizing reviews:", error);
      setAISummary("Error generating summary.");
    } finally {
      setLoadingAISummary(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#F0ECE3] min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-xl">Loading cafe details...</p>
        </div>
      </div>
    );
  }

  if (error || !cafe) {
    return (
      <div className="bg-[#F0ECE3] min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-xl text-red-500">{error || "Cafe not found"}</p>
          <button 
            onClick={handleBack}
            className="mt-4 bg-[#A07855] text-white py-2 px-4 rounded hover:bg-[#8C6A50]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F0ECE3] min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#5B4A43] p-4 flex items-center justify-between">
        <button onClick={handleBack} className="text-white">
          <ArrowLeft color="#FFFFFF" size={24} />
        </button>
        <h1 className="text-white text-xl font-semibold">View Cafe Reviews</h1>
        <div></div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row p-4 space-y-4 md:space-y-0 md:space-x-4">
        {/* Cafe Content Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex-1">
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
          {cafe.images && cafe.images.length > 0 && (
            <div className="p-6 pb-4 flex justify-end">
              <button className="text-[#A07855] text-sm flex items-center hover:underline">
                <ImageIcon color="#A07855" size={16} className="mr-1" />
                See photos
              </button>
            </div>
          )}
          <div className="px-6 pb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{cafe.name}</h2>
            <p className="text-gray-600 mb-4">{cafe.address}</p>
            <div className="flex items-center mb-4">
              <div className="flex items-center mr-2">
                {cafe.rating && [...Array(cafe.rating)].map((_, index) => (
                  <Star key={index} color="#FFC107" fill="#FFC107" size={20} />
                ))}
                {cafe.rating && [...Array(5 - cafe.rating)].map((_, index) => (
                  <Star key={index} color="#FFC107" size={20} />
                ))}
              </div>
              <span className="text-gray-500 text-sm ml-1">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </span>
            </div>
            {cafe.amenities && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Available amenities</h3>
                <ul className="space-y-2 text-sm">
                  {cafe.amenities.noise && (
                    <li className="flex items-center">
                      <CheckCircle color="#4CAF50" className="mr-2" size={16} />
                      Noise Level: {cafe.amenities.noise}
                    </li>
                  )}
                  {cafe.amenities.seatingAvailability && (
                    <li className="flex items-center">
                      <CheckCircle color="#4CAF50" className="mr-2" size={16} />
                      Seating: {cafe.amenities.seatingAvailability}
                    </li>
                  )}
                  {cafe.amenities.wifi !== undefined && (
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
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Open now until 6:00PM | <button className="text-[#007BFF] text-sm hover:underline">See hours</button>
              </h3>
            </div>
          </div>
        </div>

        {/* Cafe Reviews Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex-1">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Cafe Reviews</h3>

            {/* Write a Review Form */}
            <form onSubmit={handleReviewSubmit} className="mb-4">
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
              <button
                type="submit"
                className="bg-[#A07855] hover:bg-[#8C6A50] text-white font-semibold py-2 px-4 rounded-md block w-full text-center focus:outline-none focus:ring-2 focus:ring-[#A07855] focus:ring-opacity-50"
              >
                Submit Review
              </button>
            </form>

            {/* AI Review Summarizer */}
            <div className="mb-4">
              <button
                onClick={handleAISummarize}
                className="bg-[#A07855] hover:bg-[#8C6A50] text-white font-semibold py-2 px-4 rounded-md block w-full text-center focus:outline-none focus:ring-2 focus:ring-[#A07855] focus:ring-opacity-50"
              >
                {loadingAISummary ? "Generating Summary..." : "Ask for AI Review Summary"}
              </button>
            </div>
            {aiSummary && (
              <div className="bg-gray-100 p-4 rounded-md mb-4">
                <h4 className="font-bold text-gray-800 mb-2">AI Summary:</h4>
                <p className="text-gray-700">{aiSummary}</p>
              </div>
            )}

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <ul className="space-y-6">
                {reviews.map((review, index) => (
                  <li key={index} className={`${index < reviews.length - 1 ? 'border-b pb-4' : ''}`}>
                    <div className="flex items-start mb-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center overflow-hidden">
                        <span className="text-xl font-semibold text-gray-700">
                          {review.user.charAt(0).toUpperCase()}
                        </span>
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
                        {review.noiseRating && (
                          <div className="text-gray-600 text-xs">Noise: {review.noiseRating}/5</div>
                        )}
                        {review.seatingRating && (
                          <div className="text-gray-600 text-xs">Seating: {review.seatingRating}/5</div>
                        )}
                        {review.wifiRating && (
                          <div className="text-gray-600 text-xs">Wifi: {review.wifiRating}/5</div>
                        )}
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
    </div>
  );
}

export default CafeView;
