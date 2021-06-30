const config = require("../config/auth.config");
const db = require("../models");
const Province = db.province;

exports.provinces = async (req, res) => {
    try {
        const data = await Province.find()
        res.status(200).send(data)
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
}