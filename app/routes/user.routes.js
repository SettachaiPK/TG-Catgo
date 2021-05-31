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

  router.get(
      "/user",
      [authJwt.verifyToken, authJwt.isDriver],
      userController.userDetail);

  router.get(
      "/mod",
      [authJwt.verifyToken, authJwt.isFreightForwarder],
      userController.moderatorBoard
  );

  router.get(
      "/admin",
      [authJwt.verifyToken, authJwt.isAdmin],
      userController.adminBoard
  );

  router.get(
      "/user-company-detail",
      [authJwt.verifyToken],
      companyController.getUserCompanyDetail);

  router.post(
      "/edit-personal-information",
      [authJwt.verifyToken],
      userController.editPersonalInfo);

  app.use('/apis/user', router);
};