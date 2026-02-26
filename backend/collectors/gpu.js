const si = require("systeminformation");

async function getGpu(historyBuffer) {
  const graphics = await si.graphics();
  const timeStr = new Date().toLocaleTimeString("en-GB", { hour12: false });

  if (!graphics.controllers.length) return null;

  const g = graphics.controllers[0];

  historyBuffer.add({
    time: timeStr,
    utilization: g.utilizationGpu || 0,
    temperature: g.temperatureGpu || 0
  });

  return {
    name: g.model,
    utilization: g.utilizationGpu || 0,
    memoryTotal: g.memoryTotal || 0,
    memoryUsed: g.memoryUsed || 0,
    temperature: g.temperatureGpu || 0,
    fanSpeed: g.fanSpeed || 0,
    power: g.powerDraw || 0,
    history: historyBuffer.get()
  };
}

module.exports = getGpu;