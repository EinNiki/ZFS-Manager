import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function StatCard({ label, value, subValue, icon: Icon, trend }: StatCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      className="glass-panel p-8 flex flex-col gap-6 group hover:bg-white/[0.02] transition-all border-white/[0.03] hover:border-zfs-accent/20"
    >
      <div className="flex justify-between items-start">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-zfs-accent group-hover:bg-zfs-accent/10 transition-colors shadow-lg">
          <Icon size={28} strokeWidth={2.5} />
        </div>
        {trend && (
          <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${trend.isPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
            {trend.value}
          </div>
        )}
      </div>
      <div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 group-hover:text-slate-400 transition-colors">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black text-white tracking-tight">{value}</p>
          {subValue && (
            <p className="text-[11px] text-slate-600 font-bold uppercase tracking-wider">{subValue}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
