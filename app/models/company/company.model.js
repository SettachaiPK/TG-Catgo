const mongoose = require("mongoose");

const Company = mongoose.model(
    "Company",
    new mongoose.Schema({
        company_name: String,
        tax_id: String,
        company_detail: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company_detail"
        }]
        ,
    })
);

module.exports = Company;
