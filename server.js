require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const messagesRoute = require("./src/routes/messages");
const whatsappRoute = require("./src/routes/whatsapp");
const authRoute = require("./src/routes/auth"); // ✅ import auth route
const { initWA } = require("./src/services/waClient");

const app = express();
const server = http.createServer(app);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to Auth DB"))
.catch(err => console.error("❌ Mongo connect failed:", err));

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoute);       // ✅ mount auth route
app.use("/api/messages", messagesRoute);
app.use("/api/whatsapp", whatsappRoute);

// Socket.IO
const io = new Server(server, {
  cors: { origin: process.env.SOCKET_ORIGIN || "*" },
});
app.set("io", io);

io.on("connection", (socket) => {
  console.log("🔌 Socket connected", socket.id);

  const { userId } = socket.handshake.query;
  if (userId) {
    socket.join(userId);
    initWA(io, userId); // start WA session for this user
  }
});


// Init WhatsApp client
try {
  initWA(io);
} catch (err) {
  console.error("❌ WhatsApp client init failed:", err);
}

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () =>
  console.log(`🚀 Backend listening on port ${PORT}`)
);
