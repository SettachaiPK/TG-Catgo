const db = require("../models");
const sanitize = require('mongo-sanitize');
const User = db.user;
const User_detail = db.user_detail
const Company = db.company;
const Job = db.job;
const Company_detail = db.company_detail;
const Profile_image = db.profile_image;
const Role = db.role;

var bcrypt = require("bcryptjs");
const { company } = require("../models");

exports.allCompaniesOverviewJobStatusCount = (req, res) => {
    Job.aggregate([{ $match: { $and: [{'status': 0}] } } ,{
        $group : {
            _id : null,
            total : {
                $sum : 1
            }
        }
    }]).exec((err, job_status0) => {
        if (err) {
            return res.status(500).send({message: err});
        }
        Job.aggregate([{ $match: { $and: [{'status': 1}] } } ,{
            $group : {
                _id : null,
                total : {
                    $sum : 1
                }
            }
        }]).exec((err, job_status1) => {
            if (err) {
                return res.status(500).send({message: err});
            }
            // status 2
            Job.aggregate([{ $match: { $and: [{'status': 2}] } } ,{
                $group : {
                    _id : null,
                    total : {
                        $sum : 1
                    }
                }
            }]).exec((err, job_status2) => {
                if (err) {
                    return res.status(500).send({message: err});
                }
                //status 3
                Job.aggregate([{ $match: { $and: [{'status': 3}] } } ,{
                    $group : {
                        _id : null,
                        total : {
                            $sum : 1
                        }
                    }
                }]).exec((err, job_status3) => {
                    if (err) {
                        return res.status(500).send({message: err});
                    }
                    //status 4
                    Job.aggregate([{ $match: { $and: [{'status': 4}] } } ,{
                        $group : {
                            _id : null,
                            total : {
                                $sum : 1
                            }
                        }
                    }]).exec((err, job_status4) => {
                        if (err) {
                            return res.status(500).send({message: err});
                        }
                        //status 5
                        Job.aggregate([{ $match: { $and: [{'status': 5}] } } ,{
                            $group : {
                                _id : null,
                                total : {
                                    $sum : 1
                                }
                            }
                        }]).exec((err, job_status5) => {
                            if (err) {
                                return res.status(500).send({message: err});
                            }

                            Company.aggregate([{
                                $group : {
                                    _id : null,
                                    total : {
                                        $sum : 1
                                    }
                                }
                            }]).exec((err, company_count) => {
                                if (err) {
                                    return res.status(500).send({message: err});
                                }
                                Role.findOne({'name':"freight-forwarder"}).exec((err,roles) => {
                                    if (err) {
                                        return res.status(500).send({message: err});
                                    }
                                    User.aggregate([{ $match: { $and: [{'role': roles._id}] } } ,{
                                        $group : {
                                            _id : null,
                                            total : {
                                                $sum : 1
                                            }
                                        }
                                    }]).exec((err, ff_count) => {
                                        if (err) {
                                            return res.status(500).send({message: err});
                                        }

                                        Role.findOne({'name':"driver"}).exec((err,roles) => {
                                            if (err) {
                                                return res.status(500).send({message: err});
                                            }
                                            User.aggregate([{ $match: { $and: [{'role': roles._id}] } } ,{
                                                $group : {
                                                    _id : null,
                                                    total : {
                                                        $sum : 1
                                                    }
                                                }
                                            }]).exec((err, driver_count) => {
                                                if (err) {
                                                    return res.status(500).send({message: err});
                                                }
                                                let result = {}
                                                if (ff_count.length === 0) { result.ff_count === 0 } else { result.ff_count = ff_count[0].total }
                                                if (job_status0.length === 0) { result.status0 = 0 } else { result.status0 = job_status0[0].total }
                                                if (job_status1.length === 0) { result.status1 = 0 } else { result.status1 = job_status1[0].total }
                                                if (job_status2.length === 0) { result.status2 = 0 } else { result.status2 = job_status2[0].total }
                                                if (job_status3.length === 0) { result.status3 = 0 } else { result.status3 = job_status3[0].total }
                                                if (job_status4.length === 0) { result.status4 = 0 } else { result.status4 = job_status4[0].total }
                                                if (job_status5.length === 0) { result.status5 = 0 } else { result.status5 = job_status5[0].total }
                                                if (driver_count.length === 0) { result.driver_count === 0 } else { result.driver_count = driver_count[0].total }
                                                if (company_count.length === 0) { result.company_count === 0 } else { result.company_count = company_count[0].total }
                                                res.status(200).send(result)
                                            });
                                        })
                                    });
                                })
                            });
                        });
                    });
                });
            });
        });
    });

};

