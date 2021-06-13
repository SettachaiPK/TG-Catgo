module.exports = {
  secret: "TG-Cargo-secret-key"
};

module.exports = {
  "secret": process.env.TOKENSECRET,
  "refreshTokenSecret": process.env.REFRESHTOKENSECRET,
  "port": process.env.PORT,
  "tokenLife": process.env.TOKENLIFE,
  "refreshTokenLife": process.env.REFRESHTOKENLIFE,
};

