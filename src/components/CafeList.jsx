import CafeCard from './CafeCard';

function CafeList({ cafes }) {
  return (
    <div className="cafe-list">
      {cafes.map(cafe => (
        <CafeCard key={cafe.id} cafe={cafe} />
      ))}
    </div>
  );
}

export default CafeList;
