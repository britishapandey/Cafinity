import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

//node importCafes.js

// Convert the module URL to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase service account key
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../config/serviceAccountKey.json'), 'utf8')
);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Read and parse cafes.json file
const cafes = fs
  .readFileSync(path.join(__dirname, '../data/cafes_ca.json'), 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((line) => JSON.parse(line));

// Import cafe data into Firestore
async function importData() {
  for (const cafe of cafes) {
    try {
      await db.collection('cafes').doc(cafe.business_id).set({
        name: cafe.name,
        address: cafe.address,
        city: cafe.city,
        state: cafe.state,
        postal_code: cafe.postal_code,
        latitude: cafe.latitude,
        longitude: cafe.longitude,
        stars: cafe.stars,
        review_count: cafe.review_count,
        is_open: cafe.is_open,
        attributes: cafe.attributes,
        categories: cafe.categories,
        hours: cafe.hours,
      });
      console.log(`Imported cafe: ${cafe.name}`);
    } catch (error) {
      console.error(`Error importing cafe ${cafe.name}:`, error);
    }
  }
  console.log('Data import completed.');
}

importData();