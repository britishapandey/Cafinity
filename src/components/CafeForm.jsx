import { useState } from 'react';

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

  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

  // Handle the button click for now to do nothing
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent any form submission behavior
    console.log("Button clicked, but nothing happens.");
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setNewCafeImages([...newCafeImages, e.target.value]);
              e.target.value = "";
            }
          }}
        />
        <ul>
          {newCafeImages.map((image, index) => (
            <li key={index}>{image}</li>
          ))}
        </ul>
      </div>

      <button onClick={handleSubmit}>Add Cafe</button>
    </div>
  );
}

export default CafeForm;
