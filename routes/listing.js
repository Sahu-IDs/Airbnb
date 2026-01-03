const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const listingController = require("../controllers/listings.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");

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
