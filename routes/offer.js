const express = require("express");
const centerModel = require("../models/center");
const offerModel = require("../models/offer");
const userModel = require("../models/user");

const validate = require("../middlewares/validateOffer");
const router = express.Router();
const validateToken = require("../middlewares/validateToken");
const uploadAndSaveImage = require("../middlewares/uploadAndSaveImage");
const { google } = require('googleapis');


router.post("/add",validateToken,validate,uploadAndSaveImage, async (req, res, next) => {
  try {
    const { name, description,location, center } = req.body;
    console.log(req.body);
    const checkIfOfferExist = await offerModel.findOne({ name });
    if (checkIfOfferExist) {
      throw new Error("Offer already exist!");
    }
    
    const checkIfCenterExist = await centerModel.findById(center);
    if (!checkIfCenterExist) {
      throw new Error("Center does not exist!");
    }
    console.log(checkIfCenterExist);
    const offerData = {
      name: name,
      description: description,
      location: location,
      center: checkIfCenterExist,
      
    };

    if (req.body.imageIds) {
      offerData.image = req.body.imageIds[0];
    }
    const offer = new offerModel(offerData);
    const savedOffer = await offer.save();
    res.json({ result: savedOffer });
  } catch (error) {
    res.json(error.message);
  }
});




router.get("/get/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const offer = await offerModel.findById(id).populate('image').populate('center');;
    res.json(offer);
  } catch (error) {
    res.json(error.message);
  }
});




router.get("/", async (req, res, next) => {
  try {
    const offers = await offerModel.find().populate('image').populate('center');
    res.json({ offers });
  } catch (error) {
    res.json(error.message);
  }
});



router.get("/enabled-offers", async (req, res, next) => {
  try {
    const offers = await offerModel.find({disable:false});
    res.json({ offers });
  } catch (error) {
    res.json(error.message);
  }
});


router.get("/delete/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await offerModel.findByIdAndDelete(id);
    res.json("offer deleted");
  } catch (error) {
    res.json(error.message);
  }
});


router.post("/update/:id",validate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description,location,center } = req.body;
    const checkIfCenterExist = await centerModel.findById(center);
    if (!checkIfCenterExist) {
      throw new Error("Center does not exist!");
    }
    const offerData = {
      name: name,
      description: description,
      location: location,
      center: checkIfCenterExist,
      
    };
    
    if (req.body.imageIds) {
      offerData.image = req.body.imageIds[0];
    }
    await offerModel.findByIdAndUpdate(id,offerData);
    const offerView = await offerModel.findById(id);
    res.json({ offerView });

  } catch (error) {
    res.json(error.message);
  }
});

router.post("/search", async (req, res, next) => {
  try {
    const { search } = req.body;
    console.log(search);
    let offers = [];
    if (!offers) {
      offers = await offerModel.find({ disable: false });
    } else {
      offers = await offerModel.find({disable:false , name:{$regex:search} });
    }
    res.json({ offers });
  } catch (error) {
    res.json(error.message);
  }
});


router.post("/searchFilters", async (req, res, next) => {
  try {
    const { name, description, location } = req.body;
    let offers = [];
    if (!offers) {
      offers = await offerModel.find({ disable: false });
    } else {
      const query = {};
      if (name) {
        query.name = { $regex: name, $options: "i" };
      }
      if (description) {
        query.description = { $regex: description, $options: "i" };
      }
      if (location) {
        query.location = { $regex: location, $options: "i" };
      }
     
      offers = await offerModel.find(query).sort({ createdAt: -1 });
    }
    res.json({ offers });
  } catch (error) {
    res.json(error.message);
  }
});

router.post("/sort", async (req, res, next) => {
  try {
    const { field, order } = req.body;

    let sortValue;
    if (order === "asc") {
      sortValue = 1; 
    } else {
      sortValue = -1; 
    }
    console.log(field,order);
    const sortOptions = {};
    sortOptions[field] = sortValue;

    const offers = await offerModel
    .find({ disable: false })
    .collation({ caseLevel:true,locale:"en_US" })
    .sort(sortOptions).limit(5);    
    
    res.json({ offers });
  } catch (error) {
    res.json(error.message);
  }
});


router.get("/page", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const pageSize = parseInt(req.query.pageSize) || 10; 

    const totalOffers = await offerModel.countDocuments();
    const totalPages = Math.ceil(totalOffers / pageSize);

    const offers = await offerModel
      .find()
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    res.json({ offers, totalPages, currentPage: page });
  } catch (error) {
    res.json({ error: error.message });
  }
});


