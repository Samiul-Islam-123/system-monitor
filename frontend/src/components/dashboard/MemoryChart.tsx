import { useMetrics } from '@/contexts/MetricsContext';
import { MemoryStick } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export function MemoryChart() {
  const { metrics } = useMetrics();
  if (!metrics) return null;

  const { memory } = metrics;
  const usedPercent = ((memory.used / memory.total) * 100).toFixed(1);
  const swapPercent = memory.swapTotal > 0 ? ((memory.swapUsed / memory.swapTotal) * 100).toFixed(1) : '0';

  return (
    <div className="chart-container flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MemoryStick className="h-4 w-4 text-chart-memory" />
          <h3 className="text-sm font-semibold">Memory</h3>
        </div>
        <span className="text-2xl font-bold font-mono text-chart-memory">
          {usedPercent}%
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 text-xs font-mono">
        <div>
          <div className="text-muted-foreground">Used</div>
          <div className="font-medium">{memory.used.toFixed(1)} GB</div>
        </div>
        <div>
          <div className="text-muted-foreground">Free</div>
          <div className="font-medium">{memory.free.toFixed(1)} GB</div>
        </div>
        <div>
          <div className="text-muted-foreground">Cached</div>
          <div className="font-medium">{memory.cached.toFixed(1)} GB</div>
        </div>
        <div>
          <div className="text-muted-foreground">Swap</div>
          <div className="font-medium">{memory.swapUsed.toFixed(1)}/{memory.swapTotal} GB</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={memory.history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-memory))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-memory))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="cacheGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-disk))" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(var(--chart-disk))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis domain={[0, 16]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: '12px',
              }}
            />
            <Area type="monotone" dataKey="cached" stroke="hsl(var(--chart-disk))" strokeWidth={1.5} fill="url(#cacheGradient)" isAnimationActive={false} />
            <Area type="monotone" dataKey="used" stroke="hsl(var(--chart-memory))" strokeWidth={2} fill="url(#memGradient)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Usage bar */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>RAM {memory.used.toFixed(1)} / {memory.total} GB</span>
          <span>Swap {swapPercent}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden flex">
          <div className="h-full transition-all duration-500" style={{ width: `${(memory.used / memory.total) * 100}%`, backgroundColor: 'hsl(var(--chart-memory))' }} />
          <div className="h-full transition-all duration-500 opacity-50" style={{ width: `${(memory.cached / memory.total) * 100}%`, backgroundColor: 'hsl(var(--chart-disk))' }} />
        </div>
      </div>
    </div>
  );
}
