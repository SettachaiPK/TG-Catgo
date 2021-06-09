const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;

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
                        return res.status(401).send({message: err});
                    }
                    User.findById(second_decoded.id).exec(((err, user) => {
                        if (refreshToken === user.refresh_token) {
                            const token = jwt.sign({id: user.id}, config.secret, {
                                expiresIn: 300 // 5 minutes
                            });
                            const refreshToken = jwt.sign({id: user.id}, config.refreshTokenSecret, {
                                expiresIn: 86400 // 24 hours
                            });
                            user.updateOne({refresh_token: refreshToken},
                                [],
                                function (err, doc) {
                                    if (err) {
                                        res.status(500).send({message: err});
                                        return;
                                    }
                                    res.cookie('refreshToken', refreshToken);
                                    req.userId = second_decoded.id;
                                    req.accessToken = token;
                                    next();
                                });
                        } else {
                            return res.status(401).send(err);
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
isEnable = (req, res, next) => {
    User.findById(req.userId).exec((err, user) => {
            if (err) {
                res.status(500).send({message: err});
                return;
            }
            if (user.status === true) {
                next();
                return;
            }
            res.status(403).send({message: "User Deactivated!"});

        }
    );
}

isTgAdmin = (req, res, next) => {
    User.findById(req.userId).populate("role", "-__v")
        .exec((err, user) => {
                if (err) {
                    res.status(500).send({message: err});
                    return;
                }
                if (user.role[0].name === "tg-admin" || user.role[0].name === "admin") {
                    next();
                    return;
                }
                res.status(403).send({message: "Require tg-admin Role!"});

            }
        );
};

isAdmin = (req, res, next) => {
    User.findById(req.userId).populate("role", "-__v")
        .exec((err, user) => {
                if (err) {
                    res.status(500).send({message: err});
                    return;
                }
                if (user.role[0].name === "admin") {
                    next();
                    return;
                }
                res.status(403).send({message: "Require admin Role!"});

            }
        );
};


isFreightForwarder = (req, res, next) => {
    User.findById(req.userId).populate("role", "-__v")
        .exec((err, user) => {
                if (err) {
                    res.status(500).send({message: err});
                    return;
                }
                if (user.role[0].name === "freight-forwarder" || user.role[0].name === "admin") {
                    next();
                    return;
                }
                res.status(403).send({message: "Require freight-forwarder Role!"});

            }
        );
};

isDriver = (req, res, next) => {
    User.findById(req.userId).populate("role", "-__v")
        .exec((err, user) => {
            if (err) {
                res.status(500).send({message: err});
                return;
            }
            if (user.role[0].name === "driver" || user.role[0].name === "admin") {
                next();

            } else {
                res.status(403).send({message: "Require driver Role!"});

            }
        });
};

const authJwt = {
    verifyToken,
    isTgAdmin,
    isAdmin,
    isFreightForwarder,
    isDriver,
};

module.exports = authJwt;
