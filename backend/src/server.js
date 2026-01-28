const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { auctions, placeBid } = require("./auctions");

const app = express();
app.use(cors());
app.use(express.json());

// REST API
app.get("/items", (req, res) => {
  res.json({
    serverTime: Date.now(),
    items: auctions,
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("BID_PLACED", async ({ itemId, amount, userId }) => {
    try {
      const updatedItem = await placeBid(itemId, amount, userId);

      // ✅ Notify bidder (success)
      socket.emit("BID_SUCCESS", {
        item: updatedItem.title,
        amount: updatedItem.currentBid,
      });

      // 🔵 Notify all OTHER users (new bid)
      socket.broadcast.emit("NEW_BID", {
        item: updatedItem.title,
        amount: updatedItem.currentBid,
        bidder: userId,
      });

      // 🔁 Sync UI for everyone
      io.emit("UPDATE_BID", updatedItem);
    } catch (err) {
      // ⚠️ Outbid / auction ended / invalid
      socket.emit("BID_ERROR", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});




server.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});
