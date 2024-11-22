import { useState, useEffect } from 'react';
import './App.css';
import { Auth } from './components/auth';
import { db } from './config/firebase';
import { collection, getDocs } from 'firebase/firestore';

function App() {
  const [cafeList, setCafeList] = useState([]);

  const cafesCollectionRef = collection(db, "cafes");

  useEffect(() => {
    const getCafeList = async () => {
      try {
        const data = await getDocs(cafesCollectionRef);
        const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setCafeList(filteredData);
      } catch (err) {
        console.error(err);
      }
    };

    getCafeList();
  }, []);

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
      <Auth />
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

            <p>Location: {`Lat: ${cafe.location.latitude}, Long: ${cafe.location.longitude}`}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
