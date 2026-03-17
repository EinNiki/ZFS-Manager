import type { ZFSDataset } from '../types';
import { MoreVertical, Settings, Plus, Lock, Activity, Server, Database } from 'lucide-react';
import { motion } from 'motion/react';

interface DatasetListProps {
  datasets: ZFSDataset[];
}

export default function DatasetList({ datasets }: DatasetListProps) {
  return (
    <div className="nexus-card !p-0 overflow-hidden">
      <div className="p-12 flex justify-between items-end border-b border-white/[0.03] bg-white/[0.01]">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic">Active Datasets</h2>
          <p className="text-sm font-medium text-white/30 mt-2">Manage storage hierarchy and mountpoint properties</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="apple-button apple-button-primary px-10 h-14 text-xs uppercase tracking-[0.3em] font-black"
        >
          <Plus size={20} /> <span className="ml-1">Provision Volume</span>
        </motion.button>
      </div>
      
      <div className="p-10 space-y-6">
        {datasets.map((ds, i) => (
          <motion.div 
            key={ds.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between p-10 bg-white/[0.01] rounded-[3rem] hover:bg-white/[0.04] transition-all group border border-white/[0.03] hover:border-white/10"
          >
            <div className="flex items-center gap-10">
              <div className="w-20 h-20 bg-white/[0.03] rounded-[2rem] flex items-center justify-center text-white/20 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all duration-500 group-hover:scale-110 border border-white/5">
                <Database size={30} />
              </div>
              <div>
                <div className="flex items-center gap-6">
                  <p className="text-xl font-black tracking-tight text-white uppercase italic">{ds.name}</p>
                  {ds.readonly && (
                      <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          <Lock size={12} /> READ_ONLY
                      </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-3 grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">
                  <Server size={12} className="text-blue-400" />
                  <p className="text-[11px] text-white/60 font-black tech-font uppercase tracking-widest">{ds.mountpoint}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-20">
              <div className="hidden lg:flex items-center gap-12">
                <div className="text-left">
                  <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em] mb-3">Compression</p>
                  <div className="flex items-center gap-3">
                      <Activity size={14} className="text-blue-400" />
                      <span className="text-sm font-bold text-white/80">{ds.compression}</span>
                  </div>
                </div>
                <div className="text-left border-l border-white/5 pl-12">
                  <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em] mb-3">Deduplication</p>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${ds.dedup === 'on' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                      {ds.dedup}
                  </span>
                </div>
              </div>

              <div className="text-right min-w-[200px] border-l border-white/5 pl-20">
                <div className="flex justify-between items-end mb-4">
                  <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">Storage Matrix</p>
                  <p className="text-sm font-black tech-font text-white">{ds.used}</p>
                </div>
                <div className="w-48 h-2 bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '45%' }}
                      transition={{ duration: 1.5, ease: 'circOut' }}
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" 
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(59,130,246,0.1)' }}
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/[0.02] text-white/20 hover:text-white transition-all border border-white/5"
                >
                  <Settings size={22} />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/[0.02] text-white/20 hover:text-white transition-all border border-white/5"
                >
                  <MoreVertical size={22} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
