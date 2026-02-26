const si = require("systeminformation");
const os = require("os");

async function getCpu(historyBuffer) {
  const load = await si.currentLoad();
  const cpuData = await si.cpu();
  const cpuSpeed = await si.cpuCurrentSpeed();
  const temp = await si.cpuTemperature();

  const timeStr = new Date().toLocaleTimeString("en-GB", { hour12: false });

  historyBuffer.add({
    time: timeStr,
    usage: Number(load.currentLoad.toFixed(1))
  });

  const cores = load.cpus.map((c, i) => ({
    id: i,
    usage: Number(c.load.toFixed(1)),
    frequency: Number(cpuSpeed.cores[i]?.toFixed(0) || 0),
    temperature: temp.cores[i] || temp.main || 0
  }));

  return {
    overall: Number(load.currentLoad.toFixed(1)),
    cores,
    loadAvg: os.loadavg(),
    uptime: os.uptime(),
    model: `${cpuData.manufacturer} ${cpuData.brand}`,
    history: historyBuffer.get()
  };
}

module.exports = getCpu;