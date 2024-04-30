const express = require("express");
const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const session = require("express-session");
const passport = require("passport");
const user = require("../models/user");
const router = express.Router(); // Use const instead of var

const FacebookStrategy = require("passport-facebook").Strategy;
require("dotenv").config();

const app = express();

app.use(
  session({
    secret: "6be107ddd52c2c670f9d74d551e44e37",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:5050/loginFacebook/auth/facebook/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, displayName, emails } = profile;
        const email = emails && emails.length > 0 ? emails[0].value : null;
        const existingUser = await userModel.findOne({ emails: email });
        if (existingUser) {
          return done(null, existingUser);
        }

        const newUser = new userModel({
          firstname: displayName,
          lastname: displayName,
          email: emails,
        });

        await newUser.save();
        done(null, newUser);
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

router.get("/login", passport.authenticate("facebook"));

router.get("/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/profile");
  }
);

router.get("/profile", (req, res) => {
  const user = req.user;
  if (user) {
    res.send(`Welcome, ${user.firstname}!`);
  } else {
    res.redirect("/login");
  }
});

module.exports = router;
