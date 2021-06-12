const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const User_detail = db.user_detail;
const Company_detail = db.company_detail;
const Company = db.company;
const Job = db.job;
const Comment = db.comment;

exports.createCommentDriver = (req,res) => {
    Job.findById(req.params.job_id).exec((err, job_callback) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }
        let new_status = job_callback.status + 1;
        job_callback.updateOne( {status: new_status}, [], function (err, doc) {
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