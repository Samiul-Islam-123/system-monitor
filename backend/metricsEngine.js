const HistoryBuffer = require("./historyBuffer");

const getSystem = require("./collectors/system");
const getCpu = require("./collectors/cpu");
const getMemory = require("./collectors/memory");
const getGpu = require("./collectors/gpu");
const getDisks = require("./collectors/disk");
const getNetwork = require("./collectors/network");
const getProcesses = require("./collectors/processes");
const getTemperatures = require("./collectors/temperature");

class MetricsEngine {
  constructor() {
    this.cpuHistory = new HistoryBuffer();
    this.memHistory = new HistoryBuffer();
    this.gpuHistory = new HistoryBuffer();
    this.current = null;
  }

  async collect() {
    const system = await getSystem();
    const cpu = await getCpu(this.cpuHistory);
    const memory = await getMemory(this.memHistory);
    const gpu = await getGpu(this.gpuHistory);
    const disks = await getDisks();
    const network = await getNetwork();
    const processes = await getProcesses();
    const temperatures = await getTemperatures();

    this.current = {
      ...system,
      cpu,
      memory,
      gpu,
      disks,
      network,
      processes,
      temperatures
    };
  }

  getCurrent() {
    return this.current;
  }
}

module.exports = MetricsEngine;