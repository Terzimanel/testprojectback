const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const userModel = require('../models/user');


const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: '',
    pass: '',
}
});


// Route pour la demande de réinitialisation du mot de passe
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Vérifier si l'utilisateur existe dans la base de données
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Générer un token de réinitialisation de mot de passe
    const token = jwt.sign({ userId: user._id }, 'my_super_secret_key_12345', {
      expiresIn: '1h',
    });

    // Enregistrer le token dans la base de données pour l'utilisateur
    user.resetPasswordToken = token;
    await user.save();

    // Envoyer l'e-mail contenant le lien de réinitialisation du mot de passe
    const resetPasswordLink = `http://localhost:4200/reset-password/${token}`;
    // Utilisez le module nodemailer pour envoyer l'e-mail avec le lien

    const mailOptions = {
      from: '"Tunivita" nassreddine.trigui@hotmail.com',
      to: user.email,
      subject: 'Password Reset',
      text: `Click on the following link to reset your password: ${resetPasswordLink}`
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while sending the password reset email.' });
      } else {
        console.log('Email sent: ' + info.response);
        res.status(200).json({ message: 'An email has been sent to reset your password.' });
      }
    });
    

    res.status(200).json({ message: 'Un e-mail a été envoyé pour réinitialiser votre mot de passe.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur s\'est produite lors de la réinitialisation du mot de passe.' });
  }
});

// Route pour réinitialiser le mot de passe
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;

  try {
    // Vérifier si le token est valide et trouver l'utilisateur correspondant
    const user = await userModel.findOne({ resetPasswordToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Token de réinitialisation de mot de passe invalide.' });
    }

    // Vérifier si le token a expiré
    const decodedToken = jwt.verify(token, 'my_super_secret_key_12345');
    if (decodedToken.exp < Date.now() / 1000) {
      return res.status(400).json({ message: 'Le token de réinitialisation de mot de passe a expiré.' });
    }
    const { password } = req.body;
    // Mettre à jour le mot de passe de l'utilisateur
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    await user.save();
    res.status(200).json({ message: 'Votre mot de passe a été réinitialisé avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur s\'est produite lors de la réinitialisation du mot de passe.' });
  }
});



module.exports = router;
