const os = require("os");

async function getSystemInfo() {
  return {
    hostname: os.hostname(),
    os: `${os.type()} ${os.release()}`,
    kernel: os.release(),
    timestamp: Date.now()
  };
}

module.exports = getSystemInfo;