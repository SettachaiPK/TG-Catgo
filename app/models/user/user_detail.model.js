const mongoose = require("mongoose");

const user_detail = mongoose.model(
    "user_detail",
    new mongoose.Schema({
        username: String,

        password: String,
        roles: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Role"
            }
        ],
        address: String,
        province: String,
        postal: String,
        phone: String,
        email: String,
        role: String,

    })
);

module.exports = user_detail;
