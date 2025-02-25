const config = require("../config/auth.config");
const QRCode = require('qrcode')
const sanitize = require('mongo-sanitize');
const db = require("../models");
const User = db.user;
const User_detail = db.user_detail;
const Company_detail = db.company_detail;
const Company = db.company;
const Job = db.job;
const Log = db.log;
const Role = db.role;
const Comment = db.comment;
const Notification = db.notification;

exports.overviewJobStatusCount = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('tax_id')
        const job_status0 = await Job.aggregate([{ $match: { $and: [ {'company': user.tax_id[0]._id}, {'status': 0}] } } ,{$group : {_id : null, total : {$sum : 1}}}])
        const job_status1 = await Job.aggregate([{ $match: { $and: [ {'company': user.tax_id[0]._id}, {'status': 1}] } } ,{$group : {_id : null, total : {$sum : 1}}}])
        const job_status2 = await Job.aggregate([{ $match: { $and: [ {'company': user.tax_id[0]._id}, {'status': 2}] } } ,{$group : {_id : null, total : {$sum : 1}}}])
        const job_status3 = await Job.aggregate([{ $match: { $and: [ {'company': user.tax_id[0]._id}, {'status': 3}] } } ,{$group : {_id : null, total : {$sum : 1}}}])
        const job_status4 = await Job.aggregate([{ $match: { $and: [ {'company': user.tax_id[0]._id}, {'status': 4}] } } ,{$group : {_id : null, total : {$sum : 1}}}])
        const job_status5 = await Job.aggregate([{ $match: { $and: [ {'company': user.tax_id[0]._id}, {'status': 5}] } } ,{$group : {_id : null, total : {$sum : 1}}}])
        let result = {}
        if (job_status0.length === 0) { result.status0 = 0 } else { result.status0 = job_status0[0].total }
        if (job_status1.length === 0) { result.status1 = 0 } else { result.status1 = job_status1[0].total }
        if (job_status2.length === 0) { result.status2 = 0 } else { result.status2 = job_status2[0].total }
        if (job_status3.length === 0) { result.status3 = 0 } else { result.status3 = job_status3[0].total }
        if (job_status4.length === 0) { result.status4 = 0 } else { result.status4 = job_status4[0].total }
        if (job_status5.length === 0) { result.status5 = 0 } else { result.status5 = job_status5[0].total }
        res.status(200).send(result)
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
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
            if (err) {
                return res.status(500).send({message: err});
            }
            if (req.query.search) {
                function dateToEpoch(thedate) {
                    let time = thedate.getTime();
                    return time - (time % 86400000);
                }
                let date_input = dateToEpoch(new Date(req.query.search)) + 86400000 - 1
                let date_input_24hr = dateToEpoch(new Date(req.query.search)) + (86400000 * 2) - 1
                if (isNaN(date_input) || isNaN(date_input_24hr)) {
                    date_input = 0;
                    date_input_24hr = 0;
                }
                let hr_search = ""
                let min_search = ""
                if (req.query.search.includes(":")){
                    hr_search = parseInt(((req.query.search).substr(0, (req.query.search).indexOf(':')))).toString()
                    min_search = parseInt(((req.query.search).substr(3, (req.query.search).indexOf(':')))).toString()
                }
                Job.paginate({'company': user.tax_id[0]._id, 'status': req.query.status,
                $or:[
                    {"awbNumber":{ "$regex": req.query.search, "$options": "i" }},
                    {"flightNumber":{ "$regex": req.query.search, "$options": "i" }},
                    {"hwbSerialNumber":{ "$regex": req.query.search, "$options": "i" }},
                    {"customsEntryNumber":{ "$regex": req.query.search, "$options": "i" }},
                    {"dockNumber":{ "$regex": req.query.search, "$options": "i" }},
                    {"truckNumber":{ "$regex": req.query.search, "$options": "i" }},
                    {"customsEntryNumberDate":{ $gt: date_input, $lt: date_input_24hr }},
                    {"flightDate":{ $gt: date_input, $lt: date_input_24hr }},
                    {$and:[
                        {"pickupTimeHours": hr_search},
                        {"pickupTimeMinutes": min_search}
                    ]}
                ]
            }, options, function (err, result) {
                    if (err) {
                        console.log(err)
                        return res.status(500).send({message: err});
                    }
                    res.status(200).send(result)
                });
            }
            else {
                Job.paginate({'company': user.tax_id[0]._id, 'status': req.query.status,}, options, function (err, result) {
                    if (err) {
                        console.log(err)
                        return res.status(500).send({message: err});
                    }
                    res.status(200).send(result)
                });
            }
        });
    }

