import React from 'react';
import { motion } from 'framer-motion';
import { Database, Plus, RefreshCw, MoreHorizontal, ShieldCheck } from 'lucide-react';
import { ZFSPool } from '../types';

interface StoragePoolsProps {
  pools: ZFSPool[];
}

export default function StoragePools({ pools }: StoragePoolsProps) {
  return (
    <div className="space-y-10 max-w-[1600px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">Storage Pools</h2>
          <p className="text-slate-500 font-medium mt-1">Global management of ZFS storage resources</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="apple-button apple-button-secondary py-4 group">
            <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">Scan Hardware</span>
          </button>
          <button className="apple-button apple-button-primary py-4">
            <Plus size={16} strokeWidth={3} />
            <span className="text-[11px] font-black uppercase tracking-widest">Provision Pool</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 px-4">
        {pools.map((pool, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel p-10 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-zfs-accent/5 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none group-hover:bg-zfs-accent/10 transition-colors" />
            
            <div className="flex justify-between items-start mb-10 relative">
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 bg-white/[0.03] border border-white/[0.05] rounded-3xl flex items-center justify-center text-zfs-accent shadow-xl group-hover:scale-110 transition-transform">
                  <Database size={36} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white mb-2 leading-none">{pool.name}</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{pool.raidType}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    <span className={`status-badge ${
                      pool.health === 'ONLINE' ? 'status-online' : 'status-warning'
                    }`}>
                      {pool.health}
                    </span>
                  </div>
                </div>
              </div>
              <button className="p-3 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl transition-all border border-white/[0.03] text-slate-500 hover:text-white">
                <MoreHorizontal size={22} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aggregate Utilization</span>
                  <span className="text-sm font-black text-white">{pool.cap}%</span>
                </div>
                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pool.cap}%` }}
                    className={`h-full rounded-full ${pool.cap > 90 ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'bg-zfs-accent shadow-[0_0_15px_rgba(34,211,238,0.3)]'}`}
                  />
                </div>
              </div>

              {[
                { label: 'Total Physical', value: pool.size, icon: Database, color: 'text-indigo-400' },
                { label: 'Allocated Data', value: pool.alloc, icon: ShieldCheck, color: 'text-zfs-accent' },
                { label: 'Unused Capacity', value: pool.free, icon: RefreshCw, color: 'text-emerald-400' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col gap-2 group/stat">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover/stat:text-white/40 transition-colors uppercase">{stat.label}</span>
                  <span className="text-2xl font-black text-white tracking-tight">{stat.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-10 border-t border-white/[0.03] flex flex-wrap gap-4 relative">
              <button className="apple-button apple-button-secondary !px-6 !py-3">
                <span className="text-[10px] font-black uppercase tracking-widest">Inspect Topography</span>
              </button>
              <button className="apple-button apple-button-secondary !px-6 !py-3 text-rose-500 hover:text-rose-400 hover:bg-rose-500/5 hover:border-rose-500/10 transition-colors">
                <span className="text-[10px] font-black uppercase tracking-widest">Offline Pool</span>
              </button>
              <button className="ml-auto apple-button apple-button-primary !px-8 !py-3">
                <span className="text-[10px] font-black uppercase tracking-widest">Initiate Scrub</span>
              </button>
            </div>
          </motion.div>
        ))}
        {pools.length === 0 && (
          <div className="glass-panel p-24 flex flex-col items-center justify-center text-center">
            <Database size={64} className="text-white/5 mb-8" strokeWidth={1} />
            <h3 className="text-2xl font-black text-white mb-3">No Pools Detected</h3>
            <p className="text-slate-500 font-medium max-w-sm leading-relaxed">System scan completed. We couldn't identify any active ZFS storage pools on this node.</p>
            <button className="mt-10 apple-button apple-button-primary !px-10 !py-4">
               <Plus size={18} />
               <span className="text-[11px] font-black uppercase tracking-widest">Create First Pool</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
