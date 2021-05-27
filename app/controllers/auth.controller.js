const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const User_detail = db.user_detail;
const Company_detail = db.company_detail;
const Company = db.company;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.checktaxid = (req, res) => {
if (req.body.taxid) {
    Company.find(
        {
            tax_id: {$in: req.body.taxid}
        },
        (err, taxid) => {
            if (taxid.length == 0) {
                const company = new Company({
                    tax_id: req.body.taxid,
                    company_name: req.body.name
                });
                company.save();
                const company_detail = new Company_detail({
                    company_name: req.body.name,
                    company_province: req.body.province,
                    company_postal: req.body.postal,
                    address: req.body.address,
                });
                company_detail.tax_id.push(company._id);
                company_detail.save();
                res.send({company_filter: true});
                //return;
            }
            else {
            res.send({company_filter: false});
            }
        })
    }
};

exports.signup = (req, res) => {
    const user = new User({
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 8),
        email: req.body.email,
        //avatar: String,
    });

    const user_detail = new User_detail({
        phone: req.body.phone,
        prefix: req.body.prefix,
        firstname: req.body.firstname,
        lastname: req.body.lastname,


    });
    user.save((err, user) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }
        Company.find(
            {
                tax_id: {$in: req.body.taxid}
            },
            (err, tax_id_callback) => {
                if (err) {
                    res.status(500).send({message: err});
                    return;
                }
                user.tax_id = tax_id_callback.map(tax_id => tax_id._id);

            }
        );
        Role.find(
            {
                name: {$in: req.body.roles}
            },
            (err, roles) => {
                if (err) {
                    res.status(500).send({message: err});
                    return;
                }
                user.role = roles.map(role => role._id);
                user.save(err => {
                    if (err) {
                        res.status(500).send({message: err});
                    }
                });
            }
        );
    });
    user_detail.save(err => {
        if (err) {
            res.status(500).send({message: err});
        }
        User.find(
            {
                username: {$in: req.body.username}
            },
            (err, username_callback) => {
                if (err) {
                    res.status(500).send({message: err});
                    return;
                }
                user_detail.username = username_callback.map(username => username._id);


                user_detail.save(err => {
                    if (err) {
                        res.status(500).send({message: err});
                        return;
                    }
                    user.user_detail.push(user_detail._id);
                    user.save(err => {
                        if (err) {
                            res.status(500).send({message: err});
                            return;
                        }
                        res.send({message: "User was registered successfully!"});
                    });
                });
            },
        );
    });
};

exports.signin = (req, res) => {
    User.findOne({
        username: req.body.username
    })
        .exec((err, user) => {
            if (err) {
                res.status(500).send({message: err});
                return;
            }

            if (!user) {
                return res.status(404).send({message: "User Not found."});
            }

            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!"
                });
            }

            var token = jwt.sign({id: user.id}, config.secret, {
                expiresIn: 86400 // 24 hours
            });
                User.findOne({
                    username: req.body.username
                })
                    .populate("role", "-__v")
                    .exec((err, role_callback) => {
                        res.status(200).send({
                            id: user._id,
                            username: user.username,
                            accessToken: token,
                            email: user.email,
                            role: role_callback.role[0].name,
                            created_at: user.createdAt,
                            updated_at: user.updatedAt
                    });
                });
        });
};

exports.generateForgotPwdLink = (req, res) => {
    console.log(req.params.email);
    User.findOne({
        email: req.params.email,
    }).exec((err, user) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }
        if (!user) {
            return res.status(404).send({message: "User Not found."});
        }
        var token = jwt.sign({id: user.id}, config.secret, {
            expiresIn: 86400 // 24 hours
        });
        console.log(token)
        res.status(200).send({
            tokenForgotPwdLink: token
        });
    });
};

exports.resetPwd = (req, res) => {
    if (req.params.token) {
        jwt.verify(req.params.token, config.secret, (err, decoded) => {
            if (err) {
                return res.status(401).send({ message: "Link expired!" });
            }
            req.userId = decoded.id;
        });

        console.log(req.userId);
        res.status(200).send({
            UserId: req.userId
        });
    }
     if (req.body.token) {
        jwt.verify(req.body.token, config.secret, (err, decoded) => {
            if (err) {
                return res.status(401).send({ message: "Link expired!" });
            }
            req.userId = decoded.id;
        });

        User.findById(req.userId).exec((err, user_callback) => {
            user_callback.updateOne( { password: bcrypt.hashSync(req.body.password, 8) },
                { _id: req.userId },
                function (err, doc){
                    if (err) {
                        res.status(500).send({message: err});
                        return;
                    }
                    res.status(200).send({status: "updated"})
                });
            });
     }
    else {
        return res.status(401).send({ message: "Token expired!" })
    }
};