const db = require("../models");
const Company = db.company;

exports.allCompany = (req, res) => {
    Company.find()
        .exec((err, company) => {
            if (err) {
                res.status(500).send({ message: err });
            return;
            }
            if (!company) {
                return res.status(404).send({ message: "Company Not found." });
            }
            else {return res.status(200).send({
                id: company._id,
                name: company.name
            })};
        });
};

exports.all = (req, res) => {
    res.status(200).send("Public Content.");
  };
  