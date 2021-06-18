const config = require("../config/auth.config");
const sanitize = require('mongo-sanitize');
const db = require("../models");
const User = db.user;
const User_detail = db.user_detail;
const Company_detail = db.company_detail;
const Company = db.company;
const Job = db.job;
const Log = db.log;
const Role = db.role;
const Notification = db.notification;

exports.jobOverview = (req, res) => {
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

exports.getAllJob = (req, res) => {
    let options = {
        populate: [{path: 'company', populate: { path: 'company_detail' }}, {path: 'driver', select: 'user_detail', populate: { path: 'user_detail' } }],
        page:req.query.page,
        limit:req.query.limit,
        sort:{ [req.query.sort_by]: [req.query.order] },
    };
    Job.paginate({'status': req.query.status}, options, function (err, result) {
        if (err) {
            return res.status(500).send({message: err});
        }
        res.status(200).send(result)
    });
};

// 2 > 3 notify every ff in company
exports.jobPickUp = (req, res) => {
    Job.findOne({_id : sanitize(req.params.job_id), status : 2})
        .populate("driver", '-password')
        .exec((err, job_callback) => {
            if (job_callback === null) {
                res.status(404).send({message: "no job found."});
                return;
            }
            if (err) {
                return res.status(500).send({message: err});
            }
            job_callback.dockNumber = req.body.dockNumber;
            job_callback.pickupTimeHours = req.body.pickupTimeHours;
            job_callback.pickupTimeMinutes = req.body.pickupTimeMinutes;
            job_callback.status = 3;
            job_callback.save((err) => {
                if (err) {
                    return res.status(500).send({message: err});
                }
                const log = new Log({
                    action: "Select pick up time"
                });
                log.user.push(req.userId);
                log.job.push(job_callback._id);
                log.save(err => {
                    if (err) {
                        return res.status(500).send({message: err});
                    }
                    Role.findOne({ name: {$in: "freight-forwarder"}},(err, roles) => {
                            if (err) {
                                return res.status(500).send({message: err});
                            }
                            User.find({ 'tax_id' : job_callback.company[0], 'role' : roles._id }).exec((err,ff_users) => {
                                if (err) {
                                    return res.status(500).send({message: err});
                                }
                                ff_users.forEach(function(ff_user,index){
                                    const notification = new Notification({
                                        detail: "TG-Admin set pickup time for job"
                                    });
                                    notification.user.push(ff_user._id);
                                    notification.job.push(req.params.job_id);
                                    notification.save(err => {
                                        if (err) {
                                            return res.status(500).send({message: err});
                                        }
                                        ff_user.notification += 1;
                                        ff_user.save((err)=>{
                                            if (err) {
                                                return res.status(500).send({message: err});
                                            }
                                        })
                                    });
                                });
                                res.status(200).send({message: "Pick Up Successful"})
                            })
                        }
                    );
                });
            })
        });
}


exports.jobTgadminDetail = (req,res ) => {
    Job.findById(sanitize(req.params.job_id)).populate("driver", '-password').exec((err, job_callback) => {
        if (err) {
            return res.status(500).send({message: err});
        }

        res.status(200).send(job_callback)
    });
}
//1 > 2 
exports.confirmPayment = (req, res) => {
    Job.findOne({_id: sanitize(req.params.job_id), status: 1}).exec((err, job_callback) => {
        if (err) {
            return res.status(500).send({message: err});
        }
        if (job_callback === null) {
            res.status(404).send({message: "no job found."});
            return;
        }
        job_callback.status = 2;
        job_callback.save(err => {
            if (err) {
                return res.status(500).send({message: err});
            }
            const log = new Log({
                action: "Confirm payment"
            });
            log.user.push(req.userId);
            log.job.push(job_callback._id);
            log.save(err => {
                if (err) {
                    return res.status(500).send({message: err});
                }
            });
            res.status(200).send({message: "Payment Successful"})
        })
    });
}