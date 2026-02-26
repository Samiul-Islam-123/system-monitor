import { useMetrics } from '@/contexts/MetricsContext';
import { HardDrive } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function DiskPanel() {
  const { metrics } = useMetrics();
  if (!metrics) return null;

  return (
    <div className="metric-card flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <HardDrive className="h-4 w-4 text-chart-disk" />
        <h3 className="text-sm font-semibold">Disk Usage</h3>
      </div>

      <div className="space-y-4">
        {metrics.disks.map((disk) => {
          const percent = (disk.used / disk.total) * 100;
          const free = disk.total - disk.used;
          const pieData = [
            { name: 'Used', value: disk.used },
            { name: 'Free', value: free },
          ];
          const fillColor = percent > 90 ? 'hsl(var(--danger))' : percent > 70 ? 'hsl(var(--warning))' : 'hsl(var(--chart-disk))';

          return (
            <div key={disk.device} className="flex items-center gap-3">
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
                      <Cell fill={fillColor} />
                      <Cell fill="hsl(var(--muted))" />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        fontSize: '11px',
                      }}
                      formatter={(value: number) => `${value} GB`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-mono truncate">
                    <span className="font-medium">{disk.mountPoint}</span>
                    <span className="text-muted-foreground ml-1.5">({disk.device})</span>
                  </div>
                  <span className="font-mono font-bold" style={{ color: fillColor }}>
                    {percent.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%`, backgroundColor: fillColor }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>{disk.used}/{disk.total} GB · {disk.fsType}</span>
                  <span>R: {disk.readSpeed} · W: {disk.writeSpeed} MB/s</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
