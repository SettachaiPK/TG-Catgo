module.exports = app => {
    var router = require("express").Router();
    const { authJwt } = require("../middlewares");
    const tgAdminController = require("../controllers/tg-admin.controller")
    const jobController = require("../controllers/job.controller");

    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });
    
    router.get(
        "/overview",
        [authJwt.verifyToken, authJwt.isTgAdmin],
        tgAdminController.jobOverview
    );

    router.get(
        "/all",
        [authJwt.verifyToken, authJwt.isTgAdmin],
        tgAdminController.getAllJob
    );

    router.get(
        "/getallff/:company_id",
        [authJwt.verifyToken,authJwt.isTgAdmin],
        tgAdminController.getAllFF
    );

    router.get(
        "/getalltgadmin",
        [authJwt.verifyToken,authJwt.isTgAdmin],
        tgAdminController.getAllTgAdmin
    );
    
    router.get("/:job_id",
        [authJwt.verifyToken, authJwt.isTgAdmin],
        tgAdminController.jobTgadminDetail
    );

    router.post(
        "/:job_id/pickup",
        [authJwt.verifyToken, authJwt.isTgAdmin],
        tgAdminController.jobPickUp
    );

    router.get(
        "/:job_id/confirm_payment",
        [authJwt.verifyToken, authJwt.isTgAdmin],
        tgAdminController.confirmPayment
    );

    router.get(
        "/:job_id/job_matching",
        jobController.jobMatching
    );

    app.use('/apis/tgadmin', router);
};