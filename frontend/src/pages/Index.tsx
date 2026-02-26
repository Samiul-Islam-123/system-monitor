import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { CpuChart } from '@/components/dashboard/CpuChart';
import { MemoryChart } from '@/components/dashboard/MemoryChart';
import { GpuPanel } from '@/components/dashboard/GpuPanel';
import { NetworkPanel } from '@/components/dashboard/NetworkPanel';
import { DiskPanel } from '@/components/dashboard/DiskPanel';
import { TemperaturePanel } from '@/components/dashboard/TemperaturePanel';
import { ProcessTable } from '@/components/dashboard/ProcessTable';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader />
      <main className="flex-1 p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto w-full">
        {/* Quick stats row */}
        <QuickStats />

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CpuChart />
          <MemoryChart />
        </div>

        {/* GPU + Network */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GpuPanel />
          <NetworkPanel />
        </div>

        {/* Disk + Temp + Processes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <DiskPanel />
          <TemperaturePanel />
          <ProcessTable />
        </div>
      </main>
    </div>
  );
};

export default Index;
