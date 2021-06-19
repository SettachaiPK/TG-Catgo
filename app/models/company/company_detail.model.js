const mongoose = require("mongoose");
const sanitizerPlugin = require('mongoose-sanitizer-plugin');

const Company_detail = mongoose.model(
    "Company_detail",
    new mongoose.Schema({
        company_name: String,
        address: String,
        tax_id:
                [{
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Company"
                }]
        ,
        company_province: String,
        company_postal: String
    }).plugin(sanitizerPlugin)
);

module.exports = Company_detail;
