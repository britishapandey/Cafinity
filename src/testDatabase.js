import { db } from './config/firebase.js'; // Adjust extension to .js
import { addDoc, collection, getDocs } from 'firebase/firestore';

// node src/testDatabase.js   -- to run testDatabase.js

// Collection reference
const cafesCollectionRef = collection(db, "cafes");

// Function to save a test cafe entry
const saveTestCafe = async () => {
  try {
    const newCafe = {
      name: "Homeboy",
      address: "9760 Garden Grove Blvd, Garden Grove, CA 92844",
      averageRating: 4.4,
      amenities: {
        noise: "3",
        seatingAvailability: "busy",
        wifi: true,
      },
      hours: {
        sunday: { open: "08:00", close: "22:00" },
        monday: { open: "08:00", close: "22:00" },
        tuesday: { open: "08:00", close: "22:00" },
        wednesday: { open: "08:00", close: "22:00" },
        thursday: { open: "08:00", close: "22:00" },
        friday: { open: "08:00", close: "22:00" },
        saturday: { open: "08:00", close: "22:00" },
      },
      images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
      location: {
        latitude: 33.77294147159124,
        longitude: -117.96227126465229,
      },
    };

    // Log the data being submitted
    console.log("Submitting the following cafe data to Firestore:");
    console.log(JSON.stringify(newCafe, null, 2)); // Pretty-print the object for clarity

    const docRef = await addDoc(cafesCollectionRef, newCafe);
    console.log(`Document added with ID: ${docRef.id}`);
  } catch (err) {
    console.error("Error adding document:", err);
  }
};


// Function to retrieve and log all cafe data
const getAllCafes = async () => {
  try {
    const data = await getDocs(cafesCollectionRef);
    const cafes = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

    cafes.forEach((cafe) => {
      const cafeJson = {
        name: cafe.name,
        address: cafe.address,
        rating: cafe.averageRating,
        amenities: {
          noiseLevel: cafe.amenities.noise,
          seatingAvailability: cafe.amenities.seatingAvailability,
          wifi: cafe.amenities.wifi,
        },
        hours: Object.entries(cafe.hours).map(([day, times]) => ({
          day: day.charAt(0).toUpperCase() + day.slice(1),
          open: times.open ? timeConvert(times.open) : "Closed",
          close: times.close ? timeConvert(times.close) : "Closed",
        })),
        images: cafe.images,
        location: cafe.location
          ? {
              latitude: cafe.location.latitude,
              longitude: cafe.location.longitude,
            }
          : "Not available",
      };

      // Logging in JSON format
      console.log(JSON.stringify(cafeJson, null, 2));
      console.log(`----------------------------------------`);
    });
  } catch (err) {
    console.error("Error retrieving documents:", err);
  }
};


// Function to convert 24-hour time to 12-hour format
function timeConvert(time) {
  const [hour, minute] = time.split(":");
  const hours = parseInt(hour, 10);
  const isAM = hours < 12;
  const formattedHour = hours % 12 || 12;
  const formattedMinute = minute.padStart(2, "0");
  const period = isAM ? "AM" : "PM";
  return `${formattedHour}:${formattedMinute} ${period}`;
}

// Run the test functions
const runTest = async () => {
  console.log("Saving test cafe...");
  await saveTestCafe();

  console.log("\nRetrieving cafes...");
  await getAllCafes();
};

runTest();
