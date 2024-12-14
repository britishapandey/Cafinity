function timeConvert(time) {
    const [hour, minute] = time.split(":");
    const hours = parseInt(hour, 10);
    const isAM = hours < 12;
    const formattedHour = hours % 12 || 12;
    const formattedMinute = minute.padStart(2, "0");
    const period = isAM ? "AM" : "PM";
    return `${formattedHour}:${formattedMinute} ${period}`;
  }
  
  function CafeCard({ cafe }) {
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    
    return (
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
      </div>
    );
  }
  
  export default CafeCard;
  