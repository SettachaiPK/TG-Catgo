const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const sanitizerPlugin = require('mongoose-sanitizer-plugin');

const Log = mongoose.model(
    "Log",
    new mongoose.Schema({
        user:
            [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
            }]
        ,
        job:
            [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Job"
            }]
        ,
        action: String,
        createAt: {
            type: Date,
            default: Date.now,
            expires: 864000,
          },
    }).plugin(sanitizerPlugin).plugin(mongoosePaginate)
);

module.exports = Log;