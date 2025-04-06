import { db } from '../src/config/firebase.js';
import { updateDoc, collection, getDocs } from 'firebase/firestore';

// grabbing cafe list from firestore
const cafesCollectionRef = collection(db, 'cafes');

// adding "owner" attribute to cafe object
const addOwnerAttribute = async () => {
    try {
        const cafesData = await getDocs(cafesCollectionRef);
        cafesData.forEach(async (doc) => {
        const cafe = doc.data();
        await updateDoc(doc.ref, {
            ownerId: null,
        });
        console.log(`Added owner attribute to ${cafe.name}`);
        });
    } catch (error) {
        console.error('Error adding owner attribute:', error);
    }
};

const modifyCafes = async() => {
    console.log("Adding owner attribute to cafes...");
    await addOwnerAttribute();
};

modifyCafes();