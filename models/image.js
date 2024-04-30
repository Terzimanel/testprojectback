const mongoose = require("mongoose");
const imageSchema = new mongoose.Schema ({
    fieldname:String,
    originalname:String,
    size:String,
    destination:String,
    filename:String,
    mimetype:String,
    path:String,
},{
    timestamps: true
});
const image = mongoose.model("image", imageSchema);
module.exports = image;