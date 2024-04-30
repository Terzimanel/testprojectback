var express = require("express");
const userModel = require("../models/user");
const validateUser = require("../middlewares/validateUser");
const validateToken = require("../middlewares/validateToken");
const bcrypt = require('bcrypt');
const user = require("../models/user");
const uploadAndSaveImage = require("../middlewares/uploadAndSaveImage");

var router = express.Router();



router.get("/",validateToken, function (req, res, next) {
  res.json("welcome to TuniVita");
});


router.get("/get", validateToken ,async (req, res, next) => {
  try {
      const users = await userModel.find().populate('image');
      res.json(users);
      console.log("retuning data");
  } catch (error) {
    res.json(error.message);
  }
});


router.get("/get/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id).populate('image');
    // Get path of Images
    res.json({ result: user });
  } catch (error) {
    res.json({ error: error.message });
  }
});


// router.put("/update/:id", validateToken,uploadAndSaveImage, async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const updatedUser = req.body;
//     if(updatedUser.password == "")
//     {
//       delete updatedUser.password;
//     }
//     const user = await userModel.findByIdAndUpdate(id, updatedUser, { new: true });

//     if (!user) {
//       throw new Error("User not found");
//     }

//     res.json(user);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

router.post("/update/:id", validateToken, uploadAndSaveImage, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstname, lastname, date_birth, gender, address, state, city, zip_code, phone, email, password, role } = req.body;
    console.log(req.body);
    
    const user = await userModel.findById(id);
    
    if (user.email !== email) {
      const checkIfUserExist = await userModel.findOne({ email });
      if (checkIfUserExist) {
        throw new Error("User already exists!");
      }
    }
    
    const userdata = {
      firstname: firstname,
      lastname: lastname,
      date_birth: date_birth,
      gender: gender,
      address: address,
      state: state,
      city: city,
      zip_code: zip_code,
      phone: phone,
      email: email,
      image: (req.body.imageIds && req.body.imageIds[0] ? req.body.imageIds[0] : null)
    };
    console.log(userdata);
    
    await userModel.findByIdAndUpdate(id, userdata);
    
    if (!user.role.includes("admin")) {
      await userModel.findByIdAndUpdate(id, { role: ["user"] });
    }
    
    const updatedUser = await userModel.findById(id);
    console.log(updatedUser);
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/addUser",validateUser, uploadAndSaveImage , async (req, res, next) => {
    
  try {
    const { firstname, lastname ,date_birth, gender , address , state , city , zip_code , phone, email, password, role} =req.body;
    const checkIfUserExist = await userModel.findOne({ email });
    if (!isEmptyObject(checkIfUserExist)) {
      throw new Error("User already exist!");
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = new userModel({
      firstname: firstname,
      lastname: lastname,
      role:["user"],
      date_birth:date_birth,
      gender: gender,
      address: address,
      state: state,
      city: city,
      zip_code: zip_code,
      phone: phone,
      email: email,
      password: hashedPassword,
      image: (req.body.imageIds[0]?req.body.imageIds[0]:null)
    });
    user.save();
    res.json("User Added");
  } catch (error) {
    res.json(error.message);
  }
});


router.delete("/delete/:id",validateToken, async (req, res, next) => {
    try {
      const { id } = req.params;
      await userModel.findByIdAndUpdate(id, {disable:true});
      const user = await userModel.findById(id);
      res.json(user);
    } catch (error) {
      res.json(error.message);
    }
  });

  router.get("/enable-disable/:id", async (req, res) => {
    const userId = req.params.id;
    
    try {
      const user = await userModel.findById(userId);
      if (user) {
        user.disable = !user.disable;
        await user.save();
        res.json({ user:user.disable });
      } else {
        res.json({ error: "service not found" });
      }
    } catch (error) {
      res.json({ error: error.message });
    }
  });
  



  router.get("/statistics",validateToken, async (req, res, next) => {
    try {
      const countHommes = await userModel.countDocuments({ gender: 'Homme' });
      const countFemmes = await userModel.countDocuments({ gender: 'Femme' });
      res.json({countFemmes, countHommes});
      console.log(countHommes);
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      res.json({'Erreur lors du calcul des statistiques': error});

    }
  });
    router.post("/usersBetweenDates",validateToken, async (req, res) => {
      try {
        console.log(req.body);
        const { startDate, endDate } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);
      console.log(startDate,endDate);
        const users = await userModel.find({
          date_birth: {
            $gte: start,
            $lte: end,
          },
        });
    
        res.json(users);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    
    router.get("/searchUsers", validateToken, async (req, res, next) => {
      try {
        const searchedValue = req.body.searchTerm;
    
        const query = {
          $or: [
            { firstname: { $regex: new RegExp(searchedValue, "i") } },
            { lastname: { $regex: new RegExp(searchedValue, "i") } },
            { email: { $regex: new RegExp(searchedValue, "i") } },
          ],
        };
    
        const users = await userModel.find(query);
        console.log(searchedValue);
        res.json(users);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

  

module.exports = router;