router.post("/click/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const offer = await offerModel.findById(id);
    if (!offer) {
      throw new Error("Offer not found!");
    }

    offer.clickCount += 1;
    await offer.save();

    res.json({ message:"Offer click recorded successfully.",clickCount:offer.clickCount });
  } catch (error) {
    res.json({ error: error.message });
  }
});



router.get("/enable-disable/:id", async (req, res) => {
  const offerId = req.params.id;
  
  try {
    const offer = await offerModel.findById(offerId);
    if (offer) {
      offer.disable = !offer.disable;
      await offer.save();
      res.json({ disable:offer.disable });
    } else {
      res.json({ error: "Offer not found" });
    }
  } catch (error) {
    res.json({ error: error.message });
  }
});

router.get("/isFavorite/:id", async (req, res) => {
  const offerId = req.params.id;
  
  try {
    const offer = await offerModel.findById(offerId);
    if (offer) {
      offer.isFavorite = !offer.isFavorite;
      await offer.save();
      res.json({ isFavorite:offer.isFavorite });
    } else {
      res.json({ error: "Offer not found" });
    }
  } catch (error) {
    res.json({ error: error.message });
  }
});



router.get("/statistics", async (req, res) => {
  try {  
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();
    console.log(currentDate, currentYear, currentMonth, currentDay);

    const statistics = await offerModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-${currentMonth}-01`),
            $lte: new Date(`${currentYear}-${currentMonth}-${currentDay+1}`)
          }
        }
      },
      {
        $group: {
          _id: "$disable",
          count: { $sum: 1 }
        }
      }
    ]);
    console.log('Current Date:', currentDate);
console.log('Match Stage:', {
  createdAt: {
    $gte: new Date(`${currentYear}-${currentMonth}-01`),
    $lte: new Date(`${currentYear}-${currentMonth}-${currentDay}`)
  }
});
    console.log(statistics);

    const disabledOffers = statistics.find(stat => stat._id === false);
    const enabledOffers = statistics.find(stat => stat._id === true);

    const enabledCount = enabledOffers ? enabledOffers.count : 0;
    const disabledCount = disabledOffers ? disabledOffers.count : 0;

    const totalOffers = enabledCount + disabledCount;
    const percentageEnabledOffers = ((enabledCount / totalOffers) * 100).toFixed(2);
    const percentageDisabledOffers = ((disabledCount / totalOffers) * 100).toFixed(2);
    console.log(percentageDisabledOffers);

    const result = {
      PercentageEnabledOffers: percentageEnabledOffers,
      PercentageDisabledOffers: percentageDisabledOffers,
      enqbleOffers:enabledCount,
      disableOffers:disabledCount,
      totalOffers:totalOffers
    };
    res.json(result);
  
  } catch (error) {
    res.json({ error: error.message });
  }
});



router.post('/rate/:id', validateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.currentUser;
    const { rating } = req.body;
    const offer = await offerModel.findById(id);

    const userIndex = offer.ratedBy.findIndex((ratedUser) => ratedUser.userId.toString() === userId);

    if (userIndex > -1) {
      offer.ratedBy[userIndex].rating = rating;
    } else {
      offer.ratedBy.push({ userId, rating });
    }

    const totalRatings = offer.ratedBy.length;
    const sum = offer.ratedBy.reduce((total, ratedUser) => total + ratedUser.rating, 0);
    const averageRating = sum / totalRatings;

    offer.averageRating = averageRating;
    await offer.save();

    res.json({ message: 'Rating added/updated successfully.', averageRating,ratedBy:offer.ratedBy });
  } catch (error) {
    res.json({ error: error.message });
  }
});




router.post('/favorite/:id', validateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.currentUser;
    const offer = await offerModel.findById(id);

    if (!offer.favorites) {
      offer.favorites = []; // Initialize favorites array if it doesn't exist
    }

    const userIndex = offer.favorites.indexOf(userId);

    if (userIndex > -1) {
      offer.favorites.splice(userIndex, 1); // Remove user ID from favorites
    } else {
      offer.favorites.push(userId); // Add user ID to favorites
    }

    await offer.save();

    res.json({ message: 'Favorite status updated successfully.', favorites: offer.favorites });
  } catch (error) {
    res.json({ error: error.message });
  }
});

router.get('/offers-by-center/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const offers = await offerModel.find({ center: id }).populate('center').populate('image');
    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





module.exports = router;
