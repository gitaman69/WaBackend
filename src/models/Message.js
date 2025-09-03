const express = require("express");
const auth = require("../middleware/auth");
const { getDbConnection } = require("../db/multiTenant");
const { getTenantModels } = require("../models/tenantModels");

const router = express.Router();

// Get all messages for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const conn = await getDbConnection(req.user.userId);
    const { Message } = getTenantModels(conn);
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
