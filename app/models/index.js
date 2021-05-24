const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.role = require("./role.model");
db.user_detail = require("./user_detail.model");

db.ROLES = ["tg-admin", "admin", "freight-forwarder", "driver"];

module.exports = db;