import { useState } from 'react';
import { db } from '../../config/firebase.js';
import { doc, updateDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { Link } from 'react-router-dom'; // Make sure to import Link

function ReportedReviews({ reviews }) {
    const [expandButtons, handleExpandButtons] = useState(null);
    
    const toggleButtons = (index) => {
        handleExpandButtons(expandButtons === index ? null : index);
    };

    const handleDeleteReview = async (report) => {
        try {
            // Only proceed if we have the required IDs
            if (!report.cafeId || !report.reviewId) {
                alert("Missing required information to delete review");
                return;
            }
            
            // Delete from the reviews subcollection
            const reviewDocRef = doc(db, "googleCafes", report.cafeId, "reviews", report.reviewId);
            await deleteDoc(reviewDocRef);
            
            // Delete the report
            await deleteDoc(doc(db, "reported", report.id));
            
            // Update cafe rating stats
            await updateCafeRatingStats(report.cafeId);
            
            alert("Review deleted successfully.");
            
            // Optional: Refresh the page or update the UI
            window.location.reload();
        } catch (error) {
            console.error("Error deleting review:", error);
            alert("Failed to delete the review. Please try again.");
        }
    };

    // Add this function to update cafe stats after deleting a review
    const updateCafeRatingStats = async (cafeId) => {
        try {
            const reviewsCollectionRef = collection(db, "googleCafes", cafeId, "reviews");
            const reviewsSnapshot = await getDocs(reviewsCollectionRef);
            const reviewsData = reviewsSnapshot.docs.map(doc => doc.data());
            
            const cafeDocRef = doc(db, "googleCafes", cafeId);
            
            // Calculate average rating
            const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = reviewsData.length > 0 ? (totalRating / reviewsData.length).toFixed(1) : 0;
            
            // Update cafe document with new stats
            await updateDoc(cafeDocRef, {
                review_count: reviewsData.length,
                stars: parseFloat(averageRating)
            });
        } catch (error) {
            console.error("Error updating cafe rating stats:", error);
        }
    };

    const handleRemoveFlag = async (report) => {
        try {
            const reportDocRef = doc(db, "reported", report.id);
            await deleteDoc(reportDocRef);
            alert("Flag removed from review.");
            
            // Optional: Refresh the page or update the UI
            window.location.reload();
        } catch (err) {
            console.error("Error removing flag:", err);
            alert("Flag could not be removed from review. Please try again later.");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Flagged Reviews</h2>
            <div>
                {reviews && reviews.length > 0 ? (
                    reviews.map((report, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer mb-4"
                             onClick={() => toggleButtons(index)}>
                            {/* Cafe Name in Bold with Link to CafeView */}
                            <h3 className="font-bold text-lg">
                                {report.cafeId ? (
                                    <Link 
                                        to={`/cafe/${report.cafeId}`} 
                                        className="text-[#B07242] hover:underline"
                                        onClick={(e) => e.stopPropagation()} // Prevent card toggle when clicking link
                                    >
                                        {report.cafeName || "Unknown Cafe"}
                                    </Link>
                                ) : (
                                    <span className="text-[#B07242]">{report.cafeName || "Unknown Cafe"}</span>
                                )}
                            </h3>
                            
                            {/* Who flagged it in italics */}
                            <p className="italic text-gray-600 mb-2">
                                {report.reason || `Flagged by ${report.reportedBy || "Unknown"}`}
                            </p>
                            
                            {/* Review content in quotes */}
                            <p className="mb-2">"{report.reviewContent || "No content provided"}"</p>
                            
                            {/* Reviewer's name */}
                            <p className="text-gray-500 text-sm">
                                User: {report.reportedUser || "Anonymous"}
                            </p>
                            
                            {/* Action buttons */}
                            {expandButtons === index && (
                                <div className="flex justify-end mt-2">
                                    <button
                                        className="bg-[#6490E1] text-white px-4 py-2 rounded-lg hover:bg-[#5480D1] mr-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveFlag(report);
                                        }}
                                    >
                                        Remove Flag
                                    </button>
                                    <button
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteReview(report);
                                        }}
                                    >
                                        Delete Review
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500">No flagged reviews at this time.</p>
                )}
            </div>
        </div>
    );
}

export default ReportedReviews;