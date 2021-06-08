const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const Job = mongoose.model(
    "Job",
    new mongoose.Schema({
        status: Number,
        awbNumber: String,
        hwbSerialNumber: String,
        flightNumber: String,
        jobNumber: String,
        customsEntryNumber: String,
        customsEntryNumberDate: Date,
        date: Date,
        numberOfPieces: String,
        dockNumber: String,
        pickupTimeHours: String,
        pickupTimeMinutes: String,
        qrCode: String,
        confPickupTimeHours: String,
        confPickupTimeMinutes: String,
        truckNumber: String,
        rating: String,
        comment: String,
        driverAssigner:
                [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                }],
        driver:
                [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                }],
        company:
                [{
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Company"
                }],
    }, {timestamps: true}).plugin(mongoosePaginate)
);
module.exports = Job;


