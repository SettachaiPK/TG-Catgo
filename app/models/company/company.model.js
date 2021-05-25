const mongoose = require("mongoose");

const company = mongoose.model(
    "company",
    new mongoose.Schema({
        company_name: String,
        tax_id: String
    })
);

module.exports = company;
