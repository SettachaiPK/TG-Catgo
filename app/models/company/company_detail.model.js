const mongoose = require("mongoose");

const Company_detail = mongoose.model(
    "Company_detail",
    new mongoose.Schema({
        company_name: String,
        address: String,
        tax_id: [
                {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Company"
                }
        ],
        company_province: String,
        company_postal: String
    })
);

module.exports = Company_detail;
