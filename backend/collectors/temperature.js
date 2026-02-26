const si = require("systeminformation");

async function getTemperatures() {
  const temp = await si.cpuTemperature();

  return [
    {
      label: "CPU Package",
      value: temp.main || 0,
      max: 95,
      critical: 100
    }
  ];
}

module.exports = getTemperatures;