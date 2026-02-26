// Mock data generators for system metrics

export interface CpuCore {
  id: number;
  usage: number;
  frequency: number; // MHz
  temperature: number; // °C
}

export interface CpuMetrics {
  overall: number;
  cores: CpuCore[];
  loadAvg: [number, number, number];
  uptime: number; // seconds
  model: string;
  history: { time: string; usage: number }[];
}

export interface MemoryMetrics {
  total: number; // GB
  used: number;
  free: number;
  cached: number;
  buffers: number;
  swapTotal: number;
  swapUsed: number;
  history: { time: string; used: number; cached: number }[];
}

export interface GpuMetrics {
  name: string;
  utilization: number;
  memoryTotal: number; // MB
  memoryUsed: number;
  temperature: number;
  fanSpeed: number;
  power: number; // W
  history: { time: string; utilization: number; temperature: number }[];
}

export interface DiskPartition {
  device: string;
  mountPoint: string;
  fsType: string;
  total: number; // GB
  used: number;
  readSpeed: number; // MB/s
  writeSpeed: number; // MB/s
}

export interface NetworkInterface {
  name: string;
  ip: string;
  rxSpeed: number; // MB/s
  txSpeed: number; // MB/s
  rxTotal: number; // GB
  txTotal: number; // GB
  history: { time: string; rx: number; tx: number }[];
}

export interface ProcessInfo {
  pid: number;
  name: string;
  user: string;
  cpu: number;
  memory: number;
  memoryMB: number;
  status: 'running' | 'sleeping' | 'stopped' | 'zombie';
  threads: number;
}

export interface TemperatureSensor {
  label: string;
  value: number;
  max: number;
  critical: number;
}

export interface SystemMetrics {
  hostname: string;
  os: string;
  kernel: string;
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  gpu: GpuMetrics;
  disks: DiskPartition[];
  network: NetworkInterface[];
  processes: ProcessInfo[];
  temperatures: TemperatureSensor[];
  timestamp: number;
}

const MAX_HISTORY = 60;

let historyStore: {
  cpu: { time: string; usage: number }[];
  memory: { time: string; used: number; cached: number }[];
  gpu: { time: string; utilization: number; temperature: number }[];
  network: { time: string; rx: number; tx: number }[];
} = {
  cpu: [],
  memory: [],
  gpu: [],
  network: [],
};

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max));
}

