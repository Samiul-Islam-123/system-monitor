require("dotenv").config();
const express = require("express");
const http = require("http");

const MetricsEngine = require("./metricsEngine");
const setupSocket = require("./socket");

const app = express();
const server = http.createServer(app);

const engine = new MetricsEngine();

app.get("/api/metrics/current", async (req, res) => {
  await engine.collect();
  res.json(engine.getCurrent());
});

app.get("/api/metrics/history", async (req, res) => {
  await engine.collect();
  res.json(engine.getCurrent());
});

setupSocket(server, engine);

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});