const mongoose = require("mongoose");
const { boolean } = require("yup");
const centerSchema = new mongoose.Schema ({
    
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    image:[{
        type : mongoose.Types.ObjectId, 
        ref :"image"
    }],
    longitude:{
        type:String,
        trim:true
    },
    altitude:{
        type:String,
        trim:true
    },
    location:{
        type:String,
        trim:true
    },
    phone:{
        type:String,
        trim:true
    },
    email:{
        type:String,
        trim:true
    },
    category:{
        type : mongoose.Types.ObjectId, 
        ref :"category"
    },
    nbVus:{
        type:Number,
        default:0
    },
    disable:{
        type:Boolean,
        default:false
    }
},{
    timestamps: true
});
const center = mongoose.model("center", centerSchema);
module.exports = center;