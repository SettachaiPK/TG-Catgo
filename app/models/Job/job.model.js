const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const Job = mongoose.model(
    "Job",
    new mongoose.Schema({
        status: Number,
        awbNumber: { type: String, default: '-' },
        hwbSerialNumber: { type: String, default: '-' },
        flightNumber: { type: String, default: '-' },
        jobNumber: { type: String, default: '-' },
        customsEntryNumber: { type: String, default: '-' },
        customsEntryNumberDate: { type: Date, default: null },
        flightDate: { type: Date, default: null },
        numberOfPieces: { type: String, default: '-' },
        dockNumber: { type: String, default: '-' },
        pickupTimeHours: { type: String, default: '-' },
        pickupTimeMinutes: { type: String, default: '-' },
        confPickupTimeHours: { type: String, default: '-' },
        confPickupTimeMinutes: { type: String, default: '-' },
        qrCode: { type: String, default: '-' },
        truckNumber: { type: String, default: '-' },
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


