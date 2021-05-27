module.exports = app => {
  var router = require("express").Router();
  const { authJwt } = require("../middlewares");
  const controller = require("../controllers/user.controller");

  app.use(function(req, res, next) {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  router.get("/all", controller.allAccess)

  router.get(
      "/user",
      [authJwt.verifyToken, authJwt.isDriver],
      controller.userDetail);

  router.get(
      "/mod",
      [authJwt.verifyToken, authJwt.isFreightForwarder],
      controller.moderatorBoard
  );

  router.get(
      "/admin",
      [authJwt.verifyToken, authJwt.isAdmin],
      controller.adminBoard
  );

  app.use('/api/test', router);
};