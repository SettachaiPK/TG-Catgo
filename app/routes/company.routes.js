module.exports = app => {
    var router = require("express").Router();
    const { authJwt } = require("../middlewares");
    const userController = require("../controllers/user.controller");
    const companyController = require("../controllers/company.controller");

    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    router.post(
        "/update",
        [authJwt.verifyToken],
        companyController.updateOneCompanyDetail
    );

    app.use('/apis/company', router);
};