exports.getAllCompany =  (req, res) => {
    let options = {
        page:req.query.page,
        limit:req.query.limit,
        sort:{ [req.query.sort_by]: [req.query.order] },
    };
    Company.paginate({}, options, function (err, result) {
        if (err) {
            return res.status(500).send({message: err});
        }
        res.status(200).send(result)
    });
};

exports.getCompanyDetail = (req, res) => {
    Company.findById(sanitize(req.params.company_id)).populate({path: 'company_detail'})
        .exec((err, company_detail) => {
            if (err) {
                return res.status(500).send({message: err});
            }
            User.find({"tax_id": company_detail._id})
            .exec((err, user_detail) => {
                if (err) {
                    return res.status(500).send({message: err});
                }
                res.status(200).send({user_detail, company_detail});
        })
    });
}

exports.updateOneCompanyDetail = (req, res) => {
    Company_detail.findById(sanitize(req.params.company_detail_id)).populate({path: 'tax_id'})
        .exec((err, detail) => {
            if (err) {
                return res.status(500).send({message: err});
            }
            detail.tax_id[0].updateOne( { company_name: req.body.companyName },
            [],
            function (err){
                if (err) {
                    return res.status(500).send({message: err});
                }
                detail.updateOne( { company_name: req.body.companyName,
                        address: req.body.address,
                        company_province: req.body.province,
                        company_postal: req.body.postal },
                    [],
                    function (err){
                        if (err) {
                            return res.status(500).send({message: err});
                        }

                        res.status(200).send({status: "updated"})
                    });
            });
    });
};

exports.deleteOneUser = (req,res) => {
    Job.find({ driver: sanitize(req.body.user_id)})
        .exec((err, result) => {
            if (err) {
                return res.status(500).send({message: err});
            }
            if (result.length > 0) {
            res.status(418).send({message: "Can't delete. This driver has a job that doesn't complete"});
            return;
            }
            User.findOne({_id: sanitize(req.body.user_id) }).populate("role")
                .exec((err, user_detail) => {
                    if (err) {
                        return res.status(500).send({message: err});
                    }
                    if (user_detail.role[0].name === 'driver'){
                        Company.findById(sanitize(req.params.company_id))
                            .exec((err, company_callback) => {
                                if (err) {
                                    return res.status(500).send({message: err});
                                }
                                company_callback.driver_count -= 1;
                                company_callback.save(err => {
                                    if (err) {
                                        res.status(500).send({message: err});
                                    }
                                })
                            });
                    }
                });
            User_detail.deleteOne({ username: req.body.user_id }).
            exec(err => {
                if (err) {
                    return res.status(500).send({message: err});
                }
                User.deleteOne({ _id: req.body.user_id })
                    .exec(err => {
                        if (err) {
                            return res.status(500).send({message: err});
                        }
                        res.status(200).send({status:"Successful deletion"});
                    });
            });
    });
}

exports.viewEditUserInfo = (req, res) => {
    User.findById(sanitize(req.params.user_id)).populate("user_detail")
        .exec((err, callback) => {
            if (err) {
                return res.status(500).send({message: err});
            }
            res.status(200).send(callback)
    });
}

exports.adminEditUserInfo = (req, res) => {
    let updateBlock = {};
    updateBlock['username'] = req.body.username;
    updateBlock['email'] = req.body.email;
    updateBlock['password'] = bcrypt.hashSync(req.body.password, 8);
    updateBlock['status'] = req.body.status;
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
    let req_detail = JSON.parse(req.body.detail);
    User.findById(sanitize(req.params.user_id)).populate('role').populate('user_detail').populate('avatar')
        .exec((err, user) => {
            if (err) {
                return res.status(500).send({message: err});
            }
            if (req.files) {
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
            user.updateOne( { "$set": updateBlock }, [], function (err){
                    if (err) {
                        return res.status(500).send({message: err});
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
                        function (err){
                            if (err) {
                                return res.status(500).send({message: err});
                            }
                            res.status(200).send({message: "updated"})
                        });
                });
        });
}
