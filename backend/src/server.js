const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { getItems, placeBid } = require("./auctions");

const app = express();

/*
✅ PRODUCTION CORS
Never use "*" in production with sockets
*/
const allowedOrigins = [
  "http://localhost:3000",
  "https://mern-frontend.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

app.use(express.json());

/* ---------------- REST API ---------------- */

app.get("/items", (req, res) => {
  res.json({
    serverTime: Date.now(),
    items: getItems(),
  });
});

/* ---------------- SOCKET ---------------- */

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  socket.on("BID_PLACED", async ({ itemId, amount, userId }) => {
    try {
      const updatedItem = await placeBid(itemId, amount, userId);

      // Success to bidder
      socket.emit("BID_SUCCESS", {
        item: updatedItem.title,
        amount: updatedItem.currentBid,
      });

      // Notify others
      socket.broadcast.emit("NEW_BID", {
        item: updatedItem.title,
        amount: updatedItem.currentBid,
        bidder: userId,
      });

      // Sync everyone
      io.emit("UPDATE_BID", updatedItem);
    } catch (err) {
      socket.emit("BID_ERROR", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

/* ---------------- START SERVER ---------------- */

const PORT = process.env.PORT || 4000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
