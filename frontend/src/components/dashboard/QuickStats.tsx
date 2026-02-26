import { useMetrics } from '@/contexts/MetricsContext';
import { Cpu, MemoryStick, HardDrive, Thermometer, Monitor } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

function MiniPie({ value, color, bgColor = 'hsl(var(--muted))' }: { value: number; color: string; bgColor?: string }) {
  const data = [
    { value: Math.min(value, 100) },
    { value: Math.max(100 - value, 0) },
  ];
  return (
    <div className="w-12 h-12 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={14}
            outerRadius={22}
            dataKey="value"
            strokeWidth={0}
            startAngle={90}
            endAngle={-270}
            isAnimationActive={false}
          >
            <Cell fill={color} />
            <Cell fill={bgColor} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function QuickStats() {
  const { metrics } = useMetrics();
  if (!metrics) return null;

  const memPercent = (metrics.memory.used / metrics.memory.total) * 100;
  const diskPercent = (metrics.disks[0].used / metrics.disks[0].total) * 100;
  const gpuMemPercent = (metrics.gpu.memoryUsed / metrics.gpu.memoryTotal) * 100;

  const stats = [
    {
      label: 'CPU',
      value: `${metrics.cpu.overall.toFixed(1)}%`,
      percent: metrics.cpu.overall,
      icon: Cpu,
      color: 'hsl(var(--chart-cpu))',
      textColor: 'text-chart-cpu',
    },
    {
      label: 'Memory',
      value: `${memPercent.toFixed(1)}%`,
      sub: `${metrics.memory.used.toFixed(1)}/${metrics.memory.total} GB`,
      percent: memPercent,
      icon: MemoryStick,
      color: 'hsl(var(--chart-memory))',
      textColor: 'text-chart-memory',
    },
    {
      label: 'GPU',
      value: `${metrics.gpu.utilization.toFixed(1)}%`,
      sub: `VRAM ${gpuMemPercent.toFixed(0)}% · ${metrics.gpu.temperature}°C`,
      percent: metrics.gpu.utilization,
      icon: Monitor,
      color: 'hsl(var(--chart-gpu))',
      textColor: 'text-chart-gpu',
    },
    {
      label: 'Disk /',
      value: `${diskPercent.toFixed(1)}%`,
      sub: `${metrics.disks[0].used}/${metrics.disks[0].total} GB`,
      percent: diskPercent,
      icon: HardDrive,
      color: diskPercent > 90 ? 'hsl(var(--danger))' : diskPercent > 70 ? 'hsl(var(--warning))' : 'hsl(var(--chart-disk))',
      textColor: diskPercent > 90 ? 'text-danger' : diskPercent > 70 ? 'text-warning' : 'text-chart-disk',
    },
    {
      label: 'CPU Temp',
      value: `${metrics.temperatures[0].value}°C`,
      sub: `Max ${metrics.temperatures[0].max}°C`,
      percent: (metrics.temperatures[0].value / metrics.temperatures[0].critical) * 100,
      icon: Thermometer,
      color: metrics.temperatures[0].value > 75 ? 'hsl(var(--danger))' : 'hsl(var(--chart-temp))',
      textColor: metrics.temperatures[0].value > 75 ? 'text-danger' : 'text-chart-temp',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="metric-card flex items-center gap-3">
          <MiniPie value={stat.percent} color={stat.color} />
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <stat.icon className="h-3 w-3" />
              {stat.label}
            </div>
            <div className={`text-lg font-bold font-mono leading-tight ${stat.textColor}`}>{stat.value}</div>
            {stat.sub && <div className="text-[10px] text-muted-foreground font-mono truncate">{stat.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
