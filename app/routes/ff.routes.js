module.exports = app => {
    var router = require("express").Router();
    const { authJwt } = require("../middlewares");
    const userController = require("../controllers/user.controller");
    const companyController = require("../controllers/company.controller");
    const jobController = require("../controllers/job.controller");
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    router.get(
        "/jrq",
        [authJwt.verifyToken, authJwt.isFreightForwarder],
        jobController.overviewAllJob
    );

    router.post(
        "/jrq/create",
        [authJwt.verifyToken, authJwt.isFreightForwarder],
        jobController.createJob
    );

    router.get(
        "/jrq/:job_id",
        [authJwt.verifyToken, authJwt.isFreightForwarder],
        jobController.jobDetail
    );

    router.post(
        "/jrq/:job_id",
        [authJwt.verifyToken, authJwt.isFreightForwarder],
        jobController.selectDriver
    );

    app.use('/apis/ff', router);
};