// src/components/admin/FeedbackList.jsx
import React, { useState } from 'react';
import { Star } from 'lucide-react';

function FeedbackList({ reviews }) {
  const [expandedReview, setExpandedReview] = useState(null);

  const toggleReview = (index) => {
    setExpandedReview(expandedReview === index ? null : index);
  };

  return (
    <div className="space-y-4">
      
      {reviews.length === 0 ? (
        <p className="text-center py-8 text-gray-500">No reviews found with the selected filter.</p>
      ) : (
        reviews.map((review, index) => (
          <div 
            key={index} 
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            onClick={() => toggleReview(index)}
          >
            <div className="flex justify-between items-start cursor-pointer">
              <div>
                <a className="font-medium text-[#B07242]" href={'/cafe/'+review.cafeId}>{review.cafeName}</a>
                <p className="text-sm text-gray-500">By {review.user || 'Anonymous'} • {new Date(review.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{review.rating}/5</span>
              </div>
            </div>
            
            {expandedReview === index && (
              <div className="mt-4 space-y-3 border-t pt-3">
                <p className="text-gray-700">{review.text}</p>
                
                {(review.noiseRating || review.seatingRating || review.wifiRating) && (
                  <div className="flex flex-wrap gap-2">
                    {review.noiseRating && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        Noise: {review.noiseRating}/5
                      </span>
                    )}
                    {review.seatingRating && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        Seating: {review.seatingRating}/5
                      </span>
                    )}
                    {review.wifiRating && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        WiFi: {review.wifiRating}/5
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2 mt-2">
                  <button className="text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200">
                    Respond
                  </button>
                  <button className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200">
                    Flag
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default FeedbackList;