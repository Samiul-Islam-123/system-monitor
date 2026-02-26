const si = require("systeminformation");

async function getDisks() {
  const disks = await si.fsSize();
  const io = await si.disksIO();

  return disks.map(d => ({
    device: d.fs,
    mountPoint: d.mount,
    fsType: d.type,
    total: +(d.size / 1e9).toFixed(2),
    used: +(d.used / 1e9).toFixed(2),
    readSpeed: +(io.rIO_sec / 1e6).toFixed(2),
    writeSpeed: +(io.wIO_sec / 1e6).toFixed(2)
  }));
}

module.exports = getDisks;