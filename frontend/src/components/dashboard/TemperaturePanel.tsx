import { useMetrics } from '@/contexts/MetricsContext';
import { Thermometer } from 'lucide-react';

export function TemperaturePanel() {
  const { metrics } = useMetrics();
  if (!metrics) return null;

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
