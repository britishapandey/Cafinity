import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function CafeForm({ onSubmitCafe }) {
  const [newCafeName, setNewCafeName] = useState("");
  const [newCafeAddress, setNewCafeAddress] = useState("");
  const [newCafeRating, setNewCafeRating] = useState(0);
  const [newCafeAmenities, setNewCafeAmenities] = useState({
    noise: "",
    seatingAvailability: "",
    wifi: false,
  });
  const [newCafeHours, setNewCafeHours] = useState({
    sunday: { open: "", close: "" },
    monday: { open: "", close: "" },
    tuesday: { open: "", close: "" },
    wednesday: { open: "", close: "" },
    thursday: { open: "", close: "" },
    friday: { open: "", close: "" },
    saturday: { open: "", close: "" },
  });
  const [newCafeImages, setNewCafeImages] = useState([]);
  const [imageUrl, setImageUrl] = useState(""); // State for URL input
  const [imageFile, setImageFile] = useState(null); // State for file input

  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

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
    if (!newCafeName || !newCafeAddress || newCafeRating === 0) {
      alert("Please fill in the required fields (Cafe Name, Address, and Rating).");
      return;
    }

    // Default values for optional fields if not provided
    const newCafe = {
      name: newCafeName,
      address: newCafeAddress,
      rating: newCafeRating,
      amenities: newCafeAmenities.noise || newCafeAmenities.seatingAvailability || newCafeAmenities.wifi ? newCafeAmenities : { noise: 'N/A', seatingAvailability: 'N/A', wifi: false },
      hours: newCafeHours.sunday.open || newCafeHours.monday.open || newCafeHours.tuesday.open ? newCafeHours : {}, // default empty hours if not provided
      images: newCafeImages.length > 0 ? newCafeImages : ['default-image-url'], // fallback to a default image URL if none are uploaded
    };

    onSubmitCafe(newCafe); // Submit the new cafe data

    // Clear form data after submission
    setNewCafeName("");
    setNewCafeAddress("");
    setNewCafeRating(0);
    setNewCafeAmenities({
      noise: "",
      seatingAvailability: "",
      wifi: false,
    });
    setNewCafeHours({
      sunday: { open: "", close: "" },
      monday: { open: "", close: "" },
      tuesday: { open: "", close: "" },
      wednesday: { open: "", close: "" },
      thursday: { open: "", close: "" },
      friday: { open: "", close: "" },
      saturday: { open: "", close: "" },
    });
    setNewCafeImages([]);
    setImageUrl("");
    setImageFile(null);
  };

  return (
    <div>
      <h2>Add a New Cafe</h2>
      
      <div>
        <label htmlFor="cafe-name">Cafe Name:</label>
        <input
          id="cafe-name"
          placeholder="Cafe name..."
          value={newCafeName}
          onChange={(e) => setNewCafeName(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="cafe-address">Cafe Address:</label>
        <input
          id="cafe-address"
          placeholder="Cafe address..."
          value={newCafeAddress}
          onChange={(e) => setNewCafeAddress(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="cafe-rating">Rating (0-5):</label>
        <input
          id="cafe-rating"
          type="number"
          placeholder="Rating"
          value={newCafeRating}
          onChange={(e) => setNewCafeRating(Number(e.target.value))}
        />
      </div>

      <div>
        <h4>Amenities</h4>
        <div>
          <label htmlFor="noise-level">Noise Level:</label>
          <input
            id="noise-level"
            placeholder="Noise Level"
            value={newCafeAmenities.noise}
            onChange={(e) =>
              setNewCafeAmenities({ ...newCafeAmenities, noise: e.target.value })
            }
          />
        </div>
        <div>
          <label htmlFor="seating-availability">Seating Availability:</label>
          <input
            id="seating-availability"
            placeholder="Seating Availability"
            value={newCafeAmenities.seatingAvailability}
            onChange={(e) =>
              setNewCafeAmenities({ ...newCafeAmenities, seatingAvailability: e.target.value })
            }
          />
        </div>
        <label htmlFor="wifi">
          <input
            id="wifi"
            type="checkbox"
            checked={newCafeAmenities.wifi}
            onChange={(e) =>
              setNewCafeAmenities({ ...newCafeAmenities, wifi: e.target.checked })
            }
          />
          Wi-Fi Available
        </label>
      </div>

      <div>
        <h4>Hours</h4>
        {daysOfWeek.map((day) => (
          <div key={day}>
            <label>{day.charAt(0).toUpperCase() + day.slice(1)}</label>
            <input
              type="time"
              placeholder="Open"
              value={newCafeHours[day].open}
              onChange={(e) =>
                setNewCafeHours({
                  ...newCafeHours,
                  [day]: { ...newCafeHours[day], open: e.target.value },
                })
              }
            />
            <input
              type="time"
              placeholder="Close"
              value={newCafeHours[day].close}
              onChange={(e) =>
                setNewCafeHours({
                  ...newCafeHours,
                  [day]: { ...newCafeHours[day], close: e.target.value },
                })
              }
            />
          </div>
        ))}
      </div>

      <div>
        <h4>Images</h4>
        <label htmlFor="image-url">Image URL:</label>
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
          <label htmlFor="image-upload">Upload Image:</label>
          <input
            id="image-upload"
            type="file"
            onChange={handleImageUpload}
          />
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
