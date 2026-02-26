const si = require("systeminformation");

async function getMemory(historyBuffer) {
  const mem = await si.mem();
  const timeStr = new Date().toLocaleTimeString("en-GB", { hour12: false });

  historyBuffer.add({
    time: timeStr,
    used: +(mem.used / 1e9).toFixed(2),
    cached: +(mem.cached / 1e9).toFixed(2)
  });

  return {
    total: +(mem.total / 1e9).toFixed(2),
    used: +(mem.used / 1e9).toFixed(2),
    free: +(mem.free / 1e9).toFixed(2),
    cached: +(mem.cached / 1e9).toFixed(2),
    buffers: +(mem.buffcache / 1e9).toFixed(2),
    swapTotal: +(mem.swaptotal / 1e9).toFixed(2),
    swapUsed: +(mem.swapused / 1e9).toFixed(2),
    history: historyBuffer.get()
  };
}

module.exports = getMemory;