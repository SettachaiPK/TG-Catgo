const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const User_detail = db.user_detail;
const Company_detail = db.company_detail;
const Company = db.company;
const Role = db.role;

exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
};

exports.userDetail = (req, res) => {
    console.log(req.userId);
    User.findById(req.userId)
        .populate('role').populate('user_detail')
        .exec((err, user) => {
            console.log(user)
            res.status(200).send({
                prefix: user.user_detail[0].prefix,
                firstname: user.user_detail[0].firstname,
                lastname: user.user_detail[0].lastname,
                phone: user.user_detail[0].phone,
                avatar: user.avatar
            });
        });
}

exports.editPersonalInfo = (req, res) => {
    User.findById(req.userId).populate('role').populate('user_detail')
        .exec((err, user) => {
            user.updateOne( { avatar: req.body.avatar },
                [],
                function (err, doc){
                    if (err) {
                        res.status(500).send({message: err});
                        return;
                    }
                    user.user_detail[0].updateOne( { prefix: req.body.prefix,
                            firstname: req.body.firstname,
                            lastname: req.body.lastname,
                            phone: req.body.phone },
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

exports.getUserCompanyDetail = (req, res) => {
    User.findById(req.userId)
        .populate({
            path: 'tax_id',
            populate: { path: 'company_detail' }
        })
        .exec((err, user) => {
            res.status(200).send(user.tax_id[0]);

        });
};
