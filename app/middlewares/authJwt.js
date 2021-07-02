const jwt = require("jsonwebtoken");
const sanitize = require('mongo-sanitize');
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Job = db.job
const Company = db.company;

/** Check token by get access token first.
 * Then return the confirm message.
 */
verifyToken = (req, res, next) => {
    let refreshToken = req.cookies.refreshToken;
    let token = req.headers["x-access-token"];
    if (!token) {
        return res.status(403).send({message: "No token provided!"});
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) {
            if (err.message ==='jwt expired') {
                jwt.verify(refreshToken, config.refreshTokenSecret, (err, second_decoded) => {
                    if (err) {
                        return res.status(401).send({message: "refresh token expired"});
                    }
                    User.findById(second_decoded.id).exec(((err, user) => {
                        if (refreshToken === user.refresh_token) {
                            const token = jwt.sign({id: user.id}, config.secret, {
                                expiresIn: process.env.TOKENLIFE
                            });
                            const refreshToken = jwt.sign({id: user.id}, config.refreshTokenSecret, {
                                expiresIn: process.env.REFRESHTOKENLIFE
                            });
                            user.updateOne({refresh_token: refreshToken},
                                [],
                                function (err, doc) {
                                    if (err) {
                                        return res.status(500).send({message: err});
                                    }
                                    res.cookie('refreshToken', refreshToken);
                                    req.userId = second_decoded.id;
                                    req.accessToken = token;
                                    next();
                                });
                        } else {
                            return res.status(401).send({message: "refresh token expired"});
                        }
                    }));
                });
            }
            else {
                return res.status(401).send(err);
            }
        }
        else {
            req.userId = decoded.id;
            next();
        }
    });
};

/**Chack user status by
 * define status code */
isTgAdmin = (req, res, next) => {
    User.findById(req.userId).populate("role", "-__v")
        .exec((err, user) => {
                if (err) {
                    return res.status(500).send({message: err});
                }
            if (user.status === true) {
                if (user.role[0].name === "tg-admin" || user.role[0].name === "admin") {
                    next();
                    return;
                }
                res.status(403).send({message: "Require tg-admin Role!"});
                return;
            }
            res.status(403).send({message: "User Deactivated!"});
            }
        );
};

isTgAdminOffice = (req, res, next) => {
    User.findById(req.userId).populate("role", "-__v")
        .exec((err, user) => {
                if (err) {
                    return res.status(500).send({message: err});
                }
            if (user.status === true) {
                if (user.role[0].name === "tg-admin-office" || user.role[0].name === "admin") {
                    next();
                    return;
                }
                res.status(403).send({message: "Require tg-admin-office Role!"});
                return;
            }
            res.status(403).send({message: "User Deactivated!"});
            }
        );
};

isTgAdminFinance = (req, res, next) => {
    User.findById(req.userId).populate("role", "-__v")
        .exec((err, user) => {
                if (err) {
                    return res.status(500).send({message: err});
                }
            if (user.status === true) {
                if (user.role[0].name === "tg-admin-finance" || user.role[0].name === "admin") {
                    next();
                    return;
                }
                res.status(403).send({message: "Require tg-admin-finance Role!"});
                return;
            }
            res.status(403).send({message: "User Deactivated!"});
            }
        );
};

isTgAdminPackage = (req, res, next) => {
    User.findById(req.userId).populate("role", "-__v")
        .exec((err, user) => {
                if (err) {
                    return res.status(500).send({message: err});
                }
            if (user.status === true) {
                if (user.role[0].name === "tg-admin-package" || user.role[0].name === "admin") {
                    next();
                    return;
                }
                res.status(403).send({message: "Require tg-admin-package Role!"});
                return;
            }
            res.status(403).send({message: "User Deactivated!"});
            }
        );
};

isTgAdminDeliver = (req, res, next) => {
    User.findById(req.userId).populate("role", "-__v")
        .exec((err, user) => {
                if (err) {
                    return res.status(500).send({message: err});
                }
            if (user.status === true) {
                if (user.role[0].name === "tg-admin-deliver)" || user.role[0].name === "admin") {
                    next();
                    return;
                }
                res.status(403).send({message: "Require tg-admin-deliver Role!"});
                return;
            }
            res.status(403).send({message: "User Deactivated!"});
            }
        );
};

isAdmin = (req, res, next) => {
    User.findById(req.userId).populate("role", "-__v")
        .exec((err, user) => {
                if (err) {
                    return res.status(500).send({message: err});
                }
            if (user.status === true) {
                if (user.role[0].name === "admin") {
                    next();
                    return;
                }
                res.status(403).send({message: "Require admin Role!"});
                return;
            }
            res.status(403).send({message: "User Deactivated!"});
            }
        );
};


isFreightForwarder = (req, res, next) => {
    User.findById(req.userId).populate("role", "-__v")
        .exec((err, user) => {
                if (err) {
                    return res.status(500).send({message: err});
                }
            if (user.status === true) {
                if (user.role[0].name === "freight-forwarder" || user.role[0].name === "admin") {
                    next();
                    return;
                }
                res.status(403).send({message: "Require freight-forwarder Role!"});
                return;
            }
            res.status(403).send({message: "User Deactivated!"});
            }
        );
};

isDriver = (req, res, next) => {
    User.findById(req.userId).populate("role", "-__v")
        .exec((err, user) => {
            if (err) {
                return res.status(500).send({message: err});
            }
            if (user.status === true) {
                if (user.role[0].name === "driver" || user.role[0].name === "admin") {
                    next();
                    return;
                } else {
                    res.status(403).send({message: "Require driver Role!"});
                    return;
                }
            }
            res.status(403).send({message: "User Deactivated!"});
        });
};

isJobBelongToDriver = (req, res, next) => {
    Job.findById(sanitize(req.params.job_id)).populate('driver').exec((err, job_callback) => {
        if (err) {
            return res.status(500).send({message: err});
        }
        if ((job_callback.driver[0]._id).toString() === req.userId) {
            next();
        }
        else {
            res.status(403).send({message: "You don't have permission to view this job!"});
        }
    })
}

isJobBelongToCompany = (req, res, next) => {
    Job.findById(sanitize(req.params.job_id)).populate('company').exec((err, job_callback) => {
        if (err) {
            return res.status(500).send({message: err});
        }
        User.findById(sanitize(req.userId)).populate('tax_id').exec((err, user_callback) => {
            if (err) {
                return res.status(500).send({message: err});
            }
            if (job_callback.company[0].equals(user_callback.tax_id[0])) {
                next();
            }
            else {
                res.status(403).send({message: "You don't have permission to view this job!"});
            }
        })
    })
}

const authJwt = {
    verifyToken,
    isTgAdmin,
    isTgAdminOffice,
    isTgAdminFinance,
    isTgAdminPackage,
    isTgAdminDeliver,
    isAdmin,
    isFreightForwarder,
    isDriver,
    isJobBelongToDriver,
    isJobBelongToCompany
};

module.exports = authJwt;
