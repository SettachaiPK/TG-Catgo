const mongoose = require("mongoose");

const User_detail = mongoose.model(
    "User_detail",
    new mongoose.Schema({
        username:
            [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
            }]
        ,
        prefix: String,
        firstname: String,
        lastname: String,
        phone: String,
    }, { timestamps: true })
);

module.exports = User_detail;
