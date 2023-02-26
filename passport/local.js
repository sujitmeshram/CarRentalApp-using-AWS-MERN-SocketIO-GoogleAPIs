// for local authentication

const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const User = require("../models/user");
const bcrypt = require("bcryptjs");

// fetch user ObjectID and generate cookie ID for browser

// serializeUser to fetch user id from database
passport.serializeUser((user, done) => {
  done(null, user.id); //this id will be use for browser to generate cookie id for each user
});

// deserializeUser to find that user based on this id and it will return that user from database
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (email, password, done) => {
      User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            return done(null, false);
          }

          //comparing user password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
              return done(err);
            }
            if (isMatch) {
              //return null as error
              return done(null, user);
            } else {
              return done(null, false);
            }
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  )
);
