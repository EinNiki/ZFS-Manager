import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Cpu, ShieldCheck, Activity } from 'lucide-react';

interface PerformanceProps {
  stats: any[];
}

export default function Performance({ stats }: PerformanceProps) {
  return (
    <div className="space-y-10 pb-10 max-w-[1600px] mx-auto no-scrollbar">
      {stats.length === 0 && (
        <div className="glass-panel p-10 flex flex-col items-center justify-center text-center mx-4">
          <div className="w-12 h-12 bg-white/[0.02] rounded-xl flex items-center justify-center text-slate-700 mb-4 border border-white/[0.05]">
            <Activity size={24} />
          </div>
          <h3 className="text-lg font-black text-white mb-1">Telemetry Pending</h3>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Awaiting real-time stream from node hardware...</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4">
        {/* Throughput */}
        <div className="glass-panel p-5">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Throughput</h3>
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-1">Real-time IO performance</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-zfs-accent shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Read</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-zfs-secondary shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Write</span>
              </div>
            </div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats} style={{ outline: 'none' }}>
                <defs>
                  <linearGradient id="colorRead" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorWrite" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818CF8" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700 }} minTickGap={40} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                  itemStyle={{ fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '10px', marginBottom: '8px', textTransform: 'uppercase' }}
                  formatter={(value: number) => [`${value.toFixed(2)} MB/s`, ""]}
                />
                <Area type="monotone" dataKey="read" stroke="#22D3EE" fillOpacity={1} fill="url(#colorRead)" strokeWidth={3} animationDuration={1000} />
                <Area type="monotone" dataKey="write" stroke="#818CF8" fillOpacity={1} fill="url(#colorWrite)" strokeWidth={3} animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* IOPS */}
        <div className="glass-panel p-5">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">IOPS</h3>
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-1">Transaction rate monitoring</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Ops</span>
            </div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats} style={{ outline: 'none' }}>
                <defs>
                  <linearGradient id="colorIops" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700 }} minTickGap={40} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}
                  itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                  labelStyle={{ color: 'opacity-40', fontWeight: 800, fontSize: '10px' }}
                  formatter={(value: number) => [`${value.toFixed(2)}`, "IOPS"]}
                />
                <Area type="monotone" dataKey="iops" stroke="#F59E0B" fillOpacity={1} fill="url(#colorIops)" strokeWidth={3} animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CPU & System */}
        <div className="glass-panel p-5">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">System Resources</h3>
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-1">CPU Load & ARC efficiency</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CPU</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ARC Hit</span>
              </div>
            </div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats} style={{ outline: 'none' }}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorArc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700 }} minTickGap={40} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}
                  formatter={(value: number) => [`${value.toFixed(2)}%`, ""]}
                />
                <Area type="monotone" dataKey="cpu" stroke="#6366F1" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={3} animationDuration={1000} />
                <Area type="monotone" dataKey="arcHit" stroke="#10B981" fillOpacity={1} fill="url(#colorArc)" strokeWidth={3} animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Space Utilization */}
        <div className="glass-panel p-5">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Storage Trends</h3>
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-1">Global pool allocation history</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consumed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-zfs-accent shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available</span>
              </div>
            </div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats} style={{ outline: 'none' }}>
                <defs>
                  <linearGradient id="colorUsed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFree" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700 }} minTickGap={40} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}
                  formatter={(value: number) => [`${value.toFixed(2)} GB`, ""]}
                />
                <Area type="monotone" dataKey="alloc" stroke="#F43F5E" fillOpacity={1} fill="url(#colorUsed)" strokeWidth={3} animationDuration={1000} />
                <Area type="monotone" dataKey="free" stroke="#22D3EE" fillOpacity={1} fill="url(#colorFree)" strokeWidth={3} animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
