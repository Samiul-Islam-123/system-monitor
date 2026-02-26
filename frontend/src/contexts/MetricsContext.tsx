import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { generateMetrics, type SystemMetrics } from '@/lib/mockData';

export type RefreshMode = '5s' | '10s' | '1m' | '10m' | 'live';

interface MetricsContextType {
  metrics: SystemMetrics | null;
  refreshMode: RefreshMode;
  setRefreshMode: (mode: RefreshMode) => void;
  isConnected: boolean;
  lastUpdated: Date | null;
}

const MetricsContext = createContext<MetricsContextType | null>(null);

const INTERVAL_MAP: Record<Exclude<RefreshMode, 'live'>, number> = {
  '5s': 5000,
  '10s': 10000,
  '1m': 60000,
  '10m': 600000,
};

export function MetricsProvider({ children }: { children: React.ReactNode }) {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [refreshMode, setRefreshMode] = useState<RefreshMode>('5s');
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMetrics = useCallback(() => {
    // In production, this would be an API call or WebSocket message
    const data = generateMetrics();
    setMetrics(data);
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchMetrics();

    if (intervalRef.current) clearInterval(intervalRef.current);

    if (refreshMode === 'live') {
      // Simulate WebSocket with fast polling (in production: socket.io)
      setIsConnected(true);
      intervalRef.current = setInterval(fetchMetrics, 1000);
    } else {
      setIsConnected(false);
      const interval = INTERVAL_MAP[refreshMode];
      intervalRef.current = setInterval(fetchMetrics, interval);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refreshMode, fetchMetrics]);

  return (
    <MetricsContext.Provider value={{ metrics, refreshMode, setRefreshMode, isConnected, lastUpdated }}>
      {children}
    </MetricsContext.Provider>
  );
}

export function useMetrics() {
  const ctx = useContext(MetricsContext);
  if (!ctx) throw new Error('useMetrics must be used within MetricsProvider');
  return ctx;
}
