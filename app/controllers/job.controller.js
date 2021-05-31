const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const User_detail = db.user_detail;
const Company_detail = db.company_detail;
const Company = db.company;
const Job = db.job;

exports.overviewAllJob = (req, res) => {
    User.findById(req.userId)
        .populate('tax_id')
        .exec((err, user) => {

            Job.find({ 'company': user.tax_id[0]._id}).exec((err,callback) => {
                console.log(callback);
                res.status(200).send(callback)
            });
        });
}

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
    job.save((err, user) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }
        User.findById(req.userId).populate('tax_id').exec((err, user) => {
            job.company = user.tax_id[0];
            console.log(job.company);
            job.save((err,user) => {
                if (err) {
                    res.status(500).send({message: err});
                    return;
                }
                res.status(200).send({message: "Job was created successfully!"})
            });
        });
    });
};



exports.selectDriver = (req,res ) => {
    Job.findById(req.params.job_id).populate("driver", '-password').exec((err, job_callback) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }
        if (job_callback.driver.length > 0){
            job_callback.driver.pop()
        }
        console.log(job_callback.driver.length);
        job_callback.driver.push(req.body.driver)
        job_callback.save((err, job) => {
            if (err) {
            res.status(500).send({message: err});
            return;
            }
            res.status(200).send(job_callback)
        })
    });
}

exports.jobDetail = (req,res ) => {
    Job.findById(req.params.job_id).populate("driver", '-password').exec((err, job_callback) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }
        console.log(job_callback);

        res.status(200).send(job_callback)
    });
}