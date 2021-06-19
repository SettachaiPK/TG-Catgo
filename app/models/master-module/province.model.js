const mongoose = require("mongoose");
const sanitizerPlugin = require('mongoose-sanitizer-plugin');

const Provinces = mongoose.model(
  "Provinces",
  new mongoose.Schema({
    PROVINCE_ID: Number,
    PROVINCE_CODE: String,
    PROVINCE_NAME: String,
    GEO_ID: Number
  }).plugin(sanitizerPlugin)
);

module.exports = Provinces;