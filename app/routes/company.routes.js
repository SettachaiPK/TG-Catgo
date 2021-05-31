const controller = require("../controllers/company.controller");
const { authJwt } = require("../middlewares");

const userController = require("../controllers/user.controller");
const companyController = require("../controllers/company.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/test/company",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.allCompany
  );

  app.get(
    "/api/test/company/detail",
    [authJwt.verifyToken],
    controller.getUserCompany
  );

  app.get(
    "/api/test/company/:taxid",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getCompany
  );

  app.patch(
    "/api/test/company/:taxid",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.updateCompany
  );

  app.post(
    "/api/test/company",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.createCompany
  );
};
