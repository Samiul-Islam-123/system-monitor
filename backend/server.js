require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");   // ← ADD THIS
const { Server } = require("socket.io");
const MetricsEngine = require("./metricsEngine");

const app = express();
const server = http.createServer(app);

// ✅ ENABLE CORS FOR EXPRESS (THIS WAS MISSING)
app.use(
  cors({
    origin: ["http://localhost:8080", "http://localhost:3000", "http://localhost:8081"],
    methods: ["GET", "POST"],
    credentials: true
  })
);

// If you have JSON routes
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:8080", "http://localhost:3000", "http://localhost:8081"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const engine = new MetricsEngine(io);
engine.start();

// Example route (make sure this exists)
app.get("/api/metrics/current", (req, res) => {
  res.json(engine.getCurrent());
});

server.listen(5000, () => {
  console.log("Optimized monitoring server running on port 5000");
});