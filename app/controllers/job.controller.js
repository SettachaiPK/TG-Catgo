const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const User_detail = db.user_detail;
const Company_detail = db.company_detail;
const Company = db.company;
const Job = db.job;

exports.overviewAllJob = (req, res) => {
    let options = {
        populate: [{path: 'company', populate: { path: 'company_detail' }}, 'driver'],
        page:req.query.page,
        limit:req.query.limit,
    };
    User.findById(req.userId)
        .populate('tax_id')
        .exec((err, user) => {
            Job.paginate({'company': user.tax_id[0]._id}, options, function (err, result) {
                if (err) {
                    res.status(500).send({message: err});
                    return;
                }
                res.status(200).send(result)
            });
        });
}

exports.createJob = (req, res) => {
    const job = new Job({
        status: 1, // Simulated TG API Matched job
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
            job.save((err, user) => {
                if (err) {
                    res.status(500).send({message: err});
                    return;
                }
                res.status(200).send({message: "Job was created successfully!"})
            });
        });
    });
};


exports.selectDriver = (req, res) => {

    Job.findOne({'_id': req.params.job_id, 'status': 2})
        .populate("driver", '-password')
        .exec((err, job_callback) => {
            if (job_callback === null) {
                res.status(404).send({message: "no job found."});
                return;
            }
            if (err) {
                res.status(500).send({message: err});
                return;
            }
            if (job_callback.driver.length > 0) {
                job_callback.driver.pop()
            }
            job_callback.driver.push(req.body.driver);
            job_callback.driverAssigner.push(req.userId);
            job_callback.status = 3;
            job_callback.save((err, job) => {
                if (err) {
                    res.status(500).send({message: err});
                    return;
                }

                res.status(200).send({message: "Driver selected"})
            })
        });
}

exports.jobDetail = (req, res) => {
    Job.findById({_id: req.params.job_id}).populate("driver", '-password').exec((err, job_callback) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }

        res.status(200).send(job_callback)
    });
}