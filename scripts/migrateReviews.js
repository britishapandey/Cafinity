import { collection, getDocs, doc, updateDoc, deleteField, addDoc } from 'firebase/firestore';
import { db } from '../src/config/firebase.js';

// Migration function to move reviews from array to subcollection
const migrateReviewsToSubcollection = async () => {
  try {
    console.log("Starting reviews migration...");
    
    // Get all cafes
    const cafesSnapshot = await getDocs(collection(db, "cafes"));
    let totalReviewsMigrated = 0;
    
    for (const cafeDoc of cafesSnapshot.docs) {
      const cafeData = cafeDoc.data();
      const cafeId = cafeDoc.id;
      
      // Check if this cafe has reviews array
      if (cafeData.reviews && Array.isArray(cafeData.reviews) && cafeData.reviews.length > 0) {
        console.log(`Migrating ${cafeData.reviews.length} reviews for cafe: ${cafeData.name || cafeId}`);
        
        const reviewsCollectionRef = collection(db, "cafes", cafeId, "reviews");
        
        // Add each review to the subcollection
        for (const review of cafeData.reviews) {
          try {
            // Create a new document in the reviews subcollection
            await addDoc(reviewsCollectionRef, {
              ...review,
              // Add any missing fields that should be in the new structure
              userId: review.userId || "anonymous",
              date: review.date || new Date().toISOString(),
              // Make sure we have sensible defaults for required fields
              user: review.user || "Anonymous", 
              rating: review.rating || 5,
              text: review.text || ""
            });
            
            totalReviewsMigrated++;
            console.log(`Migrated review ${totalReviewsMigrated}`);
          } catch (reviewError) {
            console.error(`Error migrating individual review for cafe ${cafeData.name || cafeId}:`, reviewError);
          }
        }
        
        // Remove the reviews array from the cafe document
        try {
          await updateDoc(doc(db, "cafes", cafeId), {
            reviews: deleteField()
          });
          console.log(`Removed reviews array from cafe: ${cafeData.name || cafeId}`);
        } catch (updateError) {
          console.error(`Error removing reviews array from cafe ${cafeData.name || cafeId}:`, updateError);
        }
        
        console.log(`Migration completed for cafe: ${cafeData.name || cafeId}`);
      }
    }
    
    console.log(`Review migration completed successfully! ${totalReviewsMigrated} reviews migrated.`);
  } catch (error) {
    console.error("Error during migration:", error);
  }
};

// Run the migration
migrateReviewsToSubcollection();