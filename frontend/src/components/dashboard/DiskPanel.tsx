import { useMetrics } from '@/contexts/MetricsContext';
import { HardDrive, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function DiskPanel() {
  const { metrics, error } = useMetrics();
  
  if (error) {
    return (
      <div className="metric-card flex flex-col gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <h3 className="text-sm font-semibold">Disk Metrics Error</h3>
        </div>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="metric-card flex flex-col gap-3 p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Disk I/O</h3>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="metric-card flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <HardDrive className="h-4 w-4 text-chart-disk" />
        <h3 className="text-sm font-semibold">Disk I/O</h3>
      </div>

      <div className="space-y-4">
        {metrics.disks.map((disk, index) => {
          const totalIO = (disk.readSpeed || 0) + (disk.writeSpeed || 0);
          const pieData = [
            { name: 'Read', value: disk.readSpeed || 0 },
            { name: 'Write', value: disk.writeSpeed || 0 },
          ];

          return (
            <div key={`disk-${index}`} className="flex items-center gap-3">
              {/* Pie chart */}
              <div className="w-16 h-16 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={18}
                      outerRadius={28}
                      dataKey="value"
                      strokeWidth={0}
                      isAnimationActive={false}
                    >
                      <Cell fill="hsl(var(--chart-network-up))" />
                      <Cell fill="hsl(var(--chart-network-down))" />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        fontSize: '11px',
                      }}
                      formatter={(value: number) => `${value.toFixed(1)} MB/s`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-mono truncate">
                    <span className="font-medium">Disk {index + 1}</span>
                    <span className="text-muted-foreground ml-1.5">({disk.device || 'Unknown'})</span>
                  </div>
                  <span className="font-mono font-bold text-chart-disk">
                    {totalIO.toFixed(1)} MB/s
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, totalIO * 2)}%`, backgroundColor: 'hsl(var(--chart-disk))' }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>R: {(disk.readSpeed || 0).toFixed(1)} MB/s</span>
                  <span>W: {(disk.writeSpeed || 0).toFixed(1)} MB/s</span>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>I/O: {(disk.rIO || 0).toFixed(1)} r/s</span>
                  <span>I/O: {(disk.wIO || 0).toFixed(1)} w/s</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}