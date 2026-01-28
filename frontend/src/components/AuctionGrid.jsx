import AuctionCard from "./AuctionCard";
import "../styles/grid.css";


export default function AuctionGrid({ items, user, notify }) {
  return (
    <div className="grid">
      {items.map((item) => (
        <AuctionCard key={item.id} item={item} user={user} notify={notify} />
      ))}
    </div>
  );
}
