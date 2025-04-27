// src/components/admin/FeedbackChart.jsx
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function FeedbackChart({ reviews, cafes }) {
  const [chartType, setChartType] = useState('cafes');
  
  // Process data for cafe ratings chart
  const prepareCafeData = () => {
    // Create a map of cafe ratings
    const cafeRatings = {};
    
    cafes.forEach(cafe => {
      if (!cafeRatings[cafe.id]) {
        cafeRatings[cafe.id] = {
          name: cafe.name,
          averageRating: 0,
          reviewCount: 0,
          totalRating: 0
        };
      }
    });
    
    // Add review data
    reviews.forEach(review => {
      if (cafeRatings[review.cafeId]) {
        cafeRatings[review.cafeId].reviewCount++;
        cafeRatings[review.cafeId].totalRating += review.rating;
      }
    });
    
    // Calculate averages and format for chart
    return Object.values(cafeRatings)
      .map(item => ({
        name: item.name,
        rating: item.reviewCount > 0 ? (item.totalRating / item.reviewCount).toFixed(1) : 0,
        reviews: item.reviewCount
      }))
      .filter(item => item.reviews > 0)
      .sort((a, b) => b.reviews - a.reviews)
      .slice(0, 10); // Get top 10 most reviewed cafes
  };
  
  // Process data for amenity ratings chart
  const prepareAmenityData = () => {
    const amenities = {
      noise: { name: 'Noise Level', total: 0, count: 0 },
      seating: { name: 'Seating', total: 0, count: 0 },
      wifi: { name: 'WiFi', total: 0, count: 0 }
    };
    
    reviews.forEach(review => {
      if (review.noiseRating) {
        amenities.noise.total += review.noiseRating;
        amenities.noise.count++;
      }
      if (review.seatingRating) {
        amenities.seating.total += review.seatingRating;
        amenities.seating.count++;
      }
      if (review.wifiRating) {
        amenities.wifi.total += review.wifiRating;
        amenities.wifi.count++;
      }
    });
    
    return Object.values(amenities).map(amenity => ({
      name: amenity.name,
      rating: amenity.count > 0 ? (amenity.total / amenity.count).toFixed(1) : 0,
      reviews: amenity.count
    }));
  };
  
  const data = chartType === 'cafes' ? prepareCafeData() : prepareAmenityData();

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Ratings Analysis</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('cafes')}
            className={`px-4 py-2 rounded-lg ${chartType === 'cafes' ? 'bg-[#6B7AEE] text-white' : 'bg-gray-200'}`}
          >
            Cafes
          </button>
          <button
            onClick={() => setChartType('amenities')}
            className={`px-4 py-2 rounded-lg ${chartType === 'amenities' ? 'bg-[#6B7AEE] text-white' : 'bg-gray-200'}`}
          >
            Amenities
          </button>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={60} 
              tick={{ fontSize: 12 }} 
            />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="rating" name="Avg. Rating" fill="#8884d8" />
            <Bar dataKey="reviews" name="Review Count" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default FeedbackChart;