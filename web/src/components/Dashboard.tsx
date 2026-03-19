import React from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  HardDrive, 
  ShieldCheck, 
  Zap, 
  ArrowDownRight, 
  ArrowUpRight,
  TrendingUp,
  Activity,
  Server,
  Cpu
} from 'lucide-react';
import { ZFSPool, ZFSLog } from '../types';

interface DashboardProps {
  pools: ZFSPool[];
  totalCapacity: number;
  totalUsedStorage: number;
  currentStats: { read: number; write: number; iops: number; cpu?: number; arcHit?: number };
  systemStats?: any;
  formatSizeLong: (bytes: number) => string;
}

export default function Dashboard({ 
  pools, 
  totalCapacity, 
  totalUsedStorage, 
  currentStats,
  systemStats,
  formatSizeLong 
}: DashboardProps) {
  const usagePercent = totalCapacity > 0 ? (totalUsedStorage / totalCapacity) * 100 : 0;
  
  // Use systemStats from backend if available, fallback to currentStats from iostat
  const cpuLoad = systemStats?.cpu_load?.[0] ?? (currentStats as any).cpu ?? 0;
  const arcHit = systemStats?.arc_hit_ratio ?? (currentStats as any).arcHit ?? 0;
  const uptime = systemStats?.uptime ?? 'N/A';
  
  return (
    <div className="space-y-10 max-w-[1600px] mx-auto">
      {/* Hero Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-zfs-accent font-bold uppercase tracking-[0.2em] text-[10px] mb-3"
          >
            <div className="w-2 h-2 rounded-full bg-zfs-accent animate-pulse" />
            <span>Node Status: Operational</span>
          </motion.div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">System Overview</h2>
          <div className="flex items-center gap-4 mt-3">
             <p className="text-white/40 font-medium whitespace-nowrap">Real-time telemetry and storage health</p>
             <div className="hidden sm:block h-px flex-1 bg-white/5" />
             <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest whitespace-nowrap">
               <Activity size={12} />
               <span>Up: {uptime.split(',')[0]}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Capacity', value: formatSizeLong(totalCapacity), icon: Database, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: '+0.2%' },
          { label: 'Used Storage', value: formatSizeLong(totalUsedStorage), icon: HardDrive, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: '+1.4%' },
          { label: 'System Health', value: pools.length > 0 && pools.every(p => p.health === 'ONLINE') ? 'Optimal' : (pools.length === 0 ? 'No Pools' : 'Degraded'), icon: ShieldCheck, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Throughput', value: `${(currentStats.read + currentStats.write).toFixed(2)} MB/s`, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', trend: '-2.1%' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 border-white/[0.05] hover:bg-white/[0.03] transition-all group relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-[60px] opacity-20 -mr-10 -mt-10 group-hover:opacity-40 transition-opacity`} />
            <div className="flex items-start justify-between mb-5">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform shadow-lg`}>
                <stat.icon size={22} />
              </div>
              {stat.trend && (
                <div className={`flex items-center gap-1 text-[10px] font-bold ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                   {stat.trend}
                   <TrendingUp size={10} className={stat.trend.startsWith('-') ? 'rotate-180' : ''} />
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-white/30 uppercase tracking-[0.14em] mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Grid Layout for Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Storage Usage Visualizer */}
        <div className="lg:col-span-8 glass-panel p-8 border-white/[0.05] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-xl font-bold text-white">Storage Allocation</h3>
                <p className="text-sm text-white/30 mt-1 font-medium">Global pool utilization across node</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-black text-white">{usagePercent.toFixed(1)}%</span>
                <span className="text-[10px] font-bold text-zfs-accent uppercase tracking-widest">Utilized</span>
              </div>
            </div>
            
            <div className="relative h-6 bg-white/[0.02] rounded-2xl p-1 border border-white/[0.05] mb-12">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                className="h-full bg-gradient-to-r from-zfs-accent via-indigo-500 to-emerald-500 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.3)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:40px_40px] animate-[slide_2s_linear_infinite]" />
              </motion.div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block">CPU (1m)</span>
              <div className="flex items-center gap-2">
                <Cpu size={14} className="text-indigo-400" />
                <span className="text-lg font-bold text-white">{cpuLoad.toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block">ARC Hit</span>
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span className="text-lg font-bold text-white">{arcHit.toFixed(1)}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block">IO Rate</span>
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-amber-400" />
                <span className="text-lg font-bold text-white">{currentStats.iops.toLocaleString()} p/s</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block">Bandwidth</span>
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-blue-400" />
                <span className="text-lg font-bold text-white">{((currentStats.read + currentStats.write)).toFixed(1)} MB/s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Pool Status */}
        <div className="lg:col-span-4 glass-panel p-8 border-white/[0.05]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Active Pools</h3>
            <div className="p-2 rounded-lg bg-white/5 text-white/40">
               <Database size={16} />
            </div>
          </div>
          <div className="space-y-5">
            {pools.map((pool, idx) => (
              <div key={idx} className="p-4 bg-white/[0.02] rounded-2xl border border-white/[0.05] hover:bg-white/[0.04] transition-all group">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white group-hover:text-zfs-accent transition-colors">{pool.name}</span>
                    <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{pool.raidType}</span>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${
                    pool.health === 'ONLINE' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                  }`}>{pool.health}</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-3">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pool.cap}%` }}
                    className={`h-full ${pool.cap > 85 ? 'bg-rose-500' : 'bg-zfs-accent/40'}`}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  <span className={pool.cap > 85 ? 'text-rose-400' : ''}>{pool.cap}% Occupied</span>
                  <span>{pool.free} Free</span>
                </div>
              </div>
            ))}
            {pools.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-white/10 italic text-sm text-center">
                <Database size={32} className="mb-3 opacity-20" />
                No active storage pools detected
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
