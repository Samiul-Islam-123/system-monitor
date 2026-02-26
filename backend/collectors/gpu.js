const { exec } = require("child_process");

function parseNvidiaSmi(output) {
  const lines = output.trim().split("\n");
  return lines.map(line => {
    const [
      name,
      utilization,
      memoryUsed,
      memoryTotal,
      temperature
    ] = line.split(",").map(v => v.trim());

    return {
      name,
      utilization: parseFloat(utilization),
      memoryUsed: parseFloat(memoryUsed),
      memoryTotal: parseFloat(memoryTotal),
      temperature: parseFloat(temperature)
    };
  });
}

async function getGPU() {
  return new Promise((resolve) => {
    exec(
      `nvidia-smi --query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits`,
      (error, stdout) => {
        if (error) {
          return resolve(null); // no GPU
        }

        const gpus = parseNvidiaSmi(stdout);
        resolve(gpus);
      }
    );
  });
}

module.exports =  getGPU ;