import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load your Firebase service account key
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../config/serviceAccountKey.json'), 'utf8')
);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Helper function to parse JSON or NDJSON files
function parseJsonFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8').trim();
  if (!content) return [];

  try {
    // Try parsing as single JSON array
    return JSON.parse(content);
  } catch (e) {
    // If that fails, try parsing as NDJSON (one JSON object per line)
    return content
      .split('\n')
      .filter(Boolean)
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (lineErr) {
          console.error(`Error parsing line: ${line}`);
          throw lineErr;
        }
      });
  }
}

// Read the photo.json file (contains photo metadata)
const photosPath = path.join(__dirname, '../data/filtered_photos.json');
const photos = parseJsonFile(photosPath);

// Read the cafes.json file (contains filtered cafe data)
const cafesPath = path.join(__dirname, '../data/cafes_ca.json');
const cafes = parseJsonFile(cafesPath);

// Create a Set of cafe business IDs for quick lookup
const cafeBusinessIds = new Set(cafes.map((cafe) => cafe.business_id));

// Filter photos to only include those associated with cafes
const cafePhotos = photos.filter((photo) => cafeBusinessIds.has(photo.business_id));

console.log(`Found ${cafePhotos.length} photos for ${cafes.length} cafes.`);

// Rest of your code remains the same...
async function importPhotos() {
  for (const photo of cafePhotos) {
    const { photo_id, business_id, caption, label } = photo;

    const photoUrl = `https://raw.githubusercontent.com/mel418/cafes-images/refs/heads/main/filtered-photos/${photo_id}.jpg`;

    const cafeRef = db.collection('cafes').doc(business_id);
    await cafeRef.update({
      images: admin.firestore.FieldValue.arrayUnion({
        url: photoUrl,
        caption: caption || '',
        label: label || '',
        photo_id: photo_id,
      }),
    });

    console.log(`Linked photo ${photo_id} for cafe ${business_id}`);
  }

  console.log('Photo linking completed.');
}

importPhotos().catch((error) => {
  console.error('Photo linking failed:', error);
  process.exit(1);
});