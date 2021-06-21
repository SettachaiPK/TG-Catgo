const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const sanitizerPlugin = require('mongoose-sanitizer-plugin');

const Company = mongoose.model(
    "Company",
    new mongoose.Schema({
        company_name: String,
        tax_id: String,
        company_detail: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company_detail"
        }],
        driver_count: Number,
        job_count: Number,
        status: Boolean
    }).plugin(mongoosePaginate).plugin(sanitizerPlugin)
);

module.exports = Company;
