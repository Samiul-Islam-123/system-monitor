import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { generateMetrics, type SystemMetrics } from '@/lib/mockData';
import { apiService } from '@/services/apiService';
import { socketService } from '@/services/socketService';
import type { ApiSystemMetrics } from '@/types/apiMetrics';

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

// Convert API response to frontend SystemMetrics format
function convertApiMetrics(apiMetrics: ApiSystemMetrics): SystemMetrics {
  // Create mock history data since API doesn't provide it
  const now = new Date().toLocaleTimeString('en-US', { hour12: false });
  const historyData = Array.from({ length: 60 }, (_, i) => ({
    time: new Date(Date.now() - (59 - i) * 1000).toLocaleTimeString('en-US', { hour12: false, second: '2-digit' }),
    usage: Math.max(0, Math.min(100, (apiMetrics.cpu?.currentLoad || 0) + (Math.random() - 0.5) * 20))
  }));

  return {
    hostname: apiMetrics.hostname || 'localhost',
    os: apiMetrics.os || 'Linux',
    kernel: apiMetrics.kernel || 'Unknown',
    timestamp: apiMetrics.timestamp || Date.now(),
    cpu: {
      overall: apiMetrics.cpu?.currentLoad || 0,
      cores: [], // API doesn't provide core data
      loadAvg: apiMetrics.cpu?.loadAvg || [0, 0, 0],
      uptime: apiMetrics.cpu?.uptime || 0,
      model: apiMetrics.cpu?.model || 'Unknown CPU',
      history: historyData
    },
    memory: {
      total: apiMetrics.memory?.total || 1,
      used: apiMetrics.memory?.used || 0,
      free: Math.max(0, (apiMetrics.memory?.total || 1) - (apiMetrics.memory?.used || 0)),
      cached: apiMetrics.memory?.cached || 0,
      buffers: apiMetrics.memory?.buffers || 0,
      swapTotal: apiMetrics.memory?.swapTotal || 0,
      swapUsed: apiMetrics.memory?.swapUsed || 0,
      history: historyData.map(d => ({ 
        time: d.time, 
        used: (apiMetrics.memory?.used || 0) + (Math.random() - 0.5) * 0.5,
        cached: apiMetrics.memory?.cached || 0
      }))
    },
    gpu: apiMetrics.gpu ? {
      name: apiMetrics.gpu?.name || 'Unknown GPU',
      utilization: apiMetrics.gpu?.utilization || 0,
      memoryTotal: apiMetrics.gpu?.memoryTotal || 0,
      memoryUsed: apiMetrics.gpu?.memoryUsed || 0,
      temperature: apiMetrics.gpu?.temperature || 0,
      fanSpeed: apiMetrics.gpu?.fanSpeed || 0,
      power: apiMetrics.gpu?.power || 0,
      history: historyData.map(d => ({ 
        time: d.time, 
        utilization: apiMetrics.gpu?.utilization || 0,
        temperature: apiMetrics.gpu?.temperature || 0
      }))
    } : {
      name: 'No GPU detected',
      utilization: 0,
      memoryTotal: 0,
      memoryUsed: 0,
      temperature: 0,
      fanSpeed: 0,
      power: 0,
      history: []
    },
    disks: [{
      device: apiMetrics.disks?.device || '/dev/sda1',
      mountPoint: apiMetrics.disks?.mountPoint || '/',
      fsType: apiMetrics.disks?.fsType || 'ext4',
      total: apiMetrics.disks?.total || 100,
      used: apiMetrics.disks?.used || 0,
      readSpeed: apiMetrics.disks?.readSpeed || 0,
      writeSpeed: apiMetrics.disks?.writeSpeed || 0,
      rIO: apiMetrics.disks?.rIO || 0,
      wIO: apiMetrics.disks?.wIO || 0
    }],
    network: [{
      name: apiMetrics.network?.name || 'eth0',
      ip: apiMetrics.network?.ip || '127.0.0.1',
      rxSpeed: (apiMetrics.network?.rxSpeed || 0) / (1024 * 1024), // Convert bytes to MB/s
      txSpeed: (apiMetrics.network?.txSpeed || 0) / (1024 * 1024), // Convert bytes to MB/s
      rxTotal: apiMetrics.network?.rxTotal || 0,
      txTotal: apiMetrics.network?.txTotal || 0,
      history: historyData.map(d => ({ 
        time: d.time, 
        rx: (apiMetrics.network?.rxSpeed || 0) / (1024 * 1024),
        tx: (apiMetrics.network?.txSpeed || 0) / (1024 * 1024)
      }))
    }],
    processes: (apiMetrics.processes || []).map(proc => ({
      pid: proc.pid || 0,
      name: proc.name || 'Unknown',
      user: proc.user || 'Unknown',
      cpu: proc.cpu || 0,
      memory: proc.mem || 0,
      memoryMB: proc.memRss ? proc.memRss / 1024 : 0, // Convert KB to MB
      status: (proc.state as 'running' | 'sleeping' | 'stopped' | 'zombie') || 'running',
      threads: 1 // API doesn't provide thread count
    })),
    temperatures: [{
      label: 'CPU',
      value: apiMetrics.temperatures?.main || 0,
      max: 95,
      critical: 100
    }]
  };
}

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
      const apiData = await apiService.getCurrentMetrics();
      // Convert API response to frontend format
      const convertedMetrics = convertApiMetrics(apiData as unknown as ApiSystemMetrics);
      setMetrics(convertedMetrics);
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