const mongoose = require("mongoose");
const postSchema = new mongoose.Schema({


    title:{
        type:String,
        required:true,
        trim:true
    },
    short_description:{
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
    likes: {
        type: Number,
        default: 0
      },
      likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      dislikes: {
        type: Number,
        default: 0
      },
      dislikedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
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
const post = mongoose.model("post", postSchema);
module.exports = post;