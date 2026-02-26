const si = require("systeminformation");
const HistoryBuffer = require("../historyBuffer");

const historyMap = {};

async function getNetwork() {
  const stats = await si.networkStats();
  const interfaces = await si.networkInterfaces();
  const timeStr = new Date().toLocaleTimeString("en-GB", { hour12: false });

  return stats.map(s => {
    const iface = interfaces.find(i => i.iface === s.iface);

    if (!historyMap[s.iface])
      historyMap[s.iface] = new HistoryBuffer();

    historyMap[s.iface].add({
      time: timeStr,
      rx: +(s.rx_sec / 1e6).toFixed(2),
      tx: +(s.tx_sec / 1e6).toFixed(2)
    });

    return {
      name: s.iface,
      ip: iface?.ip4 || "",
      rxSpeed: +(s.rx_sec / 1e6).toFixed(2),
      txSpeed: +(s.tx_sec / 1e6).toFixed(2),
      rxTotal: +(s.rx_bytes / 1e9).toFixed(2),
      txTotal: +(s.tx_bytes / 1e9).toFixed(2),
      history: historyMap[s.iface].get()
    };
  });
}

module.exports = getNetwork;