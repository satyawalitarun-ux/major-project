// migrateImages.js
// One-off script: fixes listings whose "image" field is still the old
// { filename, url } object shape, converting it to a plain URL string.
//
// Usage:
//   node migrateImages.js

const mongoose = require("mongoose");
const Listing = require("./models/listing.js"); // adjust path if needed

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"; // adjust if different

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to DB");

  // Fetch raw documents (bypass schema casting) so we can see the real shape
  const listings = await Listing.collection.find({}).toArray();

  let fixed = 0;

  for (const doc of listings) {
    const img = doc.image;

    // Case 1: old shape -> { filename, url }
    if (img && typeof img === "object" && img.url) {
      await Listing.collection.updateOne(
        { _id: doc._id },
        { $set: { image: img.url } }
      );
      fixed++;
    }

    // Case 2: literal string "[object Object]" saved via a broken form submit
    if (img === "[object Object]") {
      await Listing.collection.updateOne(
        { _id: doc._id },
        {
          $set: {
            image:
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=60",
          },
        }
      );
      fixed++;
    }
  }

  console.log(`Done. Fixed ${fixed} of ${listings.length} listings.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});