function timeStr(): string {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

function smoothValue(prev: number, target: number, factor = 0.3): number {
  return prev + (target - prev) * factor;
}

let prevCpuUsage = 35;
let prevGpuUtil = 20;
let prevMemUsed = 8.2;

export function generateMetrics(): SystemMetrics {
  const now = timeStr();

  // Smooth CPU
  const cpuTarget = rand(15, 85);
  prevCpuUsage = smoothValue(prevCpuUsage, cpuTarget, 0.2);
  const cpuOverall = Math.round(prevCpuUsage * 10) / 10;

  const cores: CpuCore[] = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    usage: Math.round(rand(Math.max(5, cpuOverall - 25), Math.min(100, cpuOverall + 25)) * 10) / 10,
    frequency: Math.round(rand(2400, 4800)),
    temperature: Math.round(rand(40, 78)),
  }));

  historyStore.cpu.push({ time: now, usage: cpuOverall });
  if (historyStore.cpu.length > MAX_HISTORY) historyStore.cpu.shift();

  // Smooth Memory
  const memTarget = rand(6, 13);
  prevMemUsed = smoothValue(prevMemUsed, memTarget, 0.15);
  const memUsed = Math.round(prevMemUsed * 10) / 10;
  const cached = Math.round(rand(1.5, 3.5) * 10) / 10;

  historyStore.memory.push({ time: now, used: memUsed, cached });
  if (historyStore.memory.length > MAX_HISTORY) historyStore.memory.shift();

  // Smooth GPU
  const gpuTarget = rand(5, 70);
  prevGpuUtil = smoothValue(prevGpuUtil, gpuTarget, 0.2);
  const gpuUtil = Math.round(prevGpuUtil * 10) / 10;
  const gpuTemp = Math.round(rand(35, 72));

  historyStore.gpu.push({ time: now, utilization: gpuUtil, temperature: gpuTemp });
  if (historyStore.gpu.length > MAX_HISTORY) historyStore.gpu.shift();

  // Network
  const rx = Math.round(rand(0.5, 45) * 10) / 10;
  const tx = Math.round(rand(0.2, 15) * 10) / 10;
  historyStore.network.push({ time: now, rx, tx });
  if (historyStore.network.length > MAX_HISTORY) historyStore.network.shift();

  const processNames = [
    'chrome', 'firefox', 'node', 'python3', 'docker', 'postgres', 'nginx',
    'systemd', 'Xorg', 'pulseaudio', 'gnome-shell', 'code', 'java', 'redis-server',
    'mongod', 'webpack', 'vite', 'electron', 'slack', 'spotify',
  ];

  const processes: ProcessInfo[] = processNames.map((name, i) => ({
    pid: randInt(1000, 65000),
    name,
    user: i < 3 ? 'root' : 'user',
    cpu: Math.round(rand(0, i < 5 ? 25 : 5) * 10) / 10,
    memory: Math.round(rand(0.1, i < 5 ? 8 : 2) * 10) / 10,
    memoryMB: randInt(10, 2000),
    status: (Math.random() > 0.1 ? 'running' : 'sleeping') as ProcessInfo['status'],
    threads: randInt(1, 64),
  })).sort((a, b) => b.cpu - a.cpu);

  return {
    hostname: 'srv-prod-01',
    os: 'Ubuntu 24.04.1 LTS',
    kernel: '6.8.0-45-generic',
    cpu: {
      overall: cpuOverall,
      cores,
      loadAvg: [
        Math.round(rand(0.5, 4) * 100) / 100,
        Math.round(rand(0.8, 3.5) * 100) / 100,
        Math.round(rand(1, 3) * 100) / 100,
      ],
      uptime: 864000 + randInt(0, 100000),
      model: 'AMD Ryzen 7 5800X (8C/16T)',
      history: [...historyStore.cpu],
    },
    memory: {
      total: 16,
      used: memUsed,
      free: Math.round((16 - memUsed - cached) * 10) / 10,
      cached,
      buffers: Math.round(rand(0.3, 0.8) * 10) / 10,
      swapTotal: 8,
      swapUsed: Math.round(rand(0.1, 1.5) * 10) / 10,
      history: [...historyStore.memory],
    },
    gpu: {
      name: 'NVIDIA GeForce RTX 3070',
      utilization: gpuUtil,
      memoryTotal: 8192,
      memoryUsed: randInt(512, 5000),
      temperature: gpuTemp,
      fanSpeed: randInt(25, 65),
      power: Math.round(rand(30, 220)),
      history: [...historyStore.gpu],
    },
    disks: [
      {
        device: '/dev/nvme0n1p2',
        mountPoint: '/',
        fsType: 'ext4',
        total: 512,
        used: Math.round(rand(180, 380)),
        readSpeed: Math.round(rand(10, 450) * 10) / 10,
        writeSpeed: Math.round(rand(5, 300) * 10) / 10,
      },
      {
        device: '/dev/sda1',
        mountPoint: '/home',
        fsType: 'ext4',
        total: 1000,
        used: Math.round(rand(300, 750)),
        readSpeed: Math.round(rand(5, 180) * 10) / 10,
        writeSpeed: Math.round(rand(2, 120) * 10) / 10,
      },
      {
        device: '/dev/sdb1',
        mountPoint: '/data',
        fsType: 'xfs',
        total: 2000,
        used: Math.round(rand(400, 1600)),
        readSpeed: Math.round(rand(5, 200) * 10) / 10,
        writeSpeed: Math.round(rand(2, 150) * 10) / 10,
      },
    ],
    network: [
      {
        name: 'eth0',
        ip: '192.168.1.100',
        rxSpeed: rx,
        txSpeed: tx,
        rxTotal: Math.round(rand(50, 500) * 10) / 10,
        txTotal: Math.round(rand(20, 200) * 10) / 10,
        history: [...historyStore.network],
      },
    ],
    processes,
    temperatures: [
      { label: 'CPU Package', value: Math.round(rand(42, 75)), max: 95, critical: 100 },
      { label: 'CPU Core 0', value: Math.round(rand(40, 72)), max: 95, critical: 100 },
      { label: 'CPU Core 1', value: Math.round(rand(40, 72)), max: 95, critical: 100 },
      { label: 'GPU', value: gpuTemp, max: 83, critical: 90 },
      { label: 'NVMe SSD', value: Math.round(rand(32, 55)), max: 70, critical: 75 },
      { label: 'Motherboard', value: Math.round(rand(28, 42)), max: 60, critical: 70 },
    ],
    timestamp: Date.now(),
  };
}

export function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

export function formatBytes(gb: number): string {
  if (gb >= 1000) return `${(gb / 1000).toFixed(1)} TB`;
  return `${gb.toFixed(1)} GB`;
}
