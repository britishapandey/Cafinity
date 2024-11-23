# **Cafinity** ☕

## **Description**
Cafinity is an application that helps users locate nearby cafes, view detailed information about each cafe, and filter them based on various amenities such as Wi-Fi availability, seating options, and more. The app allows users to explore cafe hours, images, and locations, making it easier to find the perfect spot for a coffee break or study session.

## **Features**
- Search and filter cafes by location, amenities, and rating.
- View cafe details including address, opening hours, and available amenities.
- Access images of the cafe to get a better idea of the space.
- Get real-time location-based suggestions with integrated maps.

## **Tech Stack**
- **React**: A JavaScript library for building user interfaces.
- **Vite**: A build tool and development server for faster, optimized builds.
- **Firebase**: Backend as a service for database, authentication, and storage.
- **CSS**: Styling for the frontend.

## **Installation**

### **Prerequisites**
- Node.js (version 14 or above)
- npm (Node package manager)
- Firebase account (for Firestore and Hosting setup)

### **Step 1: Clone the repository**
```bash
git clone https://github.com/britishapandey/Cafinity.git
cd Cafinity
```

### **Step 2: Install dependencies**
```bash
npm install
```
This will install all dependencies listed in the `package.json` file.

### **Step 3: Set up Firebase**
Make sure you have a Firebase account and project. Add your Firebase configuration details in the `src/config/firebase.js` file to initialize Firebase services.
```bash
// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
```

### **Step 4: Run the Application**
To start the development server and view the app locally, run:
```bash
npm run dev
```

### **Folder Structure**
```bash
/Cafinity
├── /public
│   └── /assets
│
├── /src
│   ├── /components
│   │   └── auth.jsx
│   ├── /config
│   │   └── firebase.js
│   ├── App.css
│   ├── App.jsx
│   ├── index.css 
│   ├── main.jsx
│   └── testDatabase.js
│   
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── README.md
└── vite.config.js
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
