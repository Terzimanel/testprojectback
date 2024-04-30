const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema({

   text:{
        type:String,
        required:true,
        trim:true
    },


    post:{
        type:String,
        required:true,
        trim:true
    },
    
    like:{
        type:Number,
        required:false,
        default:0,
        trim:true
    },
    dislike:{
        type:Number,
        required:false,
        default:0,
        trim:true
    },
    post:{
        type : mongoose.Types.ObjectId, 
        ref :"post"
    },
    user:{
        type : mongoose.Types.ObjectId, 
        ref :"user"
    },
    disable:{
        type:Boolean,
        default:false
    }

},{
    timestamps: true
});
const comment = mongoose.model("comment", commentSchema);
module.exports = comment;

