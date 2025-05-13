import React, { useState, useEffect } from 'react';
import CafeCard from '../cafes/CafeCard';

// Enhanced mock user preferences
const mockUserPreferences = {
  favoriteAmenities: ['WiFi', 'OutdoorSeating', 'BikeParking'],
  visitedCafes: ['2', '5', '7'], // Cafe IDs
  ratings: {
    '2': 4,
    '5': 5,
    '7': 3
  },
  preferredNoiseLevel: 'quiet',
  preferredHours: {
    open: '07:00',
    close: '19:00',
    preferredVisitTime: '09:00' // Peak productivity time
  },
  location: {
    lat: 37.7749,
    lng: -122.4194
  },
  preferences: {
    maxPrice: 4, // Price range 1-4
    groupFriendly: true,
    studyFriendly: true,
    creditCardsAccepted: true,
    parkingPreference: 'bike', // 'bike', 'car', 'none'
    atmospherePreference: 'cozy', // 'cozy', 'modern', 'bustling'
    visitPurpose: ['work', 'study'], // 'social', 'work', 'study', 'casual'
    dietaryPreferences: ['vegan', 'glutenFree'],
    weekdayPreference: ['Monday', 'Wednesday', 'Friday']
  },
  recentSearches: ['quiet cafe', 'outdoor seating', 'study spots'],
  favoriteCategories: ['coffee shops', 'tea houses']
};

