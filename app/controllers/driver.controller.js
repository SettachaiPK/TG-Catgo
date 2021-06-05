const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const User_detail = db.user_detail;
const Company_detail = db.company_detail;
const Company = db.company;
const Role = db.role;
const Job = db.job;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.overviewAllDriver = (req, res) => {
    User.findById(req.userId)
        .populate('tax_id')
        .exec((err, user) => {
            Role.findOne({'name': 'driver'}).exec((err, driver) => {
                User.find({'tax_id': user.tax_id[0]._id, 'role': driver._id},'-password')
                    .populate("user_detail")
                    .exec((err, callback) => {
                    res.status(200).send(callback)
                });
            })
        });
}

exports.driverDetail = (req, res) => {
    User.findById(req.userId)
        .populate('tax_id')
        .exec((err, user) => {
            Role.findOne({'name': 'driver'}).exec((err, driver) => {
                User.findOne({'_id': req.params.driver_id, 'tax_id': user.tax_id[0]._id, 'role': driver._id},'-password')
                    .populate("user_detail")
                    .exec((err, callback) => {
                        res.status(200).send(callback)
                    });
            })
        });
}

exports.editDriverInfo = (req, res) => {

    let req_detail = JSON.parse(req.body.detail);
    User.findById(req.params.driver_id).populate('role').populate('user_detail')
        .exec((err, user) => {
            user.updateOne( { password: bcrypt.hashSync(req.body.password, 8), avatar: req.body.avatar , status: req.body.status , },
                [],
                function (err, doc){
                    if (err) {
                        res.status(500).send({message: err});
                        return;
                    }
                    user.user_detail[0].updateOne( { prefix: req_detail.prefix,
                            firstname: req_detail.firstname,
                            lastname: req_detail.lastname,
                            phone: req_detail.phone ,
                        address: req_detail.address,
                        province: req_detail.province,
                        zipcode: req_detail.zipcode,
                        },
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

exports.createDriver = (req, res) => {
    let req_detail = JSON.parse(req.body.detail);
    User.findById(req.userId)
        .populate('tax_id')
        .exec((err, userFF) => {
            userFF.tax_id[0].driver_count += 1;
            userFF.tax_id[0].save((err, job) => {
                if (err) {
                    res.status(500).send({message: err});
                }
            });
            const user = new User({
                username: req.body.username,
                password: bcrypt.hashSync(req.body.password, 8),
                email: req.body.email,
                status: true,
                avatar: "/assets/img/misc/profile.jpg",
            });

            const user_detail = new User_detail({ prefix: req_detail.prefix,
                firstname: req_detail.firstname,
                lastname: req_detail.lastname,
                phone: req_detail.phone ,
                address: req_detail.address,
                province: req_detail.province,
                zipcode: req_detail.zipcode,
            });
            user.save((err, user) => {
                if (err) {
                    res.status(500).send({message: err});
                    return;
                }
                user.tax_id.push(userFF.tax_id[0]._id)
                Role.find(

                {'name': 'driver'}
                    ,
                    (err, roles) => {
                        if (err) {
                            res.status(500).send({message: err});
                            return;
                        }
                        user.role = roles.map(role => role._id);
                        user.save(err => {
                            if (err) {
                                res.status(500).send({message: err});
                            }
                        });
                    }
                );
                user_detail.save(err => {
                    if (err) {
                        res.status(500).send({message: err});
                    }
                    User.find(
                        {
                            username: {$in: req.body.username}
                        },
                        (err, username_callback) => {
                            if (err) {
                                res.status(500).send({message: err});
                                return;
                            }
                            user_detail.username = username_callback.map(username => username._id);
                            user_detail.save(err => {
                                if (err) {
                                    res.status(500).send({message: err});
                                    return;
                                }
                                user.user_detail.push(user_detail._id);
                                user.save(err => {
                                    if (err) {
                                        res.status(500).send({message: err});
                                        return;
                                    }
                                    res.send({id: user._id});
                                });
                            });
                        },
                    );
                });
            });

        });
};

exports.driverJobOverview = (req,res) => {
    Job.find({'driver': req.userId}).exec((err, jobForDriver) => {
        res.status(200).send(jobForDriver)
    })
}


exports.jobDriverDetail = (req,res ) => {
    Job.findById(req.params.job_id).populate("driver", '-password').exec((err, job_callback) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }
        res.status(200).send(job_callback)
    });
}
