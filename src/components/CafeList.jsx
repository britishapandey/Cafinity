import CafeCard from './CafeCard';

function CafeList({ cafes }) {
  return (
    <div>
      {cafes.map((cafe) => (
        <CafeCard key={cafe.id} cafe={cafe} />
      ))}
    </div>
  );
}

export default CafeList;
