import { useState } from 'react';
import { User, Users, Globe, Plus, Trash2, ChevronRight, Lock, ShieldCheck } from 'lucide-react';
import type { ACLRule } from '../types';
import { motion } from 'motion/react';

export default function ACLManager() {
  const [rules] = useState<ACLRule[]>([
    { id: '1', type: 'user', name: 'admin', permissions: ['read', 'write', 'execute'], inheritance: 'all' },
    { id: '2', type: 'group', name: 'developers', permissions: ['read', 'write'], inheritance: 'file' },
    { id: '3', type: 'everyone', name: 'everyone', permissions: ['read'], inheritance: 'none' },
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'user': return <User size={20} />;
      case 'group': return <Users size={20} />;
      default: return <Globe size={20} />;
    }
  };

  return (
    <div className="glass-panel overflow-hidden">
      <div className="p-10 flex justify-between items-end border-b border-white/[0.03]">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Access Control (ACL)</h2>
          <p className="text-sm font-medium text-white/40 mt-1">Configure granular permissions and inheritance chains</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="apple-button apple-button-primary px-6 h-12 text-xs uppercase tracking-widest font-black"
        >
          <Plus size={18} /> <span className="ml-1">Define Policy</span>
        </motion.button>
      </div>

      <div className="p-8">
        <div className="space-y-4">
          {rules.map((rule, i) => (
            <motion.div 
              key={rule.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-8 bg-white/[0.01] rounded-[2.5rem] hover:bg-white/[0.04] transition-all group border border-white/[0.03] hover:border-white/10"
            >
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 bg-white/[0.03] rounded-[1.5rem] flex items-center justify-center text-white/20 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all duration-500 group-hover:scale-110 border border-white/5">
                  {getIcon(rule.type)}
                </div>
                <div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-bold text-white tracking-tight">{rule.name}</p>
                    <span className="text-[9px] font-black uppercase px-2.5 py-1 bg-white/5 text-white/30 rounded-lg border border-white/10 tracking-widest">{rule.type}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {rule.permissions.map(p => (
                      <span key={p} className="text-[9px] font-black text-zfs-accent bg-zfs-accent/5 px-2.5 py-1 rounded-lg border border-zfs-accent/10 uppercase tracking-widest">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-16">
                <div className="text-left border-l border-white/5 pl-16">
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Inheritance Model</p>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={12} className="text-emerald-400" />
                    <p className="text-xs font-bold text-white/80 capitalize">{rule.inheritance}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/[0.02] text-white/20 hover:text-white hover:bg-white/[0.08] transition-all border border-white/5"
                  >
                    <ChevronRight size={18} />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/[0.02] text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-white/5"
                  >
                    <Trash2 size={18} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="p-8 bg-white/[0.02] border-t border-white/[0.03]">
        <div className="flex items-center gap-4 text-white/40">
          <div className="p-2 bg-zfs-accent/5 rounded-lg">
            <Lock size={16} className="text-zfs-accent" />
          </div>
          <p className="text-[11px] font-bold tracking-tight uppercase tracking-[0.05em]">
            Security Advisory: <span className="text-white/20 font-medium normal-case">Changes to ACLs are applied recursively to all sub-directories and files within this volume.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
