const db = require("../models");
const sanitize = require('mongo-sanitize');
const User = db.user;
const User_detail = db.user_detail
const Company = db.company;
const Job = db.job;
const Company_detail = db.company_detail;
const Profile_image = db.profile_image;
const Role = db.role;
const Log = db.log;

const bcrypt = require("bcryptjs");
const { company } = require("../models");

exports.allCompaniesOverviewJobStatusCount = async (req, res) => {
    try {
        let result = {}
        const job_status0 = await Job.aggregate([{ $match: { $and: [{'status': 0}] } } ,{ $group : { _id : null, total : { $sum : 1 }}}])
        const job_status1 = await Job.aggregate([{ $match: { $and: [{'status': 1}] } } ,{ $group : { _id : null, total : { $sum : 1 }}}])
        const job_status2 = await Job.aggregate([{ $match: { $and: [{'status': 2}] } } ,{ $group : { _id : null, total : { $sum : 1 }}}])
        const job_status3 = await Job.aggregate([{ $match: { $and: [{'status': 3}] } } ,{ $group : { _id : null, total : { $sum : 1 }}}])
        const job_status4 = await Job.aggregate([{ $match: { $and: [{'status': 4}] } } ,{ $group : { _id : null, total : { $sum : 1 }}}])
        const job_status5 = await Job.aggregate([{ $match: { $and: [{'status': 5}] } } ,{ $group : { _id : null, total : { $sum : 1 }}}])
        const company_count = await Company.aggregate([{ $group : { _id : null, total : { $sum : 1 }}}])
        const roles_ff = await Role.findOne({'name':"freight-forwarder"})
        const ff_count = await User.aggregate([{ $match: { $and: [{'role': roles_ff._id}] } } ,{ $group : { _id : null, total : { $sum : 1 }}}])
        const roles_driver = await Role.findOne({'name':"driver"})
        const driver_count = await User.aggregate([{ $match: { $and: [{'role': roles_driver._id}] } } ,{ $group : { _id : null, total : { $sum : 1 }}}])
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
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
};

exports.getAllCompany =  async (req, res) => {
    try {
        let status1 = null;
        let status2 = null;
        const received_status = req.query.status;
        if (received_status !== 'none') {
            if (received_status === 'true') {
                status1 = true;
                status2 = true;
            }
            else if (received_status === 'false') {
                status1 = false;
                status2 = false;
            }
            else if (received_status === 'all') {
                status1 = true;
                status2 = false;
            }
            let options = {
                populate: 'company_detail',
                page:req.query.page,
                limit:req.query.limit,
                sort:{ [req.query.sort_by]: [req.query.order] },
            };
            if (req.query.search) {
                const result = await Company.paginate({status: { $in: [status1, status2] }, "company_name":{ "$regex": req.query.search, "$options": "i" }}, options)
                res.status(200).send(result);
            }
            else {
                const result = await Company.paginate({status: { $in: [status1, status2] }}, options)
                res.status(200).send(result);
            }
        }
        else if (received_status === 'none') {
            res.status(200).send({
                "docs": [],
                "totalDocs": 0,
                "limit": req.query.limit,
                "totalPages": 1,
                "page": 1,
                "pagingCounter": 1,
                "hasPrevPage": false,
                "hasNextPage": false,
                "prevPage": null,
                "nextPage": null
            });
        }
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
};

exports.getCompanyDetail = async (req, res) => {
    try {
        const company_detail = await Company.findById(sanitize(req.params.company_id)).populate({path: 'company_detail'})
        const user_detail = await User.find({"tax_id": company_detail._id}).select(['-password', '-refresh_token']).populate('role').populate('avatar').populate('user_detail')
        res.status(200).send({user_detail, company_detail});
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
}

exports.updateOneCompanyDetail = async (req, res) => {
    try {
        const detail = await Company_detail.findById(sanitize(req.params.company_detail_id)).populate({path: 'tax_id'})
        await detail.tax_id[0].updateOne( { company_name: req.body.company_name, status: req.body.status }, [])
        await detail.updateOne( {
            company_name: req.body.company_name,
            address: req.body.address,
            company_province: req.body.province,
            company_postal: req.body.postal,
            }, [])
        res.status(200).send({message: "updated"})
    }
    catch {
        return res.status(500).send({message: err});
    }
};

exports.deleteCompany = async (req, res) => {
    try {
        const company = await Company.findById(sanitize(req.params.company_id))
        const job = await Job.deleteMany({company: company})
        const users = await User.find( {tax_id: company} )
        users.forEach((item, index) => {
            User_detail.deleteOne({ _id: item.user_detail}).exec()
        })
        const user = await User.deleteMany( {tax_id: company} )
        await Company.deleteOne({ _id: sanitize(req.params.company_id)})
        res.status(200).send({
            message: company.company_name + " removed",
            job_delete: job.deletedCount,
            user_delete: user.deletedCount
        });
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
}

exports.deleteOneUser = async (req,res) => {
    try {
        const result = await Job.find({ driver: sanitize(req.body.user_id)})
        if (result.length > 0) {
            res.status(418).send({message: "Can't delete. This driver has a job that doesn't complete"});
            return;
        }
        const user_detail = await User.findById(sanitize(req.body.user_id)).populate("role")
        if (user_detail.role.name === 'driver'){
            const company_callback = await Company.findById(sanitize(req.params.company_id))
            company_callback.driver_count -= 1;
            await company_callback.save()
        }
        await User_detail.deleteOne({ username: req.body.user_id })
        await User.deleteOne({ _id: req.body.user_id })
        res.status(200).send({message:"Successful deletion"});
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
}

exports.viewEditUserInfo = async (req, res) => {
    try {
        const user = await User.findById(sanitize(req.params.user_id)).populate("user_detail")
        res.status(200).send(user)
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
}

exports.adminEditUserInfo = async (req, res) => {
    try {
        let updateBlock = {};
        updateBlock['username'] = req.body.new_username;
        updateBlock['email'] = req.body.new_email;
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
        const user = await User.findById(sanitize(req.params.user_id)).populate('role').populate('user_detail').populate('avatar')
        if (req.files) {
            const docs = await Profile_image.find({name: "default"})
            // user doesn't have profile image
            if (user.avatar[0]._id.equals(docs[0]._id)) {
                const profile = new Profile_image({
                    name: user._id,
                    value: image_data.data.toString('base64')
                })
                await profile.save()
                user.updateOne({'avatar': result}, [])
            }
            // user has profile image
            else {
                await user.avatar[0].updateOne({value: image_data.data.toString('base64')}, [])
            }
        }
        await user.updateOne( { "$set": updateBlock }, [])
        await user.user_detail[0].updateOne( { prefix: req.body.prefix,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            phone: req.body.phone ,
            address: req.body.address,
            province: req.body.province,
            zipcode: req.body.zipcode,
        },[])
        res.status(200).send({message: "updated"})
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
}

exports.adminGetAllJob = async (req, res) => {
    try {
        console.log("am in")
        let options = {
            populate: [{path: 'company', populate: { path: 'company_detail' }}, {path: 'driver', select: 'user_detail', populate: { path: 'user_detail' } }],
            page:req.query.page,
            limit:req.query.limit,
            sort:{ [req.query.sort_by]: [req.query.order] },
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
            const result = await Job.paginate({'status': req.query.status,
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
                    ]}]}, options)
            res.status(200).send(result)
        }
        else {
            const result = await Job.paginate({'status': req.query.status}, options)
            res.status(200).send(result)
        }
    }
    catch (err) {
        return res.status(500).send({message: err});

    }
};

exports.adminAddUser = (req, res) => {
    Company.findById(sanitize(req.params.company_id)).exec((err, company_callback) => {
        console.log(company_callback);
        if (err) {
            return res.status(500).send({message: err});
        }
        if (req.body.roles === 'driver') {
            company_callback.driver_count += 1;
            company_callback.save(err => {
                if (err) {
                    res.status(500).send({message: err});
                }
            });
        }
        const user = new User({
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, 8),
            email: req.body.email,
            tax_id: company_callback,
            status: req.body.status,
        });

        const user_detail = new User_detail({
            phone: req.body.phone,
            prefix: req.body.prefix,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
        });
        user.save((err, user) => {
            if (err) {
                return res.status(500).send({message: err});
            }
            if (req.files) {
                image_data = req.files.avatar;
                if(!image_data.name.match(/\.(jpg|jpeg|png)$/i)) {
                    res.status(415).send({message: "wrong file type"});
                    return;
                }
                if(image_data.truncated){
                    res.status(413).send({message: "file too large"});
                    return;
                }
                new Profile_image({
                    name: user._id,
                    value: image_data.data.toString('base64')
                }).save((err, profile_image_callback) => {
                    if (err) {
                        return res.status(500).send({message: err});
                    }
                    user.updateOne({'avatar': profile_image_callback}, [],
                                function (err) {
                                    if (err) {
                                        return res.status(500).send({message: err});
                                    }
                                });
                });
            }
            else {
                Profile_image.find({name: "default"}, (err, profile_image) => {
                    if (err) {
                        return res.status(500).send({message: err});
                    }
                    user.avatar = profile_image.map(name => name._id);
                });
            }
            Role.find(
                {
                    name: {$in: sanitize(req.body.roles)}
                },
                (err, roles) => {
                    if (err) {
                        return res.status(500).send({message: err});
                    }
                    user.role = roles.map(role => role._id);
                    user.save(err => {
                        if (err) {
                            res.status(500).send({message: err});
                        }
                    });
                }
            );
            user_detail.save(err => {
                if (err) {
                    res.status(500).send({message: err});
                }
                User.find(
                    {
                        username: {$in: sanitize(req.body.username)}
                    },
                    (err, username_callback) => {
                        if (err) {
                            return res.status(500).send({message: err});
                        }
                        user_detail.username = username_callback.map(username => username._id);
                        user_detail.save(err => {
                            if (err) {
                                return res.status(500).send({message: err});
                            }
                            user.user_detail.push(user_detail._id);
                            user.save(err => {
                                if (err) {
                                    return res.status(500).send({message: err});
                                }
                                res.status(200).send({ id: user._id });
                            });
                        });
                    },
                );
            });
        });
    });
};

exports.adminCreateCompany = async (req, res) => {
    try {
        const company_callback = await Company.findOne({ tax_id: {$in: sanitize(req.body.taxid)} });
        if (company_callback === null) {
            const company = new Company({
                tax_id: req.body.taxid,
                company_name: req.body.name,
                driver_count: 0,
                job_count: 0,
                status: req.body.status
            });
            await company.save();
            const company_detail = new Company_detail({
                company_name: req.body.name,
                company_province: req.body.province,
                company_postal: req.body.postal,
                address: req.body.address
            });
            company_detail.tax_id.push(company._id);
            await company_detail.save();
            company.company_detail.push(company_detail._id);
            await company.save();
            res.status(200).send({message: "Company created"});
        }
        else {

        }

    } 
    catch {
        return res.status(500).send({message: err});
    }


    Company.findOne({ tax_id: {$in: sanitize(req.body.taxid)} }).exec((err,company_callback) => {
        if (company_callback === null) {
            const company = new Company({
                tax_id: req.body.taxid,
                company_name: req.body.name,
                driver_count: 0,
                job_count: 0,
                status: req.body.status
            });
            company.save(err => {
                if (err){
                    return res.status(500).send({message: err});
                }
                const company_detail = new Company_detail({
                    company_name: req.body.name,
                    company_province: req.body.province,
                    company_postal: req.body.postal,
                    address: req.body.address
                });
                company_detail.tax_id.push(company._id);
                company_detail.save(err => {
                    if (err){
                        return res.status(500).send({message: err});
                    }
                    company.company_detail.push(company_detail._id);
                    company.save();
                });
                res.status(200).send({message: "Company created"});
            });
        }
        else {
            res.status(400).send({company_exist: true});
        }
    })
}

exports.adminCreateJob = async (req, res) => {
    try {
        const company_callback = await Company.findOne({ tax_id: {$in: sanitize(req.body.taxid)} })
        if (company_callback !== null) {
            const job = new Job({
                status: 0,
                awbNumber: req.body.awbNumber,
                hwbSerialNumber: req.body.hwbSerialNumber,
                flightNumber: req.body.flightNumber,
                jobNumber: req.body.jobNumber,
                customsEntryNumber: req.body.customsEntryNumber,
                customsEntryNumberDate: req.body.customsEntryNumberDate,
                company: company_callback
            });
            await job.save()
            const user = await User.findById(req.userId)
            const log = new Log({
                action: "Create job"
            });
            log.user.push(req.userId);
            log.job.push(job._id);
            await log.save()
            res.status(200).send({message: "Job was created successfully!"})
        }
        else {
            res.status(500).send({company_exist: false});
        }
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
}

exports.callLog = (req, res) => {
    let options = {
        populate: [{path: 'job'}, {path: 'user', select: 'user_detail', populate: { path: 'user_detail', populate: 'username' } }],
        page:req.query.page,
        limit:req.query.limit,
        sort:{ [req.query.sort_by]: [req.query.order] },
    };
    Log.paginate({ [req.query.sort_by]: { "$regex": req.query.search, "$options": "i" }}, options, function (err, result) {
        if (err) {
            return res.status(500).send({message: err});
        }
        res.status(200).send(result)
    });
};
