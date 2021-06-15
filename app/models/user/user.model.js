const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    password: String,
      email: String,
      avatar: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: "Profile_image"
      }],
      created_at: String,
      updated_at: String,
      status: Boolean,
      notification: { type: Number, default: 0 },
      role:
          [{
              type: mongoose.Schema.Types.ObjectId,
              ref: "Role"
          }]
      ,
    tax_id:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company"
        }]
    ,
    user_detail:
        [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User_detail"
        }]
    ,
      refresh_token: String,
  }, { timestamps: true })
);

module.exports = User;