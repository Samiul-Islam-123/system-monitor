const si = require("systeminformation");
const os = require("os");
const getGPU = require("./collectors/gpu");

class MetricsEngine {
  constructor(io) {
    this.io = io;

    // ✅ ALWAYS SAFE DEFAULTS
    this.fastCache = {
      cpu: 0,
      memoryUsed: 0,
      memoryTotal: 0,
      rxSpeed: 0,
      txSpeed: 0,
      loadAvg: [0, 0, 0]
    };

    this.mediumCache = {
      diskIO: { rIO: 0, wIO: 0 },
      temperature: 0
    };

    this.slowCache = {
      processes: [],
      gpu: null
    };

    this.lastMediumRun = 0;
    this.lastSlowRun = 0;
    this.prevNetwork = null;
  }

  async start() {
    // Run once immediately so REST has data
    await this.collectFast();
    await this.collectMedium();
    await this.collectSlow();

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
    try {
      const [cpu, mem, network] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.networkStats()
      ]);

      const net = network?.[0];

      let rxSpeed = 0;
      let txSpeed = 0;

      if (net && this.prevNetwork) {
        rxSpeed = net.rx_bytes - this.prevNetwork.rx_bytes;
        txSpeed = net.tx_bytes - this.prevNetwork.tx_bytes;
      }

      this.prevNetwork = net || null;

      this.fastCache = {
        cpu: cpu?.currentLoad || 0,
        memoryUsed: mem ? mem.used / 1024 / 1024 / 1024 : 0,
        memoryTotal: mem ? mem.total / 1024 / 1024 / 1024 : 0,
        rxSpeed,
        txSpeed,
        loadAvg: os.loadavg() || [0, 0, 0]
      };

      this.io.emit("fast_metrics", this.fastCache);
    } catch (err) {
      console.error("Fast metrics error:", err.message);
    }
  }

  // =========================
  // MEDIUM (Every 5 seconds)
  // =========================
  async collectMedium() {
    const now = Date.now();
    if (now - this.lastMediumRun < 5000) return;

    try {
      const [diskIO, temp] = await Promise.all([
        si.disksIO().catch(() => null),
        si.cpuTemperature().catch(() => null)
      ]);

      this.mediumCache = {
        diskIO: {
          rIO: diskIO?.rIO_sec || 0,
          wIO: diskIO?.wIO_sec || 0
        },
        temperature: temp?.main || 0
      };

      this.lastMediumRun = now;
      this.io.emit("medium_metrics", this.mediumCache);
    } catch (err) {
      console.error("Medium metrics error:", err.message);
    }
  }

  // =========================
  // SLOW (Every 20 seconds)
  // =========================
  async collectSlow() {
    const now = Date.now();
    if (now - this.lastSlowRun < 20000) return;

    try {
      const [processes, gpu] = await Promise.all([
        si.processes().catch(() => null),
        getGPU().catch(() => null)
      ]);

      this.slowCache = {
        processes: processes?.list
          ? processes.list
              .sort((a, b) => b.cpu - a.cpu)
              .slice(0, 10)
          : [],
        gpu: gpu || null
      };

      this.lastSlowRun = now;
      this.io.emit("slow_metrics", this.slowCache);
    } catch (err) {
      console.error("Slow metrics error:", err.message);
    }
  }

  // ✅ REST SAFE
  getCurrent() {
    return {
      fast: this.fastCache,
      medium: this.mediumCache,
      slow: this.slowCache
    };
  }
}

module.exports = MetricsEngine;