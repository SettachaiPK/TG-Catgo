const mongoose = require("mongoose");
const sanitizerPlugin = require('mongoose-sanitizer-plugin');

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
        address: String,
        province: String,
        zipcode: String,
        avg_rating: Number,
    }, { timestamps: true }).plugin(sanitizerPlugin)

);

module.exports = User_detail
;