function CafeRecommender() {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userPreferences] = useState(mockUserPreferences);

  // Enhanced scoring system
  const scoreCafe = (cafe) => {
    let score = 0;
    let scoreBreakdown = {
      amenities: 0,
      noiseLevel: 0,
      rating: 0,
      visitHistory: 0,
      location: 0,
      hours: 0,
      preferences: 0
    };
    
    // Score based on amenities match (max 10 points)
    userPreferences.favoriteAmenities.forEach(amenity => {
      if (cafe.amenities[amenity] === true || cafe.amenities[amenity] === "True") {
        score += 2;
        scoreBreakdown.amenities += 2;
      }
    });

    // Score based on noise level preference (max 5 points)
    if (userPreferences.preferredNoiseLevel === cafe.amenities.NoiseLevel) {
      score += 5;
      scoreBreakdown.noiseLevel = 5;
    }

    // Score based on rating (max 5 points)
    score += cafe.stars;
    scoreBreakdown.rating = cafe.stars;

    // Score based on previous visits and ratings (max 5 points)
    if (userPreferences.visitedCafes.includes(cafe.id.toString())) {
      const userRating = userPreferences.ratings[cafe.id.toString()] || 0;
      const visitScore = userRating > 3 ? 5 : userRating;
      score += visitScore;
      scoreBreakdown.visitHistory = visitScore;
    }

    // Score based on location/category (max 5 points)
    if (cafe.category === 'nearby') {
      score += 5;
      scoreBreakdown.location = 5;
    }

    // Score based on hours matching preferred times (max 5 points)
    const preferredTime = parseInt(userPreferences.preferredHours.preferredVisitTime.split(':')[0]);
    const cafeOpenTime = parseInt(cafe.hours?.Monday?.split('-')[0]?.split(':')[0] || 0);
    const cafeCloseTime = parseInt(cafe.hours?.Monday?.split('-')[1]?.split(':')[0] || 0);
    
    if (cafeOpenTime <= preferredTime && cafeCloseTime >= preferredTime + 2) {
      score += 5;
      scoreBreakdown.hours = 5;
    }

    // Score based on additional preferences (max 10 points)
    if (cafe.amenities.RestaurantsGoodForGroups === userPreferences.preferences.groupFriendly) {
      score += 2;
      scoreBreakdown.preferences += 2;
    }
    
    if (cafe.amenities.BusinessAcceptsCreditCards === userPreferences.preferences.creditCardsAccepted) {
      score += 2;
      scoreBreakdown.preferences += 2;
    }

    if (cafe.amenities.BikeParking && userPreferences.preferences.parkingPreference === 'bike') {
      score += 2;
      scoreBreakdown.preferences += 2;
    }

    // Log scoring breakdown
    console.log(`Scoring breakdown for ${cafe.name}:`, {
      totalScore: score,
      breakdown: scoreBreakdown,
      matchingAmenities: userPreferences.favoriteAmenities.filter(amenity => 
        cafe.amenities[amenity] === true || cafe.amenities[amenity] === "True"
      ),
      openDuringPreferredTime: cafeOpenTime <= preferredTime && cafeCloseTime >= preferredTime + 2,
      previouslyVisited: userPreferences.visitedCafes.includes(cafe.id.toString()),
      userRating: userPreferences.ratings[cafe.id.toString()] || 'Not rated'
    });

    return score;
  };

  // Dummy data for cafes with added scoring
  const dummyCafes = [
    {
      id: 1,
      name: "Morning Brew Coffee",
      address: "123 Main Street",
      city: "Long Beach",
      state: "CA",
      postal_code: "94105",
      stars: 4.8,
      amenities: {
        BusinessAcceptsCreditCards: true,
        BikeParking: true,
        NoiseLevel: false,
        RestaurantsGoodForGroups: true,
        OutdoorSeating: true,
        DriveThru: false,
        WiFi: true,
      },
      hours: {
        Monday: "7:00-17:00",
        Tuesday: "7:00-17:00",
        Wednesday: "7:00-17:00",
        Thursday: "7:00-17:00",
        Friday: "7:00-19:00",
        Saturday: "8:00-19:00",
        Sunday: "8:00-16:00",
      },
      images: [
        'https://static.vecteezy.com/system/resources/previews/026/398/113/non_2x/coffee-cup-icon-black-white-silhouette-design-vector.jpg'
      ],
      category: 'popular'
    },
    {
      id: 2,
      name: "Urban Roast",
      address: "456 Market Ave",

      city: "Long Beach",
      state: "CA",
      postal_code: "94107",
      stars: 4.5,
      amenities: {
        BusinessAcceptsCreditCards: true,
        BikeParking: false,
        NoiseLevel: true,
        RestaurantsGoodForGroups: true,
        OutdoorSeating: true,
        DriveThru: false,
        WiFi: true,
      },
      hours: {
        Monday: "6:30-18:00",
        Tuesday: "6:30-18:00",
        Wednesday: "6:30-18:00",
        Thursday: "6:30-18:00",
        Friday: "6:30-20:00",
        Saturday: "7:00-20:00",
        Sunday: "7:00-17:00",
      },
      images: [
        'https://static.vecteezy.com/system/resources/previews/026/398/113/non_2x/coffee-cup-icon-black-white-silhouette-design-vector.jpg'
      ],
      category: 'popular'
    },
    {
      id: 3,
      name: "The Coffee Studio",
      address: "789 Pine Street",

      city: "Long Beach",
      state: "CA",
      postal_code: "94108",
      stars: 4.7,
      amenities: {
        BusinessAcceptsCreditCards: true,
        BikeParking: true,
        NoiseLevel: true,
        RestaurantsGoodForGroups: false,
        OutdoorSeating: false,
        DriveThru: false,
        WiFi: true,
      },
      hours: {
        Monday: "7:00-16:00",
        Tuesday: "7:00-16:00",
        Wednesday: "7:00-16:00",
        Thursday: "7:00-16:00",
        Friday: "7:00-16:00",
        Saturday: "8:00-17:00",
        Sunday: "8:00-16:00",
      },
      images: [
        'https://static.vecteezy.com/system/resources/previews/026/398/113/non_2x/coffee-cup-icon-black-white-silhouette-design-vector.jpg'
      ],
      category: 'recommended'
    },
    {
      id: 4,
      name: "Bean There Cafe",
      address: "101 Oak Street",

      city: "Long Beach",
      state: "CA",
      postal_code: "94110",
      stars: 4.2,
      amenities: {
        BusinessAcceptsCreditCards: true,
        BikeParking: true,
        NoiseLevel: false,
        RestaurantsGoodForGroups: true,
        OutdoorSeating: true,
        DriveThru: false,
        WiFi: true,
      },
      hours: {
        Monday: "8:00-17:00",
        Tuesday: "8:00-17:00",
        Wednesday: "8:00-17:00",
        Thursday: "8:00-17:00",
        Friday: "8:00-17:00",
        Saturday: "9:00-18:00",
        Sunday: "9:00-15:00",
      },
      images: [
        'https://static.vecteezy.com/system/resources/previews/026/398/113/non_2x/coffee-cup-icon-black-white-silhouette-design-vector.jpg'
      ],
      category: 'nearby'
    },
    {
      id: 5,
      name: "Espresso Express",
      address: "222 Cedar Lane",

      city: "Long Beach",
      state: "CA",
      postal_code: "94112",
      stars: 4.6,
      amenities: {
        BusinessAcceptsCreditCards: true,
        BikeParking: false,
        NoiseLevel: false,
        RestaurantsGoodForGroups: false,
        OutdoorSeating: false,
        DriveThru: true,
        WiFi: true,
      },
      hours: {
        Monday: "6:00-19:00",
        Tuesday: "6:00-19:00",
        Wednesday: "6:00-19:00",
        Thursday: "6:00-19:00",
        Friday: "6:00-19:00",
        Saturday: "7:00-19:00",
        Sunday: "7:00-19:00",
      },
      images: [
        'https://static.vecteezy.com/system/resources/previews/026/398/113/non_2x/coffee-cup-icon-black-white-silhouette-design-vector.jpg'
      ],
      category: 'nearby'
    },
    {
      id: 6,
      name: "The Grind House",
      address: "333 Maple Ave",

      city: "Long Beach",
      state: "CA",
      postal_code: "94114",
      stars: 4.9,
      amenities: {
        BusinessAcceptsCreditCards: true,
        BikeParking: true,
        NoiseLevel: true,
        RestaurantsGoodForGroups: true,
        OutdoorSeating: true,
        DriveThru: false,
        WiFi: true,
      },
      hours: {
        Monday: "7:30-18:00",
        Tuesday: "7:30-18:00",
        Wednesday: "7:30-18:00",
        Thursday: "7:30-18:00",
        Friday: "7:30-20:00",
        Saturday: "8:00-20:00",
        Sunday: "8:00-18:00",
      },
      images: [
        'https://static.vecteezy.com/system/resources/previews/026/398/113/non_2x/coffee-cup-icon-black-white-silhouette-design-vector.jpg'
      ],
      category: 'recommended'
    },
    {
      id: 7,
      name: "Latte Love",
      address: "444 Birch Street",

      city: "Long Beach",
      state: "CA",
      postal_code: "94115",
      stars: 4.4,
      amenities: {
        BusinessAcceptsCreditCards: true,
        BikeParking: true,
        NoiseLevel: false,
        RestaurantsGoodForGroups: true,
        OutdoorSeating: true,
        DriveThru: false,
        WiFi: true,
      },
      hours: {
        Monday: "8:00-16:00",
        Tuesday: "8:00-16:00",
        Wednesday: "8:00-16:00",
        Thursday: "8:00-16:00",
        Friday: "8:00-16:00",
        Saturday: "9:00-17:00",
        Sunday: "9:00-15:00",
      },
      images: [
        'https://static.vecteezy.com/system/resources/previews/026/398/113/non_2x/coffee-cup-icon-black-white-silhouette-design-vector.jpg'
      ],
      category: 'popular'
    },
    {
      id: 8,
      name: "Brewful Thinking",
      address: "555 Walnut Court",

      city: "Long Beach",
      state: "CA",
      postal_code: "94117",
      stars: 4.3,
      amenities: {
        BusinessAcceptsCreditCards: true,
        BikeParking: false,
        NoiseLevel: true,
        RestaurantsGoodForGroups: false,
        OutdoorSeating: false,
        DriveThru: false,
        WiFi: true,
      },
      hours: {
        Monday: "7:00-15:00",
        Tuesday: "7:00-15:00",
        Wednesday: "7:00-15:00",
        Thursday: "7:00-15:00",
        Friday: "7:00-15:00",
        Saturday: "8:00-16:00",
        Sunday: "Closed",
      },
      images: [
        'https://static.vecteezy.com/system/resources/previews/026/398/113/non_2x/coffee-cup-icon-black-white-silhouette-design-vector.jpg'
      ],
      category: 'nearby'
    },
    {
      id: 9,
      name: "Rise & Grind",
      address: "666 Redwood Road",

      city: "Long Beach",
      state: "CA",
      postal_code: "94118",
      stars: 4.1,
      amenities: {
        BusinessAcceptsCreditCards: true,
        BikeParking: true,
        NoiseLevel: false,
        RestaurantsGoodForGroups: true,
        OutdoorSeating: true,
        DriveThru: false,
        WiFi: false,
      },
      hours: {
        Monday: "6:30-14:30",
        Tuesday: "6:30-14:30",
        Wednesday: "6:30-14:30",
        Thursday: "6:30-14:30",
        Friday: "6:30-14:30",
        Saturday: "7:30-15:30",
        Sunday: "7:30-13:30",
      },
      images: [
        'https://static.vecteezy.com/system/resources/previews/026/398/113/non_2x/coffee-cup-icon-black-white-silhouette-design-vector.jpg'
      ],
      category: 'recommended'
    },
    {
      id: 10,
      name: "Daily Dose",
      address: "777 Spruce Avenue",

      city: "Long Beach",
      state: "CA",
      postal_code: "94119",
      stars: 4.0,
      amenities: {
        BusinessAcceptsCreditCards: true,
        BikeParking: false,
        NoiseLevel: false,
        RestaurantsGoodForGroups: true,
        OutdoorSeating: true,
        DriveThru: true,
        WiFi: true,
      },
      hours: {
        Monday: "5:00-18:00",
        Tuesday: "5:00-18:00",
        Wednesday: "5:00-18:00",
        Thursday: "5:00-18:00",
        Friday: "5:00-18:00",
        Saturday: "6:00-18:00",
        Sunday: "6:00-16:00",
      },
      images: [
        'https://static.vecteezy.com/system/resources/previews/026/398/113/non_2x/coffee-cup-icon-black-white-silhouette-design-vector.jpg'
      ],
      category: 'popular'
    },
  ];

  useEffect(() => {
    // Load and score cafes
    const scoredCafes = dummyCafes.map(cafe => {
      const score = scoreCafe(cafe);
      return {
        ...cafe,
        score,
        category: score > 25 ? 'recommended' : cafe.category // Adjusted threshold for recommendations
      };
    });

    // Sort cafes by score for all categories
    const sortedCafes = scoredCafes.sort((a, b) => b.score - a.score);
    
    setCafes(sortedCafes);
    setLoading(false);

    // Log overall recommendation summary
    console.log('Recommendation Summary:', {
      totalCafes: sortedCafes.length,
      recommendedCafes: sortedCafes.filter(c => c.score > 25).length,
      averageScore: sortedCafes.reduce((acc, curr) => acc + curr.score, 0) / sortedCafes.length,
      topRecommendations: sortedCafes.slice(0, 3).map(c => ({
        name: c.name,
        score: c.score
      }))
    });
  }, [userPreferences]);

  // Filter cafes based on selected category
  const filteredCafes = selectedCategory === 'all'
    ? cafes
    : cafes.filter(cafe => cafe.category === selectedCategory)
      .sort((a, b) => b.score - a.score);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Personalized Cafe Recommendations</h2>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Your Preferences</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Favorite Amenities:</strong> {userPreferences.favoriteAmenities.join(', ')}</p>
            <p><strong>Preferred Noise Level:</strong> {userPreferences.preferredNoiseLevel}</p>
            <p><strong>Preferred Visit Time:</strong> {userPreferences.preferredHours.preferredVisitTime}</p>
          </div>
          <div>
            <p><strong>Visit Purpose:</strong> {userPreferences.preferences.visitPurpose.join(', ')}</p>
            <p><strong>Atmosphere:</strong> {userPreferences.preferences.atmospherePreference}</p>
            <p><strong>Previously Visited:</strong> {userPreferences.visitedCafes.length} cafes</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-6 space-x-4">
        <button 
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full ${selectedCategory === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          All
        </button>
        <button 
          onClick={() => setSelectedCategory('popular')}
          className={`px-4 py-2 rounded-full ${selectedCategory === 'popular' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Popular
        </button>
        <button 
          onClick={() => setSelectedCategory('recommended')}
          className={`px-4 py-2 rounded-full ${selectedCategory === 'recommended' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          For You
        </button>
        <button
          onClick={() => setSelectedCategory('nearby')}
          className={`px-4 py-2 rounded-full ${selectedCategory === 'nearby' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Nearby
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B7AEE]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCafes.map((cafe) => (
            <div key={cafe.id} className="relative">
              <div className="absolute top-2 right-2 z-10 bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
                Score: {cafe.score.toFixed(1)}
              </div>
              <CafeCard cafe={cafe} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CafeRecommender;