module.exports = app => {
    var router = require("express").Router();
    const { authJwt } = require("../middlewares");
    const chatController = require("../controllers/chat.controller");
  
    app.use(function(req, res, next) {
      res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });
  
    router.get(
        "/:job_id",
        [authJwt.verifyToken],
        chatController.chatHistory);
  
    app.use('/apis/chat', router);
  };