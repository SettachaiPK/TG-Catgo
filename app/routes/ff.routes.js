module.exports = app => {
    var router = require("express").Router();
    const { authJwt } = require("../middlewares");
    const { verifySignUp } = require("../middlewares");
    const jobController = require("../controllers/job.controller");
    const driverController = require("../controllers/driver.controller");
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    router.get(
        "/jrq/overview",
        [authJwt.verifyToken, authJwt.isFreightForwarder],
        jobController.overviewJobStatusCount
    );

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
        [authJwt.verifyToken, authJwt.isFreightForwarder, authJwt.isJobBelongToCompany],
        jobController.jobDetail
    );

    router.post(
        "/jrq/:job_id",
        [authJwt.verifyToken, authJwt.isFreightForwarder],
        jobController.selectDriver
    );

    router.get(
        "/tdv/overview",
        [authJwt.verifyToken, authJwt.isFreightForwarder],
        driverController.overviewAllDriver
    );

    router.get(
        "/tdv/:driver_id",
        [authJwt.verifyToken, authJwt.isFreightForwarder],
        driverController.driverDetail
    );

    router.post(
        "/tdv/edit/:driver_id",
        [authJwt.verifyToken, authJwt.isFreightForwarder],
        driverController.editDriverInfo
    );

    router.get(
        "/tdv/delete/:driver_id",
        [authJwt.verifyToken, authJwt.isFreightForwarder],
        driverController.deleteDriver
    );

    router.post(
        "/tdv/create",
        [verifySignUp.checkDuplicateUsernameOrEmail, authJwt.verifyToken, authJwt.isFreightForwarder],
        driverController.createDriver
    );

    router.get(
        "/tdv/:driver_id/all_comment",
        [authJwt.verifyToken, authJwt.isFreightForwarder],
        jobController.callCommentDriver
    );

    router.post(
        "/jrq/:job_id/comment",
        jobController.createCommentDriver
    );

    app.use('/apis/ff', router);
};