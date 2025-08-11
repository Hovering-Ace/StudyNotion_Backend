const mongoose = require("mongoose");
const SubSection = require("./SubSection");

const sectionSchema = new mongoose.Schema({
    sectionName:{
        type:String,
    },
    subSection:[
        {
            type:mongoose.Schema.Types.ObjectId,
            reuired:true,
            ref:"SubSection"
        }
    ]
});

module.exports = mongoose.model("Section", sectionSchema);