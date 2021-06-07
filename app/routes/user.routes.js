module.exports = app => {
  var router = require("express").Router();
  const { authJwt } = require("../middlewares");
  const userController = require("../controllers/user.controller");

  app.use(function(req, res, next) {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  router.get(
      "/",
      [authJwt.verifyToken],
      userController.userDetail);

  router.get(
      "/user-company-detail",
      [authJwt.verifyToken],
      userController.getUserCompanyDetail
  );

  router.post(
      "/edit-personal-information",
      [authJwt.verifyToken],
      userController.editPersonalInfo
  );

  router.post(
      "/edit-company",
      [authJwt.verifyToken ,authJwt.isFreightForwarder],
      userController.updateOneCompanyDetail
  );

  router.post(
      "/change-pwd",
      [authJwt.verifyToken],
      userController.changePwd
  );

  app.use('/apis/user', router);
};