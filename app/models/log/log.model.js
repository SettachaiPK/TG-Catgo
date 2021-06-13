const mongoose = require("mongoose");

const Log = mongoose.model(
    "Log",
    new mongoose.Schema({
        user:
            [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
            }]
        ,
        action: String,
        createAt: {
            type: Date,
            default: Date.now,
            expires: 864000,
          },
    })
);

module.exports = Log;