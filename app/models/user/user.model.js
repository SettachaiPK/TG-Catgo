const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    password: String,
      email: String,
      avatar: String,
      created_at: String,
      updated_at: String,
      role: [
          {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Role"
          }
      ],
    tax_id: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company"
        }
    ],

  },{ timestamps: true })
);

module.exports = User;