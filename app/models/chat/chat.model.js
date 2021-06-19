const mongoose = require("mongoose");
const sanitizerPlugin = require('mongoose-sanitizer-plugin');

const Chat = mongoose.model(
    "Chat",
    new mongoose.Schema({
        user:
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
        message: String,
    }, { timestamps: true }).plugin(sanitizerPlugin)
);
module.exports = Chat;