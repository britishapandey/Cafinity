// src/components/admin/SentimentSummary.jsx
import React from 'react';

function SentimentSummary({ sentimentData }) {
  const total = sentimentData.positive + sentimentData.neutral + sentimentData.negative;
  
  const calculatePercentage = (value) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Sentiment Overview</h2>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-green-600">Positive</span>
            <span className="text-sm font-medium text-green-600">{calculatePercentage(sentimentData.positive)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${calculatePercentage(sentimentData.positive)}%` }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-yellow-600">Neutral</span>
            <span className="text-sm font-medium text-yellow-600">{calculatePercentage(sentimentData.neutral)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${calculatePercentage(sentimentData.neutral)}%` }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-red-600">Negative</span>
            <span className="text-sm font-medium text-red-600">{calculatePercentage(sentimentData.negative)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${calculatePercentage(sentimentData.negative)}%` }}></div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-2xl font-bold">{total}</p>
        <p className="text-gray-500">Total Reviews</p>
      </div>
    </div>
  );
}

export default SentimentSummary;