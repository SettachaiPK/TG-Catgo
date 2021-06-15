const mongoose = require("mongoose");

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
    })
);

module.exports = Notification;