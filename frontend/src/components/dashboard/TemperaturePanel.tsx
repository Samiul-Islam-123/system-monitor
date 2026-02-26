import { useMetrics } from '@/contexts/MetricsContext';
import { Thermometer, AlertCircle } from 'lucide-react';

export function TemperaturePanel() {
  const { metrics, error } = useMetrics();
  
  if (error) {
    return (
      <div className="metric-card flex flex-col gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <h3 className="text-sm font-semibold">Temperature Metrics Error</h3>
        </div>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="metric-card flex flex-col gap-3 p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Temperatures</h3>
        </div>
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={`loading-${i}`} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Sensor {i}</span>
                <span className="font-mono font-medium text-muted-foreground">--°C</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-muted" style={{ width: '0%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="metric-card flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Thermometer className="h-4 w-4 text-chart-temp" />
        <h3 className="text-sm font-semibold">Temperatures</h3>
      </div>

      <div className="space-y-2.5">
        {metrics.temperatures.map((sensor) => {
          const percent = (sensor.value / sensor.critical) * 100;
          const color =
            sensor.value >= sensor.critical ? 'hsl(var(--danger))'
            : sensor.value >= sensor.max * 0.85 ? 'hsl(var(--warning))'
            : 'hsl(var(--chart-temp))';

          return (
            <div key={sensor.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{sensor.label}</span>
                <span className="font-mono font-medium" style={{ color }}>
                  {sensor.value}°C
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}