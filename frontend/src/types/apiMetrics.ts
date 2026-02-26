// Actual API response interfaces based on the real backend data structure

export interface ApiCpuMetrics {
  currentLoad: number;
  loadAvg: [number, number, number];
  model?: string;
  cores?: any[];
  uptime?: number;
  history?: { time: string; usage: number }[];
}

export interface ApiMemoryMetrics {
  used: number; // Likely in GB
  total: number; // Likely in GB
  free?: number;
  cached?: number;
  buffers?: number;
  swapTotal?: number;
  swapUsed?: number;
  history?: { time: string; used: number; cached: number }[];
}

export interface ApiNetworkMetrics {
  rxSpeed: number; // Bytes per second
  txSpeed: number; // Bytes per second
  rxTotal?: number;
  txTotal?: number;
  name?: string;
  ip?: string;
  history?: { time: string; rx: number; tx: number }[];
}

export interface ApiDiskMetrics {
  rIO: number; // Read I/O operations per second
  wIO: number; // Write I/O operations per second
  device?: string;
  mountPoint?: string;
  fsType?: string;
  total?: number;
  used?: number;
  readSpeed?: number;
  writeSpeed?: number;
}

export interface ApiTemperatureMetrics {
  main: number; // Main temperature in Celsius
  cores?: number[];
  gpu?: number;
}

export interface ApiProcessInfo {
  pid: number;
  name: string;
  user: string;
  cpu: number;
  mem: number; // Memory percentage
  memVsz?: number; // Virtual memory size
  memRss?: number; // Resident set size
  state: string;
  priority?: number;
  nice?: number;
  started?: string;
  command?: string;
  params?: string;
  path?: string;
  parentPid?: number;
  tty?: string;
}

export interface ApiGpuMetrics {
  name?: string;
  utilization?: number;
  memoryTotal?: number;
  memoryUsed?: number;
  temperature?: number;
  fanSpeed?: number;
  power?: number;
  history?: { time: string; utilization: number; temperature: number }[];
}

export interface ApiSystemMetrics {
  cpu: ApiCpuMetrics;
  memory: ApiMemoryMetrics;
  network: ApiNetworkMetrics;
  disks: ApiDiskMetrics;
  temperatures: ApiTemperatureMetrics;
  processes: ApiProcessInfo[];
  gpu: ApiGpuMetrics | null;
  hostname?: string;
  os?: string;
  kernel?: string;
  timestamp?: number;
}