const config = require("../config/auth.config");
const db = require("../models");
const Province = db.province;

exports.provinces = (req, res) => {
    Province.find().exec((err, data) => {
        res.status(200).send(data)
    });
}