const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/auth.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-tokหen, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/auth/checktaxid/", controller.checktaxid);
  
  /**
   * Commvault REST APIs support token-based authentication via the Authtoken request header. 
   * The POST Login API is used to retrieve the authentication token. After the authentication token is obtained, 
   * it must be inserted into the Authtoken header for all requests.
   * 
   * @note The authentication token expires after 30 minutes of inactivity.
   * 
   * @see https://documentation.commvault.com/commvault/v11/article?p=45578.htm
  */
  app.post(
    "/api/auth/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail
    ],
    controller.signup
  );

  app.post("/api/auth/signin", controller.signin);
};
