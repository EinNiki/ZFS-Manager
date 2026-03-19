import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Trash2, RotateCcw, Search, Clock, Plus, Database } from 'lucide-react';

interface SnapshotManagerProps {
  snapshots: any[];
}

export default function SnapshotManager({ snapshots }: SnapshotManagerProps) {
  return (
    <div className="space-y-10 max-w-[1700px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-4">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">Recovery Points</h2>
          <p className="text-slate-500 font-medium mt-1">Point-in-time dataset snapshots and retention control</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative group w-80">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-zfs-accent transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Filter recovery points..." 
              className="bg-white/[0.03] border border-white/[0.05] rounded-2xl pl-12 pr-6 py-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-zfs-accent/20 focus:border-zfs-accent/30 w-full transition-all group-hover:bg-white/[0.05]" 
            />
          </div>
          <button className="apple-button apple-button-primary !py-4 !px-8">
            <Plus size={18} strokeWidth={3} />
            <span className="text-[11px] font-black uppercase tracking-widest">Create Moment</span>
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden border-white/[0.03] mx-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.03]">
                <th className="px-10 py-6 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Snapshot Signature</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Source Dataset</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Data Size</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-10 py-6 text-right text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {snapshots.map((snap, idx) => (
                <motion.tr 
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-white/[0.01] transition-colors group cursor-default"
                >
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/[0.03] border border-white/[0.05] text-zfs-accent rounded-xl group-hover:scale-110 group-hover:bg-zfs-accent/10 transition-all">
                        <Camera size={18} strokeWidth={2.5} />
                      </div>
                      <span className="text-sm font-black text-white group-hover:text-zfs-accent transition-colors">{snap.name.split('@').pop()}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white/40 transition-colors">{snap.name.split('@')[0]}</span>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-xs font-black text-white/70 uppercase tracking-tighter">{snap.used}</span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3 text-slate-500">
                      <Clock size={14} className="opacity-40" />
                      <span className="text-[11px] font-bold">{snap.creation || 'Historical'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                      <button className="w-10 h-10 flex items-center justify-center bg-white/[0.03] border border-white/[0.05] rounded-xl hover:text-emerald-400 hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all" title="Rollback System">
                        <RotateCcw size={18} strokeWidth={2.5} />
                      </button>
                      <button className="w-10 h-10 flex items-center justify-center bg-white/[0.03] border border-white/[0.05] rounded-xl hover:text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/5 transition-all" title="Purge Record">
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {snapshots.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <div className="p-8 rounded-full bg-white/[0.02] border border-white/[0.03] mb-8">
              <Camera size={64} className="text-white/5" strokeWidth={1} />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">No Snapshots Found</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">Recovery telemetry is currently dormant. Create your first moment to enable system rollback capabilities.</p>
            <button className="mt-10 apple-button apple-button-primary !py-4 !px-10 font-black">
               Create Snapshot Moment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
