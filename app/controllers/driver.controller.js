const config = require("../config/auth.config");
const sanitize = require('mongo-sanitize');
const db = require("../models");
const User = db.user;
const User_detail = db.user_detail;
const Company_detail = db.company_detail;
const Profile_image = db.profile_image;
const Notification = db.notification;
const Company = db.company;
const Role = db.role;
const Job = db.job;

const bcrypt = require("bcryptjs");

exports.overviewAllDriver = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('tax_id')
        const driver = await Role.findOne({'name': 'driver'})
        const result = await User.find({'tax_id': user.tax_id[0]._id, 'role': driver._id},'-password').populate("user_detail").populate('avatar')
        res.status(200).send(result)
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
}

exports.driverDetail = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('tax_id')
        const driver = await Role.findOne({'name': 'driver'})
        const result = await User.findOne({'_id': sanitize(req.params.driver_id), 'tax_id': user.tax_id[0]._id, 'role': driver._id},'-password')
            .populate("user_detail").populate("avatar", 'value')
        res.status(200).send(result)
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
}

exports.deleteDriver = async (req,res) => {
    try {
        const result = await Job.find({ driver: sanitize(req.params.driver_id)})
        if (result.length > 0) {
            return res.status(418).send({message: "Can't delete. This driver has a job that doesn't complete"});
        }
        const user_detail = await User.findById(sanitize(req.params.driver_id)).populate("role").populate("tax_id")
        if (user_detail.role[0].name === 'driver') {
            const company_callback = await Company.findById(user_detail.tax_id[0]._id)
            company_callback.driver_count -= 1;
            await company_callback.save()
        }
        await User_detail.deleteOne({ username: req.params.driver_id })
        await User.deleteOne({ _id: req.params.driver_id })
        res.status(200).send({message:"Successful deletion"});
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
}

exports.editDriverInfo = async (req, res) => {
    try {
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
        const user = await User.findById(sanitize(req.params.driver_id)).populate('role').populate('user_detail').populate('avatar')
        user.status = req.body.status;
        await user.save()
        if(req.files) {
            const docs = await Profile_image.find({name: "default"})
            // user doesn't have profile image
            if (user.avatar[0]._id.equals(docs[0]._id)) {
                const avatar = new Profile_image({
                    name: user._id,
                    value: image_data.data.toString('base64')
                })
                await avatar.save()
                await user.updateOne({'avatar': result}, [])
            }
            // user has profile image
            else {
                await user.avatar[0].updateOne({value: image_data.data.toString('base64')}, [])
            }
        }
        await user.user_detail[0].updateOne( {
                prefix: req.body.prefix,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                phone: req.body.phone,
                address: req.body.address,
                province: req.body.province,
                zipcode: req.body.zipcode,
            }, [])
        res.status(200).send({message: "updated"})
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
}

exports.createDriver = (req, res) => {
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
    User.findById(req.userId)
        .populate('tax_id')
        .exec((err, userFF) => {
            if (err) {
                return res.status(500).send({message: err});
            }
            userFF.tax_id[0].driver_count += 1;
            userFF.tax_id[0].save((err) => {
                if (err) {
                    res.status(500).send({message: err});
                }
            });
            const user = new User({
                username: req.body.username,
                password: bcrypt.hashSync(req.body.password, 8),
                email: req.body.email,
                status: true,
            });

            const user_detail = new User_detail({ prefix: req.body.prefix,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                phone: req.body.phone ,
                address: req.body.address,
                province: req.body.province,
                zipcode: req.body.zipcode,
            });
            user.save((err, user) => {
                if (err) {
                    return res.status(500).send({message: err});
                }
                if(req.files) {
                    new Profile_image({
                        name: user._id,
                        value: image_data.data.toString('base64')
                    }).save((err, result) => {
                        if (err) {
                            return res.status(500).send({message: err});
                        }
                        user.updateOne({'avatar': result}, [],
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
                user.tax_id.push(userFF.tax_id[0]._id)
                Role.find( {'name': 'driver'}, (err, roles) => {
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
                                    res.send({id: user._id});
                                });
                            });
                        },
                    );
                });
            });
        });
};

exports.driverJobOverview = (req,res) => {
    let options = {
        populate: [{path: 'company', populate: { path: 'company_detail' }}, {path: 'driverAssigner', select: 'user_detail', populate: { path: 'user_detail' } }],
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
        Job.paginate({'driver': req.userId, 'status': req.query.status,
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
                return res.status(500).send({message: err});
            }
            res.status(200).send(result)
        });
    }
    else {
        Job.paginate({'driver': req.userId, 'status': req.query.status}, options, function (err, result) {
            if (err) {
                return res.status(500).send({message: err});
            }
            res.status(200).send(result)
        });
    }
}

exports.jobDriverDetail = async (req, res) => {
    try {
        const job = await Job.findById(sanitize(req.params.job_id)).populate({path: 'driver', select: 'user_detail', populate: { path: 'user_detail' } })
        res.status(200).send(job)
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
}



exports.driverGetAllFF = async (req, res) => {
    try {
        const company = await Company.findById(req.params.company_id)
        const roles = await Role.findOne({ name: {$in: "freight-forwarder"}})
        const ff_users = await User.find({ 'tax_id' : company._id, 'role' : roles._id })
        
        res.status(200).send(ff_users)
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({message: err});
    }
}
// 4 > 5 notify driver assigner and driver
exports.receivedPackage = (req, res) => {
    Job.findOne({_id: sanitize(req.params.job_id), status: 4}).exec((err, job_callback) => {
        if (err) {
            return res.status(500).send({message: err});
        }
        if (job_callback === null) {
            res.status(404).send({message: "no job found."});
            return;
        }
        job_callback.status = 5;
        job_callback.save((err) => {
            if (err) {
                return res.status(500).send({message: err});
            }
            User.findById(job_callback.driverAssigner[0]).exec((err, userAssigner) => {
                const notification = new Notification({
                    detail: "Job completed"
                });
                notification.user.push(userAssigner._id);
                notification.job.push(req.params.job_id);
                notification.save(err => {
                    if (err) {
                        return res.status(500).send({message: err});
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
                                    return res.status(500).send({message: err});
                                }
                                userDriver.notification += 1;
                                userDriver.save((err) => {
                                    if (err) {
                                        res.status(500).send({message: err});
                                    }
                                    Company.findById(job_callback.company[0]).exec((err, company_callback) => {
                                        if (err) {
                                            return res.status(500).send({message: err});
                                        }
                                        console.log(company_callback);
                                        company_callback.job_count += 1;
                                        company_callback.save(err => {
                                            if (err) {
                                                return res.status(500).send({message: err});
                                            }
                                            res.status(200).send({message: "Package received"})
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            }) 
        })
    })
}