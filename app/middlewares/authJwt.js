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
verifyToken = async (req, res, next) => {
    try {
        console.log('input: ' + req.cookies.refreshToken)
        const refreshToken = req.cookies.refreshToken;
        const token = req.headers["x-access-token"];
        if (!token) {
            return res.status(403).send({message: "No token provided!"});
        }
        jwt.verify(token, config.secret, (err, decoded) => {
            if(err) {
                if (err.message ==='jwt expired') {
                    jwt.verify(refreshToken, config.refreshTokenSecret, async (err, refresh_token_decoded) => {
                        if (err) {
                            return res.status(401).send({message: "refresh token expired"});
                        }
                        const user = await  User.findById(refresh_token_decoded.id)
                        console.log('database: ' + user.refresh_token)
                        if (refreshToken === user.refresh_token) {
                            const token = jwt.sign({id: user.id}, config.secret, {
                                expiresIn: process.env.TOKEN_LIFE
                            });
                            const refreshToken = jwt.sign({id: user.id}, config.refreshTokenSecret, {
                                expiresIn: process.env.REFRESH_TOKEN_LIFE
                            });
                            await user.updateOne({refresh_token: refreshToken}, [])
                            res.cookie('refreshToken', refreshToken);
                            req.userId = refresh_token_decoded.id;
                            req.accessToken = token;
                            console.log('new_token: ' + req.accessToken)
                            next();
                        }
                        else {
                            return res.status(401).send({message: "refresh token expired"});
                        }
                    })
                }
                else {
                    return res.status(401).send(err);
                }
            }
            else {
                req.userId = decoded.id;
                next();
            }
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({message: err});
    }
};

/**Chack user status by
 * define status code */
isTgAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).populate("role", "-__v")
        if (user.status === true) {
            if (user.role[0].name === "tg-admin" || user.role[0].name === "admin") {
                return next();
            }
            return res.status(403).send({message: "Require tg-admin Role!"});
        }
        return res.status(403).send({message: "User Deactivated!"});
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
};

isTgAdminOffice = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).populate("role", "-__v")
        if (user.status === true) {
            if (user.role[0].name === "tg-admin-office" || user.role[0].name === "admin") {
                return next();
            }
            return res.status(403).send({message: "Require tg-admin-office Role!"});
        }
        return res.status(403).send({message: "User Deactivated!"});
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
};

isTgAdminFinance = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).populate("role", "-__v")
        if (user.status === true) {
            if (user.role[0].name === "tg-admin-finance" || user.role[0].name === "admin") {
                return next();
            }
            return res.status(403).send({message: "Require tg-admin-finance Role!"});
        }
        return res.status(403).send({message: "User Deactivated!"});
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
};

isTgAdminPackage = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).populate("role", "-__v")
        if (user.status === true) {
            if (user.role[0].name === "tg-admin-package" || user.role[0].name === "admin") {
                return next();
            }
            return res.status(403).send({message: "Require tg-admin-package Role!"});
        }
        return res.status(403).send({message: "User Deactivated!"});
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
};

isTgAdminDeliver = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).populate("role", "-__v")
        if (user.status === true) {
            if (user.role[0].name === "tg-admin-deliver" || user.role[0].name === "admin") {
                return next();
            }
            return res.status(403).send({message: "Require tg-admin-deliver Role!"});
        }
        return res.status(403).send({message: "User Deactivated!"});
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
};

isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).populate("role", "-__v")
        if (user.status === true) {
            if (user.role[0].name === "admin") {
                return next();
            }
            return res.status(403).send({message: "Require admin Role!"});
        }
        return res.status(403).send({message: "User Deactivated!"});
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
};


isFreightForwarder = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).populate("role", "-__v")
        if (user.status === true) {
            if (user.role[0].name === "freight-forwarder" || user.role[0].name === "admin") {
                return next();
            }
            return res.status(403).send({message: "Require freight-forwarder Role!"});
        }
        return res.status(403).send({message: "User Deactivated!"});
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
};

isDriver = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).populate("role", "-__v")
        if (user.status === true) {
            if (user.role[0].name === "driver" || user.role[0].name === "admin") {
                return next();
            }
            return res.status(403).send({message: "Require driver Role!"});
        }
        return res.status(403).send({message: "User Deactivated!"});
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
};

isJobBelongToDriver = async (req, res, next) => {
    try {
        const job = await Job.findById(sanitize(req.params.job_id)).populate('driver')
        if ((job.driver[0]._id).toString() === req.userId) {
            return next();
        }
        else {
            return res.status(403).send({message: "You don't have permission to view this job!"});
        }
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
}

isJobBelongToCompany = async (req, res, next) => {
    try {
        const job = await Job.findById(sanitize(req.params.job_id)).populate('company')
        const user = await User.findById(sanitize(req.userId)).populate('tax_id')
        if (job.company[0].equals(user.tax_id[0])) {
            return next();
        }
        else {
            return res.status(403).send({message: "You don't have permission to view this job!"});
        }
    }
    catch (err) {
        return res.status(500).send({message: err});
    }
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
