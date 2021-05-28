const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const User_detail = db.user_detail;
const Company_detail = db.company_detail;
const Company = db.company;
const Role = db.role;

exports.getUserCompanyDetail = (req, res) => {
    User.findById(req.userId)
        .populate({
            path: 'tax_id',
            populate: { path: 'company_detail' }
        })
        .exec((err, user) => {
            res.status(200).send(user.tax_id[0]);

        });
};


exports.getAllCompany = (req, res) => {
    Company.find().exec((err, Allcompany) => {
        res.status(200).send(Allcompany);
    });
};

exports.getCompanyDetail = (req, res) => {
    Company.findById(req.body.companyId).populate({
        path: 'company_detail'
    }).exec((err, detail) => {
        console.log(company);
        res.status(200).send(company);
    });
};

exports.updateOneCompanyDetail = (req, res) => {

    Company_detail.findById(req.body.companyDetailId
    ).exec((err, detail) => {

        detail.updateOne( { company_name: req.body.companyName,
                address: req.body.address,
                company_province: req.body.province,
                company_postal: req.body.postal },
            [],
            function (err, doc){
                if (err) {
                    res.status(500).send({message: err});
                    return;
                }
                res.status(200).send({status: "updated"})
            });
    });
};

