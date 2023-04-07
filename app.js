//loading modules
const express = require("express");
const exphbs = require("express-handlebars"); //https://www.npmjs.com/package/express-handlebars
const colors = require("colors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const formidable = require("formidable");
const socketIO = require("socket.io");
const http = require("http");
//initialize app
const app = express();

// setup body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//configuration for authentication
app.use(cookieParser());
app.use(
  session({
    secret: "mysecret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

//load helper
const { requireLogin, ensureGuest } = require("./helpers/authHelper");
const { upload } = require("./helpers/aws");

//load passport
require("./passport/local");
require("./passport/facebook");

//make user as global object to logged in after login
app.use((req, res, next) => {
  // req.user=> user from login
  //and setting that user in local to stay logged in
  res.locals.user = req.user || null;
  next();
});

//load files
const keys = require("./config/keys");

//user collections
const User = require("./models/user");
const Contact = require("./models/contact");
const Car = require("./models/car");
const Chat = require("./models/chat");

//connect to mongoDB
mongoose
  .connect(keys.MongoDB, () => {
    console.log("MongoDB is connected");
  })
  .catch((err) => {
    console.log(err);
  });

//setup view engine
app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowedProtoMethodsByDefault: true,
    },
  })
);
app.set("view engine", "handlebars");

//connect cliend side to serve css and js files
app.use(express.static("public"));
//creating port
const port = process.env.PORT || 3000;

// handle home route
app.get("/", ensureGuest, (req, res) => {
  res.render("home");
});

app.get("/about", ensureGuest, (req, res) => {
  res.render("about", {
    title: "About",
  });
});

app.get("/contact", requireLogin, (req, res) => {
  res.render("contact", {
    title: "Contact us",
  });
});

//save contact form data
app.post("/contact", requireLogin, (req, res) => {
  console.log(req.body);
  const newContact = {
    name: req.user._id,
    message: req.body.message,
  };
  new Contact(newContact).save((err, user) => {
    if (err) {
      console.log(err);
    } else {
      console.log("We received message from user", user);
    }
  });
});

app.get("/signup", ensureGuest, (req, res) => {
  res.render("signupForm", {
    title: "Register",
  });
});

app.post("/signup", ensureGuest, (req, res) => {
  console.log(req.body);
  let errors = [];
  if (req.body.password !== req.body.password2) {
    errors.push({ text: "Password does not match" });
  }

  if (req.body.password.length < 5) {
    errors.push({ text: "Password must be at least 5 characters" });
  }
  if (errors.length > 0) {
    res.render("signupForm", {
      errors: errors,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      password: req.body.password,
      password2: req.body.password2,
      email: req.body.email,
    });
  } else {
    User.findOne({ email: req.body.email }).then((user) => {
      if (user) {
        let errors = [];
        errors.push({ text: "Email already exist" });
        res.render("signupForm", {
          errors: errors,
          // for keeping input value as it is after entered
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          password: req.body.password,
          password2: req.body.password2,
          email: req.body.email,
        });
      } else {
        //encrypt password
        // generating salt of 10 digits
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(req.body.password, salt);

        const newUser = {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          email: req.body.email,
          password: hash,
        };
        new User(newUser).save((err, user) => {
          if (err) {
            throw err;
          }
          if (user) {
            let success = [];
            success.push({
              text: "You successfully created an account. You can login now",
            });
            res.render("loginForm", {
              success: success,
            });
          }
        });
      }
    });
  }
});

app.get("/displayLoginForm", ensureGuest, (req, res) => {
  res.render("loginForm", {
    title: "Login",
  });
});

//passport authentication
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/loginErrors",
  })
);

// for login with facebook button route
app.get(
  "/auth/facebook",
  passport.authenticate("facebook", {
    scope: ["email"],
  })
);

// for facebook auth callback
app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/profile",
    failureRedirect: "/",
  })
);

//display profile
app.get("/profile", requireLogin, (req, res) => {
  User.findById({ _id: req.user._id }).then((user) => {
    console.log(user);
    user.online = true;
    user.save((err, user) => {
      if (err) {
        throw err;
      }

      if (user) {
        res.render("profile", {
          user: user,
          title: "Profile",
        });
      }
    });
  });
});

app.get("/loginErrors", (req, res) => {
  let errors = [];
  errors.push({ text: "User not found or Passwword Incorrent" });
  res.render("loginForm", {
    errors: errors,
    title: "Error",
  });
});

//lit a car route
app.get("/listCar", requireLogin, (req, res) => {
  res.render("listCar", {
    title: "Listing",
  });
});

app.post("/listCar", requireLogin, (req, res) => {
  const newCar = {
    owner: req.user._id,
    make: req.body.make,
    model: req.body.model,
    year: req.body.year,
    type: req.body.type,
  };
  new Car(newCar).save((err, car) => {
    if (err) {
      throw err;
    }
    if (car) {
      res.render("listCar2", {
        title: "Finish",
        car: car,
      });
    }
  });
});

app.post("/listCar2", requireLogin, (req, res) => {
  console.log(req.body.carID);
  Car.findOne({ _id: req.body.carID, owner: req.user._id }).then((car) => {
    car.pricePerHour = req.body.pricePerHour;
    car.pricePerWeek = req.body.pricePerWeek;
    car.location = req.body.location;
    car.image = `https://sujit-car-rental-app.s3.us-east-2.amazonaws.com/${req.body.image}`;

    car.save((err, car) => {
      if (err) {
        throw err;
      }
      if (car) {
        res.redirect("/showCars");
      }
    });
  });
});

app.get("/showCars", requireLogin, (req, res) => {
  Car.find({})
    .populate("owner")
    .sort({ date: "desc" })
    .then((cars) => {
      res.render("showCars", {
        cars: cars,
      });
    });
});

//receive image
// upload.any() to upload for any extension
app.post("/uploadImage", requireLogin, upload.any(), (req, res) => {
  const form = new formidable.IncomingForm();
  form.on("file", (field, file) => {
    console.log(file);
  });
  form.on("error", (err) => {
    console.log(err);
  });

  form.on("end", () => {
    console.log("Image received successfully");
  });
  form.parse(req);
});

//log user out
app.get("/logout", (req, res) => {
  // req.user._id logged in user
  User.findById({ _id: req.user._id }).then((user) => {
    user.online = false;
    user.save((err, user) => {
      if (err) {
        throw err;
      }

      if (user) {
        // request object have logout method

        req.logout();
        res.redirect("/");
      }
    });
  });
});

app.get("/contactOwner/:id", (req, res) => {
  User.findOne({ _id: req.params.id })
    .then((owner) => {
      res.render("profile", {
        owner: owner,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

// socket connection
const server = http.createServer(app);
const io = socketIO(server);
io.on("connection", (socket) => {
  console.log("Connected to client");

  // listen to disconnection
  socket.on("disconnect", (socket) => {
    console.log("Disocnnected from client");
  });
});

server.listen(port, () => {
  console.log(`Server in running on port ${port}`.green);
});

// using google geocode api to fetch car location, latitude and longitude
// geocoding : process of converting address like ('1600, hat parkway, mountain view, ca' into geographic coordinates like (latitude 37,4200 and longitude -122.0645))
