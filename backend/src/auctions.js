// const Mutex = require("./mutex");
// const mutex = new Mutex();

// function createAuction() {
//   return {
//     id: 1,
//     title: "MacBook Pro",
//     startingPrice: 500,
//     currentBid: 500,
//     highestBidder: null,
//     endsAt: Date.now() + 2 * 60 * 1000, // 2 minutes from NOW
//   };
// }

// let auctions = [createAuction()];

// async function placeBid(itemId, amount, userId) {
//   await mutex.lock();
//   try {
//     let item = auctions.find((i) => i.id === itemId);
//     if (!item) throw new Error("Item not found");

//     // 🔁 AUTO-RESET AUCTION IF ENDED
//     if (Date.now() > item.endsAt) {
//       item = createAuction();
//       auctions[0] = item;
//     }

//     if (amount <= item.currentBid) throw new Error("Outbid");

//     item.currentBid = amount;
//     item.highestBidder = userId;

//     return item;
//   } finally {
//     mutex.unlock();
//   }
// }

// module.exports = { auctions, placeBid };


const Mutex = require("./mutex");
const mutex = new Mutex();

function createAuction(id, title, startingPrice) {
  return {
    id,
    title,
    startingPrice,
    currentBid: startingPrice,
    highestBidder: null,
    endsAt: Date.now() + 2 * 60 * 1000, // 2 minutes
  };
}

let auctions = [
  createAuction(1, "MacBook Pro", 500),
  createAuction(2, "Gaming Laptop", 800),
  createAuction(3, "Designer Handbag", 400),
  createAuction(4, "Smart Watch Pro", 300),
  createAuction(5, "Professional Camera", 1200),
];

async function placeBid(itemId, amount, userId) {
  await mutex.lock();
  try {
    const itemIndex = auctions.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) throw new Error("Item not found");

    let item = auctions[itemIndex];

    // 🔁 Auto-reset individual auction if ended
    if (Date.now() > item.endsAt) {
      const resetItem = createAuction(item.id, item.title, item.startingPrice);
      auctions[itemIndex] = resetItem;
      item = resetItem;
    }

    if (amount <= item.currentBid) throw new Error("Outbid");

    item.currentBid = amount;
    item.highestBidder = userId;

    return item;
  } finally {
    mutex.unlock();
  }
}

module.exports = { auctions, placeBid };
