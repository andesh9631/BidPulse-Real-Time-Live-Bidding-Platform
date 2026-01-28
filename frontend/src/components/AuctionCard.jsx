import { socket } from "../socket";
import { useCountdown } from "../hooks/useCountdown";
import { useEffect, useState, useRef } from "react";
import "../styles/card.css";


export default function AuctionCard({ item, user }) {
  const seconds = useCountdown(item.endsAt);

  const isWinning = item.highestBidder === user;
  const ended = seconds === 0;
  const urgent = seconds > 0 && seconds <= 30;

  // 🔴 Outbid state: someone else became highest bidder
  const isOutbid = item.highestBidder && item.highestBidder !== user && !ended;

  const [flash, setFlash] = useState(false);
  const prevBidRef = useRef(item.currentBid);

  // 🟢 Flash animation on ANY new bid (from anyone)
  useEffect(() => {
    if (item.currentBid !== prevBidRef.current) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 300);
      prevBidRef.current = item.currentBid;
      return () => clearTimeout(t);
    }
  }, [item.currentBid]);

  const bid = () => {
    socket.emit("BID_PLACED", {
      itemId: item.id,
      amount: item.currentBid + 10,
      userId: user,
    });
  };

  return (
    <div
      className={`card
        ${isWinning ? "winning" : ""}
        ${isOutbid ? "outbid" : ""}
        ${urgent ? "urgent" : ""}
        ${ended ? "ended" : ""}
        ${flash ? "flash" : ""}
      `}
    >
      <h3>{item.title}</h3>

      {/* Status badges */}
      {isWinning && <span className="badge winning-badge">🏆 Winning</span>}
      {isOutbid && <span className="badge outbid-badge">Outbid</span>}
      {ended && <span className="badge ended-badge">Ended</span>}

      <p className="price">₹{item.currentBid}</p>

      <p className={`timer ${urgent ? "blink" : ""}`}>
        {ended ? "Auction Ended" : `${seconds}s left`}
      </p>

      <p className="bidder">Bidder: {item.highestBidder || "None"}</p>

      <button disabled={ended} onClick={bid}>
        Bid +10
      </button>
    </div>
  );
}
