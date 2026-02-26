import { useMetrics } from '@/contexts/MetricsContext';
import { Activity } from 'lucide-react';
import { useState } from 'react';

export function ProcessTable() {
  const { metrics } = useMetrics();
  const [sortBy, setSortBy] = useState<'cpu' | 'memory'>('cpu');

  if (!metrics) return null;

  const sorted = [...metrics.processes].sort((a, b) =>
    sortBy === 'cpu' ? b.cpu - a.cpu : b.memory - a.memory
  ).slice(0, 12);

  return (
    <div className="metric-card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Top Processes</h3>
        </div>
        <div className="flex items-center bg-secondary rounded p-0.5 text-xs">
          <button
            onClick={() => setSortBy('cpu')}
            className={`px-2 py-0.5 rounded transition-colors ${
              sortBy === 'cpu' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            CPU
          </button>
          <button
            onClick={() => setSortBy('memory')}
            className={`px-2 py-0.5 rounded transition-colors ${
              sortBy === 'memory' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            MEM
          </button>
        </div>
      </div>

      <div className="overflow-auto scrollbar-thin">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="text-left py-1.5 font-medium">PID</th>
              <th className="text-left py-1.5 font-medium">Name</th>
              <th className="text-left py-1.5 font-medium">User</th>
              <th className="text-right py-1.5 font-medium">CPU%</th>
              <th className="text-right py-1.5 font-medium">MEM%</th>
              <th className="text-right py-1.5 font-medium">MEM</th>
              <th className="text-right py-1.5 font-medium">THR</th>
              <th className="text-right py-1.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((proc, i) => (
              <tr key={`${proc.pid}-${i}`} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                <td className="py-1.5 text-muted-foreground">{proc.pid}</td>
                <td className="py-1.5 font-medium">{proc.name}</td>
                <td className="py-1.5 text-muted-foreground">{proc.user}</td>
                <td className="py-1.5 text-right">
                  <span style={{ color: proc.cpu > 15 ? 'hsl(var(--danger))' : proc.cpu > 5 ? 'hsl(var(--warning))' : 'inherit' }}>
                    {proc.cpu.toFixed(1)}
                  </span>
                </td>
                <td className="py-1.5 text-right">{proc.memory.toFixed(1)}</td>
                <td className="py-1.5 text-right text-muted-foreground">{proc.memoryMB} MB</td>
                <td className="py-1.5 text-right text-muted-foreground">{proc.threads}</td>
                <td className="py-1.5 text-right">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${
                    proc.status === 'running' ? 'bg-success' : proc.status === 'sleeping' ? 'bg-warning' : 'bg-danger'
                  }`} />
                  <span className="text-muted-foreground">{proc.status[0].toUpperCase()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
