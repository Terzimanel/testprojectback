const express = require("express");
const professeurModel = require("../models/post");
const validate = require("../middlewares/validate");
const router = express.Router();

router.get("/addProfesseur", (req, res, next) => {
  try {
    res.render("addProfesseur");
  } catch (error) {
    res.render("error", { message: error.message, error });
  }
}); 
router.post("/addProfesseur",validate,async (req, res, next) => {
    try {
      const { fullname, email, telephone } = req.body;
      const checkIfProfesseurExist = await professeurModel.findOne({ email });
      if (checkIfProfesseurExist) {
        throw new Error("Professeur already exist!");
      }
      const professeur = new professeurModel({
        fullname: fullname,
        telephone: telephone,
        email: email
      });
      professeur.save();
      res.redirect("http://localhost:5050/professeur");
    } catch (error) {
      res.render("error", { message: error.message, error });
    }
  }
);
router.get("/", async (req, res, next) => {
  try {
    const professeurs = await professeurModel.find();
    res.render("index", { professeurs });
  } catch (error) {
    res.render("error", { message: error.message, error });
  }
});
router.get("/deleteProfesseur/:professeurId", async (req, res, next) => {
  try {
    const { professeurId } = req.params;
    await professeurModel.findByIdAndDelete(professeurId);
    res.redirect("http://localhost:5050/professeur");
  } catch (error) {
    res.render("error", { message: error.message, error });
  }
});
router.get("/updateProfesseur/:professeurId", async (req, res, next) => {
  try {
    const { professeurId } = req.params;
    const professeur = await professeurModel.findById(professeurId);
    console.log(professeur);
    res.render("updateProfesseur", { p: professeur });
  } catch (error) {
    res.render("error", { message: error.message, error });
  }
});
router.post("/updateProfesseur/:professeurId", async (req, res, next) => {
  try {
    const { professeurId } = req.params;
    const { fullname, email, telephone } = req.body;
    const professeur = await professeurModel.findById(professeurId);
    console.log("Update Professeur");
    console.log(professeur);
    console.log(email);
    if(professeur.email!=email){
      const checkIfProfesseurExist = await professeurModel.find({ email });
      if (checkIfProfesseurExist) {
        throw new Error("Professeur already exist!");
      }
    }
    await professeurModel.findByIdAndUpdate(professeurId, req.body);
    res.redirect("http://localhost:5050/professeur");
  } catch (error) {
    res.render("error", { message: error.message, error });
  }
});
router.post("/search", async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log("search : ",email);
    const professeurs = await professeurModel.find({ email });
    res.render("index", { professeurs });
  } catch (error) {
    res.render("error", { message: error.message, error });
  }
});
module.exports = router;
