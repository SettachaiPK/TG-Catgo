module.exports = app => {
    var router = require("express").Router();
    const { authJwt } = require("../middlewares");
    const driverController = require("../controllers/driver.controller");
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    router.get(
        "/overview",
        [authJwt.verifyToken, authJwt.isDriver],
        driverController.driverJobOverview
    );

    router.get(
        "/:job_id",
        [authJwt.verifyToken, authJwt.isDriver, authJwt.isJobBelongToDriver],
        driverController.jobDriverDetail
    );

    router.get(
        "/:job_id/received",
        [authJwt.verifyToken, authJwt.isDriver, authJwt.isJobBelongToDriver],
        driverController.receivedPackage
    );

    app.use('/apis/driver', router);
};