var express = require('express');
const postModel = require("../models/post");
const validateToken = require("../middlewares/validateToken");
const userModel = require("../models/user");
const uploadAndSaveImage = require("../middlewares/uploadAndSaveImage");

const PDFDocument = require('pdfkit');
const fs = require('fs');
const app = require('../app'); 




const router = express.Router();


router.post("/add",uploadAndSaveImage,async (req, res, next) => {
    
    try {
      const {title , description , short_description} = req.body;
      const checkIfpostExist = await postModel.findOne({ title });
      if (checkIfpostExist) {
        throw new Error("post  already exist!");
      }
      const postData = {
        title: title,
        description: description,
        short_description,
      };
    
      if (req.body.imageIds) {
        postData.image = req.body.imageIds;
      }
      const post = new postModel(postData);
      const savedPost = await post.save();
      res.json({ result: savedPost });
    } catch (error) {
      res.json(error.message);
    }
  }
);

router.get("/delete/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await postModel.findByIdAndDelete(id);
    res.json("post deleted");
  } catch (error) {
    res.json(error.message);
  }
});

router.get("/get/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await postModel.findById(id).populate('image');
    res.json(post);
  } catch (error) {
    res.json(error.message);
  }
});

router.post("/update/:id",uploadAndSaveImage,async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title,short_description,description } = req.body;
      const checkIfpostExist = await postModel.findById(id);
      if (!checkIfpostExist) {
        throw new Error("post does not exist!");
      }

    const postData = {
      title,
      description,
      short_description,
    };
    
    if (req.body.imageIds) {
      postData.image = req.body.imageIds;
    }

    await postModel.findByIdAndUpdate(id, postData);
    const postView = await postModel.findById(id);
    res.json(postView);
 
  } catch (error) {
    res.json(error.message);
  }
});

router.get("/get", async (req, res, next) => {
  try {
    const posts = await postModel.find().populate('image');
    res.json(posts);
  } catch (error) {
    res.json(error.message);
  }
});

router.post("/search", async (req, res, next) => {
  try {
    const { search } = req.body;
    console.log(search);
    let posts = [];
    if (!posts) {
      posts = await postModel.find();
    } else {
      posts = await postModel.find({ title:{$regex:search} });
    }
    res.json({ posts });
  } catch (error) {
    res.json(error.message);
  }
});




router.post('/like/:id',validateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.currentUser;
    

    const post = await postModel.findById(id);

    if (post.likedBy.includes(userId)) {
      throw new Error('Vous avez déjà liké cette publication');
    }
    if (post.dislikedBy.includes(userId)) {
      post.dislikedBy.pull(userId);
      post.dislikes -= 1;
    }

    post.likedBy.push(userId);
    post.likes += 1;
    await post.save();

    res.json({ message: 'Publication likée avec succès' });
  } catch (error) {
    res.json({ error: error.message });
  }
});




router.post('/dislike/:id',validateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.currentUser;
    

    const post = await postModel.findById(id);

    if (post.dislikedBy.includes(userId)) {
      throw new Error('Vous avez déjà disliké cette publication');
    }
    if (post.likedBy.includes(userId)) {
      post.likedBy.pull(userId);
      post.likes -= 1;
    }

    post.dislikedBy.push(userId);
    post.dislikes += 1;
    await post.save();

    res.json({ message: 'Publication dislikée avec succès' });
  } catch (error) {
    res.json({ error: error.message });
  }
});




router.get("/page", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page (default: 1)
    const pageSize = parseInt(req.query.pageSize) || 10; // Page size (default: 10)

    const totalPosts = await postModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / pageSize);

    const posts = await postModel
      .find()
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    res.json({ posts, totalPages, currentPage: page });
  } catch (error) {
    res.json({ error: error.message });
  }
});


router.post("/searchFilters", async (req, res, next) => {
  try {
    const { title, description, short_description } = req.body;
    let posts = [];
    if (!posts) {
      posts = await postModel.find();
    } else {
      const query = {};
      if (title) {
        query.title = { $regex: title, $options: "i" };
      }
      if (description) {
        query.description = { $regex: description, $options: "i" };
      }
      if (short_description) {
        query.short_description = { $regex: short_description, $options: "i" };
      }
     
      posts = await postModel.find(query).sort({ createdAt: -1 });
    }
    res.json({ posts });

} catch (error) {
    res.json(error.message);
  }
});

router.post('/rate/:id', validateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.currentUser;
    const { rating } = req.body;
    const post = await postModel.findById(id);

    const userIndex = post.ratedBy.findIndex((ratedUser) => ratedUser.userId.toString() === userId);

    if (userIndex > -1) {
      post.ratedBy[userIndex].rating = rating;
    } else {
      post.ratedBy.push({ userId, rating });
    }

    const totalRatings = post.ratedBy.length;
    const sum = post.ratedBy.reduce((total, ratedUser) => total + ratedUser.rating, 0);
    const averageRating = sum / totalRatings;

    post.averageRating = averageRating;
    await post.save();

    res.json({ message: 'Rating added/updated successfully.', averageRating,ratedBy:post.ratedBy });
  } catch (error) {
    res.json({ error: error.message });
  }
});



router.get('/pdf/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await postModel.findById(id);

    if (!post) {
      throw new Error('La publication n\'existe pas');
    }

    const doc = new PDFDocument();
    const fileName = 'post.pdf';

    doc.fontSize(24).text(post.title);
    doc.fontSize(14).text(post.short_description);
    doc.fontSize(12).text(post.description);

    const filePath = __dirname + '/' + fileName;

    doc.pipe(fs.createWriteStream(filePath));
    doc.end();

    doc.on('end', () => {
      if (fs.existsSync(filePath)) {
        res.download(filePath, fileName, (err) => {
          if (err) {
            console.error(err);
            res.status(500).send('Une erreur est survenue lors de la génération du PDF.');
          }
          fs.unlinkSync(filePath);
        });
      } else {
        res.status(404).send('Le fichier PDF est introuvable.');
      }
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});




module.exports = router;


