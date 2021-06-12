const mongoose = require("mongoose");

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
    }, { timestamps: true })
);
module.exports = Chat;