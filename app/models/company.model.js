const mongoose = require("mongoose");

const Company = mongoose.model(
  "Company",
  new mongoose.Schema({
    id: String,
  })
);

module.exports = Company;
