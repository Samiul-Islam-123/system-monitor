const si = require("systeminformation");

async function getProcesses() {
  const proc = await si.processes();

  return proc.list
    .sort((a, b) => b.cpu - a.cpu)
    .slice(0, 20)
    .map(p => ({
      pid: p.pid,
      name: p.name,
      user: p.user,
      cpu: +p.cpu.toFixed(1),
      memory: +p.mem.toFixed(1),
      memoryMB: +(p.memRss / 1e6).toFixed(0),
      status: p.state,
      threads: p.threads
    }));
}

module.exports = getProcesses;