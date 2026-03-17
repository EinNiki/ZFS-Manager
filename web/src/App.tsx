import { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  User as UserIcon, 
  Activity, 
  Database, 
  HardDrive as Disk,
  Terminal,
  Zap,
  Globe,
  RefreshCw,
  ShieldCheck,
  Activity as Pulse
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import DatasetList from './components/DatasetList';
import ACLManager from './components/ACLManager';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ZFSDataset } from './types';

// --- Nexus Gen 2 Mock Data ---
const performanceData = [
  { time: '00:00', throughput: 450, iops: 1200, latency: 0.5 },
  { time: '04:00', throughput: 890, iops: 2400, latency: 0.8 },
  { time: '08:00', throughput: 1200, iops: 3800, latency: 1.2 },
  { time: '12:00', throughput: 950, iops: 2900, latency: 0.9 },
  { time: '16:00', throughput: 1350, iops: 4200, latency: 1.5 },
  { time: '20:00', throughput: 800, iops: 2100, latency: 0.7 },
  { time: '23:59', throughput: 550, iops: 1500, latency: 0.6 },
];

const mockDatasets: ZFSDataset[] = [
  { id: '1', name: 'tank/production', used: '1.2TB', avail: '8.8TB', refer: '1.2TB', mountpoint: '/mnt/prod', compression: 'lz4', dedup: 'off', readonly: false },
  { id: '2', name: 'tank/backups', used: '4.5TB', avail: '5.5TB', refer: '4.5TB', mountpoint: '/mnt/backup', compression: 'zstd', dedup: 'on', readonly: true },
];

