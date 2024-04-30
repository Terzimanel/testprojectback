const yup = require("yup");
const jwt = require('jsonwebtoken');
const userModel = require("../models/user");



const validateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const [bearerKeyword, token] = authHeader.split(' ');
    if (bearerKeyword === 'Bearer' && token!="") {
      try {
        await yup.string().required().validate(token); // Valider le format du token

        const decoded = jwt.verify(token, secretKey); // Vérifier le token
        const userId = decoded.userId;

        const user = await userModel.findById(userId);
        if (user && user.id == userId && user.tokens.includes(token)) {

          console.log('User verification:', user.id);
          req.body.currentUser=user.id;
          return next();
        }

        res.json({ token: "KO", error: "User not found" });
      } catch (error) {
        console.log('Token verification failed:', error.message);
        res.json({ token: "KO", error: error.message });
      }
    }
  }

  res.json({ token: "KO", error: "Token not provided" });
};

module.exports = validateToken;