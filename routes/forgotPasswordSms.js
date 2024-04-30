const express = require('express');
const userModel = require('../models/user');
const { Vonage } = require('@vonage/server-sdk')
const bcrypt = require('bcrypt');
const router = express.Router();

// Set up Nexmo client
const vonage = new Vonage({
    apiKey: "ac13b29b",
    apiSecret: "Z7QrnNXzjdedILxl"
  })

// Route for sending a verification code to the user's phone number
router.post('/', async (req, res) => {
    const from = "TuniVita"
    const to = "21628046402"
    const text = 'A text message sent using the Vonage SMS API'
    
    async function sendSMS() {
        await vonage.sms.send({to, from, text})
            .then(resp => { console.log('Message sent successfully'); console.log(resp); })
            .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
    }
    
    sendSMS();
});
// Route for resetting the password with the verification code
router.post('/reset', async (req, res) => {
  const { phoneNumber, verificationCode, newPassword } = req.body;
  try {
    const user = await userModel.findOne({ phoneNumber });
    if (!user || !user.resetToken || user.resetToken !== verificationCode || !user.resetTokenExpiration || user.resetTokenExpiration < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    // Reset token is valid, proceed with password update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Error resetting password' });
  }
});

// Function to generate a random verification code
function generateVerificationCode() {
  const codeLength = 6;
  const characters = '0123456789';
  let code = '';
  for (let i = 0; i < codeLength; i++) {
    code += characters[Math.floor(Math.random() * characters.length)];
  }
  return code;
}

module.exports = router;
