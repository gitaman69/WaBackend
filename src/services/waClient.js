const qrcode = require("qrcode");
const { Client, LocalAuth } = require("whatsapp-web.js");
const { generateReply } = require("./llm");
const { getDbConnection } = require("../db/multiTenant");
const { getTenantModels } = require("../models/tenantModels");

const clients = {}; // userId -> WhatsApp client

function initWA(io, userId) {
  if (clients[userId]) return clients[userId];

  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: `bot-session-${userId}`,
      dataPath: "./.wwebjs_auth",
    }),
    puppeteer: { headless: true },
  });

  // 📡 QR Code
  client.on("qr", async (qr) => {
    io.to(userId).emit("wa:qr", await qrcode.toDataURL(qr));
  });

  // ✅ Ready
  client.on("ready", () => {
    console.log(`✅ WhatsApp ready for user ${userId}`);
    io.to(userId).emit("wa:ready");
  });

  // ❌ Auth failure
  client.on("auth_failure", (msg) => {
    console.error(`❌ Auth failure for ${userId}:`, msg);
    io.to(userId).emit("wa:auth_failure", msg);
  });

  // ⚠️ Disconnected
  client.on("disconnected", (reason) => {
    console.warn(`⚠️ WhatsApp disconnected for ${userId}:`, reason);
    io.to(userId).emit("wa:disconnected", reason);
  });

  // 📩 Incoming message
  client.on("message", async (msg) => {
    try {
      if (msg.fromMe) return;

      const { from, body, id } = msg;

      // Get per-user DB + model
      const conn = await getDbConnection(userId);
      const { Message } = getTenantModels(conn);

      // Save inbound
      const saved = await Message.create({
        messageId: id._serialized,
        from,
        to: userId,
        body,
        direction: "in",
      });
      io.to(userId).emit("message:in", saved);

      // AI reply
      let reply = await generateReply(userId, from, body);
      if (!reply) reply = "🤖 Sorry, I couldn't generate a reply right now.";

      await msg.reply(reply);

      // Save outbound
      const out = await Message.create({
        messageId: `${id._serialized}_out`,
        from: userId,
        to: from,
        body: reply,
        direction: "out",
      });
      io.to(userId).emit("message:out", out);
    } catch (err) {
      console.error(`Message handling error [${userId}]:`, err.message);
    }
  });

  client.initialize();
  clients[userId] = client;
  return client;
}


function getClient(userId) {
  if (!clients[userId]) throw new Error(`No WA client for ${userId}`);
  return clients[userId];
}

module.exports = { initWA, getClient };
