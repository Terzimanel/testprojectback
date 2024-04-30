const mongoose = require("mongoose");
const { token } = require("morgan");
const { array } = require("yup");
const moment = require("moment");
const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      trim: true,
    },
    image: {
      type: mongoose.Types.ObjectId,
      ref: "image",
    },
    date_birth: {
        type: Date,
        required: false,
        trim: true,
    },
    address: {
      type: String,
      required: false,
    },
    state: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    zip_code: {
      type: String,
      required: false,
    },
    role: {
      type: [String],
      trim: true,
    },
    disable: {
      type: Boolean,
      default: true,
    },
    tokens: {
      type: [String],
      trim: true,
    },
    loginCount: {
        type: Number,
        default:0,
        trim: true,
      },
  },
  {
    timestamps: true,
  }
);

const user = mongoose.model("user", userSchema);
module.exports = user;