//0 
exports.createJob = async (req, res) => {
    try {
        const job = new Job({
            status: 1,
            awbNumber: req.body.awbNumber,
            hwbSerialNumber: req.body.hwbSerialNumber,
            flightNumber: req.body.flightNumber,
            jobNumber: req.body.jobNumber,
            customsEntryNumber: req.body.customsEntryNumber,
            customsEntryNumberDate: req.body.customsEntryNumberDate
        });
        job.numberOfPieces = Math.floor(Math.random() * 1000) + 1
	    job.flightDate = Date.now();
        await job.save()
        const user = await User.findById(req.userId).populate('tax_id')
        job.company = user.tax_id[0];
        await job.save()
        const log = new Log({
            action: "Create job",
            username: user.username,
            email: user.email
        });
        log.user.push(req.userId);
        log.job.push(job._id);
        await log.save()
        const qrcode = await QRCode.toDataURL(process.env.QRCODE_DOMAIN + 'driver/my-job-view/' + job._id)
        job.qrCode = qrcode
        await job.save()
        res.status(200).send({message: "Job was created successfully!"});
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
};

// 3 > 4 notify assigned driver
exports.selectDriver = async (req, res) => {
    try {
        const job_callback = await Job.findOne({_id: sanitize(req.params.job_id), status: 3}).populate("driver", '-password')
        if (job_callback === null) {
            res.status(404).send({message: "no job found."});
            return;
        }
        if (job_callback.driver.length > 0) {
            job_callback.driver.pop()
        }
        if (typeof req.body.truck === 'string') { 
            job_callback.truck = JSON.parse(req.body.truck) 
        }
        else if (typeof req.body.truck === 'object') 
        { 
            job_callback.truck = req.body.truck 
        }
        job_callback.driver.push(req.body.driver);
        job_callback.driverAssigner.push(req.userId);
        job_callback.status = 4;
        await job_callback.save()
        const user = await User.findById(req.userId)
        const log = new Log({
            action: "Select driver",
            username: user.username,
            email: user.email
        });
        log.user.push(req.userId);
        log.job.push(job_callback._id);
        await log.save()
        const user_driver = await User.findById(sanitize(req.body.driver))
        const notification = new Notification({
            detail: "You has been assigned to job"
        });
        notification.user.push(user_driver._id);
        notification.job.push(req.params.job_id);
        await notification.save()
        user_driver.notification += 1;
        await user_driver.save()

        const role = await Role.findOne({ name: "tg-admin"})
        const tg_users = await User.find({ role: role._id })
        tg_users.forEach(async (tg_user, index) => {
            const notification = new Notification({
                detail: "A request has been paid by FF. Please assign dock number and pickup time."
            });
            notification.user.push(tg_user);
            notification.job.push(req.params.job_id);
            await notification.save()
            tg_user.notification += 1;
            await tg_user.save()
        })
        res.status(200).send({message: "Driver selected"})
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({message: err});
    }
}

exports.jobDetail = async (req, res) => {
    try {
        const job_callback = await Job.findById(sanitize(req.params.job_id)).populate("driver", '-password')
        res.status(200).send(job_callback)
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
}

exports.callCommentDriver = async (req,res) => {
    try {
        const driver_callback = await User.findById(sanitize(req.params.driver_id))
        const job_callback = await Comment.aggregate([{ $match : {'driver': driver_callback._id }}, { $group : { _id : null, total : { $avg : "$rating" }}}])
        res.status(200).send(job_callback)
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
}

// 0 > 1
exports.jobMatching = async (req, res) => {
    try {
        const job_callback = await Job.findOne({_id: sanitize(req.params.job_id), status: 0})
        if (job_callback === null) {
            res.status(404).send({message: "no job found."});
            return;
        }
        job_callback.flightDate = req.body.flightDate;
        job_callback.status = 1;
        await job_callback.save()
        res.status(200).send({message: "Pick Up Successful"})
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
}

exports.createCommentDriver = async (req,res) => {
    try {
        const job_callback = await Job.findById(sanitize(req.params.job_id))
        job_callback.comment = req.body.comment;
        job_callback.rating = req.body.rating;
        await job_callback.save()
        const comment = new Comment({
            comment : req.body.comment,
            rating : req.body.rating,
        });
        comment.driver.push(req.body.driver_id);
        comment.job.push(req.params.job_id);
        await comment.save()
        // save avg rating to driver model
        const driver_callback = await User.findById(sanitize(req.body.driver_id)).populate("user_detail")
        const avg_rating_callback = await Comment.aggregate([{ $match : { 'driver': driver_callback._id }},{ $group : { _id : null, total : { $avg : "$rating" }}}])
        driver_callback.user_detail[0].avg_rating = avg_rating_callback[0].total
        await driver_callback.save()
        res.status(200).send({message: "Commented"});
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
}

exports.getAlltgadmin = async (req, res) => {
    console.log('getAllTgAdmin')
    try {
        const roles = await Role.findOne({ name: {$in: "tg-admin"}})
        console.log(roles)
        const tgadmin_users = await User.find({ 'role' : roles._id })
        console.log(tgadmin_users)
        
        res.status(200).send(tgadmin_users)
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({message: err});
    }
}
