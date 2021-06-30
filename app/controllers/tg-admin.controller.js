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

exports.jobOverview = async (req, res) => {
    try {
        const job_status0 = await Job.aggregate([{ $match: { $and: [{'status': 0}] } } ,{ $group : { _id : null, total : { $sum : 1 }}}])
        const job_status1 = await Job.aggregate([{ $match: { $and: [{'status': 1}] } } ,{ $group : { _id : null, total : { $sum : 1 }}}])
        const job_status2 = await Job.aggregate([{ $match: { $and: [{'status': 2}] } } ,{ $group : { _id : null, total : { $sum : 1 }}}])
        const job_status3 = await Job.aggregate([{ $match: { $and: [{'status': 3}] } } ,{ $group : { _id : null, total : { $sum : 1 }}}])
        const job_status4 = await Job.aggregate([{ $match: { $and: [{'status': 4}] } } ,{ $group : { _id : null, total : { $sum : 1 }}}])
        const job_status5 = await Job.aggregate([{ $match: { $and: [{'status': 5}] } } ,{ $group : { _id : null, total : { $sum : 1 }}}])
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

exports.getAllJob = (req, res) => {
    let options = {
        populate: [{path: 'company', populate: { path: 'company_detail' }}, {path: 'driver', select: 'user_detail', populate: { path: 'user_detail' } }],
        page:req.query.page,
        limit:req.query.limit,
        // sort:{ [req.query.sort_by]: [req.query.order] },
    };
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
        Job.paginate({'status': req.query.status,
        $or:[
            {"awbNumber":{ "$regex": req.query.search, "$options": "i" }},
            {"flightNumber":{ "$regex": req.query.search, "$options": "i" }},
            {"hwbSerialNumber":{ "$regex": req.query.search, "$options": "i" }},
            {"customsEntryNumber":{ "$regex": req.query.search, "$options": "i" }},
            {"numberOfPieces":{ "$regex": req.query.search, "$options": "i" }},
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
                return res.status(500).send({message: err});
            }
            res.status(200).send(result)
        });
    }
    else {
        Job.paginate({'status': req.query.status}, options, function (err, result) {
            if (err) {
                return res.status(500).send({message: err});
            }
            res.status(200).send(result)
        });
    }
};

// 2 > 3 notify every ff in company
exports.jobPickUp = async (req, res) => {
    try {
        const job_callback = await Job.findOne({_id : sanitize(req.params.job_id), status : 2}).populate("driver", '-password')
        if (job_callback === null) {
            return res.status(404).send({message: "no job found."});
        }
        job_callback.dockNumber = req.body.dockNumber;
        job_callback.pickupTimeHours = req.body.pickupTimeHours;
        job_callback.pickupTimeMinutes = req.body.pickupTimeMinutes;
        job_callback.confPickupTimeHours = req.body.pickupTimeHours;
        job_callback.confPickupTimeMinutes = req.body.pickupTimeMinutes;
        job_callback.status = 3;
        await job_callback.save()
        const user = await User.findById(req.userId)
        const log = new Log({
            action: "Select pick up time",
            username: user.username,
            email: user.email
        });
        log.user.push(req.userId);
        log.job.push(job_callback._id);
        await log.save()
        const roles = await Role.findOne({ name: {$in: "freight-forwarder"}})
        const ff_users = await User.find({ 'tax_id' : job_callback.company[0], 'role' : roles._id })
        ff_users.forEach(async function(ff_user, index){
            const notification = new Notification({
                detail: "TG-Admin set pickup time for job"
            });
            notification.user.push(ff_user._id);
            notification.job.push(req.params.job_id);
            await notification.save()
            ff_user.notification += 1;
            await ff_user.save()
        });
        res.status(200).send({message: "Pick Up Successful"})
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
}

exports.jobTgadminDetail = async (req, res) => {
    try {
        const job_callback = await Job.findById(sanitize(req.params.job_id)).populate("driver", '-password')
        res.status(200).send(job_callback)
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
}
//1 > 2 
exports.confirmPayment = async (req, res) => {
    try {
        const job_callback = await Job.findOne({_id: sanitize(req.params.job_id), status: 1})
        if (job_callback === null) {
            return res.status(404).send({message: "no job found."}); 
        }
        job_callback.status = 2;
        await job_callback.save()
        const user = await User.findById(req.userId)
        const log = new Log({
            action: "Confirm payment",
            username: user.username,
            email: user.email
        });
        log.user.push(req.userId);
        log.job.push(job_callback._id);
        await log.save()
        res.status(200).send({message: "Payment Successful"})
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({message: err});
    }
}