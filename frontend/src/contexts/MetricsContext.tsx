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

export function MetricsProvider({ children }: { children: React.ReactNode }) {
  const [metrics, setMetrics] = useState<SystemMetrics>(defaultMetrics);
  const [refreshMode, setRefreshMode] = useState<RefreshMode>("live");
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // =========================
  // FAST METRICS
  // =========================
  const handleFastMetrics = useCallback((data: FastMetrics) => {
    setMetrics(prev => ({
      ...prev,
      fast: data,
      cpuHistory: [...prev.cpuHistory, data.cpu].slice(-60),
      memoryHistory: [...prev.memoryHistory, data.memoryUsed].slice(-60),
      rxHistory: [...prev.rxHistory, data.rxSpeed].slice(-60),
      txHistory: [...prev.txHistory, data.txSpeed].slice(-60)
    }));

    setLastUpdated(new Date());
  }, []);

  // =========================
  // MEDIUM METRICS
  // =========================
  const handleMediumMetrics = useCallback((data: MediumMetrics) => {
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
  const handleSlowMetrics = useCallback((data: SlowMetrics) => {
    setMetrics(prev => ({
      ...prev,
      slow: {
        processes: data?.processes ?? [],
        gpu: data?.gpu ?? null
      }
    }));
  }, []);

  // =========================
  // INITIAL FETCH
  // =========================
  const fetchInitial = useCallback(async () => {
    try {
      const data = await apiService.getCurrentMetrics();

      setMetrics(prev => ({
        ...prev,
        fast: data?.fast ?? prev.fast,
        medium: data?.medium ?? prev.medium,
        slow: data?.slow ?? prev.slow
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
  // REFRESH MODE LOGIC
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