var express = require('express');
const geolib = require('geolib');
const nodemailer = require('nodemailer');
const opencage = require('opencage-api-client');
const centerModel = require("../models/center");
const categoryModel = require("../models/category");
const userModel = require('../models/user');
const validateToken = require("../middlewares/validateToken");
const validate = require("../middlewares/validateCenter");
const uploadAndSaveImage = require("../middlewares/uploadAndSaveImage");
const axios = require('axios');
const user = require('../models/user');
const ejs = require('ejs');
const path = require('path');
var router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Centre
 *   description: API pour les opérations liées aux centre
 */

// Set up nodemailer transporter for sending emails
const transporter = nodemailer.createTransport({
  // service: 'gmail',
  // auth: {
  //   user: 'badii.abdelkhalak@esprit.tn', // Your Hotmail.com email address
  //   pass: '211SMT7823' // Your Hotmail.com password
  // }
  service: 'hotmail',
  auth: {
    user: 'nassreddine.trigui@hotmail.com', // Your Hotmail.com email address
    pass: 'Nass..1989' // Your Hotmail.com password
  }
});

router.post("/add", validateToken , validate , uploadAndSaveImage , async (req, res, next) => {
    try {
      const {title , description , longitude , altitude , location , phone , email , category} = req.body;
      
      const categoryData = {
        title,
        description,
        longitude , 
        altitude , 
        location , 
        phone , 
        email ,
        category
      };
      if (req.body.imageIds) {
        categoryData.image = req.body.imageIds;
      }
      const center = new centerModel(categoryData);
      center.save();
      const users = userModel.find({disable:true});
      (await users).forEach((user,i) => {
        setTimeout(() => {
          ejs.renderFile(path.join(__dirname, 'modele_mails', 'maile_add_centers.ejs'), { 
            username: user.firstname , 
            centrename: categoryData.title ,
            centreurl: "http://localhost:4200/centers/show/"+center._id
          }, async(err, data) => {
            if (err) {
              console.log(err);
            } else {
              sundMails(
                user.email,
                "Découvrez notre tout nouveau centre de loisirs !",
                data
              );
            }
          });
          
        }, 1000 * (i+1));
      }); 
      
      res.json({ result: center });
    } catch (error) {
      res.json({error : error.message});
    }
  }
);

router.post("/update/:id",validateToken,validate,uploadAndSaveImage, async (req, res, next) => {
  try {
    const { id } = req.params;
    const {title , description , longitude , altitude , location , phone , email , category} = req.body;
   
    const categoryData = {};

      if (title) {
        categoryData.title = title;
      }
      if (description) {
        categoryData.description = description;
      }
      if (longitude) {
        categoryData.longitude = longitude;
      }
      if (altitude) {
        categoryData.altitude = altitude;
      }
      if (location) {
        categoryData.location = location;
      }
      if (phone) {
        categoryData.phone = phone;
      }
      if (email) {
        categoryData.email = email;
      }
      if (category) {
        categoryData.category = category;
      }
    if (req.body.imageIds) {
      categoryData.image = req.body.imageIds;
    }
    await centerModel.findByIdAndUpdate(id, categoryData);
    center = await centerModel.findById(id);
    res.json({ result: center });
  } catch (error) {
    res.json({error : error.message});
  }
});

/**
 * @swagger
 * /center/delete/{id}:
 *   delete:
 *     summary: Supprime un centre par son ID
 *     tags: [Center]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du centre à supprimer
 *     responses:
 *       200:
 *         description: Succès
 */
router.delete("/delete/:id",validateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    await centerModel.findByIdAndUpdate(id, {disable:true});
    const center = await centerModel.findById(id);
    res.json({ result: center });
  } catch (error) {
    res.json({error : error.message});
  }
});



/**
 * @swagger
 * /center/get/{id}:
 *   get:
 *     summary: Récupère un centre par son ID
 *     tags: [Center]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du centre à récupérer
 *     responses:
 *       200:
 *         description: Succès
 */
router.get("/get/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const center = await centerModel.findById(id).populate('image').populate('category');
    if(center){
      center.nbVus = center.nbVus + 1;
      await centerModel.findByIdAndUpdate(id, {nbVus:(center.nbVus)});
    }
    res.json({ result: center });
  } catch (error) {
    res.json({error : error.message});
  }
});

/**
 * @swagger
 * /center/getAll:
 *   get:
 *     summary: Récupère la liste des centres
 *     tags: [Center]
 *     responses:
 *       200:
 *         description: Succès
 */

router.get("/getAll", async (req, res, next) => {
  try {
    const centers = await centerModel.find().sort({disable:1}).populate('image').populate('category');
    res.json({ size: centers.length, result: centers });
  } catch (error) {
    res.json({error : error.message});
  }
});

/**
 * @swagger
 * /center/getbycategory/{category}:
 *   get:
 *     summary: Récupère les centres par catégorie
 *     tags: [Center]
 *     parameters:
 *       - in: path
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la catégorie
 *     responses:
 *       200:
 *         description: Succès
 */
router.get("/getbycategory/:category", async (req, res, next) => {
  try {
    const { category } = req.params;
    const centers = await centerModel.find({category}).populate('image').populate('category');
    res.json({ size: centers.length, result: centers });
  } catch (error) {
    res.json({error : error.message});
  }
});