const mockPools = [
  { name: 'tank-main', size: '20TB', alloc: '4.2TB', free: '15.8TB', cap: 21, health: 'ONLINE' },
  { name: 'data-nexus', size: '100TB', alloc: '65TB', free: '35TB', cap: 65, health: 'ONLINE' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Initialization logic if needed
  }, []);

  return (
    <div className="relative min-h-screen bg-zfs-bg text-white overflow-hidden selection:bg-blue-500/30">
      {/* Nexus Liquid Background */}
      <div className="nexus-bg">
        <div className="liquid-blob blob-1" />
        <div className="liquid-blob blob-2" />
        <div className="liquid-blob blob-3" />
      </div>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="pl-[24rem] pr-12 py-12 min-h-screen overflow-y-auto no-scrollbar relative z-10">
        {/* Modern Command Header */}
        <header className="flex justify-between items-center mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
            <div className="relative group">
                <div className="absolute -inset-2 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="nexus-card !p-3.5 !rounded-2xl border-white/5 bg-white/[0.02] relative">
                    <Terminal size={20} className="text-blue-400" />
                </div>
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                {activeTab === 'dashboard' ? 'Nexus Terminal' : activeTab}
              </h2>
              <div className="flex items-center gap-2 mt-2 opacity-40">
                <Globe size={10} />
                <span className="text-[10px] font-black tracking-[0.3em] uppercase">Node: storage-delta-01</span>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center gap-10">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="EXECUTE SCAN..."
                className="bg-white/[0.02] border border-white/5 rounded-3xl px-14 py-4.5 w-96 text-xs font-black tech-font tracking-widest focus:outline-none focus:border-blue-500/30 transition-all placeholder:text-white/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-5">
                <button className="nexus-card !p-4.5 !rounded-2xl border-white/5 bg-white/[0.02] text-white/40 hover:text-white hover:border-white/20 transition-all">
                    <Bell size={20} />
                </button>
                <div className="w-px h-8 bg-white/5 mx-2" />
                <button className="nexus-card !p-4.5 !rounded-2xl border-white/5 bg-white/[0.02] text-white/40 hover:text-white hover:border-white/20 transition-all">
                    <UserIcon size={20} />
                </button>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Ultra-Modern Stat Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                {[
                    { label: 'System Health', value: '98.4%', trend: 'OPTIMAL', icon: ShieldCheck, color: 'text-emerald-400', glow: 'neon-glow-emerald' },
                    { label: 'Total Capacity', value: '142.8 TB', trend: '12% USED', icon: Database, color: 'text-blue-400', glow: 'neon-glow-blue' },
                    { label: 'Network Flow', value: '942 MB/s', trend: '+12.4%', icon: Activity, color: 'text-blue-400', glow: 'neon-glow-blue' },
                    { label: 'IO Velocity', value: '4.2k IOPS', trend: 'STEADY', icon: Pulse, color: 'text-indigo-400', glow: 'neon-glow-blue' },
                ].map((stat) => (
                    <motion.div 
                        key={stat.label}
                        whileHover={{ scale: 1.02 }}
                        className={`nexus-card group ${stat.glow} transition-all duration-500`}
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className={`p-5 rounded-2xl bg-white/[0.03] border border-white/5 ${stat.color} group-hover:scale-110 transition-all duration-500`}>
                                <stat.icon size={26} />
                            </div>
                            <span className={`text-[10px] font-black tech-font tracking-widest px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/5 ${stat.color}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.25em] mb-2">{stat.label}</h3>
                        <p className="text-4xl font-black tracking-tighter">{stat.value}</p>
                        
                        <div className="mt-8 pt-8 border-t border-white/[0.03] flex items-center justify-between">
                            <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">Active Process</span>
                            <div className="flex gap-1.5">
                                {[1,2,3,4].map(b => (
                                    <div key={b} className={`w-1 h-3.5 rounded-full ${stat.color} opacity-${b*2}0 animate-pulse`} style={{ animationDelay: `${b*0.2}s` }} />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
              </div>

              {/* Modular Command Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                    {/* Living Throughput Velocity */}
                    <div className="nexus-card">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h3 className="text-2xl font-black tracking-tighter uppercase italic">Flow Velocity</h3>
                                <p className="text-sm font-medium text-white/30 mt-2">Real-time I/O throughput spectral analysis</p>
                            </div>
                            <div className="flex items-center gap-10 tech-font">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-white/10 uppercase tracking-widest mb-2">Peak Read</p>
                                    <p className="text-lg font-bold text-blue-400 tracking-tight">1.42 GB/s</p>
                                </div>
                                <div className="text-right border-l border-white/5 pl-10">
                                    <p className="text-[10px] font-black text-white/10 uppercase tracking-widest mb-2">Peak Write</p>
                                    <p className="text-lg font-bold text-purple-400 tracking-tight">890 MB/s</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-[350px] w-full mt-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={performanceData}>
                                    <defs>
                                        <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 900}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 900}} />
                                    <Tooltip 
                                        contentStyle={{backgroundColor: 'rgba(2, 6, 23, 0.9)', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '2rem', backdropFilter: 'blur(25px)', padding: '1.5rem'}}
                                        itemStyle={{color: '#fff', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase'}}
                                    />
                                    <Area type="monotone" dataKey="throughput" stroke="#3b82f6" strokeWidth={5} fillOpacity={1} fill="url(#colorThroughput)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Node Overview & Active Pools */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="nexus-card">
                            <h3 className="text-sm font-black text-white/30 uppercase tracking-[0.25em] mb-10">System Repository</h3>
                            <div className="space-y-8">
                                {mockPools.map((pool) => (
                                    <div key={pool.name} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] group hover:border-white/10 transition-all duration-500">
                                        <div className="flex justify-between items-center mb-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-all duration-500">
                                                    <Database size={22} />
                                                </div>
                                                <span className="text-base font-bold tracking-tight">{pool.name}</span>
                                            </div>
                                            <span className="status-badge status-online text-[9px]">Online</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/[0.03] rounded-full overflow-hidden mb-4 border border-white/5">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pool.cap}%` }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" 
                                            />
                                        </div>
                                        <div className="flex justify-between text-[11px] font-black tech-font text-white/20 uppercase tracking-widest">
                                            <span>{pool.alloc} USED</span>
                                            <span>{pool.size} TOTAL</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="nexus-card">
                            <h3 className="text-sm font-black text-white/30 uppercase tracking-[0.25em] mb-10">Process Registry</h3>
                            <div className="space-y-5">
                                {[
                                    { label: 'ZFS Scrubbing', status: 'ACTIVE', progress: 42 },
                                    { label: 'Cloud Replication', status: 'SYNCHING', progress: 88 },
                                    { label: 'Auto Snapshot', status: 'IDLE', progress: 0 },
                                    { label: 'Dataset Backup', status: 'QUEUED', progress: 0 },
                                ].map((task) => (
                                    <div key={task.label} className="flex items-center justify-between p-5 px-8 bg-white/[0.01] rounded-[1.5rem] border border-white/[0.02] hover:bg-white/[0.03] transition-all">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-2.5 h-2.5 rounded-full ${task.progress > 0 ? 'bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`} />
                                            <span className="text-sm font-bold text-white/60">{task.label}</span>
                                        </div>
                                        <span className="text-[10px] font-black tech-font text-white/20 uppercase tracking-widest">{task.status}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="apple-button apple-button-secondary w-full mt-10 text-[10px] h-14 uppercase tracking-[0.4em] font-black">Full Registry</button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Node Pulse & Resources */}
                <div className="space-y-12">
                    <div className="nexus-card neon-glow-blue !p-0 overflow-hidden relative min-h-[500px] flex flex-col">
                        <div className="p-12 relative z-10">
                            <h3 className="text-2xl font-black tracking-tighter uppercase italic">Node Core</h3>
                            <p className="text-sm font-medium text-white/30 mt-2">Resource allocation matrix</p>
                        </div>
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                             <div className="w-[400px] h-[400px] border-[1px] border-white/20 rounded-full animate-[spin_60s_linear_infinite]" />
                             <div className="absolute w-[300px] h-[300px] border-[1px] border-white/20 border-dashed rounded-full animate-[spin_40s_linear_infinite_reverse]" />
                             <div className="absolute w-[200px] h-[200px] border-[1px] border-white/20 rounded-full animate-[spin_20s_linear_infinite]" />
                        </div>

                        <div className="p-12 space-y-10 relative z-10 flex-1">
                            {[
                                { label: 'ARC Cache', value: '32.4 GB', percent: 85, color: 'bg-blue-500' },
                                { label: 'CPU Cluster', value: '12% Load', percent: 12, color: 'bg-purple-500' },
                                { label: 'L2ARC Hit', value: '4.2 k/s', percent: 65, color: 'bg-indigo-500' },
                                { label: 'IO Wait', value: '0.04 ms', percent: 5, color: 'bg-emerald-500' },
                            ].map((res) => (
                                <div key={res.label}>
                                    <div className="flex justify-between items-end mb-4">
                                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">{res.label}</span>
                                        <span className="text-base font-black tech-font text-white">{res.value}</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${res.percent}%` }}
                                            transition={{ duration: 2, ease: "circOut" }}
                                            className={`h-full ${res.color} rounded-full`} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="p-10 bg-blue-500/5 mt-auto border-t border-white/[0.05]">
                            <div className="flex items-center gap-4">
                                <Disk size={18} className="text-blue-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Array Status: OPTIMIZED</span>
                            </div>
                        </div>
                    </div>

                    <div className="nexus-card">
                        <h3 className="text-sm font-black text-white/30 uppercase tracking-[0.25em] mb-10">Event Spectrum</h3>
                        <div className="space-y-8">
                            {[
                                { msg: 'Pool scrubbing complete', time: '2m ago', type: 'info' },
                                { msg: 'High ARC pressure detected', time: '12m ago', type: 'warn' },
                                { msg: 'Snapshot delta generated', time: '45m ago', type: 'info' },
                                { msg: 'Remote sync established', time: '1h ago', type: 'info' },
                            ].map((ev, i) => (
                                <div key={i} className="flex gap-6 items-start pb-8 border-b border-white/[0.03] last:border-0 last:pb-0 group">
                                    <div className={`mt-2 w-2 h-2 rounded-full shrink-0 ${ev.type === 'info' ? 'bg-blue-400' : 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`} />
                                    <div>
                                        <p className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{ev.msg}</p>
                                        <p className="text-[10px] font-black tech-font text-white/10 uppercase tracking-widest mt-2">{ev.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="apple-button apple-button-secondary w-full mt-10 text-[10px] h-14 uppercase tracking-[0.4em] font-black">Audit History</button>
                    </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'datasets' && (
             <motion.div 
                key="datasets"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
             >
                <DatasetList datasets={mockDatasets} />
             </motion.div>
          )}

          {activeTab === 'permissions' && (
             <motion.div 
                key="permissions"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
             >
                <ACLManager />
             </motion.div>
          )}

          {/* Nexus Placeholder for other modules */}
          {['stats', 'pools', 'snapshots', 'replication', 'scrub', 'logs', 'settings'].includes(activeTab) && (
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="nexus-card min-h-[700px] flex items-center justify-center relative overflow-hidden"
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <Zap size={500} />
              </div>
              <div className="text-center relative z-10 px-12">
                <motion.div 
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 bg-blue-500/10 rounded-[3rem] flex items-center justify-center text-blue-400 mx-auto mb-12 border border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.1)]"
                >
                    <RefreshCw size={50} opacity={0.4} />
                </motion.div>
                <h3 className="text-5xl font-black tracking-tighter uppercase italic mb-6">Module Calibration</h3>
                <p className="text-base font-medium text-white/30 max-w-lg mx-auto mb-12 leading-relaxed">
                  The <span className="text-white uppercase font-black tracking-widest">{activeTab}</span> analytics spectrum is currently being established for your storage node.
                </p>
                <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59,130,246,0.4)' }}
                    whileTap={{ scale: 0.95 }}
                    className="apple-button apple-button-primary px-14 h-16 text-xs uppercase tracking-[0.4em] font-black"
                >
                    Sync Terminal
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Global Tech Overlay */}
      <div className="fixed bottom-12 right-12 flex gap-5 z-50">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="nexus-card !p-5 !px-8 !rounded-2xl border-white/5 bg-white/[0.05] tech-font text-[11px] font-black tracking-[0.3em] text-emerald-400/80 flex items-center gap-4 backdrop-blur-3xl"
          >
            <Pulse size={14} className="animate-pulse" />
            LIVE LINK: SECURE
          </motion.div>
      </div>
    </div>
  );
}
