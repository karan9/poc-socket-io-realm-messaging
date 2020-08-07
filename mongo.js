
const { MongoClient } = require("mongodb");
const { MONGO_URI } = require("./private");

/**
 * A simple high
 * 
 * @param {Function} WrappedFunction 
 * @param {String} database 
 * @param  {...any} args 
 */
async function open(database, ...args) {
  const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const conn = await client.connect();
  const db = await conn.db(database);
  const count = await db.collection("messages").count();

  return {
    db: db,
    connection: conn,
    close: function() {
      if (conn) {
        conn.close();
      }
    }
  };
}

module.exports = {
  open
}
