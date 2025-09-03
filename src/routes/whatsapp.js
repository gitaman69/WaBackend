// WaBackend/src/routes/whatsapp.js
const express = require("express");
const router = express.Router();
const { getClient, reconnectWA, logoutWA } = require("../services/waClient");
const { getDbConnection } = require("../db/multiTenant");
const { getTenantModels } = require("../models/tenantModels");
const authMiddleware = require("../middleware/auth");

// ✅ Apply authentication middleware globally
router.use(authMiddleware);

// ✅ Send message
router.post("/send", async (req, res) => {
  const { to, content } = req.body;

  if (!to || !content) {
    return res.status(400).json({ error: "Missing 'to' or 'content'" });
  }

  try {
    const chatId = to.includes("@c.us") ? to : `${to}@c.us`;

    // ✅ Send via WhatsApp client
    await getClient().sendMessage(chatId, content);

    // ✅ Get tenant DB + models
    const conn = await getDbConnection(req.user.id);
    const { Message } = getTenantModels(conn);

    // ✅ Save to DB
    const out = await Message.create({
      from: "me",
      to: chatId,
      body: content,
      direction: "out",
      user: req.user.id,
    });

    // ✅ Emit only to this user
    req.app.get("io").to(req.user.id).emit("message:out", out);

    res.json({ ok: true, message: out });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ error: err.message || "Failed to send message" });
  }
});


module.exports = router;
