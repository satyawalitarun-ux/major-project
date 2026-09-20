const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");


const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: String,

 image: {
  type: String,
  default: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=60",
  set: (v) => (v === "" ? "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=60" : v),
},

  price: Number,

  location: String,

  country: String,

reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
],
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});


const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;