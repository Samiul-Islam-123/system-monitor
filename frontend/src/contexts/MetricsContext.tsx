import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { generateMetrics, type SystemMetrics } from '@/lib/mockData';
import { apiService } from '@/services/apiService';
import { socketService } from '@/services/socketService';

export type RefreshMode = '5s' | '10s' | '1m' | '10m' | 'live';

interface MetricsContextType {
  metrics: SystemMetrics | null;
  refreshMode: RefreshMode;
  setRefreshMode: (mode: RefreshMode) => void;
  isConnected: boolean;
  lastUpdated: Date | null;
  error: string | null;
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
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleMetricsUpdate = useCallback((data: SystemMetrics) => {
    setMetrics(data);
    setLastUpdated(new Date());
    setError(null); // Clear any previous error when new data arrives
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      // Fetch metrics from the backend API
      const data = await apiService.getCurrentMetrics();
      setMetrics(data);
      setLastUpdated(new Date());
      setError(null); // Clear any previous error
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      setError(`Failed to fetch metrics: ${error.message || 'Unknown error'}`);
      // Don't fallback to mock data anymore - only show actual data or error
    }
  }, []);

  useEffect(() => {
    // Connect to socket
    const onConnect = () => {
      setIsConnected(true);
      setError(null); // Clear connection error when connected
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onError = (error: any) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      setError(`Socket connection error: ${error.message || 'Connection failed'}`);
    };

    socketService.connect(onConnect, onDisconnect, onError);

    // Initial fetch
    fetchMetrics();

    return () => {
      socketService.disconnect();
    };
  }, [fetchMetrics]);

  useEffect(() => {
    // Clear any existing intervals
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (refreshMode === 'live') {
      // Subscribe to live updates via WebSocket
      socketService.subscribeToLiveUpdates(handleMetricsUpdate, '1s');
    } else {
      // Unsubscribe from live updates
      socketService.unsubscribeFromLiveUpdates();
      
      // Set up periodic fetch based on selected interval
      const interval = INTERVAL_MAP[refreshMode];
      intervalRef.current = setInterval(fetchMetrics, interval);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (refreshMode === 'live') {
        socketService.unsubscribeFromLiveUpdates();
      }
    };
  }, [refreshMode, fetchMetrics, handleMetricsUpdate]);

  return (
    <MetricsContext.Provider value={{ metrics, refreshMode, setRefreshMode, isConnected, lastUpdated, error }}>
      {children}
    </MetricsContext.Provider>
  );
}

export function useMetrics() {
  const ctx = useContext(MetricsContext);
  if (!ctx) throw new Error('useMetrics must be used within MetricsProvider');
  return ctx;
}