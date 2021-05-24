module.exports = {
  up(db) {
      return db.createCollection('User')
  },

  down(db) {
    return db.dropCollection('User')
  }
};