/**
 * @swagger
 * /center/gettopvus/{limit}:
 *   get:
 *     summary: Récupère les centres les plus vus
 *     tags: [Center]
 *     parameters:
 *       - in: path
 *         name: limit
 *         schema:
 *           type: integer
 *         required: true
 *         description: Nombre maximum de centres à récupérer
 *     responses:
 *       200:
 *         description: Succès
 */
router.get("/gettopvus/:limit", async (req, res, next) => {
  try {
    const { limit } = req.params;
    const centers = await centerModel.find()
      .sort({ nbVus: -1 })
      .limit(limit)
      .populate('image')
      .populate('category');
    res.json({ size: centers.length, result: centers });
  } catch (error) {
    res.json({error : error.message});
  }
});

router.get("/search", async (req, res, next) => {
  try {
    
    const searchQuery = req.query.search || ''; // Search query (default: empty string)
    


    let query = centerModel.find({disable:false});

    // Search query
    if (searchQuery) {
      query = query.and({ title: { $regex: searchQuery, $options: "i" } });
    }

    // Sorting options
    let sortOption = { updatedAt: 1 };
    query = query.sort(sortOption);

    const centers = await query
      .populate('image')
      .populate('category')
      .exec();

    res.json({ totalCenters: centers.length , centers });
  } catch (error) {
    res.json({ error: error.message });
  }
});

/**
 * @swagger
 * /center/page:
 *   get:
 *     summary: Récupère une page de centres paginée
 *     tags: [Center]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numéro de la page à récupérer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         required: true
 *         description: Taille de la page (nombre de centres par page)
 *     responses:
 *       200:
 *         description: Succès
 */
router.get("/page", async (req, res, next) => {
  try {
    
    const page = parseInt(req.query.page) || 1; // Current page (default: 1)
    const pageSize = parseInt(req.query.pageSize) || 10; // Page size (default: 10)
    const sortBy = req.query.sortBy || 'updatedAt'; // Sort by (default: updatedAt)
    const sortOrder = req.query.sortOrder || 'asc'; // Sort order (default: asc)
    const searchQuery = req.query.search || ''; // Search query (default: empty string)
    

    const totalCenters = await centerModel.countDocuments();
    const totalPages = Math.ceil(totalCenters / pageSize);

    let query = centerModel.find();

    // Search query
    if (searchQuery) {
      query = query.or([
        { title: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
        { location: { $regex: searchQuery, $options: "i" } },
        { phone: { $regex: searchQuery, $options: "i" } },
        { email: { $regex: searchQuery, $options: "i" } },
      ]);
    }

    // Sorting options
    let sortOption = {};
    if (sortBy === 'createdAt') {
      sortOption = { createdAt: sortOrder === 'desc' ? -1 : 1 };
    } else if (sortBy === 'updatedAt') {
      sortOption = { updatedAt: sortOrder === 'desc' ? -1 : 1 };
    } else if (sortBy === 'nbVus') {
      sortOption = { nbVus: sortOrder === 'desc' ? -1 : 1 };
    } else if (sortBy === 'title') {
      sortOption = { title: sortOrder === 'desc' ? -1 : 1 };
    }

    query = query.sort(sortOption);

    const centers = await query
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('image')
      .populate('category')
      .exec();

    res.json({ totalPages, currentPage: page, totalCenters: centers.length , centers });
  } catch (error) {
    res.json({ error: error.message });
  }
});



router.get("/getbydistance/:distance/:latitude/:longitude", async (req, res, next) => {
  try {
    const { distance,latitude,longitude } = req.params;
    const centers = await centerModel.find({disable:false}).populate('image').populate('category');
    let distance_centers =[];
    if(centers){
      centers.forEach( async (center) => {
        const d = geolib.getDistance(
          { latitude:latitude, longitude: longitude },
          { latitude: center.altitude, longitude: center.longitude }
        );
        console.log({"distance":d});
        if(distance >= d){
          distance_centers.push({distance:d,center});
        }
     });
    }
    res.json({ result: distance_centers });
  } catch (error) {
    throw new Error(error.message);
  }
});

router.post("/sundmail" , async (req, res, next) => {
  try {
    const {subject , messager , id} = req.body;
    const center = await centerModel.findById(id).populate('image').populate('category');
    ejs.renderFile(path.join(__dirname, 'modele_mails', 'maile_centers.ejs'), { 
      subject: subject , 
      messager: messager ,
      centreurl: "http://localhost:4200/centers/show/"+center._id
    }, async(err, data) => {
      if (err) {
        console.log(err);
      } else {
        sundMails(
          center.email,
          subject,
          data
        );
      }
    }); 
    
    res.json({ result: center });
  } catch (error) {
    res.json({error : error.message});
  }
}
);


const sundMails = async (email , subject , html ) => {
  try {
    // Compose the email
    const mailOptions = {
      from: 'nassreddine.trigui@hotmail.com',
      to: email,
      subject: subject,
      html: html,
    };
    console.log(mailOptions);
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log({ message: "Send mail to : "+email });

  } catch (error) {
    console.log({ error: "Erreur lors de l'envoi du mail" });
    console.log(error.message);
  }
}

module.exports = router;

