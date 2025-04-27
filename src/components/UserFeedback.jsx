import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function UserFeedback({ db, id, feedback, setFeedback }) {
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [newFeedback, setNewFeedback] = useState({
    email: '',
    rating: 5,
    comment: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');


  const currentUser = getAuth().currentUser;


  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleRating = (rate) => {
    setRating(rate);
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const feedbackDocRef = doc(db, "feedbacks", id);
      const feedbackToAdd = {
        email: newFeedback.user || "Anonymous",
        rating: parseInt(newFeedback.rating),
        comment: newFeedback.comment,
        date: new Date().toISOString(),
        userID: currentUser.uid
      };

      // Use arrayUnion to add the new review without overwriting existing ones
      await updateDoc(feedbackDocRef, {
        reviews: arrayUnion(feedbackToAdd)
      });

      // Update local state
      setFeedback(prev => [...prev, reviewToAdd]);
      setNewFeedback({ user: "", rating: 5, comment: "" });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setReviewError("Error submitting feedback: " + error.message);
    }
    setSubmitted(true);
  };


  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">User Feedback</h2>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <input
              type="email"
              placeholder="Your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">Rate Your Experience:</h4>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-3xl cursor-pointer ${rating >= star ? 'text-yellow-400' : 'text-gray-400'}`}
                >
                  &#9733;
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <textarea
              placeholder="Your comments..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 border rounded h-24"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#6490E1] text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Submit Feedback
          </button>
        </form>
      ) : (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Thank You for Your Feedback!</h2>
          <p>Your rating: {rating} {rating === 1 ? 'star' : 'stars'}</p>
          <p>Your comment: "{comment}"</p>
        </div>
      )}

      {reviewError && (
        <div className="mt-4 text-red-500 text-center">
          {reviewError}
        </div>
      )}
    </div>
  );
}

export default UserFeedback;
