var express = require("express");
const bodyParser = require('body-parser');

const session = require('express-session'); // Add this line
const passport = require('passport'); // Add this line
const multer = require('multer');
var path = require("path");
const http = require("http");
const mongoose = require("mongoose");
var indexRouter = require("./routes/index");
const categoryRouter = require("./routes/category");
const offerRouter = require("./routes/offer");
const centerRouter = require("./routes/center");
const userRouter = require("./routes/user");
const imageRouter = require("./routes/image");
const serviceRouter = require("./routes/service");
const loginRouter = require("./routes/login");
const forgotPasswordEmailRouter = require("./routes/forgotPasswordEmail");
const forgotPasswordSmsRouter = require("./routes/forgotPasswordSms");
const loginFacebookRouter = require("./routes/loginFacebook");
const connectGoogleRouter = require("./routes/connectGoogle");
const logoutRouter = require ("./routes/logout");
const postRouter = require("./routes/post");
const commentRouter = require("./routes/comment");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const upload = multer();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const app = express();
const requestIp = require('request-ip');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerAutogen = require('swagger-autogen')();
var router = express.Router();
app.use(bodyParser.json());
app.use(cors());
// Swagger configuration options
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Your API',
      version: '1.0.0',
      description: 'API documentation using Swagger',
    },
    servers: [
      {
        url: 'http://localhost:5050', // Update with your server's URL
      },
    ],
  },
  apis: ['./routes/*.js'], // Specify the path to your API routes
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));



mongoose.set('strictQuery', true);
mongoose.connect("mongodb://127.0.0.1:27017/TuniVita", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(express.urlencoded({ extended: true }));

const filesUploads = fileUpload({ safeFileNames: true, preserveExtension: true });


// Set up session middleware
app.use(session({
  secret: 'your_session_secret',
  resave: false,
  saveUninitialized: true
}));

// Set up passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRouter);
app.use("/category", filesUploads , categoryRouter);
app.use("/center", filesUploads , centerRouter);
app.use("/user",filesUploads, userRouter);
app.use("/services", filesUploads,serviceRouter);
app.use("/offers", filesUploads,offerRouter);
app.use("/login", loginRouter);
app.use("/pdf", postRouter);
app.use("/posts",filesUploads,postRouter);
app.use("/image",imageRouter);
app.use("/forgotPasswordEmail", forgotPasswordEmailRouter);
app.use("/forgotPasswordSms", forgotPasswordSmsRouter);
app.use("/loginFacebook", loginFacebookRouter);
app.use("/connectGoogle", connectGoogleRouter)
app.use("/logout", logoutRouter)
app.use("/posts",postRouter);
app.use("/comments",commentRouter);
app.use(express.static(path.join(__dirname, "public")));
app.use(upload.array());
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  console.log("Error 404");
});

// error handler

const server = http.createServer(app);
server.listen(5050, () => {
  console.log("app is running on port 5050");
});

global.isEmptyObject = function (value) {
  if (typeof value === 'undefined' || value === null) {
    return true;
  }

  if (typeof value === "string" && value.trim() === "") {
    return true;
  }

  if (Array.isArray(value) && value.length === 0) {
    return true;
  }

  if (typeof value === "object" && Object.keys(value).length === 0) {
    return true;
  }

  return false;
};
//secretKey JWT Token
global.secretKey = "kgnùfdjhnojgnfsjlnfmljkdfsgb66g5fg5fg5fgfgkdg6fg5fg";


global.getImageFilePathById = (image) => {
  if (!image) {
    return null;
  }
  const imagePath = path.join(__dirname, 'uplods', image.filename);
  return imagePath;
}

// handling CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", 
             "http://localhost:4200");
  res.header("Access-Control-Allow-Headers", 
             "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

