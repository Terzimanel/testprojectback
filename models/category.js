const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema ({
    
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
    image:{
        type : mongoose.Types.ObjectId, 
        ref :"image"
    },
    parent:{
        type : mongoose.Types.ObjectId,
        ref:'category',
    },
    disable:{
        type:Boolean,
        default:false
    }

},{
    timestamps: true
});
const category = mongoose.model("category", categorySchema);
module.exports = category;