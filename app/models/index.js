const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user/user.model");
db.role = require("./user/role.model");
db.user_detail = require("./user/user_detail.model");
db.company = require("./company/company.model");
db.company_detail = require("./company/company_detail.model");
db.job = require("./job/job.model");
db.province = require("./master-module/province.model");
db.profile_image = require("./user/profile_image.model");
db.comment = require("./user/comment.model");
db.chat = require("./chat/chat.model");
db.log = require("./log/log.model");

db.ROLES = ["tg-admin", "admin", "freight-forwarder", "driver"];

module.exports = db;