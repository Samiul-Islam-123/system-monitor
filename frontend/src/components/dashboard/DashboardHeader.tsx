import { useMetrics, type RefreshMode } from '@/contexts/MetricsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { formatUptime } from '@/lib/mockData';
import { Moon, Sun, Server, Wifi, WifiOff, Monitor, AlertTriangle, AlertCircle } from 'lucide-react';

const REFRESH_OPTIONS: { value: RefreshMode; label: string }[] = [
  { value: '5s', label: '5s' },
  { value: '10s', label: '10s' },
  { value: '1m', label: '1m' },
  { value: '10m', label: '10m' },
  { value: 'live', label: 'Live' },
];

export function DashboardHeader() {
  const { metrics, error, refreshMode, setRefreshMode, isConnected, lastUpdated } = useMetrics();
  const { isDark, toggle } = useTheme();

  return (
    <header className="border-b border-border bg-card px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Branding + System Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            {error ? (
              <>
                <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                <h1 className="text-lg font-semibold text-destructive">Connection Error</h1>
              </>
            ) : (
              <>
                <Server className="h-5 w-5 text-primary shrink-0" />
                <h1 className="text-lg font-semibold truncate">
                  {metrics?.hostname ?? 'System Monitor'}
                </h1>
              </>
            )}
          </div>
          {!error && metrics && (
            <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground font-mono">
              <span>{metrics.os}</span>
              <span className="text-border">|</span>
              <span>{metrics.kernel}</span>
              <span className="text-border">|</span>
              <span>Up {formatUptime(metrics.cpu?.uptime || 0)}</span>
              <span className="text-border">|</span>
              <span className="flex items-center gap-1">
                <Monitor className="h-3 w-3 text-chart-gpu" />
                {metrics.gpu?.name || 'GPU'} · {(metrics.gpu?.utilization || 0).toFixed(1)}% · {metrics.gpu?.temperature || 0}°C
              </span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Connection status */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
            {error ? (
              <>
                <div className="status-dot-error" />
                <WifiOff className="h-3.5 w-3.5 text-destructive" />
              </>
            ) : isConnected ? (
              <>
                <div className="status-dot-live" />
                <Wifi className="h-3.5 w-3.5 text-success" />
              </>
            ) : (
              <WifiOff className="h-3.5 w-3.5" />
            )}
            {lastUpdated && !error && (
              <span className="hidden sm:inline font-mono">
                {lastUpdated.toLocaleTimeString('en-US', { hour12: false })}
              </span>
            )}
          </div>

          {/* Refresh mode selector */}
          <div className="flex items-center bg-secondary rounded-md p-0.5">
            {REFRESH_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setRefreshMode(value)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                  refreshMode === value
                    ? value === 'live'
                      ? 'bg-success text-success-foreground shadow-sm'
                      : 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                disabled={!!error}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}