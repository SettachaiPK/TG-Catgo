const mongoose = require("mongoose");
const sanitizerPlugin = require('mongoose-sanitizer-plugin');

const Notification = mongoose.model(
    "Notification",
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
        detail: String,
    }).plugin(sanitizerPlugin)
);

module.exports = Notification;