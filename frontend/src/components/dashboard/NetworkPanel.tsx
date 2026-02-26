import { useMetrics } from '@/contexts/MetricsContext';
import { Network, AlertCircle } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export function NetworkPanel() {
  const { metrics, error } = useMetrics();
  
  if (error) {
    return (
      <div className="chart-container flex flex-col gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <h3 className="text-sm font-semibold">Network Metrics Error</h3>
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
            <Network className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Network</h3>
          </div>
          <div className="flex gap-3 text-xs font-mono">
            <span className="text-muted-foreground">↓ -- MB/s</span>
            <span className="text-muted-foreground">↑ -- MB/s</span>
          </div>
        </div>
        <div className="h-36 flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  const net = metrics.network[0];
  if (!net) {
    return (
      <div className="chart-container flex flex-col gap-3 p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Network</h3>
          </div>
          <div className="flex gap-3 text-xs font-mono">
            <span className="text-muted-foreground">↓ -- MB/s</span>
            <span className="text-muted-foreground">↑ -- MB/s</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-center py-8">No network data available</div>
      </div>
    );
  }

  return (
    <div className="chart-container flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-chart-network-up" />
          <h3 className="text-sm font-semibold">Network</h3>
        </div>
        <div className="flex gap-3 text-xs font-mono">
          <span className="text-chart-network-up">↓ {net.rxSpeed.toFixed(1)} MB/s</span>
          <span className="text-chart-network-down">↑ {net.txSpeed.toFixed(1)} MB/s</span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
        <span>{net.name} ({net.ip})</span>
        <span>Total: ↓{net.rxTotal.toFixed(1)} GB / ↑{net.txTotal.toFixed(1)} GB</span>
      </div>

      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={net.history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="rxGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-network-up))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-network-up))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="txGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-network-down))" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(var(--chart-network-down))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }} />
            <Area type="monotone" dataKey="rx" name="Download" stroke="hsl(var(--chart-network-up))" strokeWidth={2} fill="url(#rxGradient)" isAnimationActive={false} />
            <Area type="monotone" dataKey="tx" name="Upload" stroke="hsl(var(--chart-network-down))" strokeWidth={1.5} fill="url(#txGradient)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}