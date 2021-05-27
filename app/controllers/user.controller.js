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
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role[0].name,
                firstname: user.user_detail[0].firstname,
                created_at: user.createdAt,
                updated_at: user.updatedAt
            });
        });
}

exports.userBoard = (req, res) => {
    res.status(200).send("Public Content.");
};

exports.adminBoard = (req, res) => {
    res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
    res.status(200).send("Moderator Content.");
};
