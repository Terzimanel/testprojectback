var express = require("express");
var router = express.Router();
const jwt = require('jsonwebtoken');
const userModel = require("../models/user");


router.post('/', async(req, res) => {
 
  
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const [Bearer,token] = authHeader.split(' ');
    console.log(token);
    const decoded = jwt.verify(token, secretKey); 
    const userId = decoded.userId;
    const user = await userModel.findById(userId);
    const tokens = user.tokens.filter((element) => element !== token);
    await userModel.findByIdAndUpdate(user._id,{tokens});
    res.json({ message: 'Déconnexion réussie' });
  }

});
  module.exports = router;
