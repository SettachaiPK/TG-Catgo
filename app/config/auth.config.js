module.exports = {
  secret: process.env.TOKENSECRET,
  refreshTokenSecret: process.env.REFRESHTOKENSECRET,
  verifySecret: process.env.VERIFYSECRET,
  resetPasswordSecret: process.env.RESETPASSWORDSECRET,
  port: process.env.PORT,
  tokenLife: process.env.TOKENLIFE,
  refreshTokenLife: process.env.REFRESHTOKENLIFE,
  emailHost: process.env.EMAILHOST,
  emailPort: process.env.EMAILPORT,
  emailUser: process.env.EMAILUSER,
  emailPass: process.env.EMAILPASS
};