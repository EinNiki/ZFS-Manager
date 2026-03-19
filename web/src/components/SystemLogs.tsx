import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info, XCircle, Clock, Trash2, Download, Search } from 'lucide-react';
import { ZFSLog } from '../types';

interface SystemLogsProps {
  logs: ZFSLog[];
}

export default function SystemLogs({ logs }: SystemLogsProps) {
  return (
    <div className="space-y-10 max-w-[1700px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-4">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">System Telemetry</h2>
          <p className="text-slate-500 font-medium mt-1">Real-time infrastructure events and operation audit</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group w-72">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-zfs-accent transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search telemetry..." 
              className="bg-white/[0.03] border border-white/[0.05] rounded-2xl pl-12 pr-6 py-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-zfs-accent/20 focus:border-zfs-accent/30 w-full transition-all group-hover:bg-white/[0.05]" 
            />
          </div>
          <button className="apple-button apple-button-secondary !py-4 !px-6 flex items-center gap-3">
            <Download size={18} />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">Export Archive</span>
          </button>
          <button className="apple-button apple-button-secondary !py-4 !px-6 !text-rose-500 hover:bg-rose-500/5 hover:border-rose-500/10 flex items-center gap-3">
            <Trash2 size={18} />
            <span className="text-[11px] font-black uppercase tracking-widest">Wipe Buffer</span>
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden border-white/[0.03] mx-4 bg-gradient-to-b from-white/[0.01] to-transparent">
        <div className="max-h-[700px] overflow-y-auto divide-y divide-white/[0.02] no-scrollbar scroll-smooth">
          {logs.map((log, idx) => (
            <motion.div 
              key={log.id || idx}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.02 }}
              className="p-8 hover:bg-white/[0.01] transition-all flex items-start gap-8 group cursor-default"
            >
              <div className={`p-3.5 rounded-2xl flex-shrink-0 border ${
                log.level === 'error' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                log.level === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-zfs-accent/10 text-zfs-accent border-zfs-accent/20'
              } group-hover:scale-110 transition-transform shadow-lg`}>
                {log.level === 'error' ? <XCircle size={20} strokeWidth={2.5} /> : 
                 log.level === 'warning' ? <AlertTriangle size={20} strokeWidth={2.5} /> : 
                 <Info size={20} strokeWidth={2.5} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 mb-2.5">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                    log.level === 'error' ? 'text-rose-400' :
                    log.level === 'warning' ? 'text-amber-400' :
                    'text-zfs-accent'
                  }`}>
                    {log.level}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={12} className="opacity-40" />
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    <span className="opacity-40 text-[9px] lowercase mx-1">—</span>
                    {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm font-black text-slate-300 leading-relaxed font-mono tracking-tight group-hover:text-white transition-colors">{log.message}</p>
              </div>
              {log.pool && (
                <div className="px-4 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:border-zfs-accent/20 group-hover:text-zfs-accent transition-all">
                  POOL: {log.pool}
                </div>
              )}
            </motion.div>
          ))}
          {logs.length === 0 && (
            <div className="py-48 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-white/[0.02] rounded-full border border-white/[0.03] flex items-center justify-center text-white/5 mb-8">
                <Info size={48} strokeWidth={1} />
              </div>
              <h3 className="text-2xl font-black text-white/20 uppercase tracking-[0.2em]">Silence Observed</h3>
              <p className="text-slate-700 mt-3 font-medium text-sm">System telemetry buffer is currently empty. Events will populate in real-time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
