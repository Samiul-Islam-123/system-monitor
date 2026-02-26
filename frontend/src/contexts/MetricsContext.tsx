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

// =========================
// TYPES
// =========================
interface FastMetrics {
  cpu: number;
  memoryUsed: number;
  memoryTotal: number;
  rxSpeed: number;
  txSpeed: number;
  loadAvg: number[];
}

interface MediumMetrics {
  diskIO: {
    rIO: number;
    wIO: number;
  } | null;
  temperature: number | null;
}

interface SlowMetrics {
  processes: any[];
  gpu: any[] | null;
}

interface SystemMetrics {
  fast: FastMetrics;
  medium: MediumMetrics;
  slow: SlowMetrics;

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

// =========================
// SAFE DEFAULT STATE
// =========================
const defaultMetrics: SystemMetrics = {
  fast: {
    cpu: 0,
    memoryUsed: 0,
    memoryTotal: 0,
    rxSpeed: 0,
    txSpeed: 0,
    loadAvg: [0, 0, 0]
  },
  medium: {
    diskIO: null,
    temperature: null
  },
  slow: {
    processes: [],
    gpu: null
  },
  cpuHistory: [],
  memoryHistory: [],
  rxHistory: [],
  txHistory: []
};

// =========================
// PROVIDER
// =========================
export function MetricsProvider({ children }: { children: React.ReactNode }) {
  const [metrics, setMetrics] = useState<SystemMetrics>(defaultMetrics);
  const [refreshMode, setRefreshMode] = useState<RefreshMode>("live");
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // =========================
  // FAST METRICS (LIVE)
  // =========================
  const handleFastMetrics = useCallback((data: Partial<FastMetrics>) => {
    setMetrics(prev => ({
      ...prev,
      fast: {
        cpu: data?.cpu ?? 0,
        memoryUsed: data?.memoryUsed ?? 0,
        memoryTotal: data?.memoryTotal ?? 0,
        rxSpeed: data?.rxSpeed ?? 0,
        txSpeed: data?.txSpeed ?? 0,
        loadAvg: data?.loadAvg ?? [0, 0, 0]
      },
      cpuHistory: [...prev.cpuHistory, data?.cpu ?? 0].slice(-60),
      memoryHistory: [...prev.memoryHistory, data?.memoryUsed ?? 0].slice(-60),
      rxHistory: [...prev.rxHistory, data?.rxSpeed ?? 0].slice(-60),
      txHistory: [...prev.txHistory, data?.txSpeed ?? 0].slice(-60)
    }));

    setLastUpdated(new Date());
  }, []);

  // =========================
  // MEDIUM METRICS
  // =========================
  const handleMediumMetrics = useCallback((data: Partial<MediumMetrics>) => {
    setMetrics(prev => ({
      ...prev,
      medium: {
        diskIO: data?.diskIO ?? null,
        temperature: data?.temperature ?? null
      }
    }));
  }, []);

  // =========================
  // SLOW METRICS
  // =========================
  const handleSlowMetrics = useCallback((data: Partial<SlowMetrics>) => {
    setMetrics(prev => ({
      ...prev,
      slow: {
        processes: Array.isArray(data?.processes)
          ? data!.processes
          : [],
        gpu: Array.isArray(data?.gpu)
          ? data!.gpu
          : null
      }
    }));
  }, []);

  // =========================
  // INITIAL FETCH (SAFE)
  // =========================
  const fetchInitial = useCallback(async () => {
    try {
      const data = await apiService.getCurrentMetrics();

      setMetrics(prev => ({
        ...prev,
        fast: {
          cpu: data?.fast?.cpu ?? prev.fast.cpu,
          memoryUsed: data?.fast?.memoryUsed ?? prev.fast.memoryUsed,
          memoryTotal: data?.fast?.memoryTotal ?? prev.fast.memoryTotal,
          rxSpeed: data?.fast?.rxSpeed ?? prev.fast.rxSpeed,
          txSpeed: data?.fast?.txSpeed ?? prev.fast.txSpeed,
          loadAvg: data?.fast?.loadAvg ?? prev.fast.loadAvg
        },
        medium: {
          diskIO: data?.medium?.diskIO ?? null,
          temperature: data?.medium?.temperature ?? null
        },
        slow: {
          processes: Array.isArray(data?.slow?.processes)
            ? data.slow.processes
            : [],
          gpu: Array.isArray(data?.slow?.gpu)
            ? data.slow.gpu
            : null
        }
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
  // REFRESH MODE HANDLING
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