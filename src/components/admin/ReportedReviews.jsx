import { useState } from 'react';
import { db } from '../../config/firebase.js';
import { doc, updateDoc, arrayRemove, deleteDoc } from "firebase/firestore";

function FeedbackList({ reviews }) {
    const [expandButtons, handleExpandButtons] = useState(null);
    const toggleButtons = (index) => {
        handleExpandButtons(expandButtons === index ? null : index);
      };

    const handleDeleteReview = async (cafeId, review) => {
      try {
        // ensuring deletion from both reported reviews and cafe reviews
        const cafeDocRef = doc(db, "cafes", cafeId);
        const reportDocRef = await doc(db, "reported", review.id);
        await updateDoc(cafeDocRef, {
          reviews: arrayRemove(review),
        });
        await deleteDoc(reportDocRef);
    
        alert("Review deleted successfully.");
      } catch (error) {
        console.error("Error deleting review:", error);
        alert("Failed to delete the review. Please try again.");
      }
    };

    const handleRemoveFlag = async (review) => {
        try {
            const reportDocRef = await doc(db, "reported", review.id);
            await deleteDoc(reportDocRef);
            alert("Flag removed from review.");
        } catch (err) {
            console.error("Error removing flag:", err);
            alert("Flag could not be removed from review. Please try again later.");
        }
    };

return (
    <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Flagged Reviews</h2>
        <div>
        {reviews && reviews.map((report, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer mb-4"
                onClick={() => toggleButtons(index)}>
                <a className="text-[#B07242]" href={'/cafe/'+report.cafeId}>{report.cafeName}</a>
                <p className="italic">{report.reason}</p>
                <p>"{report.reviewContent}"</p>
                <p className="text-gray-500 text-sm">User: {report.reportedUser}</p>
            {expandButtons === index && (
                <div className="flex justify-end mt-2">
                    <button
                        className="bg-[#6490E1] text-white px-4 py-2 rounded-lg hover:bg-white"
                        onClick={() => handleRemoveFlag(report)}
                        >
                        Remove Flag
                    </button>
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-white"
                        onClick={() => handleDeleteReview(report.cafeId, report.reviewContent)}
                        >
                        Delete Review
                    </button>
                </div>
            )}
            </div>
        ))}
        </div>
    </div>
)}

export default FeedbackList;