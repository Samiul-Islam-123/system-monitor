require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const MetricsEngine = require("./metricsEngine");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:8080", "http://localhost:3000", "http://localhost:8081"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const engine = new MetricsEngine(io);
engine.start();

server.listen(5000, () => {
  console.log("Optimized monitoring server running on port 5000");
});