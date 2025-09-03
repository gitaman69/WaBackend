const mongoose = require("mongoose");

const connections = {}; // cache connections per userId

function sanitizeDbName(userId) {
  return String(userId).replace(/[^a-zA-Z0-9_-]/g, "_");
}

async function getDbConnection(userId) {
  if (connections[userId]) return connections[userId];

  const baseUri = process.env.MONGO_URI;

  const safeUserId = sanitizeDbName(userId);

  const dbName = `wa_${safeUserId}`;

  // Build per-user DB URI
  const uri = baseUri.replace("mongodb.net/", `mongodb.net/${dbName}`);

  const conn = await mongoose.createConnection(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  connections[userId] = conn;
  return conn;
}

module.exports = { getDbConnection };
