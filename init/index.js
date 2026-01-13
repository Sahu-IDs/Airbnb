// initDB.js
const path = require('path');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
}
const mongoose = require("mongoose");
const Listing = require("../Models/listing.js");
const User = require("../Models/user.js"); // Import User model
const initData = require("./data.js");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(MONGO_URL);
}

// Helper function: get coordinates from location + country
async function getCoordinates(location, country) {
  try {
    // Dynamic import to fix "require() of ES Module" error
    const nodeFetch = (await import("node-fetch")).default;
    const query = encodeURIComponent(`${location}, ${country}`);
    const response = await nodeFetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`
    );
    const data = await response.json();
    if (data.length === 0) return [0, 0]; // default if not found
    return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
  } catch (err) {
    console.log("Geocoding error:", err);
    return [0, 0];
  }
}

// Initialize database
const initDB = async () => {
  try {
    // Delete all existing listings
    await Listing.deleteMany({});

    // Fetch user "Sandeep" to assign all listings to him
    const user = await User.findOne({ username: "Sandeep" });
    const ownerId = user ? user._id : "69597b0a14e09f921a9b939a"; // Use Sandeep's ID or fallback

    // Map through initData and add owner + geometry
    const listingsWithGeometry = [];
    for (const obj of initData.data) {
      const coords = await getCoordinates(obj.location, obj.country);
      
      // Fix: Handle image correctly (whether it's a string or object)
      let imageObject;
      if (typeof obj.image === "string") {
        const [filename, url] = obj.image.split('|');
        imageObject = { url, filename };
      } else {
        imageObject = obj.image;
      }

      listingsWithGeometry.push({
        ...obj,
        image: imageObject, 
        owner: ownerId, // Directly assign owner
        geometry: {
          type: "Point",
          coordinates: coords, // [lng, lat]
        },
      });
    }

    // Insert into DB
    await Listing.insertMany(listingsWithGeometry);
    console.log("✅ Data was initialized successfully!");
    process.exit(0); // Exit script
  } catch (err) {
    console.log("❌ Initialization error:", err);
    process.exit(1); // Exit with error code
  }
};

// Connect to MongoDB and then Init
main()
  .then(async () => {
    console.log("✅ Connected to DB");
    await initDB();
  })
  .catch((err) => console.log("❌ DB Connection Error:", err));
