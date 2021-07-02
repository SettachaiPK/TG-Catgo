module.exports = {
  secret: process.env.TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  verifySecret: process.env.VERIFY_SECRET,
  resetPasswordSecret: process.env.RESET_PASSWORD_SECRET,
  port: process.env.PORT,
  tokenLife: process.env.TOKEN_LIFE,
  refreshTokenLife: process.env.REFRESH_TOKEN_LIFE,
};