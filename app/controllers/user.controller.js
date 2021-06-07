const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const User_detail = db.user_detail;
const Company_detail = db.company_detail;
const Company = db.company;
const Role = db.role;

var bcrypt = require("bcryptjs");

exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
};

exports.userDetail = (req, res) => {
    User.findById(req.userId)
        .populate('role').populate('user_detail')
        .exec((err, user) => {
            res.status(200).send({
                prefix: user.user_detail[0].prefix,
                firstname: user.user_detail[0].firstname,
                lastname: user.user_detail[0].lastname,
                phone: user.user_detail[0].phone,
                avatar: user.avatar
            });
        });
}

exports.editPersonalInfo = (req, res) => {
    User.findById(req.userId).populate('role').populate('user_detail')
        .exec((err, user) => {
            user.updateOne( { avatar: req.body.avatar },
                [],
                function (err, doc){
                    if (err) {
                        res.status(500).send({message: err});
                        return;
                    }
                    user.user_detail[0].updateOne( { prefix: req.body.prefix,
                            firstname: req.body.firstname,
                            lastname: req.body.lastname,
                            phone: req.body.phone },
                        [],
                        function (err, doc){
                            if (err) {
                                res.status(500).send({message: err});
                                return;
                            }
                            res.status(200).send({message: "updated"})
                        });
                });
        });
}

exports.getUserCompanyDetail = (req, res) => {
    User.findById(req.userId)
        .populate({
            path: 'tax_id',
            populate: { path: 'company_detail' }
        })
        .exec((err, user) => {
            res.status(200).send({
                'name' : user.tax_id[0].company_name,
                'address' : user.tax_id[0].company_detail[0].address,
                'province' : user.tax_id[0].company_detail[0].company_province,
                'zipcode' : user.tax_id[0].company_detail[0].company_postal,
                'taxId' : user.tax_id[0].tax_id
            })
            // res.status(200).send(user.tax_id[0]);   ของเก่า

        });
};



exports.updateOneCompanyDetail = (req, res) => {

    User.findById(req.userId)
        .populate({
            path: 'tax_id',
            populate: {path: 'company_detail'}
        })
        .exec((err, user) => {
            console.log(user.tax_id[0]._id);
            Company.findById(user.tax_id[0]._id).exec((err, company) => {
                company.updateOne({company_name: req.body.companyName}, [],
                    function (err, doc) {
                        if (err) {
                            res.status(500).send({message: err});
                            return;
                        }
                        Company_detail.findById(company.company_detail[0]._id)
                            .exec((err, company_detail) => {
                            company_detail.updateOne({
                                    company_name: req.body.companyName,
                                    address: req.body.address,
                                    company_province: req.body.province,
                                    company_postal: req.body.postal
                                },
                                [],
                                function (err, doc) {
                                    if (err) {
                                        res.status(500).send({message: err});
                                        return;
                                    }
                                    res.status(200).send({status: "updated"})
                                });
                        });
                    })
            });
        });
}
exports.changePwd = (req, res) => {

        User.findById(req.userId).exec((err, user_callback) => {
            bcrypt.compare(req.body.oldpassword, user_callback.password, function(err, result) {
                if (err){
                    console.log(err);
                }
                else {
                    if (result === true) {
                        user_callback.updateOne({password: bcrypt.hashSync(req.body.newpassword, 8)},
                            [],
                            function (err, doc) {
                                if (err) {
                                    res.status(500).send({message: err});
                                    return;
                                }
                                res.status(200).send({status: "updated"});
                            });
                    }
                    else if (result === false) {
                        res.status(401).send({status: "Your old password are not correct"});
                    }
                }
            });
        });
};