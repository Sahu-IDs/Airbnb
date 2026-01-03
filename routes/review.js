const express = require("express");
//const router = express.Router();
const router = require("express").Router({ mergeParams: true }); // ← MUST
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const Review = require("../Models/review.js");
const Listing = require("../Models/listing.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");
//Reviews
//Post Route
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview));
//Delete Review Route
router.delete("/:reviewId",
  isLoggedIn,
  isReviewAuthor,
wrapAsync(reviewController.destroyReview));
module.exports = router;