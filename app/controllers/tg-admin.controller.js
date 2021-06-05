const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const User_detail = db.user_detail;
const Company_detail = db.company_detail;
const Company = db.company;
const Job = db.job;


exports.getAllJob = (req, res) => {
    Job.find().exec((err, AllJob) => {
        res.status(200).send(AllJob);
    });
};


exports.jobPickUp = (req, res) => {
    Job.findOne({"_id" : req.params.job_id, "status" : 1})
        .populate("driver", '-password')
        .exec((err, job_callback) => {
            if (err) {
                res.status(500).send({message: err});
                return;
            }
            job_callback.dockNumber = req.body.dockNumber;
            job_callback.pickupTimeHours  =  req.body.pickupTimeHours;
            job_callback.pickupTimeMinutes  =   req.body.pickupTimeMinutes;
            job_callback.status = 2;
            job_callback.save((err, job) => {
                if (err) {
                    res.status(500).send({message: err});
                    return;
                }

                res.status(200).send({message: "Pick Up Successful"})
            })
        });
}


exports.jobTgadminDetail = (req,res ) => {
    Job.findById({_id :req.params.job_id}).populate("driver", '-password').exec((err, job_callback) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }

        res.status(200).send(job_callback)
    });
}