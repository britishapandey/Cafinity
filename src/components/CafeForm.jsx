import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';

function CafeForm({ onSubmitCafe }) {
  const [newCafeName, setNewCafeName] = useState("");
  const [newCafeAddress, setNewCafeAddress] = useState("");
  const [newCafeState, setNewCafeState] = useState("");
  const [newCafePostalCode, setNewCafePostalCode] = useState("");
  const [newCafeRating, setNewCafeRating] = useState(0);
  // Below states are part of specific cafe attributes
  // TODO: Update them with all possible attributes in Yelp's schema
  const [cafeCreditCard, setCafeCreditCard] = useState(false);
  const [cafeBikeParking, setCafeBikeParking] = useState(false);
  const [cafeNoiseLevel, setCafeNoiseLevel] = useState(false);
  const [cafeGoodForGroups, setCafeGoodForGroups] = useState(false);
  const [cafeOutdoorSeating, setCafeOutdoorSeating] = useState(false);
  const [cafeDriveThru, setCafeDriveThru] = useState(false);
  const [cafeWiFi, setCafeWiFi] = useState(false);
  const [newCafeAttributes, setNewCafeAttributes] = useState({
    BusinessAcceptsCreditCards: cafeCreditCard,
    BikeParking: cafeBikeParking,
    // BusinessParking: "{'garage': False, 'street': False, 'validated': False, 'lot': False, 'valet': False}",
    NoiseLevel: cafeNoiseLevel,
    RestaurantsGoodForGroups: cafeGoodForGroups,
    OutdoorSeating: cafeOutdoorSeating,
    DriveThru: cafeDriveThru,
    WiFi: cafeWiFi
  });
  const [newCafeHours, setNewCafeHours] = useState({
    Friday: "",
    Monday: "",
    Saturday: "",
    Sunday: "",
    Thursday: "",
    Tuesday: "",
    Wednesday: "",
  });
  const [newCafeImages, setNewCafeImages] = useState([]);
  const [imageUrl, setImageUrl] = useState(""); // State for URL input
  const [imageFile, setImageFile] = useState(null); // State for file input

  const daysOfWeek = ["Friday", "Monday", "Saturday", "Sunday", "Thursday", "Tuesday", "Wednesday"];

  // Handle image URL input
  const handleImageUrl = () => {
    if (imageUrl) {
      setNewCafeImages([...newCafeImages, imageUrl]);
      setImageUrl(""); // Clear input after adding
    }
  };

  // Handle file input
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const storageRef = ref(storage, `cafes/${file.name}`);
      try {
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        setNewCafeImages([...newCafeImages, downloadURL]); // Save the URL to Firestore
      } catch (err) {
        console.error("Error uploading image:", err);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if required fields are filled
    if (!newCafeName || !newCafeAddress === 0) {
      alert("Please fill in the required fields (Cafe Name and Address).");
      return;
    }

    // Default values for optional fields if not provided
    const newCafe = {
      name: newCafeName,
      address: newCafeAddress,
      state: newCafeState,
      postal_code: newCafePostalCode,
      stars: newCafeRating,
      amenities: newCafeAttributes,
      hours: newCafeHours, // default empty hours if not provided
      images: newCafeImages.length > 0 ? newCafeImages : ['https://static.vecteezy.com/system/resources/previews/026/398/113/non_2x/coffee-cup-icon-black-white-silhouette-design-vector.jpg'], // fallback to a default image URL if none are uploaded
    };

    onSubmitCafe(newCafe); // Submit the new cafe data

    // Clear form data after submission
    setNewCafeName("");
    setNewCafeAddress("");
    setNewCafeRating(0);
    setCafeCreditCard(false);
    setCafeBikeParking(false);
    setCafeNoiseLevel(false);
    setCafeGoodForGroups(false);
    setCafeOutdoorSeating(false);
    setCafeDriveThru(false);
    setCafeWiFi(false);
    setNewCafeHours({
      Friday: "",
      Monday: "",
      Saturday: "",
      Sunday: "",
      Thursday: "",
      Tuesday: "",
      Wednesday: "",
    });
    setNewCafeImages([]);
    setImageUrl("");
    setImageFile(null);
  };

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-xl m-4 font-bold">Add a New Cafe</h2>
      <div className="flex">
        {/* <h2>Add a New Cafe</h2> */}
        <div className="">
          {/* <label htmlFor="cafe-name">Cafe Name:</label> */}
          <input
            id="cafe-name"
            placeholder="Cafe name..."
            value={newCafeName}
            onChange={(e) => setNewCafeName(e.target.value)}
            className="w-96"
          />
          </div>
      </div>

      <div>
        {/* <label htmlFor="cafe-rating">Rating (0-5):</label> */}
          <input
          id="cafe-address"
          placeholder="Address"
          value={newCafeAddress}
          onChange={(e) => setNewCafeAddress(e.target.value)}
          />
          <input
          id="cafe-state"
          placeholder="State"
          value={newCafeState}
          onChange={(e) => setNewCafeState(e.target.value)}
          className="w-20"
          />
          <input
          id="cafe-postalcode"
          placeholder="Zip Code"
          value={newCafePostalCode}
          onChange={(e) => setNewCafePostalCode(e.target.value)}
          className="w-28"
          />
      </div>

      <div>
        <h4>Amenities</h4>
        <div>
          {/* Quick checkbox form using MUI to handle amenities */}
          <FormGroup>
            <FormControlLabel control={<Checkbox />} label="Accepts Credit Card"
              onChange={(e) => (setCafeCreditCard(e.target.checked))}/>
            <FormControlLabel control={<Checkbox />} label="Bike Parking"
              onChange={(e) => (setCafeBikeParking(e.target.checked))}/>
            <FormControlLabel control={<Checkbox />} label="Quiet"
              onChange={(e) => (setCafeNoiseLevel(e.target.checked))}/>
            <FormControlLabel control={<Checkbox />} label="Good for Groups"
              onChange={(e) => (setCafeGoodForGroups(e.target.checked))}/>
            <FormControlLabel control={<Checkbox />} label="Outdoor Seating"
              onChange={(e) => (setCafeOutdoorSeating(e.target.checked))}/>
            <FormControlLabel control={<Checkbox />} label="Drive Thru"
              onChange={(e) => (setCafeDriveThru(e.target.checked))}/>
            <FormControlLabel control={<Checkbox />} label="WiFi"
              onChange={(e) => (setCafeWiFi(e.target.checked))}/>
          </FormGroup>
        </div>
      </div>

      <div>
        <h4>Hours</h4>
        {daysOfWeek.map((day) => (
          <div key={day}>
            <label>{day.charAt(0).toUpperCase() + day.slice(1)} </label>
            <input
              type="time"
              placeholder="Open"
              value={newCafeHours.day}
              onChange={(e) =>
                setNewCafeHours({
                  ...newCafeHours,
                  [day]: { ...newCafeHours.day },
                })
              }
            />
            <span> to </span>
            <input
              type="time"
              placeholder="Close"
              value={newCafeHours.day}
              onChange={(e) =>
                setNewCafeHours({
                  ...newCafeHours,
                  [day]: { ...newCafeHours.day + "-" + e.target.value },
                })
              }
            />
          </div>
        ))}
      </div>

      <div>
        <h4>Images</h4>
        {/* <label htmlFor="image-url">Image URL:</label> */}
        <div className="flex justify-center items-center">

          <input
            id="image-url"
            type="text"
            placeholder="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <button 
            onClick={handleImageUrl} 
            disabled={!imageUrl} // Disable if URL input is empty
          >
            Add URL
          </button>

          <div>
            {/* <label htmlFor="image-upload">Upload Image:</label> */}
            <input
              id="image-upload"
              type="file"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        <ul>
          {newCafeImages.map((image, index) => (
            <li key={index}>
              <img src={image} alt={`Cafe Image ${index + 1}`} width="100" />
            </li>
          ))}
        </ul>
      </div>

      <button onClick={handleSubmit}>Add Cafe</button>
    </div>
  );
}

export default CafeForm;
