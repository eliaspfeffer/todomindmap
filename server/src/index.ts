import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Import routes
import authRoutes from "./routes/auth.js";
import mindMapRoutes from "./routes/mindmap.js";

// Import WebSocket handlers
import { setupMindMapHandlers } from "./websocket/mindmapHandlers.js";

// Initialize environment variables
dotenv.config();

// Create Express application
const app = express();
const server = http.createServer(app);

// Current file directory (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/mindmap", mindMapRoutes);

// Serve static client files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(join(__dirname, "../../client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(join(__dirname, "../../client/dist/index.html"));
  });
}

// Setup WebSocket Handlers
setupMindMapHandlers(io);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
