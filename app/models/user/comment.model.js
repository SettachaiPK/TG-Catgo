const mongoose = require("mongoose");
const sanitizerPlugin = require('mongoose-sanitizer-plugin');

const Comment = mongoose.model(
    "Comment",
    new mongoose.Schema({
        driver:
            [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
            }]
        ,
        job:
            [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Job"
            }]
        ,
        rating: Number,
        comment: String,
    }, { timestamps: true }).plugin(sanitizerPlugin)

);

module.exports = Comment
;
