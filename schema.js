const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().min(0).required(),

    //  Cloudinary image
    image: Joi.object({
      url: Joi.string().allow("", null),
      filename: Joi.string().allow("", null),
    }).optional(),

    //  Category
    category: Joi.string().valid(
      "trending",
      "rooms",
      "iconic",
      "mountain",
      "castle",
      "pool",
      "camping",
      "farm",
      "arctic",
      "domes",
      "boats"
    ).required(),

    // 🔥 GEOJSON — optional
    geometry: Joi.object({
      type: Joi.string().valid("Point"),
      coordinates: Joi.array().items(Joi.number()).length(2)
    }).optional() // optional, no .required()

  }).required() //  close listing object
}); //  close listingSchema

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().required(),
  }).required(),
});
