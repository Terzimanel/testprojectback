const express = require("express");
const serviceModel = require("../models/service");
const validate = require("../middlewares/validateService");
const uploadAndSaveImage = require("../middlewares/uploadAndSaveImage");
const validateToken = require("../middlewares/validateToken");
const qrCode = require("qrcode");
const router = express.Router();
const mongoose = require("mongoose");



router.post("/add",validate,validateToken,uploadAndSaveImage, async (req, res, next) => {
  try {
    const { name, description, phone, email, location,date } = req.body;

    const checkIfServiecExist = await serviceModel.findOne({ name });
    if (checkIfServiecExist) {
      throw new Error("Service already exist!");
    }
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    const qrCodeDataUrl = await generateQRCode(googleMapsUrl);

    const serviceData ={
      name,
      description,
      location,
      phone,
      email,
      date,
      qrCode:qrCodeDataUrl,

    };

    if (req.body.imageIds) {
      serviceData.image = req.body.imageIds[0];
    }
    const service = new serviceModel(serviceData);
    service._id = new mongoose.Types.ObjectId();
    const savedService = await service.save();
    res.json({ result: savedService });
    
  } catch (error) {
    // res.json(error.message);
    console.log(error.message);

  }
});

router.get("/get/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await serviceModel.findById(id).populate('image');
    res.json(service);
  } catch (error) {
    res.json(error.message);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const services = await serviceModel.find().populate('image');
    res.json({ services });
  } catch (error) {
    res.json(error.message);
  }
});

router.get("/delete/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await serviceModel.findByIdAndDelete(id);
    res.json("service deleted");
  } catch (error) {
    res.json(error.message);
  }
});

router.post("/add",validate,validateToken,uploadAndSaveImage, async (req, res, next) => {
  try {
    const { name, description, phone, email, location,date } = req.body;

    const checkIfServiecExist = await serviceModel.findOne({ name });
    if (checkIfServiecExist) {
      throw new Error("Service already exist!");
    }
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    const qrCodeDataUrl = await generateQRCode(googleMapsUrl);

    const serviceData ={
      name,
      description,
      location,
      phone,
      email,
      date,
      qrCode:qrCodeDataUrl,

    };

    if (req.body.imageIds) {
      serviceData.image = req.body.imageIds[0];
    }
    const service = new serviceModel(serviceData);
    service._id = new mongoose.Types.ObjectId();
    const savedService = await service.save();
    res.json({ result: savedService });
    
  } catch (error) {
    // res.json(error.message);
    console.log(error.message);

  }
});

router.post("/update/:id",validateToken,validate,uploadAndSaveImage, async (req, res, next) => {
  try {

    const { id } = req.params;
    console.log(id);
    const { name, description, phone, email, location,date } = req.body;

    const checkIfServiecExist = await serviceModel.findOne({ name });
    if (checkIfServiecExist) {
      throw new Error("Service already exist!");
    }

    const serviceData ={
      name,
      description,
      location,
      phone,
      email,
      date,
    };
    if (req.body.imageIds) {
      serviceData.image = req.body.imageIds[0];
    }
    const service = new serviceModel(serviceData);
    await serviceModel.findByIdAndUpdate(id,service);
    const serviceView = await serviceModel.findById(id);
    res.json({ serviceView });
  } catch (error) {
    res.json(error.message);
    
  }
});

router.post("/search", async (req, res, next) => {
  try {
    const { search } = req.body;
    console.log(search);
    let services = [];
    if (!services) {
      services = await serviceModel.find();
    } else {
      services = await serviceModel.find({ name:{$regex:search} });
    }
    res.json({ services });
  } catch (error) {
    res.json(error.message);
  }
});

router.post("/searchFilters", async (req, res, next) => {
  try {
    const { name, description, location,date } = req.body;
    let services = [];
    if (!services) {
      services = await serviceModel.find();
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
      if (date) {
        const parsedDate = new Date(date);
        query.date = { $eq: parsedDate };  
      }
      services = await serviceModel.find(query).sort({ createdAt: -1 });
    }
    res.json({ services });
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

    const services = await serviceModel
    .find()
    .collation({ caseLevel:true,locale:"en_US" })
    .sort(sortOptions).limit(5);    
    
    res.json({ services });
  } catch (error) {
    res.json(error.message);
  }
});

