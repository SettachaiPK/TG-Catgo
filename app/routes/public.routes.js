module.exports = app => {
    var router = require("express").Router();
    const { authJwt } = require("../middlewares");
    const publicController = require("../controllers/public.controller");
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // router.get(
    //     "/:job_id",
    //     publicController.jobDetail
    // );

    router.post(
        "/:job_id/comment",
        publicController.createCommentDriver
    );

    router.get(
        "/:job_id/received",
        publicController.receivedPackage
    );
    app.use('/apis/public', router);
};