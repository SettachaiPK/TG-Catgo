const mongoose = require("mongoose");

const Provinces = mongoose.model(
  "Provinces",
  new mongoose.Schema({
    PROVINCE_ID: Number,
    PROVINCE_CODE: String,
    PROVINCE_NAME: String,
    GEO_ID: Number
  })
);

module.exports = Provinces;