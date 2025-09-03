const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { generateReply } = require("../services/llm"); // Gemini integration
const { getDbConnection } = require("../db/multiTenant");
const { getTenantModels } = require("../models/tenantModels");

// ✅ Require authentication for all message routes
router.use(authMiddleware)

// ✅ Middleware: inject tenant models per user
router.use(async (req, res, next) => {
  try {
    // Prefer auth middleware, fallback to header
    const userId = req.user?.userId || req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: userId missing" });
    }

    const conn = await getDbConnection(userId);
    req.models = getTenantModels(conn);
    next();
  } catch (err) {
    console.error("DB connection error:", err.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// ✅ Get all messages
router.get("/", async (req, res) => {
  try {
    const { Message } = req.models;
    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(messages);
  } catch (err) {
    console.error("Fetch messages error:", err.message);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// ✅ Get a single message by ID
router.get("/:id", async (req, res) => {
  try {
    const { Message } = req.models;
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: "Message not found" });
    res.json(msg);
  } catch (err) {
    console.error("Fetch single message error:", err.message);
    res.status(500).json({ error: "Error fetching message", details: err.message });
  }
});

// ✅ Send a message and generate Gemini reply
router.post("/send", async (req, res) => {
  try {
    const { Message } = req.models;
    const { to, body } = req.body;

    if (!to || !body) {
      return res.status(400).json({ error: "To and body are required" });
    }

    // Save inbound message
    const inbound = await Message.create({
      messageId: Date.now().toString(),
      from: to,
      to: "me",
      body,
      direction: "in",
    });

    // Generate reply using Gemini
    const replyText = await generateReply(body);

    // Save outbound message
    const outbound = await Message.create({
      messageId: Date.now().toString(),
      from: "me",
      to,
      body: replyText,
      direction: "out",
      replied: true,
    });

    res.json({ inbound, outbound });
  } catch (err) {
    console.error("Send message error:", err.message);
    res.status(500).json({ error: "Failed to send message", details: err.message });
  }
});

// ✅ Delete a message
router.delete("/:id", async (req, res) => {
  try {
    const { Message } = req.models;
    const deleted = await Message.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Message not found" });
    res.json({ success: true, deleted });
  } catch (err) {
    console.error("Delete message error:", err.message);
    res.status(500).json({ error: "Error deleting message" });
  }
});

module.exports = router;
