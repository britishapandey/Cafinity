import { useState, useEffect } from 'react';
// import './App.css';
import { Auth } from './components/auth';
import { db } from './config/firebase';
import { addDoc, collection, getDocs } from 'firebase/firestore';

function Cafe() {
    const [cafeList, setCafeList] = useState([]);

    // New cafe states
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
  
    const cafesCollectionRef = collection(db, "cafes");
  
    const getCafeList = async () => {
      try {
        const data = await getDocs(cafesCollectionRef);
        const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setCafeList(filteredData);
      } catch (err) {
        console.error(err);
      }
    };
  
    useEffect(() => {
      getCafeList();
    }, []);
  
    const onSubmitCafe = async () => {
      try {
        await addDoc(cafesCollectionRef, {
          name: newCafeName,
          address: newCafeAddress,
          averageRating: newCafeRating,
          amenities: newCafeAmenities,
          hours: newCafeHours,
          images: newCafeImages,
        });
  
        getCafeList();
      } catch (err) {
        console.error(err);
      }
    };
  
    function timeConvert(time) {
      const [hour, minute] = time.split(":");
      const hours = parseInt(hour, 10);
      const isAM = hours < 12;
      const formattedHour = hours % 12 || 12;
      const formattedMinute = minute.padStart(2, "0");
      const period = isAM ? "AM" : "PM";
      return `${formattedHour}:${formattedMinute} ${period}`;
    }
  
    // Predefined days array to order the days starting from Sunday
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  
    return (
      <div className="App">
        <div>
          <h1>Cafinity</h1>
        </div>
        <Auth />
  
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
          <button onClick={onSubmitCafe}>Add Cafe</button>
        </div>
        <div>
          {cafeList.map((cafe) => (
            <div key={cafe.id}>
              <h1>{cafe.name}</h1>
              <p>{cafe.address}</p>
              <p>Rating: {cafe.averageRating}</p>
  
              <p>Amenities:</p>
              <ul>
                <li>Noise Level: {cafe.amenities.noise}</li>
                <li>Seating Availability: {cafe.amenities.seatingAvailability}</li>
                <li>Wi-Fi: {cafe.amenities.wifi ? 'Available' : 'Not Available'}</li>
              </ul>
  
              <h3>Hours:</h3>
              <table>
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Open</th>
                    <th>Close</th>
                  </tr>
                </thead>
                <tbody>
                  {daysOfWeek.map((day) => {
                    const times = cafe.hours[day];
                    return (
                      <tr key={day}>
                        <td>{day.charAt(0).toUpperCase() + day.slice(1)}</td>
                        <td>{times ? timeConvert(times.open) : 'Closed'}</td>
                        <td>{times ? timeConvert(times.close) : 'Closed'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
  
              <div>
                <h3>Images:</h3>
                {cafe.images.map((image, index) => (
                  <img key={index} src={image} alt={`Image ${index + 1}`} />
                ))}
              </div>
  
              <p>
              Location: 
              {cafe.location && cafe.location.latitude && cafe.location.longitude ? `Lat: ${cafe.location.latitude}, Long: ${cafe.location.longitude}` : 'Location not available'}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
}