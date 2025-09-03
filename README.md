# 🛠️ WhatsApp AI Bot - Backend

The **backend service** for our WhatsApp AI Bot Platform 🤖.  
Built with **Node.js** 🟢 and **Express.js**, it handles **authentication, WhatsApp Web client management, real-time communication (WebSocket), AI-powered responses, and per-user MongoDB databases**.

---

## ✨ Features

- 🔒 **JWT Authentication Middleware** – Secure APIs
- 💬 **WhatsApp Web Integration** – Manage sessions with `whatsapp-web.js`
- 📡 **Real-time WebSocket (Socket.IO)** – Live messaging + status updates
- 🗄️ **Per-user MongoDB Databases** – Isolated storage for messages
- ⚙️ **Reconnect & Logout APIs** – Manage WhatsApp sessions
- 🤖 **AI Response Support** – Gemini API integration for smart replies
- 🛠️ **Scalable Architecture** – Multiple users, separate sessions, secure handling

---

## 🛠️ Tech Stack

### Core
- 🟢 **Node.js** – Backend runtime
- 🚀 **Express.js** – Web framework
- 🗄️ **MongoDB Atlas** – Cloud database (per-user DBs)
- 📝 **Mongoose** – ODM for MongoDB

### WhatsApp Automation
- 📱 **whatsapp-web.js** – WhatsApp client integration
- 🖥️ **Puppeteer** – Chrome automation under the hood

### Real-time Communication
- 📡 **Socket.IO** – WebSockets for instant events

### Authentication & Security
- 🔑 **JWT** – Authentication
- 🛡️ **CORS + dotenv** – Secure configuration

### AI Integration
- 🤖 **Google Gemini API** – Smart message replies *(optional)*

---

