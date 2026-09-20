const express = require("express");
const app = express();
const mongoose = require("mongoose");

const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError.js");

const reviewRoutes = require("./routes/review.js");
const listingRoutes = require("./routes/listing.js");  
const userRoutes = require("./routes/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


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

const sessionOptions={
    secret: "mySecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    } 
  };

  app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// app.get("/registerUser", async (req, res) => {
//   let fakeUser = new User({  
//     email: "testuser@example.com",
//     username: "testUser"
//   });
//   let newUser = await User.register(fakeUser, "testPassword");
//   res.send(newUser);
// });


app.get("/setCookie", (req, res) => {
  res.cookie("isLoggedIn", true, { maxAge: 1000 * 60 * 60 * 24 });
  res.send("cookie has been set");
});



app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

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