import { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { useParams } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

function UpdateCafe({ onSubmitCafe, storage }) { // Add storage as a prop
  const {id} = useParams();
  const [loading, setLoading] = useState(true);

  const [newCafeName, setNewCafeName] = useState("");
  const [newCafeAddress, setNewCafeAddress] = useState("");
  const [newCafeState, setNewCafeState] = useState("");
  const [newCafePostalCode, setNewCafePostalCode] = useState("");
  const [cafeCreditCard, setCafeCreditCard] = useState(false);
  const [cafeBikeParking, setCafeBikeParking] = useState(false);
  const [cafeNoiseLevel, setCafeNoiseLevel] = useState("");
  const [cafeGoodForGroups, setCafeGoodForGroups] = useState(false);
  const [cafeOutdoorSeating, setCafeOutdoorSeating] = useState(false);
  const [cafeDriveThru, setCafeDriveThru] = useState(false);
  const [cafeWiFi, setCafeWiFi] = useState("");
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
  
  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hourNum = parseInt(hours);
    const minNum = parseInt(minutes) || 0;
    const minuteStr = minNum < 10 ? `0${minNum}` : minNum;
    return `${hourNum}:${minuteStr}`;
  };

  const getCafe = async () => {
    setLoading(true);
    try {
        const cafeDoc = doc(db, "cafes", id);
        const docSnap = await getDoc(cafeDoc); // await getDoc(cafeDoc);
        if (docSnap) {
          console.log("Document data:", docSnap.data());
          setNewCafeName(docSnap.data().name);
          setNewCafeAddress(docSnap.data().address);
          setNewCafeState(docSnap.data().state);
          setNewCafePostalCode(docSnap.data().postal_code);
          setCafeCreditCard(docSnap.data().attributes.BusinessAcceptsCreditCards);
          setCafeBikeParking(docSnap.data().attributes.BikeParking);
          setCafeNoiseLevel(docSnap.data().attributes.NoiseLevel);
          setCafeGoodForGroups(docSnap.data().attributes.RestaurantsGoodForGroups);
          setCafeOutdoorSeating(docSnap.data().attributes.OutdoorSeating);
          setCafeDriveThru(docSnap.data().attributes.DriveThru);
          setCafeWiFi(docSnap.data().attributes.WiFi);
          setNewCafeAttributes({
            BusinessAcceptsCreditCards: cafeCreditCard,
            BikeParking: cafeBikeParking,
            NoiseLevel: cafeNoiseLevel,
            RestaurantsGoodForGroups: cafeGoodForGroups,
            OutdoorSeating: cafeOutdoorSeating,
            DriveThru: cafeDriveThru,
            WiFi: cafeWiFi,
          }
          );
          Object.entries(docSnap.data().hours).forEach(([day, hours]) => {
            const openHours = hours.split("-")[0];
            const closeHours = hours.split("-")[1];
            console.log(`${day}: ${openHours} - ${closeHours}`);
            setNewCafeHours((prev) => ({ ...prev, [day]: {
              open: formatTime(openHours),
              close: formatTime(closeHours),
            } }));
          });
        } else {
          console.log("Cafe ID not found.");
        }
    } catch (err) {
        console.error("Error fetching cafe data:", err);
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    getCafe();
  }, [])

  const handleImageUrl = () => {
    if (imageUrl) {
      setNewCafeImages([...newCafeImages, imageUrl]);
      setImageUrl("");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const storageRef = ref(storage, `cafes/${file.name}`);
      try {
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        setNewCafeImages([...newCafeImages, downloadURL]);
      } catch (err) {
        console.error("Error uploading image:", err);
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
      state: newCafeState,
      postal_code: newCafePostalCode,
      amenities: newCafeAttributes,
      hours: formattedHours,
      images: newCafeImages.length > 0 ? newCafeImages : ['https://static.vecteezy.com/system/resources/previews/026/398/113/non_2x/coffee-cup-icon-black-white-silhouette-design-vector.jpg'],
    };

    onSubmitCafe(newCafe);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B7AEE]"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
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
          <FormGroup className="grid grid-cols-2 gap-4">
            <FormControlLabel
              control={<Checkbox checked={cafeCreditCard === "true"} />}
              label="Accepts Credit Card"
              onChange={(e) => setCafeCreditCard(e.target.checked)}
            />
            <FormControlLabel
              control={<Checkbox checked={cafeBikeParking === "true"} />}
              label="Bike Parking"
              onChange={(e) => setCafeBikeParking(e.target.checked)}
            />
            <FormControlLabel
              control={<Checkbox checked={cafeNoiseLevel.includes("quiet")} />}
              label="Quiet"
              onChange={(e) => setCafeNoiseLevel(e.target.checked)}
            />
            <FormControlLabel
              control={<Checkbox checked={cafeGoodForGroups === "true"} />}
              label="Good for Groups"
              onChange={(e) => setCafeGoodForGroups(e.target.checked)}
            />
            <FormControlLabel
              control={<Checkbox checked={cafeOutdoorSeating === "true"} />}
              label="Outdoor Seating"
              onChange={(e) => setCafeOutdoorSeating(e.target.checked)}
            />
            <FormControlLabel
              control={<Checkbox checked={cafeDriveThru === "true"} />}
              label="Drive Thru"
              onChange={(e) => setCafeDriveThru(e.target.checked)}
            />
            <FormControlLabel
              control={<Checkbox checked={cafeWiFi.includes("free")} />}
              label="WiFi"
              onChange={(e) => setCafeWiFi(e.target.checked)}
            />
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
              className="w-full p-2 border rounded"
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

export default UpdateCafe;