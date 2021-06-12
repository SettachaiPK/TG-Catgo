const mongoose = require("mongoose");

const Log = mongoose.model(
  "Log",
  new mongoose.Schema({
    username:
            [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
            }]
        ,
    action: String,
  }), { timestamps: true }
);

module.exports = Log;