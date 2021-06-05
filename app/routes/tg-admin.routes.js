module.exports = app => {
    var router = require("express").Router();
    const { authJwt } = require("../middlewares");
    const tgAdminController = require("../controllers/tg-admin.controller")

    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    router.get(
        "/",
        [authJwt.verifyToken, authJwt.isTgAdmin],
        tgAdminController.getAllJob
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


    app.use('/apis/tgadmin', router);
};