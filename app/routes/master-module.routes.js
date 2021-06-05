module.exports = app => {
    var router = require("express").Router();
    const { authJwt } = require("../middlewares");
    const master_module = require("../controllers/master-module.controller");
  
    // app.use(function(req, res, next) {
    //   res.header(
    //       "Access-Control-Allow-Headers",
    //       "x-access-token, Origin, Content-Type, Accept"
    //   );
    //   next();
    // });
    
    router.get(
        "/province",
        master_module.provinces
    );
  
    app.use('/apis/master-module', router);
  };