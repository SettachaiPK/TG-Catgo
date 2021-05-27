module.exports = function(app) {
  var router = require("express").Router();
  const { verifySignUp } = require("../middlewares");
  const controller = require("../controllers/auth.controller");

  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  router.post("/checktaxid", controller.checktaxid);

  router.post(
    "/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail
    ],
    controller.signup
  );

  router.post("/signin", controller.signin);

  router.get("/forgot/:email", controller.generateForgotPwdLink);

  router.get("/reset/:token", controller.resetPwd);

  router.post("/reset", controller.resetPwd);

  app.use('/api/auth', router);
};
