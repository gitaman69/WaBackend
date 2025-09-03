const { Schema } = require("mongoose");

const messageSchema = new Schema({
  messageId: String,
  from: String,
  to: String,
  body: String,
  direction: String,
  replied: { type: Boolean, default: false },
  metadata: Object,
}, { timestamps: true });

// ✅ Rule Schema updated
const ruleSchema = new Schema({
  keyword: { type: String, required: true, trim: true },
  response: { type: String, required: true, trim: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

function getTenantModels(conn) {
  return {
    Message: conn.model("Message", messageSchema),
    Rule: conn.model("Rule", ruleSchema),
  };
}

module.exports = { getTenantModels };
