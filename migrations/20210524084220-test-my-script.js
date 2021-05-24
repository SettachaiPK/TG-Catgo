module.exports = {
  async up(db, client) {
    db.createCollection("he")
  },

  async down(db, client) {
    db.he.drop()
  }
};
