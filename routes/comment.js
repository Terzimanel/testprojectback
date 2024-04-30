var express = require('express');
const commentModel = require("../models/comment");
const userModel = require("../models/user");
const postModel = require("../models/post");
var router = express.Router();


router.post("/add",async (req, res, next) => {
    try {
      const { Postid,text } = req.body;
      const userId = req.body.currentUser;
      
      var user = await userModel.findById(userId);
      var post = await postModel.findById(Postid);
      if (!post) {
        throw new Error("post does not exist!");
      }
        
      const comment = new commentModel({
        text: text,
        post: post,
        user: user,
      });

      comment.save();
      res.json(comment);
    } catch (error) {
      res.json(error.message);
    }
  }
);

router.get("/delete/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await commentModel.findByIdAndDelete(id);
    res.json("comment deleted");
  } catch (error) {
    res.json(error.message);
  }
});



router.get("/get/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await commentModel.findById(id).populate('user').populate('post');
    res.json(comment);
  } catch (error) {
    res.json(error.message);
  }
});

router.post("/update/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    var commentaire = await commentModel.findById(id);
    console.log(commentaire);
    const com=await commentModel.findByIdAndUpdate(id,req.body);
    res.json(com);
  } catch (error) {
    res.json(error.message);
  }
});
router.get("/get", async (req, res, next) => {
  try {
    const comments = await commentModel.find().populate('user').populate('post');
    res.json(comments);
  } catch (error) {
    res.json(error.message);
  }
});


router.get('/comments-by-post/:id', async (req, res) => {
  try {
    const { postId } = req.body;
    const comments = await commentModel.find({ post: postId }).populate('post').populate('user');

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
