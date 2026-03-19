import React from 'react';
import { ZFSDataset } from '../types';
import { MoreVertical, HardDrive, Settings, Plus, Lock } from 'lucide-react';
import { motion } from 'motion/react';

interface DatasetListProps {
  datasets: ZFSDataset[];
  selectedName?: string;
  onSelect?: (name: string) => void;
}

export default function DatasetList({ datasets }: DatasetListProps) {
  return (
    <div className="max-w-[1600px] mx-auto pb-10">
      <div className="glass-panel overflow-hidden border-white/[0.03]">
        <div className="p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/[0.03] bg-gradient-to-r from-white/[0.01] to-transparent">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Storage Volumes</h2>
            <p className="text-slate-500 font-medium mt-1">Dataset hierarchy and logical volume management</p>
          </div>
          <button className="apple-button apple-button-primary !py-4 !px-8">
            <Plus size={18} strokeWidth={3} />
            <span className="text-[11px] font-black uppercase tracking-widest">Provision Volume</span>
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4">
            {datasets.map((ds, i) => (
              <motion.div 
                key={ds.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-8 bg-white/[0.01] rounded-[2rem] hover:bg-white/[0.03] transition-all group border border-white/[0.03] hover:border-white/[0.08]"
              >
                <div className="flex items-center gap-8 mb-6 lg:mb-0">
                  <div className="w-16 h-16 bg-white/[0.03] border border-white/[0.05] rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-zfs-accent group-hover:scale-110 transition-all shadow-lg">
                    <HardDrive size={28} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="flex items-center gap-4 mb-1.5">
                      <p className="text-2xl font-black text-white leading-none tracking-tight group-hover:text-zfs-accent transition-colors">{ds.name.split('/').pop()}</p>
                      {ds.readonly && (
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          <Lock size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{ds.name}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-10 lg:gap-14">
                  <div className="flex items-center gap-10">
                    <div className="min-w-[80px]">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Compression</p>
                      <span className="px-3 py-1 rounded-lg bg-white/[0.03] text-[11px] font-black text-white/70 border border-white/[0.05] uppercase tracking-tighter">{ds.compression}</span>
                    </div>
                    <div className="min-w-[60px]">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Dedup</p>
                      <span className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-tighter border ${ds.dedup === 'on' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/[0.03] text-slate-500 border-white/[0.05]'}`}>{ds.dedup}</span>
                    </div>
                  </div>

                  <div className="min-w-[180px]">
                    {(() => {
                      const usedMatch = ds.used.match(/(\d+(\.\d+)?)\s*(\w+)/);
                      const availMatch = ds.avail.match(/(\d+(\.\d+)?)\s*(\w+)/);
                      let percent = 0;
                      if (usedMatch && availMatch) {
                        const u = parseFloat(usedMatch[1]);
                        const a = parseFloat(availMatch[1]);
                        const uUnit = usedMatch[3].toUpperCase();
                        const aUnit = availMatch[3].toUpperCase();
                        
                        const toMb = (v: number, unit: string) => {
                          if (unit.startsWith('T')) return v * 1024 * 1024;
                          if (unit.startsWith('G')) return v * 1024;
                          if (unit.startsWith('K')) return v / 1024;
                          return v;
                        };
                        
                        const uMb = toMb(u, uUnit);
                        const aMb = toMb(a, aUnit);
                        percent = (uMb / (uMb + aMb)) * 100;
                      }

                      return (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Resource Usage</p>
                            <p className="text-[11px] font-black text-white">{ds.used}</p>
                          </div>
                          <div className="w-full h-1.5 bg-white/[0.03] rounded-full overflow-hidden p-0.5 border border-white/[0.02]">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              className="h-full bg-zfs-accent rounded-full shadow-[0_0_10px_rgba(34,211,238,0.4)]" 
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex items-center gap-3 ml-auto">
                    <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.02] border border-white/[0.03] text-slate-500 hover:text-white hover:bg-white/[0.05] hover:border-white/[0.1] transition-all">
                      <Settings size={20} strokeWidth={2.5} />
                    </button>
                    <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.02] border border-white/[0.03] text-slate-500 hover:text-white hover:bg-white/[0.05] hover:border-white/[0.1] transition-all">
                      <MoreVertical size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
