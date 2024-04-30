const mongoose = require("mongoose");
const { boolean, string, date } = require("yup");
const serviceSchema = new mongoose.Schema({
    
    name:{
        type:String,
        trim:true,
        required:true,

    },
    
    description:{
        type:String,
        trim:true
    },
    
    date:{
        type:Date,
        trim:true
    },
    
    image:{
        type : mongoose.Types.ObjectId, 
        ref :"image"
    },
    phone:{
        type:String,
        trim:true
    },    
    email:{
        type:String,
        trim:true
    },
    location:{
        type:String,
        trim:true
    },
    date:{
        type:Date,
        trim:true
    },

    disable:{
        type:Boolean,
        default:false
    }
    ,
    qrCode: {
        type: String,
    },
    clickStatistics: [
        {
          date: {
            type: Date,
            required: true
          },
          count: {
            type: Number,
            default: 0
          },
          clickedDates: [
            {
              type: Date
            }
          ]
        }
      ],
      ratedBy: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          rating: {
            type: Number,
            required: true,
          },
        },
      ],
    averageRating:{
        type: Number,
        default: 0,
    }
   


},{
    timestamps: true
});
const service = mongoose.model("service", serviceSchema);
module.exports = service;