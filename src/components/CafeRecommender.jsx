import { useState, useEffect } from 'react';
import { Star, MapPin, Clock, Wifi, CreditCard, Users, Umbrella, Car } from 'lucide-react';

function CafeRecommender() {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Dummy data for cafes
  const dummyCafes = [
    {
      id: 1,
      name: "Morning Brew Coffee",
      address: "123 Main Street",
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
      images: ['https://static.vecteezy.com/system/resources/previews/026/398/113/non_2x/coffee-cup-icon-black-white-silhouette-design-vector.jpg'],
      category: 'popular'
    },
    {
      id: 2,
      name: "Urban Roast",
      address: "456 Market Ave",
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
      images: ['https://static.vecteezy.com/system/resources/previews/026/398/113/non_2x/coffee-cup-icon-black-white-silhouette-design-vector.jpg'],
      category: 'popular'
    },
    {
      id: 3,
      name: "The Coffee Studio",
      address: "789 Pine Street",
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
      images: ['https://static.vecteezy.com/system/resources/previews/026/398/113/non_2x/coffee-cup-icon-black-white-silhouette-design-vector.jpg'],
      category: 'recommended'
    },
    {
      id: 4,
      name: "Bean There Cafe",
      address: "101 Oak Street",
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
      images: ['https://static.vecteezy.com/system/resources/previews/026/398/113/non_2x/coffee-cup-icon-black-white-silhouette-design-vector.jpg'],
      category: 'nearby'
    },
    {
      id: 5,
      name: "Espresso Express",
      address: "222 Cedar Lane",
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
      images: ['https://static.vecteezy.com/system/resources/previews/026/398/113/non_2x/coffee-cup-icon-black-white-silhouette-design-vector.jpg'],
      category: 'nearby'
    },
    {
      id: 6,
      name: "The Grind House",
      address: "333 Maple Ave",
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
      images: ['https://static.vecteezy.com/system/resources/previews/026/398/113/non_2x/coffee-cup-icon-black-white-silhouette-design-vector.jpg'],
      category: 'recommended'
    },
    {
      id: 7,
      name: "Latte Love",
      address: "444 Birch Street",
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
      images: ['https://static.vecteezy.com/system/resources/previews/026/398/113/non_2x/coffee-cup-icon-black-white-silhouette-design-vector.jpg'],
      category: 'popular'
    },
    {
      id: 8,
      name: "Brewful Thinking",
      address: "555 Walnut Court",
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
      images: ['https://static.vecteezy.com/system/resources/previews/026/398/113/non_2x/coffee-cup-icon-black-white-silhouette-design-vector.jpg'],
      category: 'nearby'
    },
    {
      id: 9,
      name: "Rise & Grind",
      address: "666 Redwood Road",
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
      images: ['https://static.vecteezy.com/system/resources/previews/026/398/113/non_2x/coffee-cup-icon-black-white-silhouette-design-vector.jpg'],
      category: 'recommended'
    },
    {
      id: 10,
      name: "Daily Dose",
      address: "777 Spruce Avenue",
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
      images: ['https://static.vecteezy.com/system/resources/previews/026/398/113/non_2x/coffee-cup-icon-black-white-silhouette-design-vector.jpg'],
      category: 'popular'
    },
  ];

  useEffect(() => {
    // Simulate loading from an API
    const fetchCafes = () => {
      setTimeout(() => {
        setCafes(dummyCafes);
        setLoading(false);
      }, 1000);
    };

    fetchCafes();
  }, []);

  // Filter cafes based on selected category
  const filteredCafes = selectedCategory === 'all' 
    ? cafes 
    : cafes.filter(cafe => cafe.category === selectedCategory);

  // Generate stars display
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="text-yellow-500 fill-yellow-500" size={16} />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="text-yellow-500 fill-yellow-500" size={16} />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-gray-300" size={16} />);
    }

    return stars;
  };

  // Function to get today's hours
  const getTodayHours = (hoursObj) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    return hoursObj[today] || 'Closed';
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Top Cafes For You</h2>
      
      {/* Category filter */}
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
          Recommended
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
          <p className="text-gray-500">Loading cafes...</p>
        </div>
      ) : (
        <div className="overflow-y-auto max-h-96 pr-2">
          <div className="grid grid-cols-1 gap-6">
            {filteredCafes.map((cafe) => (
              <div key={cafe.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/3 h-48">
                    <img 
                      src={cafe.images[0]} 
                      alt={cafe.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-full md:w-2/3 p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold">{cafe.name}</h3>
                      <div className="flex items-center">
                        <span className="mr-1 font-semibold">{cafe.stars}</span>
                        <div className="flex">{renderStars(cafe.stars)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mt-2">
                      <MapPin size={16} className="mr-1" />
                      <p>{cafe.address}, {cafe.state} {cafe.postal_code}</p>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mt-2">
                      <Clock size={16} className="mr-1" />
                      <p>Today: {getTodayHours(cafe.hours)}</p>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {cafe.amenities.WiFi && (
                        <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          <Wifi size={12} className="mr-1" /> WiFi
                        </span>
                      )}
                      {cafe.amenities.BusinessAcceptsCreditCards && (
                        <span className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          <CreditCard size={12} className="mr-1" /> Credit Cards
                        </span>
                      )}
                      {cafe.amenities.RestaurantsGoodForGroups && (
                        <span className="inline-flex items-center bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                          <Users size={12} className="mr-1" /> Groups
                        </span>
                      )}
                      {cafe.amenities.OutdoorSeating && (
                        <span className="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          <Umbrella size={12} className="mr-1" /> Outdoor
                        </span>
                      )}
                      {cafe.amenities.DriveThru && (
                        <span className="inline-flex items-center bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                          <Car size={12} className="mr-1" /> Drive Thru
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">
                        View Details
                      </button>
                      <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                        Get Directions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CafeRecommender;