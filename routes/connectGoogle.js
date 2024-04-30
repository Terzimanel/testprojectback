// Importation des modules nécessaires
const express = require("express");
const passport = require("passport");
const mongoose = require("mongoose");
const userModel = require("../models/user");
const router = require(".");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Configuration des identifiants client
const GOOGLE_CLIENT_ID =
  "897449572917-tkrgddt2q3vuvnssv1c41jgf66bpggjs.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

// Configuration d'Express
const app = express();
app.set("view engine", "twig");

// Configuration de Passport pour utiliser la stratégie Google
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      // Vérifier si l'utilisateur existe déjà dans la base de données
      const checkIfUserExist = await userModel.findOne({
        email: profile.emails[0].value,
      });

      if (checkIfUserExist) {
        return done(null, checkIfUserExist);
      } else {
        // Sinon, créer un nouvel utilisateur dans la base de données
        const user = new userModel({
          firstname: profile.name.givenName,
          lastname: profile.name.familyName,
          email: profile.emails[0].value,
          role: ["user"], // Set the user role
        });

        await user.save();
        return done(null, user);
      }
    }
  )
);

// Configuration de la sérialisation et de la désérialisation de l'utilisateur
passport.serializeUser((user, done) => {
  // Sauvegarde de l'ID utilisateur dans la session
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // Récupération de l'ID utilisateur à partir de la session
  // Vous pouvez utiliser cet ID pour charger les informations de l'utilisateur depuis la base de données
  done(null, { id: id, name: "John Doe" }); // Exemple statique
});

// Initialisation de Passport et configuration des sessions
app.use(passport.initialize());
app.use(passport.session());

// Définition des routes
router.get("/", (req, res) => {
  res.render("http://localhost:4200/");
});

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:4200/",
    failureRedirect: "/login",
  })
);

router.get("/dashboard", (req, res) => {
  res.render("dashboard.twig", { user: req.user });
  console.log({ user: req.user });
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
