const mongoose = require("mongoose");

const Profile_image = mongoose.model(
    "Profile_image",
    new mongoose.Schema({
        name: String,
        value: String
    })
);

module.exports = Profile_image;