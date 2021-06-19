const mongoose = require("mongoose");
const sanitizerPlugin = require('mongoose-sanitizer-plugin');

const Role = mongoose.model(
  "Role",
  new mongoose.Schema({
    name: String
    
  }).plugin(sanitizerPlugin)
);

module.exports = Role;
