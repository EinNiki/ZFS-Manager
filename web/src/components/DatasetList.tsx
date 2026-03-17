import type { ZFSDataset } from '../types';
import { MoreVertical, Settings, Plus, Lock, Activity, Server, Database } from 'lucide-react';
import { motion } from 'motion/react';

interface DatasetListProps {
  datasets: ZFSDataset[];
}

export default function DatasetList({ datasets }: DatasetListProps) {
  return (
    <div className="glass-panel overflow-hidden">
      <div className="p-10 flex justify-between items-end border-b border-white/[0.03]">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Active Datasets</h2>
          <p className="text-sm font-medium text-white/40 mt-1">Manage storage hierarchy and mountpoint properties</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="apple-button apple-button-primary px-6 h-12 text-xs uppercase tracking-widest font-black"
        >
          <Plus size={18} /> <span className="ml-1">Provision Volume</span>
        </motion.button>
      </div>
      
      <div className="p-8">
        <div className="grid grid-cols-1 gap-6">
          {datasets.map((ds, i) => (
            <motion.div 
              key={ds.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-8 bg-white/[0.01] rounded-[2.5rem] hover:bg-white/[0.04] transition-all group border border-white/[0.03] hover:border-white/10"
            >
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 bg-white/[0.03] rounded-[1.5rem] flex items-center justify-center text-white/20 group-hover:bg-zfs-accent/10 group-hover:text-zfs-accent transition-all duration-500 group-hover:scale-110 border border-white/5">
                  <Database size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-bold text-white tracking-tight">{ds.name}</p>
                    {ds.readonly && (
                        <span className="px-2 py-0.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5">
                            <Lock size={10} /> Read Only
                        </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                    <Server size={10} className="text-white" />
                    <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.1em]">{ds.mountpoint}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-16">
                <div className="hidden lg:flex items-center gap-10">
                  <div className="text-left">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Compression</p>
                    <div className="flex items-center gap-2">
                        <Activity size={12} className="text-zfs-accent" />
                        <span className="text-xs font-bold text-white/80">{ds.compression}</span>
                    </div>
                  </div>
                  <div className="text-left border-l border-white/5 pl-10">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Deduplication</p>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${ds.dedup === 'on' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                        {ds.dedup}
                    </span>
                  </div>
                </div>

                <div className="text-right min-w-[160px] border-l border-white/5 pl-16">
                  <div className="flex justify-between items-end mb-2.5">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Storage Capacity</p>
                    <p className="text-xs font-bold text-white">{ds.used}</p>
                  </div>
                  <div className="w-40 h-1.5 bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '45%' }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-zfs-accent to-indigo-500 rounded-full" 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/[0.02] text-white/20 hover:text-white hover:bg-white/[0.08] transition-all border border-white/5"
                  >
                    <Settings size={18} />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/[0.02] text-white/20 hover:text-white hover:bg-white/[0.08] transition-all border border-white/5"
                  >
                    <MoreVertical size={18} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
