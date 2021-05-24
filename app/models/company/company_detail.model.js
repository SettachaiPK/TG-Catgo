const mongoose = require("mongoose");

const company_detail = mongoose.model(
    "company_detail",
    new mongoose.Schema({
        company_name: String,
        user_id: String,
        address: String,
        tax_id: String,
        company_province: String,
        company_postal: String
    })
);

module.exports = company_detail;
