const config = require("../config/auth.config");
const db = require("../models");
const mailer = require("nodemailer");
const sanitize = require('mongo-sanitize');
const handlebars = require('handlebars');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require('path');
const fs = require('fs');
const User = db.user;
const User_detail = db.user_detail;
const Company_detail = db.company_detail;
const Company = db.company;
const Role = db.role;
const Profile_image = db.profile_image;

let readHTMLFile = function(path, callback) {
    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
        if (err) {
            throw err;
            callback(err);
        }
        else {
            callback(null, html);
        }
    });
};

const smtp = {
    host: process.env.EMAILHOST, //set to your host name or ip
    port: process.env.EMAILPORT, //25, 465, 587 depend on your 
    secure: false, // use TLS
    auth: {
      user: process.env.EMAILUSER, //user account
      pass: process.env.EMAILPASS //user password
    }
  };
const smtpTransport = mailer.createTransport(smtp);

exports.checkExistCompany = (req, res) => {
    Company.find({ tax_id: {$in: sanitize(req.params.taxid)} }).populate('company_detail')
        .exec((err, company_detail) => {
            if (err) {
                return res.status(500).send({message: err});
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
exports.createCompany = (req, res) => {
  if (req.body.taxid) {
      Company.find(
        {
            tax_id: {$in: sanitize(req.body.taxid)}
        },
        (err, taxid) => {
            if (err) {
                return res.status(500).send({message: err});
            }
            if (taxid.length === 0) {
                const company = new Company({
                    tax_id: req.body.taxid,
                    company_name: req.body.name,
                    driver_count: 0,
                    job_count: 0,
                    status: true
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
        status: false,
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
        Profile_image.find({name: "default"}, (err, profile_image) => {
            if (err) {
                return res.status(500).send({message: err});
            }
            user.avatar = profile_image.map(name => name._id);
        });
        Company.find({tax_id: {$in: sanitize(req.body.taxid)}}, (err, tax_id_callback) => {
                if (err) {
                    return res.status(500).send({message: err});
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
                            let token = jwt.sign({id: user.id}, config.verifySecret, {
                                expiresIn: process.env.VERIFYEMAILTOKENLIFE
                            });

                            readHTMLFile( path.join(__dirname, '../assets/fromEmail/register/index.html'), function(err, html) {
                                let template = handlebars.compile(html)
                                let replacements = {
                                    verifyLink: process.env.CLIENTURL + 'auth/verifyRegister/' + token
                                };
                                let htmlToSend = template(replacements);

                                let mail = {
                                    from: process.env.EMAILFROM,
                                    to: user.email,
                                    subject: "Email verification for "+ user.username + " at TG Smart Backhaul", 
                                    html: htmlToSend
                                }
                                
                                smtpTransport.sendMail(mail, function(err, response){
                                    smtpTransport.close();
                                    if (err){
                                        return res.status(500).send(err);
                                    }
                                    else {
                                        res.status(200).send({ verifyLink: token });
                                    }
                                });
                            })
                        });
                    });
                },
            );
        });
    });
};

exports.verifyEmail = (req, res) => {
    jwt.verify(req.params.token, config.verifySecret, (err, decoded) => {
        if (err) {
            res.status(401).send(err);
            return;
        }
        req.userId = decoded.id;
        User.findById(sanitize(req.userId)).exec((err, user) => {
            if (err) {
                return res.status(500).send(err);
            }
            user.status = true;
            user.save(err => {
                if (err) {
                    return res.status(500).send(err);
                }
                res.status(200).send({ message: "User is activated" });
            })
        })
    });
}

/**
 * Login
 *
 * @returns boolean
 * @see
 */
exports.signIn = (req, res) => {
    User.findOne({
        username: sanitize(req.body.username)
    })
        .exec((err, user) => {
            if (err) {
                return res.status(500).send({message: err});
            }

            if (!user) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Username or Password!"
                });
            }

            let passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Username or Password!"
                });
            }
            const token = jwt.sign({id: user.id}, config.secret, {
                expiresIn: 86400 //process.env.TOKENLIFE
            });
            const refreshToken = jwt.sign({id: user.id}, config.refreshTokenSecret, {
                expiresIn: 86400 //process.env.REFRESHTOKENLIFE
            });
            User.findById(sanitize(user._id)).populate("role").populate("avatar")
                .exec((err, user_callback) => {
                    if (err) {
                        return res.status(500).send({message: err});
                    }
                    if (user_callback.status === false) {
                        return res.status(403).send({message: "User Deactivated!"});
                    }
                    user_callback.updateOne({refresh_token: refreshToken},
                    [],
                    function (err) {
                        if (err) {
                            return res.status(500).send({message: err});
                        }
                        res.cookie('refreshToken', refreshToken);
                        res.status(200).send({
                            id: user._id,
                            username: user.username,
                            accessToken: token,
                            refreshToken: refreshToken,
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
        email: sanitize(req.params.email),
    }).exec((err, user) => {
        if (err) {
            return res.status(500).send({message: err});
        }
        if (!user) {
            return res.status(404).send({message: "User Not found."});
        }
        let token = jwt.sign({id: user.id}, config.resetPasswordSecret, {
            expiresIn: process.env.RESETPASSWORDTOKENLIFE
        });

        readHTMLFile( path.join(__dirname, '../assets/fromEmail/forgetPWD/index.html'), function(err, html) {

            let template = handlebars.compile(html)
            let replacements = {
                verifyLink: process.env.CLIENTURL + 'auth/forget-password/' + token
            };
            let htmlToSend = template(replacements);

            let mail = {
                from: process.env.EMAILFROM,
                to: user.email,
                subject: "Reset password link for "+ user.username + " at TG Smart Backhaul", 
                html: htmlToSend
             }
             smtpTransport.sendMail(mail, function(err, response){
                smtpTransport.close();
                if (err){
                    return res.status(500).send(err);
                }
                else {
                   console.log(response);
                   res.status(200).send({ verifyLink: token });
                }
             });
            res.status(200).send({
                tokenForgotPwdLink: token
            });
        })
    });
};


exports.resetPwd = (req, res) => {
    if (req.params.token) {
        jwt.verify(req.params.token, config.resetPasswordSecret, (err, decoded) => {
            if (err) {
                return res.status(401).send(err);
            }
            req.userId = decoded.id;
            res.status(200).send({
                UserId: req.userId
            });
        });
    }
    else if (req.body.token) {
        jwt.verify(req.body.token, config.resetPasswordSecret, (err, decoded) => {
            if (err) {
                return res.status(401).send({ message: "Link expired!" });
            }
            req.userId = decoded.id;
        });

        User.findById(sanitize(req.userId)).exec((err, user_callback) => {
            if (err) {
                return res.status(500).send({message: err});
            }
            user_callback.updateOne( { password: bcrypt.hashSync(req.body.password, 8) },
                [],
                function (err){
                    if (err) {
                        return res.status(500).send({message: err});
                    }
                    res.status(200).send({message: "updated"})
                });
        });
    }
    else {
        return res.status(401).send({ message: "Token expired!" })
    }
};