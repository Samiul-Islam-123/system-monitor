import { useMetrics } from '@/contexts/MetricsContext';
import { Monitor, AlertCircle } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart,
} from 'recharts';

export function GpuPanel() {
  const { metrics, error } = useMetrics();
  
  if (error) {
    return (
      <div className="chart-container flex flex-col gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <h3 className="text-sm font-semibold">GPU Metrics Error</h3>
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
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">GPU</h3>
          </div>
          <span className="text-2xl font-bold font-mono text-muted-foreground">--%</span>
        </div>
        <div className="text-xs text-muted-foreground font-mono">Loading GPU data...</div>
        <div className="h-36 flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  const gpu = metrics.gpu;
  const memPercent = gpu && gpu.memoryTotal > 0 ? ((gpu.memoryUsed / gpu.memoryTotal) * 100).toFixed(1) : '0';

  return (
    <div className="chart-container flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-chart-gpu" />
          <h3 className="text-sm font-semibold">GPU</h3>
        </div>
        <span className="text-2xl font-bold font-mono text-chart-gpu">
          {(gpu?.utilization || 0).toFixed(1)}%
        </span>
      </div>

      <div className="text-xs text-muted-foreground font-mono">{gpu?.name || 'GPU Name'}</div>

      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={gpu?.history || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gpuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-gpu))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-gpu))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis yAxisId="right" orientation="right" domain={[20, 90]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }} />
            <Area yAxisId="left" type="monotone" dataKey="utilization" stroke="hsl(var(--chart-gpu))" strokeWidth={2} fill="url(#gpuGradient)" isAnimationActive={false} />
            <Line yAxisId="right" type="monotone" dataKey="temperature" stroke="hsl(var(--chart-temp))" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* GPU stats grid */}
      <div className="grid grid-cols-4 gap-2 text-xs font-mono">
        <div className="bg-secondary rounded p-2">
          <div className="text-muted-foreground">VRAM</div>
          <div className="font-medium">{memPercent}%</div>
          <div className="text-[10px] text-muted-foreground">{gpu?.memoryUsed || 0}/{gpu?.memoryTotal || 0} MB</div>
        </div>
        <div className="bg-secondary rounded p-2">
          <div className="text-muted-foreground">Temp</div>
          <div className="font-medium">{gpu?.temperature || 0}°C</div>
        </div>
        <div className="bg-secondary rounded p-2">
          <div className="text-muted-foreground">Fan</div>
          <div className="font-medium">{gpu?.fanSpeed || 0}%</div>
        </div>
        <div className="bg-secondary rounded p-2">
          <div className="text-muted-foreground">Power</div>
          <div className="font-medium">{gpu?.power || 0}W</div>
        </div>
      </div>
    </div>
  );
}