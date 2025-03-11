import { useState, useEffect } from 'react';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import axios from 'axios';

const IMGUR_CLIENT_ID = import.meta.env.VITE_IMGUR_CLIENT_ID;


function CafeForm({ onSubmitCafe }) { 
  const [newCafeName, setNewCafeName] = useState("");
  const [newCafeAddress, setNewCafeAddress] = useState("");
  const [newCafeState, setNewCafeState] = useState("");
  const [newCafeCity, setNewCafeCity] = useState("");
  const [newCafePostalCode, setNewCafePostalCode] = useState("");
  const [newCafeRating, setNewCafeRating] = useState(0);
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
    NoiseLevel: cafeNoiseLevel,
    RestaurantsGoodForGroups: cafeGoodForGroups,
    OutdoorSeating: cafeOutdoorSeating,
    DriveThru: cafeDriveThru,
    WiFi: cafeWiFi,
  });
  const [newCafeHours, setNewCafeHours] = useState({
    Friday: { open: "", close: "" },
    Monday: { open: "", close: "" },
    Saturday: { open: "", close: "" },
    Sunday: { open: "", close: "" },
    Thursday: { open: "", close: "" },
    Tuesday: { open: "", close: "" },
    Wednesday: { open: "", close: "" },
  });
  const [newCafeImages, setNewCafeImages] = useState([]);
  const [imageUrl, setImageUrl] = useState("");

  const daysOfWeek = ["Friday", "Monday", "Saturday", "Sunday", "Thursday", "Tuesday", "Wednesday"];

  // Sync newCafeAttributes with checkbox states
  useEffect(() => {
    setNewCafeAttributes({
      BusinessAcceptsCreditCards: cafeCreditCard,
      BikeParking: cafeBikeParking,
      NoiseLevel: cafeNoiseLevel,
      RestaurantsGoodForGroups: cafeGoodForGroups,
      OutdoorSeating: cafeOutdoorSeating,
      DriveThru: cafeDriveThru,
      WiFi: cafeWiFi,
    });
  }, [
    cafeCreditCard,
    cafeBikeParking,
    cafeNoiseLevel,
    cafeGoodForGroups,
    cafeOutdoorSeating,
    cafeDriveThru,
    cafeWiFi,
  ]);

  const handleImageUrl = () => {
    if (imageUrl) {
      setNewCafeImages([...newCafeImages, imageUrl]);
      setImageUrl("");
    }
  };

  // new function to upload imgur
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await axios.post("https://api.imgur.com/3/image", formData, {
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
            "Content-Type": "multipart/form-data",
          },
        });
        const imageUrl = response.data.data.link;
        setNewCafeImages([...newCafeImages, imageUrl]);
      } catch (err) {
        console.error("Error uploading to Imgur:", err);
        alert("Failed to upload image. Please try again.");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!newCafeName || !newCafeAddress) {
      alert("Please fill in the required fields (Cafe Name and Address).");
      return;
    }

    // Format hours into 'open-close' string
    const formattedHours = {};
    for (const day in newCafeHours) {
      const { open, close } = newCafeHours[day];
      formattedHours[day] = open && close ? `${open}-${close}` : "";
    }

    const newCafe = {
      name: newCafeName,
      address: newCafeAddress,
      city: newCafeCity,
      state: newCafeState,
      postal_code: newCafePostalCode,
      stars: newCafeRating,
      amenities: newCafeAttributes,
      hours: formattedHours,
      images: newCafeImages.length > 0 ? newCafeImages : ['https://static.vecteezy.com/system/resources/previews/026/398/113/non_2x/coffee-cup-icon-black-white-silhouette-design-vector.jpg'],
    };

    onSubmitCafe(newCafe);

    // Reset form
    setNewCafeName("");
    setNewCafeAddress("");
    setNewCafeCity("");
    setNewCafeState("");
    setNewCafePostalCode("");
    setNewCafeRating(0);
    setCafeCreditCard(false);
    setCafeBikeParking(false);
    setCafeNoiseLevel(false);
    setCafeGoodForGroups(false);
    setCafeOutdoorSeating(false);
    setCafeDriveThru(false);
    setCafeWiFi(false);
    setNewCafeHours({
      Friday: { open: "", close: "" },
      Monday: { open: "", close: "" },
      Saturday: { open: "", close: "" },
      Sunday: { open: "", close: "" },
      Thursday: { open: "", close: "" },
      Tuesday: { open: "", close: "" },
      Wednesday: { open: "", close: "" },
    });
    setNewCafeImages([]);
    setImageUrl("");
  };

  return (
    <div className="p-6 m-4 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Add a New Cafe</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <input
            id="cafe-name"
            placeholder="Cafe Name"
            value={newCafeName}
            onChange={(e) => setNewCafeName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              id="cafe-address"
              placeholder="Address"
              value={newCafeAddress}
              onChange={(e) => setNewCafeAddress(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <input
            id="cafe-city"
            placeholder="City"
            value={newCafeCity}
            onChange={(e) => setNewCafeCity(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
            <input
              id="cafe-state"
              placeholder="State"
              value={newCafeState}
              onChange={(e) => setNewCafeState(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              id="cafe-postalcode"
              placeholder="Zip Code"
              value={newCafePostalCode}
              onChange={(e) => setNewCafePostalCode(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Amenities</h4>
          <FormGroup className="">
            <div className="grid grid-cols-1 sm:grid-cols-2">
            <FormControlLabel
              control={<Checkbox checked={cafeCreditCard} />}
              label="Accepts Credit Card"
              onChange={(e) => setCafeCreditCard(e.target.checked)}
              />
            <FormControlLabel
              control={<Checkbox checked={cafeBikeParking} />}
              label="Bike Parking"
              onChange={(e) => setCafeBikeParking(e.target.checked)}
              />
            <FormControlLabel
              control={<Checkbox checked={cafeNoiseLevel} />}
              label="Quiet"
              onChange={(e) => setCafeNoiseLevel(e.target.checked)}
              />
            <FormControlLabel
              control={<Checkbox checked={cafeGoodForGroups} />}
              label="Good for Groups"
              onChange={(e) => setCafeGoodForGroups(e.target.checked)}
              />
            {/* </div> */}
            {/* <div className="flex flex-col"> */}
            <FormControlLabel
              control={<Checkbox checked={cafeOutdoorSeating} />}
              label="Outdoor Seating"
              onChange={(e) => setCafeOutdoorSeating(e.target.checked)}
            />
            <FormControlLabel
              control={<Checkbox checked={cafeDriveThru} />}
              label="Drive Thru"
              onChange={(e) => setCafeDriveThru(e.target.checked)}
            />
            <FormControlLabel
              control={<Checkbox checked={cafeWiFi} />}
              label="WiFi"
              onChange={(e) => setCafeWiFi(e.target.checked)}
              />
              </div>
          </FormGroup>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Hours</h4>
          {daysOfWeek.map((day) => (
            <div key={day} className="grid grid-cols-3 gap-4 mb-2">
              <label className="col-span-1">{day.charAt(0).toUpperCase() + day.slice(1)}</label>
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
                className="col-span-1 p-2 border rounded"
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
                className="col-span-1 p-2 border rounded"
              />
            </div>
          ))}
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Images</h4>
          <div className="flex gap-4">
            <input
              id="image-url"
              type="text"
              placeholder="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full"
            />
            <button
              onClick={handleImageUrl}
              disabled={!imageUrl}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add URL
            </button>
          </div>
          <div className="mt-4">
            <input
              id="image-upload"
              type="file"
              onChange={handleImageUpload}
              className="w-full p-2 border rounded"
            />
          </div>
          <ul className="mt-4 flex gap-4">
            {newCafeImages.map((image, index) => (
              <li key={index}>
                <img src={image} alt={`Cafe Image ${index + 1}`} className="w-24 h-24 object-cover rounded" />
              </li>
            ))}
          </ul>
        </div>

        <button
          type="submit"
          className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add Cafe
        </button>
      </form>
    </div>
  );
}

export default CafeForm;