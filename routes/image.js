
var express = require("express");
const imageModel = require("../models/image");
var router = express.Router();

router.get("/get/:id", async (req, res, next) => {
  const { id } = req.params;
    try {
      const image = await imageModel.findById(id);
      if (image) {
        res.json({ result: image });
      }else{
        res.json({ error: "Image not found." });
      }
    } catch (error) {
      return res.status(500).json({ error: "erreur lors de la connexion" });
    }
  });

module.exports=router;
