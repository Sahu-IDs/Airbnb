// initDB.js
const mongoose = require("mongoose");
const fetch = require("node-fetch"); // For geocoding
const Listing = require("../Models/listing.js");
const initData = require("./data.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// Connect to MongoDB
main()
  .then(() => console.log("✅ Connected to DB"))
  .catch((err) => console.log("❌ DB Connection Error:", err));

async function main() {
  await mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

// Helper function: get coordinates from location + country
async function getCoordinates(location, country) {
  try {
    const query = encodeURIComponent(`${location}, ${country}`);
    const response = await fetch(
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
    // await Listing.deleteMany({});

    // Map through initData and add owner + geometry
    const listingsWithGeometry = [];
    for (const obj of initData.data) {
      const coords = await getCoordinates(obj.location, obj.country);
      listingsWithGeometry.push({
        ...obj,
        owner: "693f242b25f46d3f1d69790b", // your user id
        geometry: {
          type: "Point",
          coordinates: coords, // [lng, lat]
        },
      });
    }

    // Insert into DB
    await Listing.insertMany(listingsWithGeometry);
    console.log("✅ Data was initialized successfully!");
    process.exit(); // Exit script
  } catch (err) {
    console.log("❌ Initialization error:", err);
  }
};

initDB();
