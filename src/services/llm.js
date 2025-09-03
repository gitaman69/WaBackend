import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDbConnection } from "../db/multiTenant.js";
import { getTenantModels } from "../models/tenantModels.js";

// ✅ Initialize Gemini client
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateReply(tenantId, waUserId, newMessage) {
  try {
    // ✅ Get tenant DB connection
    const conn = await getDbConnection(tenantId);

    // ✅ Get tenant-specific models
    const { Message } = getTenantModels(conn);

    // ✅ Fetch last 10 messages for context
    const lastMessages = await Message.find({
      $or: [{ from: waUserId }, { to: waUserId }],
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // ✅ Build conversation history
    const conversation = lastMessages.reverse().map((m) =>
      m.direction === "in"
        ? { role: "user", parts: [{ text: m.body }] }
        : { role: "model", parts: [{ text: m.body }] }
    );

    // ✅ Add the new incoming message
    conversation.push({ role: "user", parts: [{ text: newMessage }] });

    console.log("📝 Gemini conversation input:", JSON.stringify(conversation, null, 2));

    // ✅ Get model instance
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    // ✅ Generate content
    const result = await model.generateContent({ contents: conversation });

    // ✅ Extract reply safely
    const reply =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No reply generated";

    console.log("💬 Gemini generated reply:", reply);

    return reply;
  } catch (err) {
    console.error("❌ Gemini API error:", err.message || err);
    return "⚠️ Sorry, I couldn't generate a reply right now.";
  }
}

export { generateReply };
