import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from "react";
import { socketService } from "@/services/socketService";
import { apiService } from "@/services/apiService";

export type RefreshMode = "5s" | "10s" | "1m" | "10m" | "live";

interface SystemMetrics {
  cpu: { overall: number; loadAvg: number[] };
  memory: { used: number; total: number };
  network: { rx_sec: number; tx_sec: number }[];
  disks: { rIO: number; wIO: number }[];
  temperature: { main: number }[];
  processes: any[];
  gpu: any[];

  cpuHistory: number[];
  memoryHistory: number[];
  rxHistory: number[];
  txHistory: number[];
}

interface MetricsContextType {
  metrics: SystemMetrics;
  refreshMode: RefreshMode;
  setRefreshMode: (mode: RefreshMode) => void;
  isConnected: boolean;
  lastUpdated: Date | null;
  error: string | null;
}

const MetricsContext = createContext<MetricsContextType | null>(null);

const INTERVAL_MAP: Record<Exclude<RefreshMode, "live">, number> = {
  "5s": 5000,
  "10s": 10000,
  "1m": 60000,
  "10m": 600000
};

const defaultMetrics: SystemMetrics = {
  cpu: { overall: 0, loadAvg: [0, 0, 0] },
  memory: { used: 0, total: 0 },
  network: [{ rx_sec: 0, tx_sec: 0 }],
  disks: [],
  temperature: [],
  processes: [],
  gpu: [],
  cpuHistory: [],
  memoryHistory: [],
  rxHistory: [],
  txHistory: []
};

// 🔥 Adapter Function
function adaptBackendData(data: any): Partial<SystemMetrics> {
  return {
    cpu: {
      overall: data?.fast?.cpu ?? 0,
      loadAvg: data?.fast?.loadAvg ?? [0, 0, 0]
    },

    memory: {
      used: data?.fast?.memoryUsed ?? 0,
      total: data?.fast?.memoryTotal ?? 0
    },

    network: [
      {
        rx_sec: data?.fast?.rxSpeed ?? 0,
        tx_sec: data?.fast?.txSpeed ?? 0
      }
    ],

    disks: data?.medium?.diskIO
      ? [
          {
            rIO: data.medium.diskIO.rIO ?? 0,
            wIO: data.medium.diskIO.wIO ?? 0
          }
        ]
      : [],

    temperature:
      data?.medium?.temperature !== null &&
      data?.medium?.temperature !== undefined
        ? [{ main: data.medium.temperature }]
        : [],

    processes: Array.isArray(data?.slow?.processes)
      ? data.slow.processes
      : [],

    gpu: Array.isArray(data?.slow?.gpu) ? data.slow.gpu : []
  };
}

export function MetricsProvider({ children }: { children: React.ReactNode }) {
  const [metrics, setMetrics] = useState<SystemMetrics>(defaultMetrics);
  const [refreshMode, setRefreshMode] = useState<RefreshMode>("live");
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // =========================
  // SOCKET HANDLERS
  // =========================
  const handleFastMetrics = useCallback((data: any) => {
    const adapted = adaptBackendData({ fast: data });

    setMetrics(prev => ({
      ...prev,
      ...adapted,
      cpuHistory: [...prev.cpuHistory, adapted.cpu?.overall ?? 0].slice(-60),
      memoryHistory: [...prev.memoryHistory, adapted.memory?.used ?? 0].slice(-60),
      rxHistory: [...prev.rxHistory, adapted.network?.[0]?.rx_sec ?? 0].slice(-60),
      txHistory: [...prev.txHistory, adapted.network?.[0]?.tx_sec ?? 0].slice(-60)
    }));

    setLastUpdated(new Date());
  }, []);

  const handleMediumMetrics = useCallback((data: any) => {
    const adapted = adaptBackendData({ medium: data });

    setMetrics(prev => ({
      ...prev,
      ...adapted
    }));
  }, []);

  const handleSlowMetrics = useCallback((data: any) => {
    const adapted = adaptBackendData({ slow: data });

    setMetrics(prev => ({
      ...prev,
      ...adapted
    }));
  }, []);

  // =========================
  // INITIAL FETCH
  // =========================
  const fetchInitial = useCallback(async () => {
    try {
      const data = await apiService.getCurrentMetrics();
      const adapted = adaptBackendData(data);

      setMetrics(prev => ({
        ...prev,
        ...adapted
      }));

      setLastUpdated(new Date());
      setError(null);
    } catch {
      setError("Failed to fetch initial metrics");
    }
  }, []);

  // =========================
  // SOCKET CONNECTION
  // =========================
  useEffect(() => {
    socketService.connect(
      () => {
        setIsConnected(true);
        setError(null);
      },
      () => setIsConnected(false),
      () => {
        setIsConnected(false);
        setError("Socket connection error");
      }
    );

    fetchInitial();

    return () => {
      socketService.disconnect();
    };
  }, [fetchInitial]);

  // =========================
  // REFRESH MODE
  // =========================
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (refreshMode === "live") {
      socketService.on?.("fast_metrics", handleFastMetrics);
      socketService.on?.("medium_metrics", handleMediumMetrics);
      socketService.on?.("slow_metrics", handleSlowMetrics);
    } else {
      socketService.off?.("fast_metrics");
      socketService.off?.("medium_metrics");
      socketService.off?.("slow_metrics");

      const interval = INTERVAL_MAP[refreshMode];
      intervalRef.current = setInterval(fetchInitial, interval);
    }

    return () => {
      socketService.off?.("fast_metrics");
      socketService.off?.("medium_metrics");
      socketService.off?.("slow_metrics");
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [
    refreshMode,
    handleFastMetrics,
    handleMediumMetrics,
    handleSlowMetrics,
    fetchInitial
  ]);

  return (
    <MetricsContext.Provider
      value={{
        metrics,
        refreshMode,
        setRefreshMode,
        isConnected,
        lastUpdated,
        error
      }}
    >
      {children}
    </MetricsContext.Provider>
  );
}

export function useMetrics() {
  const ctx = useContext(MetricsContext);
  if (!ctx) throw new Error("useMetrics must be used within MetricsProvider");
  return ctx;
}