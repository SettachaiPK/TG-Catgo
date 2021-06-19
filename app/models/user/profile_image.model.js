const mongoose = require("mongoose");
const sanitizerPlugin = require('mongoose-sanitizer-plugin');

const Profile_image = mongoose.model(
    "Profile_image",
    new mongoose.Schema({
        name: String,
        value: String
    }).plugin(sanitizerPlugin)
);

module.exports = Profile_image;