const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapasync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const Review = require("./models/review.js");
const { reviewSchema } = require("./schema.js");

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.engine("ejs", ejsMate);

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error.message);
  } else {
    next();
  }
};


const validatereview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error.message);
  } else {
    next();
  }
};


//Index Route
app.get("/listings", async (req, res) => {
  const Listings = await Listing.find({});
  res.render("listings/index.ejs", { Listings });
});

//New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  res.render("listings/show.ejs", { listing });
})) ;

//Create Route
app.post("/listings", validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
  await newListing.save();
  await listing.findById(id).populate("reviews");
  res.redirect("/listings");
}));

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  if (!req.params.id) {
    throw new ExpressError(400, "send valid data");
  }
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing })
  res.redirect(`/listings/${id}`);
})) ;

//Delete Route
app.delete("/listings/:id", validateListing,   async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});

// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });

// reviews
// post route

app.post("/listings/:id/reviews", validatereview, wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  const review = new Review(req.body.review);
  listing.reviews.push(review);
  await review.save();
  await listing.save();
  console.log("review was saved");
  res.redirect(`/listings/${listing._id}`);
}));

app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/listings/${id}`);
}));


app.all("/*splat", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));  
}); 


app.use((err, req, res, next) => { 
  let { statusCode = 500, message = "Something went wrong" } = err;

  res.render("error.ejs", { err });
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});