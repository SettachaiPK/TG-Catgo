const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const User_detail = db.user_detail;
const Company_detail = db.company_detail;
const Company = db.company;
const Role = db.role;
const Profile_image = db.profile_image;

var bcrypt = require("bcryptjs");

exports.userDetail = (req, res) => {
    User.findById(req.userId)
        .populate('role').populate('user_detail').populate('avatar')
        .exec((err, user) => {
            if (err) {
                return res.status(500).send({message: err});
            }
            res.status(200).send({
                prefix: user.user_detail[0].prefix,
                firstname: user.user_detail[0].firstname,
                lastname: user.user_detail[0].lastname,
                phone: user.user_detail[0].phone,
                avatar: user.avatar[0].value,
            });
        });
}

exports.editPersonalInfo = (req, res) => {
    let image_data = {};
    if(req.files) {
        image_data = req.files.avatar;
        if(!image_data.name.match(/\.(jpg|jpeg|png)$/i)) {
            res.status(415).send({message: "wrong file type"});
            return;
        }
        if(image_data.truncated){
            res.status(413).send({message: "file too large"});
            return;
        }
    }
    User.findById(req.userId).populate('role').populate('user_detail').populate('avatar')
        .exec((err, user) => {
            if (err) {
                return res.status(500).send({message: err});
            }
            if(req.files) {
                Profile_image.find({name: "default"}, ((err, docs) => {
                    if (err) {
                        return res.status(500).send({message: err});
                    }
                    // user doesn't have profile image
                    if (user.avatar[0]._id.equals(docs[0]._id)) {
                        new Profile_image({
                            name: user._id,
                            value: image_data.data.toString('base64')
                        }).save((err, result) => {
                            if (err) {
                                return res.status(500).send({message: err});
                            }
                            user.updateOne({'avatar': result}, [],
                                function (err) {
                                    if (err) {
                                        return res.status(500).send({message: err});
                                    }
                                });
                        });
                    }
                    // user has profile image
                    else {
                        user.avatar[0].updateOne({value: image_data.data.toString('base64')},
                            [],
                            function (err) {
                                if (err) {
                                    return res.status(500).send({message: err});
                                }
                            })
                    }
                }));
            }
            user.user_detail[0].updateOne( { prefix: req.body.prefix,
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    phone: req.body.phone },
                [],
                function (err){
                    if (err) {
                        return res.status(500).send({message: err});
                    }
                    res.status(200).send({message: "updated"})
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
            if (err) {
                return res.status(500).send({message: err});
            }
            res.status(200).send({
                'name' : user.tax_id[0].company_name,
                'address' : user.tax_id[0].company_detail[0].address,
                'province' : user.tax_id[0].company_detail[0].company_province,
                'zipcode' : user.tax_id[0].company_detail[0].company_postal,
                'taxId' : user.tax_id[0].tax_id
            })
        });
};



exports.updateOneCompanyDetail = (req, res) => {

    User.findById(req.userId)
        .populate({
            path: 'tax_id',
            populate: {path: 'company_detail'}
        })
        .exec((err, user) => {
            if (err) {
                return res.status(500).send({message: err});
            }
            Company.findById(user.tax_id[0]._id).exec((err, company) => {
                if (err) {
                    return res.status(500).send({message: err});
                }
                company.updateOne({company_name: req.body.companyName}, [],
                    function (err) {
                        if (err) {
                            return res.status(500).send({message: err});
                        }
                        Company_detail.findById(company.company_detail[0]._id)
                            .exec((err, company_detail) => {
                                if (err) {
                                    return res.status(500).send({message: err});
                                }
                                company_detail.updateOne({
                                    company_name: req.body.companyName,
                                    address: req.body.address,
                                    company_province: req.body.province,
                                    company_postal: req.body.postal
                                },
                                [],
                                function (err) {
                                    if (err) {
                                        return res.status(500).send({message: err});
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
            if (err) {
                return res.status(500).send({message: err});
            }
            bcrypt.compare(req.body.oldpassword, user_callback.password, function(err, result) {
                if (err){
                    res.status(500).send({message: err});
                }
                else {
                    if (result === true) {
                        user_callback.updateOne({password: bcrypt.hashSync(req.body.newpassword, 8)},
                            [],
                            function (err, doc) {
                                if (err) {
                                    return res.status(500).send({message: err});
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