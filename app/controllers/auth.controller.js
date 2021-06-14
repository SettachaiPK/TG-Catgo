const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const User_detail = db.user_detail;
const Company_detail = db.company_detail;
const Company = db.company;
const Role = db.role;
const Profile_image = db.profile_image;
const Log = db.log;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.getcompanydetail_ifexist = (req, res) => {
    Company.find({ tax_id: {$in: req.params.taxid} }).populate('company_detail')
        .exec((err, company_detail) => {
            if (err) {
                res.status(500).send({message: err});
                return;
            }
            if (company_detail.length === 0) {
                res.send({company_exist: false});
                return
            }
            res.status(200).send({
                company_exist: true,
                company_detail: company_detail[0].company_detail[0]
            });
    });
}

/**
 * Check taxid is exist, isn't?
 * if not, system will create new company
 * if exist, system will give permission for auto create driver
 *
 * @returns res boolean type
 *
 * @value ads
 *
 * @see
 */
exports.checktaxid = (req, res) => {
  if (req.body.taxid) {
      Company.find(
        {
            tax_id: {$in: req.body.taxid}
        },
        (err, taxid) => {
            if (err) {
                res.status(500).send({message: err});
                return;
            }
            if (taxid.length === 0) {
                const company = new Company({
                    tax_id: req.body.taxid,
                    company_name: req.body.name,
                    driver_count: 0,
                    job_count: 0
                });
                company.save(err => {
                    if (err){
                        res.status(500).send({message: err});
                        return;
                    }
                    const company_detail = new Company_detail({
                        company_name: req.body.name,
                        company_province: req.body.province,
                        company_postal: req.body.postal,
                        address: req.body.address,
                    });
                    company_detail.tax_id.push(company._id);
                    company_detail.save(err => {
                        if (err){
                            res.status(500).send({message: err});
                            return;
                        }
                        company.company_detail.push(company_detail._id);
                        company.save();
                    });
                    res.send({company_exist: false});
                });
            }
            else {
            res.send({company_exist: true});
            }
        })
    }
};

/**
 * Register
 *
 * @returns boolean
 * @see
 */
exports.signup = (req, res) => {

    const user = new User({
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 8),
        email: req.body.email,
        status: true,
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
        Profile_image.find({name: "default"}, (err, profile_image) => {
            if (err) {
                res.status(500).send({message: err});
                return;
            }
            user.avatar = profile_image.map(name => name._id);
        });
        Company.find({tax_id: {$in: req.body.taxid}}, (err, tax_id_callback) => {
                if (err) {
                    res.status(500).send({message: err});
                    return;
                }
                user.tax_id = tax_id_callback.map(tax_id => tax_id._id);
                if (req.body.roles === 'driver') {
                    tax_id_callback[0].driver_count += 1;
                    tax_id_callback[0].save((err, job) => {
                        if (err) {
                            res.status(500).send({message: err});
                        }
                    });
                }
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
    });
};

/**
 * Login
 *
 * @returns boolean
 * @see
 */
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
            const token = jwt.sign({id: user.id}, config.secret, {
                expiresIn: 86400 // 300 // 5 minutes
            });
            const refreshToken = jwt.sign({id: user.id}, config.refreshTokenSecret, {
                expiresIn: 86400 // 24 hours
            });
            User.findById(user._id).populate("role").populate("avatar")
                .exec((err, user_callback) => {
                    if (err) {
                        res.status(500).send({message: err});
                        return;
                    }
                    user_callback.updateOne({refresh_token: refreshToken},
                    [],
                    function (err) {
                        if (err) {
                            res.status(500).send({message: err});
                            return;
                        }
                        res.cookie('refreshToken', refreshToken);
                        res.status(200).send({
                            id: user._id,
                            username: user.username,
                            accessToken: token,
                            email: user.email,
                            role: user_callback.role[0].name,
                            avatar: user_callback.avatar[0].value,
                            created_at: user.createdAt,
                            updated_at: user.updatedAt,
                        });
                    });
            });
        });
}

exports.generateForgotPwdLink = (req, res) => {
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
        res.status(200).send({
            tokenForgotPwdLink: token
        });
    });
};


exports.resetPwd = (req, res) => {
    if (req.params.token) {
        jwt.verify(req.params.token, config.secret, (err, decoded) => {
            if (err) {
                res.status(401).send(err);
                return;
            }
            req.userId = decoded.id;
            res.status(200).send({
                UserId: req.userId
            });
        });
    }
    else if (req.body.token) {
        jwt.verify(req.body.token, config.secret, (err, decoded) => {
            if (err) {
                return res.status(401).send({ message: "Link expired!" });
            }
            req.userId = decoded.id;
        });

        User.findById(req.userId).exec((err, user_callback) => {
            if (err) {
                res.status(500).send({message: err});
                return;
            }
            user_callback.updateOne( { password: bcrypt.hashSync(req.body.password, 8) },
                [],
                function (err){
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

exports.log = (req, res) => {
    const log = new Log({
        action: req.body.log
    });
    log.user.push(req.userId);
    log.save(err => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }
        res.status(200).send({message: 'logged'});
    });
}


