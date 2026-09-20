const express = require('express');
const router = express.Router();
const { listingSchema } = require("../schema.js");
const wrapAsync = require("../utils/wrapasync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");


const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error.message);
  } else {
    next();
  }
};

//Index Route
router.get("/", async (req, res) => {
  const Listings = await Listing.find({});
  res.render("listings/index.ejs", { Listings });
});

//New Route
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  req.flash("success", "Successfully fetched the listing");
  res.render("listings/show.ejs", { listing });
})) ;

//Create Route
router.post("/",validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
  await newListing.save();
  req.flash("success", "Successfully made a new listing");
  res.redirect("/listings");
}));

//Edit Route
router.get("/:id/edit", wrapAsync(async (req, res) => {
  if (!req.params.id) {
    throw new ExpressError(400, "send valid data");
  }
  let { id } = req.params;
  const listing = await Listing.findById(id);
  req.flash("success", "Successfully edited the listing");
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success", "Listing updated successfully");
  res.redirect(`/listings/${id}`);
})) ;

//Delete Route
router.delete("/:id",  wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing deleted successfully");
  res.redirect("/listings");
}));


module.exports = router;