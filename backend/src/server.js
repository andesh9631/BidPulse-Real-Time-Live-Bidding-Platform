const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { getItems, placeBid } = require("./auctions");

const app = express();

/*
✅ CORS FIX
This WILL stop the blocking error.
*/
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
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
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("BID_PLACED", async ({ itemId, amount, userId }) => {
    try {
      const updatedItem = await placeBid(itemId, amount, userId);

      socket.emit("BID_SUCCESS", updatedItem);

      socket.broadcast.emit("NEW_BID", updatedItem);

      io.emit("UPDATE_BID", updatedItem);
    } catch (err) {
      socket.emit("BID_ERROR", err.message);
    }
  });
});

/* ---------------- START SERVER ---------------- */

const PORT = process.env.PORT || 4000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
