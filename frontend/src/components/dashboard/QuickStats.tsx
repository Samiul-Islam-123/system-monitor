import { useMetrics } from '@/contexts/MetricsContext';
import { Cpu, MemoryStick, HardDrive, Thermometer, Monitor, AlertCircle } from 'lucide-react';
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
  const { metrics, error } = useMetrics();
  
  if (error) {
    return (
      <div className="metric-card flex flex-col items-center justify-center p-6 bg-destructive/10 border border-destructive/30 rounded-lg">
        <AlertCircle className="h-8 w-8 text-destructive mb-2" />
        <h3 className="text-sm font-semibold text-destructive">Metrics Error</h3>
        <p className="text-xs text-muted-foreground mt-1">{error}</p>
      </div>
    );
  }

  if (!metrics) {
    const loadingStats = [
      { label: 'CPU', icon: Cpu },
      { label: 'Memory', icon: MemoryStick },
      { label: 'GPU', icon: Monitor },
      { label: 'Disk /', icon: HardDrive },
      { label: 'CPU Temp', icon: Thermometer },
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {loadingStats.map((stat, index) => (
          <div key={stat.label} className="metric-card flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <stat.icon className="h-3 w-3" />
                {stat.label}
              </div>
              <div className="text-lg font-bold font-mono text-transparent bg-muted rounded">--%</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Calculate percentages safely with fallback values
  const memPercent = metrics.memory && metrics.memory.total > 0 ? (metrics.memory.used / metrics.memory.total) * 100 : 0;
  const diskPercent = metrics.disks && metrics.disks.length > 0 && metrics.disks[0]?.total > 0 ? (metrics.disks[0].used / metrics.disks[0].total) * 100 : 0;
  const gpuMemPercent = metrics.gpu && metrics.gpu.memoryTotal > 0 ? (metrics.gpu.memoryUsed / metrics.gpu.memoryTotal) * 100 : 0;

  const stats = [
    {
      label: 'CPU',
      value: `${(metrics.cpu?.overall || 0).toFixed(1)}%`,
      percent: metrics.cpu?.overall || 0,
      icon: Cpu,
      color: 'hsl(var(--chart-cpu))',
      textColor: 'text-chart-cpu',
    },
    {
      label: 'Memory',
      value: `${memPercent.toFixed(1)}%`,
      sub: `${(metrics.memory?.used || 0).toFixed(1)}/${metrics.memory?.total || 0} GB`,
      percent: memPercent,
      icon: MemoryStick,
      color: 'hsl(var(--chart-memory))',
      textColor: 'text-chart-memory',
    },
    {
      label: 'GPU',
      value: `${(metrics.gpu?.utilization || 0).toFixed(1)}%`,
      sub: `VRAM ${(gpuMemPercent || 0).toFixed(0)}% · ${metrics.gpu?.temperature || 0}°C`,
      percent: metrics.gpu?.utilization || 0,
      icon: Monitor,
      color: 'hsl(var(--chart-gpu))',
      textColor: 'text-chart-gpu',
    },
    {
      label: 'Disk /',
      value: `${diskPercent.toFixed(1)}%`,
      sub: `${metrics.disks[0]?.used || 0}/${metrics.disks[0]?.total || 0} GB`,
      percent: diskPercent,
      icon: HardDrive,
      color: diskPercent > 90 ? 'hsl(var(--danger))' : diskPercent > 70 ? 'hsl(var(--warning))' : 'hsl(var(--chart-disk))',
      textColor: diskPercent > 90 ? 'text-danger' : diskPercent > 70 ? 'text-warning' : 'text-chart-disk',
    },
    {
      label: 'CPU Temp',
      value: `${metrics.temperatures[0]?.value || 0}°C`,
      sub: `Max ${metrics.temperatures[0]?.max || 0}°C`,
      percent: metrics.temperatures[0] && metrics.temperatures[0].critical > 0 ? (metrics.temperatures[0].value / metrics.temperatures[0].critical) * 100 : 0,
      icon: Thermometer,
      color: (metrics.temperatures[0]?.value || 0) > 75 ? 'hsl(var(--danger))' : 'hsl(var(--chart-temp))',
      textColor: (metrics.temperatures[0]?.value || 0) > 75 ? 'text-danger' : 'text-chart-temp',
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