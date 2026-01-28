import { useEffect, useState } from "react";
import { socket } from "./socket";
import { fetchItems } from "./api";
import Landing from "./components/Landing";
import Header from "./components/Header";
import AuctionGrid from "./components/AuctionGrid";
import Notification from "./components/Notification";

export default function App() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [toast, setToast] = useState(null);

  // 🔔 Toast helper
  const notify = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!user) return;

    // 📦 Load auction items
    fetchItems()
      .then((data) => setItems(data.items))
      .catch(() => notify("Failed to load items", "error"));

    // 🔁 Update bids for everyone
    const onUpdateBid = (updated) => {
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    };

    // ✅ Bid success (only bidder)
    const onBidSuccess = (data) => {
      notify(
        `✅ Bid successful! You bid ₹${data.amount} on ${data.item}`,
        "success",
      );
    };

    // 🔵 New bid (other users)
    const onNewBid = (data) => {
      notify(`🔵 New bid: ₹${data.amount} on ${data.item}`, "info");
    };

    // ⚠️ Errors / outbid
    const onBidError = (msg) => {
      notify(`⚠️ You've been outbid! ${msg}`, "error");
    };

    // 🔌 Register socket listeners
    socket.on("UPDATE_BID", onUpdateBid);
    socket.on("BID_SUCCESS", onBidSuccess);
    socket.on("NEW_BID", onNewBid);
    socket.on("BID_ERROR", onBidError);

    // 🧹 Cleanup
    return () => {
      socket.off("UPDATE_BID", onUpdateBid);
      socket.off("BID_SUCCESS", onBidSuccess);
      socket.off("NEW_BID", onNewBid);
      socket.off("BID_ERROR", onBidError);
    };
  }, [user]);

  // 🧭 Landing page
  if (!user) {
    return <Landing onStart={setUser} />;
  }

  // 🖥️ Dashboard
  return (
    <>
      <Header user={user} />
      <AuctionGrid items={items} user={user} notify={notify} />
      {toast && <Notification message={toast.msg} type={toast.type} />}
    </>
  );
}
