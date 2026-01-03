const Listing = require("../Models/listing");
const fetch = require("node-fetch");
// HELPER: Get coordinates
async function getCoordinates(location, country) {
  try {
    const query = `${location}, ${country}`;
    console.log("🔍 Geocoding query:", query);

    const url =
      "https://nominatim.openstreetmap.org/search" +
      `?q=${encodeURIComponent(query)}` +
      "&format=json&limit=1";

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Wanderlust-App/1.0"
      }
    });

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      return {
        lat: Number(data[0].lat),
        lng: Number(data[0].lon)
      };
    }
  } catch (err) {
    console.error("Geocoding failed:", err);
  }

  // Fallback Delhi
  return { lat: 28.6139, lng: 77.2090 };
}
// INDEX
module.exports.index = async (req, res) => {
  const { search } = req.query;
  let allListings;
  if (search) {
    allListings = await Listing.find({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ],
    });
    if(allListings.length === 0) {
      req.flash("error", "No listings found for that search!");
    }
  } else {
    allListings = await Listing.find({});
  }
  res.render("listings/index.ejs", { allListings });
};
// NEW FORM
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};
// SHOW
module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing, currUser: req.user });
};
// CREATE LISTING
module.exports.createListing = async (req, res) => {
  const { path: url, filename } = req.file;
  const { location, country } = req.body.listing;

  const coords = await getCoordinates(location, country);

  const newListing = new Listing({
    ...req.body.listing,
    owner: req.user._id,
    image: { url, filename },

    //  GeoJSON store
    geometry: {
      type: "Point",
      coordinates: [coords.lng, coords.lat]
    }
  });

  await newListing.save();

  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};
// EDIT FORM
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/edit", { listing });
};
// UPDATE LISTING
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  listing.set({ ...req.body.listing });

  if (req.file) {
    const { path: url, filename } = req.file;
    listing.image = { url, filename };
  }

  const { location, country } = req.body.listing;
  if (location && country) {
    const coords = await getCoordinates(location, country);

    listing.geometry = {
      type: "Point",
      coordinates: [coords.lng, coords.lat]
    };
  }

  await listing.save();

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};
// DELETE
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
// FILTER BY CATEGORY
module.exports.filterByCategory = async (req, res) => {
  const { type } = req.params;

  const allListings = await Listing.find({
    category: type.toLowerCase()
  });

  if (!allListings.length) {
    req.flash("error", "No listings found for this category");
  }

  res.render("listings/index", { allListings });
};