const { Server } = require("socket.io");

module.exports = function (server, engine) {
  const io = new Server(server, { 
    cors: { 
      origin: ["http://localhost:8080", "http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true
    } 
  });

  io.on("connection", socket => {
    socket.on("request_metrics", () => {
      socket.emit("metrics_update", engine.getCurrent());
    });

    socket.on("subscribe_live", interval => {
      const map = {
        live: 1000,
        "5s": 5000,
        "10s": 10000,
        "1m": 60000,
        "10m": 600000
      };

      const ms = map[interval] || 1000;

      const timer = setInterval(async () => {
        await engine.collect();
        socket.emit("metrics_update", engine.getCurrent());
      }, ms);

      socket.on("disconnect", () => clearInterval(timer));
    });
  });
};