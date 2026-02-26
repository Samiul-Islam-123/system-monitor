import { useMetrics } from '@/contexts/MetricsContext';
import { Cpu, AlertCircle } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export function CpuChart() {
  const { metrics, error } = useMetrics();
  
  if (error) {
    return (
      <div className="chart-container flex flex-col gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <h3 className="text-sm font-semibold">CPU Metrics Error</h3>
        </div>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="chart-container flex flex-col gap-3 p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">CPU Usage</h3>
          </div>
          <span className="text-2xl font-bold font-mono text-muted-foreground">--%</span>
        </div>
        <div className="h-40 flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  const { cpu } = metrics;
  
  // Use the converted data with fallbacks
  const cpuUsage = cpu?.overall || 0;
  const loadAvg = cpu?.loadAvg || [0, 0, 0];
  const model = cpu?.model || 'Unknown CPU';

  return (
    <div className="chart-container flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-chart-cpu" />
          <h3 className="text-sm font-semibold">CPU Usage</h3>
        </div>
        <span className="text-2xl font-bold font-mono text-chart-cpu">
          {(cpuUsage || 0).toFixed(1)}%
        </span>
      </div>

      {/* Model info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
        <span>{model}</span>
        <span>Load: {(loadAvg || [0, 0, 0]).map(l => (l || 0).toFixed(2)).join(', ')}</span>
      </div>

      {/* Chart */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={cpu?.history || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-cpu))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-cpu))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Area
              type="monotone"
              dataKey="usage"
              stroke="hsl(var(--chart-cpu))"
              strokeWidth={2}
              fill="url(#cpuGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Core info - simplified since we don't have core data */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-secondary rounded p-2 text-center">
          <div className="text-xs text-muted-foreground">Cores</div>
          <div className="font-mono font-medium">--</div>
        </div>
        <div className="bg-secondary rounded p-2 text-center">
          <div className="text-xs text-muted-foreground">Freq</div>
          <div className="font-mono font-medium">-- MHz</div>
        </div>
        <div className="bg-secondary rounded p-2 text-center">
          <div className="text-xs text-muted-foreground">Temp</div>
          <div className="font-mono font-medium">--°C</div>
        </div>
        <div className="bg-secondary rounded p-2 text-center">
          <div className="text-xs text-muted-foreground">Uptime</div>
          <div className="font-mono font-medium">--</div>
        </div>
      </div>
    </div>
  );
}