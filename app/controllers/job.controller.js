const config = require("../config/auth.config");
const sanitize = require('mongo-sanitize');
const db = require("../models");
const User = db.user;
const User_detail = db.user_detail;
const Company_detail = db.company_detail;
const Company = db.company;
const Job = db.job;
const Log = db.log
const Comment = db.comment;
const Notification = db.notification;

// aggregate.count("userCount");

exports.overviewJobStatusCount = (req, res) => {
    User.findById(req.userId)
        .populate('tax_id')
        .exec((err, user) => {
            if (err) {
                return res.status(500).send({message: err});
            }
            // status 0
            Job.aggregate([{ $match: { $and: [ {'company': user.tax_id[0]._id}, {'status': 0}] } } ,{
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
                // status 1
                Job.aggregate([{ $match: { $and: [ {'company': user.tax_id[0]._id}, {'status': 1}] } } ,{
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
                    //status 2
                    Job.aggregate([{ $match: { $and: [ {'company': user.tax_id[0]._id}, {'status': 2}] } } ,{
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
                        Job.aggregate([{ $match: { $and: [ {'company': user.tax_id[0]._id}, {'status': 3}] } } ,{
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
                            Job.aggregate([{ $match: { $and: [ {'company': user.tax_id[0]._id}, {'status': 4}] } } ,{
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
                                Job.aggregate([{ $match: { $and: [ {'company': user.tax_id[0]._id}, {'status': 5}] } } ,{
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
                                    let result = {}
                                    if (job_status0.length === 0) { result.status0 = 0 } else { result.status0 = job_status0[0].total }
                                    if (job_status1.length === 0) { result.status1 = 0 } else { result.status1 = job_status1[0].total }
                                    if (job_status2.length === 0) { result.status2 = 0 } else { result.status2 = job_status2[0].total }
                                    if (job_status3.length === 0) { result.status3 = 0 } else { result.status3 = job_status3[0].total }
                                    if (job_status4.length === 0) { result.status4 = 0 } else { result.status4 = job_status4[0].total }
                                    if (job_status5.length === 0) { result.status5 = 0 } else { result.status5 = job_status5[0].total }
                                    res.status(200).send(result)
                                });
                            });
                        });
                    });
                });
            });
        });
};

exports.overviewAllJob = (req, res) => {
    let options = {
        populate: [{path: 'company', populate: { path: 'company_detail' }}, {path: 'driver', select: 'user_detail', populate: { path: 'user_detail' } }],
        page:req.query.page,
        limit:req.query.limit,
        sort:{ [req.query.sort_by]: [req.query.order] },
    };
    User.findById(req.userId)
        .populate('tax_id')
        .exec((err, user) => {
            Job.paginate({'company': user.tax_id[0]._id, 'status': req.query.status, [req.query.sort_by]: { "$regex": req.query.search, "$options": "i" } }, options, function (err, result) {
                if (err) {
                    return res.status(500).send({message: err});
                }
                res.status(200).send(result)
            });
        });
}
//0 
exports.createJob = (req, res) => {
    const job = new Job({
        status: 0,
        awbNumber: req.body.awbNumber,
        hwbSerialNumber: req.body.hwbSerialNumber,
        flightNumber: req.body.flightNumber,
        jobNumber: req.body.jobNumber,
        customsEntryNumber: req.body.customsEntryNumber,
        customsEntryNumberDate: req.body.customsEntryNumberDate,
    });
    job.save(err => {
        if (err) {
            return res.status(500).send({message: err});
        }
        User.findById(req.userId).populate('tax_id').exec((err, user) => {
            if (err) {
                return res.status(500).send({message: err});
            }
            job.company = user.tax_id[0];
            job.save((err) => {
                if (err) {
                    return res.status(500).send({message: err});
                }
                const log = new Log({
                    action: "Create job"
                });
                log.user.push(req.userId);
                log.job.push(job._id);
                log.save(err => {
                    if (err) {
                        return res.status(500).send({message: err});
                    }
                });
                res.status(200).send({message: "Job was created successfully!"})
            });
        });
    });
};

// 3 > 4 notify assigned driver
exports.selectDriver = (req, res) => {

    Job.findOne({_id: sanitize(req.params.job_id), status: 3})
        .populate("driver", '-password')
        .exec((err, job_callback) => {
            if (job_callback === null) {
                res.status(404).send({message: "no job found."});
                return;
            }
            if (err) {
                return res.status(500).send({message: err});
            }
            if (job_callback.driver.length > 0) {
                job_callback.driver.pop()
            }
            job_callback.confPickupTimeHours = req.body.confPickupTimeHours;
            job_callback.confPickupTimeMinutes = req.body.confPickupTimeMinutes;
            job_callback.truckNumber = req.body.truckNumber;
            job_callback.driver.push(req.body.driver);
            job_callback.driverAssigner.push(req.userId);
            job_callback.status = 4;
            job_callback.save((err) => {
                if (err) {
                    return res.status(500).send({message: err});
                }
                const log = new Log({
                    action: "Select driver"
                });
                log.user.push(req.userId);
                log.job.push(job_callback._id);
                log.save(err => {
                    if (err) {
                        return res.status(500).send({message: err});
                    }
                    User.findById(sanitize(req.body.driver)).exec((err,userDriver)=>{
                        if (err) {
                            return res.status(500).send({message: err});
                        }
                        const notification = new Notification({
                            detail: "You has been assigned to job"
                        });
                        notification.user.push(userDriver._id);
                        notification.job.push(req.params.job_id);
                        notification.save(err => {
                            if (err) {
                                return res.status(500).send({message: err});
                            }
                            userDriver.notification += 1;
                            userDriver.save((err)=>{
                                if (err) {
                                    res.status(500).send({message: err});
                                }
                                res.status(200).send({message: "Driver selected"})
                            })
                        });
                    });
                });
            });
        });
}

exports.jobDetail = (req, res) => {
    Job.findById(sanitize(req.params.job_id)).populate("driver", '-password').exec((err, job_callback) => {
        if (err) {
            return res.status(500).send({message: err});
        }

        res.status(200).send(job_callback)
    });
}

exports.callCommentDriver = (req,res) => {
    User.findById(sanitize(req.params.driver_id)).exec((err, driver_callback) => {
        if (err) {
            return res.status(500).send({message: err});
        }
        Comment.aggregate([{
            $match : {'driver': driver_callback._id},
        },{
            $group : {
                _id : null,
                total : {
                    $avg : "$rating"
                }
            }
        }]).exec((err, job_callback) => {
            if (err) {
                return res.status(500).send({message: err});
            }
            res.status(200).send(job_callback)
        });
    });
}

// 0 > 1
exports.jobMatching = (req, res) => {
    Job.findOne({_id: sanitize(req.params.job_id), status: 0}).exec((err, job_callback) => {
        if (err) {
            return res.status(500).send({message: err});
        }
        if (job_callback === null) {
            res.status(404).send({message: "no job found."});
            return;
        }
        job_callback.flightDate = req.body.flightDate;
        job_callback.numberOfPieces = req.body.numberOfPieces;
        job_callback.status = 1;
        job_callback.save((err) => {
            if (err) {
                return res.status(500).send({message: err});
            }
            res.status(200).send({message: "Pick Up Successful"})
        })
    });
}