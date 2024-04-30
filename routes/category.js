var express = require("express");
var router = express.Router();
const categoryModel = require("../models/category");
const imageModel = require("../models/image");
const validateToken = require("../middlewares/validateToken");
const validate = require("../middlewares/validateCategory");
const uploadAndSaveImage = require("../middlewares/uploadAndSaveImage");
const fs = require('fs');

/**
 * @swagger
 * tags:
 *   name: Category
 *   description: API pour les opérations liées aux catégories
 */


router.post("/add",validateToken,validate,uploadAndSaveImage, async (req, res, next) => {
  try {
    const { title, description, parent } = req.body;

    const categoryData = {
      title,
      description,
    };
    if (parent) {
      categoryData.parent = parent;
    }
    if (req.body.imageIds) {
      categoryData.image = req.body.imageIds[0];
    }
    const category = new categoryModel(categoryData);
    const savedCategory = await category.save();
    res.json({ result: savedCategory });
  } catch (error) {
    res.json({ error: error.message });
  }
});


router.post("/update/:id", validateToken, validate,uploadAndSaveImage, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, parent } = req.body;
    const categoryData = {
      title,
      description,
    };
    if (parent) {
      categoryData.parent = parent;
    }else{
      categoryData.parent = null;
    }
    if (req.body.imageIds) {
      console.error(req.body.imageIds);
      if(categoryData.image){
        let image = await imageModel.findById(categoryData.image);
        if(image){
          let pathImage = getImageFilePathById(image);
          console.log(pathImage);
          fs.unlink(pathImage, (error) => {
            if (error) {
              console.error('Error while deleting image:', error);
            }
          });
          await imageModel.findByIdAndRemove(image._id);
        }
      }
      categoryData.image = req.body.imageIds[0];
    }
    category = await categoryModel.findByIdAndUpdate(id, categoryData);
    res.json({ result: category });
  } catch (error) {
    res.json({ error: error.message });
  }
});

/**
 * @swagger
 * /category/delete/{id}:
 *   delete:
 *     summary: Supprime une catégorie existante
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la catégorie à supprimer
 *     responses:
 *       200:
 *         description: Succès
 */
router.delete("/delete/:id", validateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.findByIdAndUpdate(id, {
      disable: true,
    });
    res.json({ result: category });
  } catch (error) {
    res.json({ error: error.message });
  }
});

/**
 * @swagger
 * /category/get/{id}:
 *   get:
 *     summary: Récupère une catégorie par son ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la catégorie à récupérer
 *     responses:
 *       200:
 *         description: Succès
 */
router.get("/get/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.findById(id).populate('image').populate('parent');
    // Get path of Images
    category.image = await imageModel.findById(category.image);
    res.json({ result: category });
  } catch (error) {
    res.json({ error: error.message });
  }
});

/**
 * @swagger
 * /category/get:
 *   get:
 *     summary: Récupère la liste des catégories
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: Succès
 */
router.get("/get", async (req, res, next) => {
  try {
    const categorys = await categoryModel
    
      .find()
      .sort({disable:1})
      .populate('image')
      .populate('parent');
    res.json({ size: categorys.length, result: categorys });
  } catch (error) {
    res.json({ error: error.message });
  }
});

/**
 * @swagger
 * /category/search:
 *   get:
 *     summary: Recherche une catégorie par titre ou description
 *     tags: [Category]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         required: true
 *         description: Mot clé de recherche
 *     responses:
 *       200:
 *         description: Succès
 */
router.get("/search", async (req, res, next) => {
  try {
    const { search } = req.query;
    console.log(search);
    if (!search) {
      categorys = await categoryModel.find().populate('image').populate('parent');
    } else {
      categorys = await categoryModel.find({ title: { $regex: search } }).populate('image').populate('parent');
    }
    res.json({ size: categorys.length, result: categorys });
  } catch (error) {
    res.json({ error: error.message });
  }
});

/**
 * @swagger
 * /category/getbyparent/{parent}:
 *   get:
 *     summary: Récupère les catégories par catégorie parente
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: parent
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la catégorie parente
 *     responses:
 *       200:
 *         description: Succès
 */
router.get("/getbyparent/:parent", async (req, res, next) => {
  try {
    const { parent } = req.params;
    if(parent == "parent"){
      const categorys = await categoryModel.find().populate('image').populate('parent');
    }else{
      const categorys = await categoryModel.find({ parent }).populate('image').populate('parent');
    }
    res.json({ size: categorys.length, result: categorys });
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = router;
