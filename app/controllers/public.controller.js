const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const User_detail = db.user_detail;
const Company_detail = db.company_detail;
const Company = db.company;
const Job = db.job;
const Comment = db.comment;
const Notification = db.notification;
exports.createCommentDriver = (req,res) => {
    Job.findById(req.params.job_id).exec((err, job_callback) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }
        job_callback.status = 6;
        job_callback.save(err => {
            if (err) {
                res.status(500).send({message: err});
                return;
            }
            const comment = new Comment({
                comment : req.body.comment,
                rating : req.body.rating,
            });
            comment.driver.push(req.body.driver_id);
            comment.job.push(req.params.job_id);
            comment.save(err => {
                if (err) {
                    res.status(500).send({message: err});
                    return;
                }
                // save avg rating to driver model
                User.findById(req.body.driver_id).populate("user_detail").exec((err, driver_callback) => {
                    if (err) {
                        res.status(500).send({message: err});
                        return;
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
                    }]).exec((err, avg_rating_callback) => {
                        if (err) {
                            res.status(500).send({message: err});
                            return;
                        }
                        driver_callback.user_detail[0].avg_rating = avg_rating_callback[0].total
                        driver_callback.save((err) => {
                            if (err) {
                                res.status(500).send({message: err});
                                return;
                            }
                            res.status(200).send({message: "Commented"});
                        })
                    });
                });
            });
        });
    });
}

// 4 > 5 notify driver assigner and driver
exports.receivedPackage = (req, res) => {
    Job.findById({_id: req.params.job_id, status: 4}).exec((err, job_callback) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }
        job_callback.status = 5;
        job_callback.save((err) => {
            if (err) {
                res.status(500).send({message: err});
                return;
            }
            User.findById(job_callback.driverAssigner[0]).exec((err, userAssigner) => {
                const notification = new Notification({
                    detail: "Job completed"
                });
                notification.user.push(userAssigner._id);
                notification.job.push(req.params.job_id);
                notification.save(err => {
                    if (err) {
                        res.status(500).send({message: err});
                        return;
                    }
                    userAssigner.notification += 1;
                    userAssigner.save((err) => {
                        if (err) {
                            res.status(500).send({message: err});
                        }
                        User.findById(job_callback.driver[0]).exec((err, userDriver) => {
                            const notification = new Notification({
                                detail: "Job completed"
                            });
                            notification.user.push(userDriver._id);
                            notification.job.push(req.params.job_id);
                            notification.save(err => {
                                if (err) {
                                    res.status(500).send({message: err});
                                    return;
                                }
                                userDriver.notification += 1;
                                userDriver.save((err) => {
                                    if (err) {
                                        res.status(500).send({message: err});
                                    }
                                    res.status(200).send({message: "Package received"})
                                })
                            })
                        })
                    })
                })
            })
            
        })
    });
}