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
      case 'user': return <User size={24} />;
      case 'group': return <Users size={24} />;
      default: return <Globe size={24} />;
    }
  };

  return (
    <div className="nexus-card !p-0 overflow-hidden">
      <div className="p-12 flex justify-between items-end border-b border-white/[0.03] bg-white/[0.01]">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic">Access Control (ACL)</h2>
          <p className="text-sm font-medium text-white/30 mt-2">Configure granular permissions and inheritance chains</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="apple-button apple-button-primary px-10 h-14 text-xs uppercase tracking-[0.3em] font-black"
        >
          <Plus size={20} /> <span className="ml-1">Define Policy</span>
        </motion.button>
      </div>

      <div className="p-10 space-y-6">
        {rules.map((rule, i) => (
          <motion.div 
            key={rule.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between p-10 bg-white/[0.01] rounded-[3rem] hover:bg-white/[0.04] transition-all group border border-white/[0.03] hover:border-white/10"
          >
            <div className="flex items-center gap-10">
              <div className="w-20 h-20 bg-white/[0.03] rounded-[2rem] flex items-center justify-center text-white/20 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all duration-500 group-hover:scale-110 border border-white/5">
                {getIcon(rule.type)}
              </div>
              <div>
                <div className="flex items-center gap-6">
                  <p className="text-xl font-black tracking-tight text-white uppercase italic">{rule.name}</p>
                  <span className="text-[10px] font-black uppercase px-3 py-1 bg-white/5 text-white/30 rounded-lg border border-white/10 tracking-widest">{rule.type}</span>
                </div>
                <div className="flex gap-3 mt-4">
                  {rule.permissions.map(p => (
                    <span key={p} className="text-[10px] font-black text-blue-400 bg-blue-500/5 px-3 py-1 rounded-lg border border-blue-500/10 uppercase tracking-widest">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-20">
              <div className="text-left border-l border-white/5 pl-20">
                <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em] mb-3">Inheritance Model</p>
                <div className="flex items-center gap-3">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <p className="text-sm font-bold text-white/80 capitalize">{rule.inheritance}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(59,130,246,0.1)' }}
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/[0.02] text-white/20 hover:text-white transition-all border border-white/5"
                >
                  <ChevronRight size={22} />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(225,29,72,0.1)' }}
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/[0.02] text-white/20 hover:text-rose-400 transition-all border border-white/5"
                >
                  <Trash2 size={22} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-10 bg-white/[0.02] border-t border-white/[0.03]">
        <div className="flex items-center gap-5 text-white/40">
          <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
            <Lock size={20} className="text-blue-400" />
          </div>
          <p className="text-[11px] font-black tracking-widest uppercase">
            Security Advisory: <span className="text-white/20 font-medium normal-case">Changes to ACLs are applied recursively to all sub-directories and files within this volume.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
