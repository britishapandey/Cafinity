// scripts/populateLongBeachCafes.js
import { Client as GoogleMapsClient } from '@googlemaps/google-maps-services-js';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the service account JSON file
const serviceAccount = JSON.parse(
  fs.readFileSync('./serviceAccountKey.json', 'utf8')
);

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Initialize Google Maps client
const googleMapsClient = new GoogleMapsClient({});

// Ensure Google API key is available
const apiKey = process.env.VITE_GOOGLE_API_KEY;
if (!apiKey) {
  console.error('ERROR: Google Maps API key not found. Please add VITE_GOOGLE_API_KEY to your .env file.');
  process.exit(1);
}

// Constants for Long Beach search
const LONG_BEACH_LOCATION = '33.7701,-118.1937'; // Lat,Lng for Long Beach
const SEARCH_RADIUS = 8000; // 8km radius (covers most of Long Beach)

/**
 * Main function to fetch and store cafes
 */
async function fetchAndStoreCafes() {
  console.log('Starting to fetch cafes in Long Beach...');
  
  try {
    // Create data directory for backups if it doesn't exist
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Search for coffee shops
    console.log('Searching for coffee shops...');
    const coffeeShopsResults = await searchNearby('coffee', LONG_BEACH_LOCATION, SEARCH_RADIUS);
    
    // Search for cafes
    console.log('Searching for cafes...');
    const cafesResults = await searchNearby('cafe', LONG_BEACH_LOCATION, SEARCH_RADIUS);
    
    // Combine and deduplicate results
    const combinedPlaces = new Map();
    
    // Add coffee shops
    coffeeShopsResults.forEach(place => {
      combinedPlaces.set(place.place_id, place);
    });
    
    // Add cafes (if not already added)
    cafesResults.forEach(place => {
      if (!combinedPlaces.has(place.place_id)) {
        combinedPlaces.set(place.place_id, place);
      }
    });
    
    const allPlaces = Array.from(combinedPlaces.values());
    console.log(`Found ${allPlaces.length} unique cafes and coffee shops in Long Beach.`);
    
    // Save initial results to file
    fs.writeFileSync(
      path.join(dataDir, 'longbeach_initial_results.json'),
      JSON.stringify(allPlaces, null, 2)
    );
    
    // Process each place
    let count = 0;
    
    for (const place of allPlaces) {
      console.log(`Processing details for ${place.name}...`);
      
      try {
        // Get place details
        const details = await getPlaceDetails(place.place_id);
        
        // Skip permanently closed places
        if (details.business_status === 'CLOSED_PERMANENTLY') {
          console.log(`Skipping ${place.name} - permanently closed`);
          continue;
        }
        
        // Extract address components
        let city = 'Long Beach';
        let state = 'CA';
        let postalCode = '';
        let streetAddress = '';
        
        if (details.address_components) {
          for (const component of details.address_components) {
            if (component.types.includes('locality')) {
              city = component.long_name;
            } else if (component.types.includes('administrative_area_level_1')) {
              state = component.short_name;
            } else if (component.types.includes('postal_code')) {
              postalCode = component.long_name;
            } else if (component.types.includes('street_number') || component.types.includes('route')) {
              streetAddress += (streetAddress ? ' ' : '') + component.long_name;
            }
          }
        }
        
        // Format opening hours
        const hours = {};
        if (details.opening_hours?.periods) {
          const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          
          details.opening_hours.periods.forEach(period => {
            if (!period.open || !period.close) return;
            
            const day = daysOfWeek[period.open.day];
            const openHours = period.open.time.substring(0, 2);
            const openMinutes = period.open.time.substring(2, 4);
            const closeHours = period.close.time.substring(0, 2);
            const closeMinutes = period.close.time.substring(2, 4);
            
            hours[day] = `${openHours}:${openMinutes}-${closeHours}:${closeMinutes}`;
          });
        }
        
        // Format photos
        const photos = [];
        if (details.photos && details.photos.length > 0) {
          details.photos.forEach(photo => {
            photos.push({
              photo_id: photo.photo_reference,
              url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${apiKey}`,
              width: photo.width,
              height: photo.height
            });
          });
        }
        
        // Create cafe document (without reviews)
        const cafeDoc = {
          // Basic info
          name: place.name,
          address: streetAddress || place.vicinity,
          city: city,
          state: state,
          postal_code: postalCode,
          latitude: place.geometry?.location.lat,
          longitude: place.geometry?.location.lng,
          stars: place.rating || 0,
          review_count: place.user_ratings_total || 0,
          is_open: details.business_status === 'OPERATIONAL' ? 1 : 0,
          
          // Cafinity fields
          attributes: {
            BusinessAcceptsCreditCards: "True", // Default value, could be changed based on actual data
            BikeParking: "False",
            NoiseLevel: "u'average'",
            RestaurantsGoodForGroups: "True",
            OutdoorSeating: place.plus_code?.compound_code?.includes("patio") ? "True" : "False",
            DriveThru: "False",
            WiFi: "u'free'"
          },
          categories: "Coffee & Tea, Cafe",
          hours: hours,
          images: photos,
          business_id: place.place_id,
          ownerId: null,
          
          // Additional Google data
          place_id: place.place_id,
          formatted_address: place.formatted_address || place.vicinity,
          website: details.website || '',
          phone: details.formatted_phone_number || '',
          price_level: details.price_level || 0,
          types: place.types || [],
          
          // Metadata
          fetched_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // Use a transaction to ensure atomic operations
        await db.runTransaction(async (transaction) => {
          // Create a reference to the cafe document
          const cafeRef = db.collection('googleCafes').doc(place.place_id);
          
          // Add the cafe document
          transaction.set(cafeRef, cafeDoc);
          
          // Add reviews as a subcollection
          if (details.reviews && details.reviews.length > 0) {
            for (const review of details.reviews) {
              // Create a unique ID for the review
              const reviewId = `google_${review.time}_${review.author_name?.replace(/\s+/g, '_').toLowerCase() || 'anonymous'}`;
              const reviewRef = cafeRef.collection('reviews').doc(reviewId);
              
              // Format review data
              const reviewData = {
                user: review.author_name || 'Anonymous',
                userId: `google_${review.author_name?.replace(/\s+/g, '_').toLowerCase() || 'anonymous'}`,
                rating: review.rating || 0,
                text: review.text || '',
                date: new Date(review.time * 1000).toISOString(),
                source: 'google_places',
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp()
              };
              
              // Add the review to the transaction
              transaction.set(reviewRef, reviewData);
            }
          }
        });
        
        count++;
        console.log(`Saved cafe ${place.name} with ID ${place.place_id} and its reviews`);
        
        // Add short delay to be nice to the API
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error processing ${place.name}:`, error);
      }
    }
    
    console.log(`Successfully saved ${count} cafes to Firestore with reviews as subcollections`);
  } catch (error) {
    console.error('Error fetching cafes:', error);
    throw error;
  }
}

/**
 * Search for places nearby a location
 */
async function searchNearby(keyword, location, radius) {
  const results = [];
  let pageToken = null;
  
  do {
    try {
      const params = {
        keyword: keyword,
        location: location,
        radius: radius,
        type: 'cafe', // This helps filter for cafe-like establishments
        key: apiKey
      };
      
      // Add page token if we have one
      if (pageToken) {
        params.pagetoken = pageToken;
      }
      
      const response = await googleMapsClient.placesNearby({
        params: params
      });
      
      if (response.data.status === 'OK' || response.data.status === 'ZERO_RESULTS') {
        if (response.data.results && response.data.results.length > 0) {
          results.push(...response.data.results);
        }
        
        pageToken = response.data.next_page_token;
        
        // Need to wait a short time before using the page token
        if (pageToken) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } else {
        console.error(`Places API error: ${response.data.status}`);
        break;
      }
    } catch (error) {
      console.error(`Error in searchNearby for ${keyword}:`, error);
      break;
    }
  } while (pageToken);
  
  console.log(`Found ${results.length} ${keyword} places`);
  return results;
}

/**
 * Get details for a specific place
 */
async function getPlaceDetails(placeId) {
  try {
    const response = await googleMapsClient.placeDetails({
      params: {
        place_id: placeId,
        fields: [
          'address_component',
          'business_status',
          'formatted_address',
          'formatted_phone_number',
          'geometry',
          'name',
          'opening_hours',
          'photo',
          'place_id',
          'plus_code',
          'price_level',
          'rating',
          'review',
          'type',
          'user_ratings_total',
          'website'
        ],
        key: apiKey
      }
    });
    
    if (response.data.status === 'OK') {
      return response.data.result;
    } else {
      console.error(`Place details API error for ${placeId}: ${response.data.status}`);
      return {};
    }
  } catch (error) {
    console.error(`Error fetching place details for ${placeId}:`, error);
    return {};
  }
}

// Run the script
fetchAndStoreCafes()
  .then(() => {
    console.log('Cafe data processing complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });