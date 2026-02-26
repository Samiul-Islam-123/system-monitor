const si = require("systeminformation");
const os = require("os");
const { getGPU } = require("./collectors/gpu");

class MetricsEngine {
  constructor(io) {
    this.io = io;

    this.mediumCache = {};
    this.slowCache = {};

    this.lastMediumRun = 0;
    this.lastSlowRun = 0;

    this.prevNetwork = null;
  }

  async start() {
    this.loop();
  }

  async loop() {
    const start = Date.now();

    await this.collectFast();
    await this.collectMedium();
    await this.collectSlow();

    const elapsed = Date.now() - start;
    const delay = Math.max(0, 1000 - elapsed);

    setTimeout(() => this.loop(), delay);
  }

  // =========================
  // FAST (Every 1 second)
  // =========================
  async collectFast() {
    const [cpu, mem, network] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.networkStats()
    ]);

    const net = network[0];

    let rxSpeed = 0;
    let txSpeed = 0;

    if (this.prevNetwork) {
      rxSpeed = net.rx_bytes - this.prevNetwork.rx_bytes;
      txSpeed = net.tx_bytes - this.prevNetwork.tx_bytes;
    }

    this.prevNetwork = net;

    this.io.emit("fast_metrics", {
      cpu: cpu.currentLoad,
      memoryUsed: mem.used / 1024 / 1024 / 1024,
      memoryTotal: mem.total / 1024 / 1024 / 1024,
      rxSpeed,
      txSpeed,
      loadAvg: os.loadavg()
    });
  }

  // =========================
  // MEDIUM (Every 5 seconds)
  // =========================
  async collectMedium() {
    const now = Date.now();
    if (now - this.lastMediumRun < 5000) return;

    const [diskIO, temp] = await Promise.all([
      si.disksIO().catch(() => null),
      si.cpuTemperature().catch(() => null)
    ]);

    this.mediumCache = {
      diskIO: diskIO
        ? {
            rIO: diskIO.rIO_sec,
            wIO: diskIO.wIO_sec
          }
        : null,
      temperature: temp ? temp.main : null
    };

    this.lastMediumRun = now;

    this.io.emit("medium_metrics", this.mediumCache);
  }

  // =========================
  // SLOW (Every 20 seconds)
  // =========================
  async collectSlow() {
    const now = Date.now();
    if (now - this.lastSlowRun < 20000) return;

    const [processes, gpu] = await Promise.all([
      si.processes().catch(() => null),
      getGPU().catch(() => null)
    ]);

    this.slowCache = {
      processes: processes
        ? processes.list
            .sort((a, b) => b.cpu - a.cpu)
            .slice(0, 10)
        : null,
      gpu
    };

    this.lastSlowRun = now;

    this.io.emit("slow_metrics", this.slowCache);
  }
}

module.exports = MetricsEngine;