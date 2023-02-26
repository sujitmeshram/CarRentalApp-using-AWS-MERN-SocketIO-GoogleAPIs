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

//load files
const keys = require("./config/keys");

//user collections
const User = require("./models/user");
const Contact = require("./models/contact");
//connect to mongoDB
mongoose
  .connect(keys.MongoDB, () => {
    console.log("MongoDB is connected");
  })
  .catch((err) => {
    console.log(err);
  });

//setup view engine
app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//connect cliend side to serve css and js files
app.use(express.static("public"));
//creating port
const port = process.env.PORT || 3000;

// handle home route
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about", {
    title: "About",
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", {
    title: "Contact us",
  });
});

//save contact form data
app.post("/contact", (req, res) => {
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

app.get("/signup", (req, res) => {
  res.render("signupForm", {
    title: "Register",
  });
});

app.post("/signup", (req, res) => {
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
            console.log("New User is created");
          }
        });
      }
    });
  }
});

app.get("/displayLoginForm", (req, res) => {
  res.render("loginForm");
});

app.listen(port, () => {
  console.log(`Server in running on port ${port}`.green);
});
