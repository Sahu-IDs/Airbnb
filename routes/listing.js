const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const listingController = require("../controllers/listings.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const Listing = require("../Models/listing.js");

const upload = multer({ storage });
// INDEX + CREATE
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single("listing[image]"), // ensure form input name="listing[image]"
        validateListing,
        wrapAsync(listingController.createListing)
    )

// NEW FORM
router.get("/new", isLoggedIn, listingController.renderNewForm);

/*CATEGORY FILTER  ✅ NEW - Must be before /:id */
router.get(
  "/category/:type",
  wrapAsync(listingController.filterByCategory)
);

// SEARCH ROUTE
router.get("/search", wrapAsync(async (req, res) => {
    let { q } = req.query;
    if(!q){
        return res.redirect("/listings");
    }
    const allListings = await Listing.find({ 
        $or: [
            { title: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } }
        ]
    });
    res.render("listings/index.ejs", { allListings });
}));

router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"), // update image if provided
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.deleteListing)
    );

// EDIT FORM
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;
