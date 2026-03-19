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
    <div className="space-y-12 max-w-[1700px] mx-auto pb-10">
      {/* Dynamic Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-4">
        <div className="relative">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zfs-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-zfs-accent"></span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zfs-accent/80">Active Node: Main</span>
          </motion.div>
          <h2 className="text-5xl lg:text-6xl font-black text-white tracking-tighter leading-tight">
            Dashboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-zfs-accent to-zfs-secondary">Overview</span>
          </h2>
          <p className="text-slate-500 font-medium text-lg mt-4 max-w-xl leading-relaxed">
            Real-time infrastructure telemetry, storage allocation, and automated node health monitoring.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="glass-panel px-6 py-4 flex items-center gap-4 border-white/[0.03]">
             <div className="p-2.5 rounded-xl bg-zfs-accent/10 text-zfs-accent">
               <Activity size={20} />
             </div>
             <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Uptime</p>
               <p className="text-sm font-black text-white uppercase tracking-tight">{uptime.split(',')[0]}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Main Metric Grid (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
        {[
          { label: 'Overall Capacity', value: formatSizeLong(totalCapacity), icon: Database, color: 'text-zfs-accent', glow: 'shadow-[0_0_20px_rgba(34,211,238,0.2)]', iconBg: 'bg-zfs-accent/10' },
          { label: 'Consumed Space', value: formatSizeLong(totalUsedStorage), icon: HardDrive, color: 'text-zfs-secondary', glow: 'shadow-[0_0_20px_rgba(129,140,248,0.2)]', iconBg: 'bg-zfs-secondary/10' },
          { label: 'System Health', value: pools.length > 0 && pools.every(p => p.health === 'ONLINE') ? 'Optimal' : (pools.length === 0 ? 'Silent' : 'Issue'), icon: ShieldCheck, color: 'text-emerald-400', glow: 'shadow-[0_0_20px_rgba(52,211,153,0.2)]', iconBg: 'bg-emerald-500/10' },
          { label: 'Throughput', value: `${(currentStats.read + currentStats.write).toFixed(2)} MB/s`, icon: Zap, color: 'text-amber-400', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.2)]', iconBg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-panel p-8 group cursor-default h-full flex flex-col justify-between`}
          >
            <div className="flex items-start justify-between">
              <div className={`p-4 rounded-2xl ${stat.iconBg} ${stat.color} transition-all duration-500 group-hover:scale-110 ${stat.glow}`}>
                <stat.icon size={26} strokeWidth={2.5} />
              </div>
              <TrendingUp size={16} className="text-slate-600 group-hover:text-white transition-colors" />
            </div>
            <div className="mt-8">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 truncate">{stat.label}</p>
              <h3 className="text-3xl font-black text-white tracking-tight leading-none group-hover:text-zfs-accent transition-colors">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
        {/* Storage Center Bento Card */}
        <div className="lg:col-span-8 glass-panel p-10 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-zfs-accent/5 blur-[120px] rounded-full -mr-20 -mt-20 pointer-events-none" />
          
          <div className="relative flex justify-between items-start mb-12">
            <div>
              <h3 className="text-3xl font-black text-white tracking-tight">Storage Allocation</h3>
              <p className="text-slate-400 font-medium mt-2">Aggregate pool utilization telemetry</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-5xl font-black text-white tracking-tighter">{usagePercent.toFixed(1)}<span className="text-2xl text-zfs-accent">%</span></div>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zfs-accent animate-pulse" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Load</span>
              </div>
            </div>
          </div>
          
          <div className="relative h-10 bg-white/[0.03] rounded-[1.25rem] p-1.5 border border-white/[0.03] mb-14">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${usagePercent}%` }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className="h-full bg-gradient-to-r from-zfs-accent via-indigo-500 to-zfs-accent rounded-[0.8rem] shadow-[0_0_40px_rgba(34,211,238,0.25)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:40px_40px] animate-slide" />
            </motion.div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pt-10 border-t border-white/[0.03]">
            {[
              { label: 'CPU Load', value: cpuLoad.toFixed(2), icon: Cpu, color: 'text-indigo-400' },
              { label: 'ARC Ratio', value: `${arcHit.toFixed(1)}%`, icon: ShieldCheck, color: 'text-zfs-accent' },
              { label: 'I/O Rate', value: currentStats.iops.toLocaleString(), icon: Zap, color: 'text-amber-400' },
              { label: 'Link Speed', value: `${((currentStats.read + currentStats.write)).toFixed(1)} MB/s`, icon: Activity, color: 'text-rose-400' }
            ].map((stat, i) => (
              <div key={i} className="group/stat cursor-default">
                <div className="flex items-center gap-2 mb-3">
                  <stat.icon size={14} className={`${stat.color} opacity-60 group-hover/stat:opacity-100 transition-opacity`} />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                </div>
                <p className="text-2xl font-black text-white group-hover/stat:text-zfs-accent transition-colors">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Status Bento Card */}
        <div className="lg:col-span-4 glass-panel p-10 flex flex-col h-full bg-gradient-to-br from-white/[0.02] to-transparent">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-white tracking-tight">Node Pools</h3>
            <div className="p-3 rounded-2xl bg-white/[0.03] text-slate-400 border border-white/[0.03]">
               <Database size={20} />
            </div>
          </div>
          
          <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar scroll-smooth">
            {pools.map((pool, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={idx} 
                className="p-5 bg-white/[0.01] rounded-[1.5rem] border border-white/[0.03] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all group/pool"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-sm font-black text-white group-hover/pool:text-zfs-accent transition-colors block leading-tight">{pool.name}</span>
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1.5 block">{pool.raidType}</span>
                  </div>
                  <span className={`status-badge ${
                    pool.health === 'ONLINE' ? 'status-online' : 'status-warning'
                  }`}>{pool.health}</span>
                </div>
                
                <div className="w-full h-1.5 bg-white/[0.03] rounded-full overflow-hidden mb-4 p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pool.cap}%` }}
                    className={`h-full rounded-full ${pool.cap > 90 ? 'bg-rose-500' : 'bg-zfs-accent/60'} shadow-[0_0_15px_rgba(34,211,238,0.2)]`}
                  />
                </div>
                
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <span className={pool.cap > 90 ? 'text-rose-400' : ''}>{pool.cap}% Cap</span>
                  <span className="text-white/40">{pool.free} Free</span>
                </div>
              </motion.div>
            ))}
            {pools.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-700 text-center">
                <Database size={48} className="mb-4 opacity-10" strokeWidth={1} />
                <p className="font-bold text-xs uppercase tracking-[0.3em]">No Active Pools</p>
              </div>
            )}
          </div>

          <button className="w-full mt-10 apple-button apple-button-secondary bg-white/[0.02] py-5 group-hover:bg-white/[0.05]">
            <Server size={18} />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">Detailed Node Stats</span>
          </button>
        </div>
      </div>
    </div>
  );
}
