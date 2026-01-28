const express = require("express");
const router = express.Router();
const { auctions } = require("./auctions");

router.get("/items", (req, res) => {
  res.json({
    serverTime: Date.now(),
    items: auctions,
  });
});

module.exports = router;
