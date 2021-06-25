module.exports = app => {
    var router = require("express").Router();
    const { authJwt } = require("../middlewares");
    const { verifySignUp } = require("../middlewares");
    const adminController = require("../controllers/admin.controller");

    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    router.get(
        "/all_job",
        [authJwt.verifyToken, authJwt.isAdmin],
        adminController.adminGetAllJob
    );

    router.get(
        "/company",
        [authJwt.verifyToken, authJwt.isAdmin],
        adminController.getAllCompany
    );

    router.get(
        "/:company_id/overview",
        [authJwt.verifyToken, authJwt.isAdmin],
        adminController.getCompanyDetail
    );

    router.post(
        "/company/:company_detail_id/update",
        [authJwt.verifyToken, authJwt.isAdmin],
        adminController.updateOneCompanyDetail
    );

    router.get(
        "/company/:company_id/",
        [authJwt.verifyToken, authJwt.isAdmin],
        adminController.getCompanyDetail
    );

    router.get(
        "/company/:company_id/delete",
        [authJwt.verifyToken, authJwt.isAdmin],
        adminController.deleteCompany
    );

    router.post(
        "/company/:company_id/delete_user",
        [authJwt.verifyToken, authJwt.isAdmin],
        adminController.deleteOneUser
    );

    router.get(
        "/company/:company_id/:user_id",
        [authJwt.verifyToken, authJwt.isAdmin],
        adminController.viewEditUserInfo
    );

    router.post(
        "/company/:company_id/:user_id/edit",
        [authJwt.verifyToken, authJwt.isAdmin, verifySignUp.checkDuplicateUsernameOrEmail],
        adminController.adminEditUserInfo
    );

    router.get(
        "/overview",
        [authJwt.verifyToken, authJwt.isAdmin],
        adminController.allCompaniesOverviewJobStatusCount
    );

    router.post(
        "/company/:company_id/create_user",
        [authJwt.verifyToken, authJwt.isAdmin, verifySignUp.checkDuplicateUsernameOrEmail],
        adminController.adminAddUser
    );

    router.get(
        "/log",
        [authJwt.verifyToken, authJwt.isAdmin],
        adminController.callLog
    );

    router.post(
        "/company/create",
        [authJwt.verifyToken, authJwt.isAdmin],
        adminController.adminCreateCompany
    );

    router.post(
        "/all_job/create",
        [authJwt.verifyToken, authJwt.isAdmin],
        adminController.adminCreateJob
    );

    app.use('/apis/admin', router);
};