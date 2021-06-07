const db = require("../models");
const User = db.user;
const User_detail = db.user_detail
const Company = db.company;
const Job = db.job;
const Company_detail = db.company_detail;

var bcrypt = require("bcryptjs");


exports.getAllCompany =  (req, res) => {
    Company.find().exec((err, AllCompany) => {
        res.status(200).send(AllCompany);
    })
};

exports.getCompanyDetail = (req, res) => {
    Company.findById(req.params.company_id).populate({path: 'company_detail'})
        .exec((err, company_detail) => {
        User.find({"tax_id": company_detail._id})
            .exec((err, user_detail) => {
            res.status(200).send({user_detail, company_detail});
        })
    });
}

exports.updateOneCompanyDetail = (req, res) => {
    Company_detail.findById(req.params.company_detail_id).populate({path: 'tax_id'})
        .exec((err, detail) => {
        detail.tax_id[0].updateOne( { company_name: req.body.companyName },
            [],
            function (err, doc){
                if (err) {
                    res.status(500).send({message: err});
                    return;
                }
                detail.updateOne( { company_name: req.body.companyName,
                        address: req.body.address,
                        company_province: req.body.province,
                        company_postal: req.body.postal },
                    [],
                    function (err, doc){
                        if (err) {
                            res.status(500).send({message: err});
                            return;
                        }

                        res.status(200).send({status: "updated"})
                    });
            });
    });
};

exports.deleteOneUser = (req,res) => {
    Job.find({ driver:req.body.user_id})
        .exec((err, result) => {
        if (result.length > 0) {
            res.status(418).send({message: "Can't delete. This driver has a job that doesn't complete"});
            return;
        }
            User.findOne({_id: req.body.user_id }).populate("role")
                .exec((err, user_detail) => {
                    if (user_detail.role[0].name === 'driver'){
                        Company.findById(req.params.company_id)
                            .exec((err1, company_callback) => {
                                company_callback.driver_count -= 1;
                                company_callback.save((err, job) => {
                                    if (err) {
                                        res.status(500).send({message: err});
                                    }
                                })
                            });
                    }
                });
            User_detail.deleteOne({ username: req.body.user_id }).
            exec((err, doc) => {
                if (err) {
                    res.status(500).send({message: err});
                    return;
                }
                User.deleteOne({ _id: req.body.user_id })
                    .exec((err, doc) => {
                        if (err) {
                            res.status(500).send({message: err});
                            return;
                        }
                        res.status(200).send({status:"Successful deletion"});
                    });
            });
    });
}

exports.viewEditUserInfo = (req, res) => {
    User.findById(req.params.user_id).populate("user_detail")
        .exec((err, callback) => {
            res.status(200).send(callback)
    });
}

exports.adminEditUserInfo = (req, res) => {
    let updateBlock = {};
    updateBlock['username'] = req.body.username;
    updateBlock['email'] = req.body.email;
    updateBlock['password'] = bcrypt.hashSync(req.body.password, 8);
    updateBlock['status'] = req.body.status;
    if(req.files) {
        const image_data = req.files.avatar;
        if(!image_data.name.match(/\.(jpg|jpeg|png)$/i)) {
            console.log("wrong type")
            res.status(415).send({message: "wrong file type"});
            return;
        }
        if(image_data.truncated){
            res.status(413).send({message: "file too large"});
            return;
        }
        updateBlock['avatar'] = image_data.data.toString('base64');
    }
    let req_detail = JSON.parse(req.body.detail);
    User.findById(req.params.user_id).populate('role').populate('user_detail')
        .exec((err, user) => {
            user.updateOne( { "$set": updateBlock }, [], function (err, doc){
                    if (err) {
                        res.status(500).send({message: err});
                        return;
                    }
                    user.user_detail[0].updateOne( { prefix: req_detail.prefix,
                            firstname: req_detail.firstname,
                            lastname: req_detail.lastname,
                            phone: req_detail.phone ,
                            address: req_detail.address,
                            province: req_detail.province,
                            zipcode: req_detail.zipcode,
                        },
                        [],
                        function (err, doc){
                            if (err) {
                                res.status(500).send({message: err});
                                return;
                            }
                            res.status(200).send({message: "updated"})
                        });
                });
        });
}
// async function testfunc(){
//     var testOutput = await [];
//
//     let a = await Role.findOne({'name': "driver"}).exec((err, callback) => {
//         Company.find().exec((err, Allcompany) => {
//             for (var i = 0; i < Allcompany.length; i++) {
//                 User.find({ 'tax_id': Allcompany[i]._id , 'role': callback._id })
//                     .populate("driver", '-password')
//                     .exec((err, companies_driver) => {
//                         if (err) {
//                             return;
//                         }

//                         console.log(companies_driver.length);
//                         testOutput.push({companies_driver,
//                             count: companies_driver.length
//                         });
//                         console.log(testOutput)
//                     });
//             };
//             res.status(200).send('result :' + testOutput);
//         });
//     });
// }
//
// // count all driver in company