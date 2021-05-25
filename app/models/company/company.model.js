const mongoose = require("mongoose");

const Company = mongoose.model(
    "company",
    new mongoose.Schema({
        company_name: String,
        tax_id: String
    })
);

module.exports = Company;