router.get("/page", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const pageSize = parseInt(req.query.pageSize) || 5; 
    const totalServices = await serviceModel.countDocuments();
    const totalPages = Math.ceil(totalServices / pageSize);

    const services = await serviceModel
      .find()
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    res.json({ services, totalPages, currentPage: page });
  } catch (error) {
    res.json({ error: error.message });
  }
});

const generateQRCode = async (data) => {
  try {
    const qrCodeDataUrl = await qrCode.toDataURL(data);
    return qrCodeDataUrl;
  } catch (error) {
    throw new Error("Failed to generate QR code");
  }
};


router.post("/click/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await serviceModel.findById(id);
    if (!service) {
      throw new Error("Service not found!");
    }

    const clickedAt = new Date();
    const today = new Date().setUTCHours(0, 0, 0, 0);

    if (!service.clickStatistics) {
      service.clickStatistics = [];
    }

    const clickStatsToday = service.clickStatistics.find(stat => stat.date && stat.date.getTime() === today);
    if (clickStatsToday) {
      clickStatsToday.count++;
      clickStatsToday.clickedDates.push(clickedAt);

    } else {
      const newClickStats = {
        date: new Date(today),
        count: 1,
        clickedDates: [clickedAt]
      };
      service.clickStatistics.push(newClickStats);
    }

    await service.save({ strict: false }); 

    res.json({ message: "Service click recorded successfully.", clickStatistics: service.clickStatistics });
  } catch (error) {
    res.json({ error: error.message });
  }
});



router.post("/statistics", async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    console.log(req.body);

    const statistics = await serviceModel.aggregate([
      {
        $match: {
          "clickStatistics.date": { $gte: start, $lte: end }
        }
      },
      {
        $project: {
          name: 1,
          clickCount: {
            $sum: "$clickStatistics.count"
          }
        }
      },
      {
        $sort: {
          clickCount: -1
        }
      },
      {
        $limit: 3
      }
    ]);

    res.json({ statistics });
  } catch (error) {
    res.json({ error: error.message });
  }
});

router.get("/gettopvus/:limit", async (req, res, next) => {
  try {
    const { limit } = req.params;
    const services = await serviceModel.aggregate([
      {
        $sort: {
          "clickStatistics.count": -1
        }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $lookup: {
          from: "images",
          localField: "image",
          foreignField: "_id",
          as: "image"
        }
      }
    ]);
    res.json({ size: services.length, result: services });
  } catch (error) {
    res.json({ error: error.message });
  }
});


router.get("/enable-disable/:id", async (req, res) => {
  const serviceId = req.params.id;
  
  try {
    const service = await serviceModel.findById(serviceId);
    if (service) {
      service.disable = !service.disable;
      await service.save();
      res.json({ disable:service.disable });
    } else {
      res.json({ error: "service not found" });
    }
  } catch (error) {
    res.json({ error: error.message });
  }
});




router.post('/rate/:id', validateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.currentUser;
    const { rating } = req.body;
    const service = await serviceModel.findById(id);

    const userIndex = service.ratedBy.findIndex((ratedUser) => ratedUser.userId.toString() === userId);

    if (userIndex > -1) {
      service.ratedBy[userIndex].rating = rating;
    } else {
      service.ratedBy.push({ userId, rating });
    }

    const totalRatings = service.ratedBy.length;
    const sum = service.ratedBy.reduce((total, ratedUser) => total + ratedUser.rating, 0);
    const averageRating = sum / totalRatings;

    service.averageRating = averageRating;
    console.log(averageRating);
    await service.save();

    res.json({ message: 'Rating added/updated successfully.', averageRating,ratedBy:service.ratedBy });
  } catch (error) {
    res.json({ error: error.message });
  }
});




module.exports = router;
