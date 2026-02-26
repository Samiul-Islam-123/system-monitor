require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");

const MetricsEngine = require("./metricsEngine");
const setupSocket = require("./socket");

const app = express();
const server = http.createServer(app);

// Enable CORS for frontend running on port 8080
app.use(cors({
  origin: ["http://localhost:8080", "http://localhost:3000", "http://localhost:8081"],
  credentials: true
}));

const engine = new MetricsEngine();

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("/api/metrics/current", async (req, res) => {
  await engine.collect();
  res.json(engine.getCurrent());
});

app.get("/api/metrics/history", async (req, res) => {
  await engine.collect();
  res.json(engine.getCurrent());
});

// Serve frontend for all other routes (SPA support)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

setupSocket(server, engine);

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});