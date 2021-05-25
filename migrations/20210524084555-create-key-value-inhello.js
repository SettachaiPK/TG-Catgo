
module.exports = {
  async up(db, client) {
    const cursor = await db.collection('User').find();

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const nickname = doc.email.split('@')[0];

      await db.collection('User').updateOne({_id: doc._id}, {$set: {nickname: nickname}});
    }
  },

  async down(db, client) {
    await db.collection('User').updateMany({}, {$unset: {nickname: true}});
  }
};
