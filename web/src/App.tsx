import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Bell, 
  User, 
  HardDrive, 
  ShieldCheck, 
  Database,
  Camera,
  RefreshCw,
  Layers,
  Zap,
  Cpu,
  ArrowUpRight,
  ArrowDownRight,
  Settings as SettingsIcon,
  ChevronRight,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  Thermometer,
  Info,
  AlertTriangle,
  XCircle,
  Terminal,
  Server,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import DatasetList from './components/DatasetList';
import ACLManager from './components/ACLManager';
import type { ZFSPool, ZFSDataset, ZFSLog, DiskSmart, DiskStat } from './types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDatasets, getPools } from './api';
import type { ZfsDataset as ApiDataset, ZfsPool as ApiPool } from './api';

// Helper for generating mock stats for charts
const generateMockStats = () => {
  const stats: DiskStat[] = [];
  const now = new Date();
  for (let i = 0; i < 20; i++) {
    stats.push({
      timestamp: new Date(now.getTime() - (20 - i) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: Math.floor(Math.random() * 500) + 100,
      write: Math.floor(Math.random() * 300) + 50,
      iops: Math.floor(Math.random() * 5000) + 1000,
      latency: (Math.random() * 5 + 1).toFixed(2),
      arcHit: Math.floor(Math.random() * 10) + 90,
      l2arcHit: Math.floor(Math.random() * 20) + 70,
    });
  }
  return stats;
};

// Mock data for components not yet in API
const mockLogs: ZFSLog[] = [
  { id: '1', timestamp: '2026-03-06 14:20:12', level: 'info', message: 'Pool "tank" scrub started.', pool: 'tank' },
  { id: '2', timestamp: '2026-03-06 14:25:45', level: 'info', message: 'Dataset "tank/data" property "compression" set to "lz4".', pool: 'tank' },
  { id: '3', timestamp: '2026-03-06 14:30:00', level: 'warning', message: 'Disk "sde" reported high temperature (45°C).', pool: 'tank' },
  { id: '4', timestamp: '2026-03-06 14:32:10', level: 'info', message: 'Snapshot "tank/data@hourly-1" created.', pool: 'tank' },
  { id: '5', timestamp: '2026-03-06 14:35:00', level: 'error', message: 'Replication task "tank/data → remote" failed: Connection timed out.', pool: 'tank' },
];

const mockSmartData: DiskSmart[] = [
  { device: 'sda', model: 'Samsung SSD 870', serial: 'S5YJN123456', temperature: 32, powerOnHours: 12450, status: 'PASSED', reallocatedSectors: 0 },
  { device: 'sdb', model: 'Samsung SSD 870', serial: 'S5YJN123457', temperature: 33, powerOnHours: 12452, status: 'PASSED', reallocatedSectors: 0 },
  { device: 'sdc', model: 'WD Red Pro', serial: 'WD-WCC123456', temperature: 38, powerOnHours: 25600, status: 'PASSED', reallocatedSectors: 0 },
  { device: 'sdd', model: 'WD Red Pro', serial: 'WD-WCC123457', temperature: 39, powerOnHours: 25605, status: 'PASSED', reallocatedSectors: 0 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [datasets, setDatasets] = useState<ZFSDataset[]>([]);
  const [pools, setPools] = useState<ZFSPool[]>([]);
  const [stats, setStats] = useState<DiskStat[]>(generateMockStats());
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [d, p] = await Promise.all([getDatasets(), getPools()]);
      
      const mappedDatasets: ZFSDataset[] = d.map((ds: ApiDataset, index: number) => ({
        id: index.toString(),
        name: ds.name,
        used: ds.used,
        avail: ds.available,
        refer: ds.refer,
        mountpoint: ds.mountpoint,
        compression: 'lz4',
        dedup: 'off',
        readonly: false
      }));

      const mappedPools: ZFSPool[] = p.map((pool: ApiPool) => ({
        name: pool.name,
        size: pool.size,
        alloc: pool.alloc,
        free: pool.free,
        cap: Math.round((parseInt(pool.alloc) / parseInt(pool.size)) * 100) || 0,
        health: pool.health as any,
        raidType: 'Generic',
        vdevs: []
      }));

      setDatasets(mappedDatasets);
      setPools(mappedPools);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setStats(prev => {
        const newStat: DiskStat = {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: Math.floor(Math.random() * 500) + 100,
          write: Math.floor(Math.random() * 300) + 50,
          iops: Math.floor(Math.random() * 5000) + 1000,
          latency: (Math.random() * 5 + 1).toFixed(2),
          arcHit: Math.floor(Math.random() * 10) + 90,
          l2arcHit: Math.floor(Math.random() * 20) + 70,
        };
        return [...prev.slice(1), newStat];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    const currentStats = stats[stats.length - 1] || { read: 0, write: 0, iops: 0 };

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-12">
            {/* High-Impact Stat Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
              {[
                { label: 'Total Capacity', value: pools.length > 0 ? pools.reduce((acc, p) => acc + (parseFloat(p.size) || 0), 0).toFixed(1) + ' TB' : '0 TB', icon: Database, color: 'text-blue-400', trend: '+2.4%', up: true },
                { label: 'CPU Usage', value: '12.4%', icon: Cpu, color: 'text-emerald-400', trend: '-1.2%', up: false },
                { label: 'System Health', value: pools.every(p => p.health === 'ONLINE') ? 'Optimal' : 'Check', icon: ShieldCheck, color: 'text-indigo-400', trend: 'Stable', up: true },
                { label: 'IOPS', value: `${(currentStats.iops / 1000).toFixed(1)}k`, icon: Zap, color: 'text-amber-400', trend: '+12%', up: true },
                { label: 'Read Speed', value: `${currentStats.read} MB/s`, icon: ArrowDownRight, color: 'text-blue-500', trend: 'Live', up: true },
                { label: 'Write Speed', value: `${currentStats.write} MB/s`, icon: ArrowUpRight, color: 'text-emerald-500', trend: 'Live', up: true },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 + 0.2 }}
                  className="glass-panel p-8 flex flex-col gap-6 group hover:translate-y-[-4px]"
                >
                  <div className="flex justify-between items-start">
                    <div className={`p-4 rounded-2xl bg-white/[0.03] ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                      <stat.icon size={28} />
                    </div>
                    <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${stat.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {stat.trend}
                    </div>
                  </div>
                  <div>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-10">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="glass-panel p-10"
                >
                  <div className="flex justify-between items-center mb-10">
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">System Node Overview</h3>
                      <p className="text-sm font-medium text-white/40 mt-1">Status and performance metrics for Node-01</p>
                    </div>
                    <span className="status-badge status-online">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Operational
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-6">Uptime</h4>
                      <p className="text-3xl font-bold text-white tracking-tight">12d 4h 32m</p>
                      <div className="flex items-center gap-2 mt-3 text-white/20 text-[11px] font-medium">
                        <Clock size={12} />
                        <span>Last boot: 2026-02-22</span>
                      </div>
                    </div>
                    
                    <div className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-6">Load Average</h4>
                      <div className="flex gap-8">
                        <div>
                          <p className="text-xl font-bold text-white">0.42</p>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">1m</p>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div>
                          <p className="text-xl font-bold text-white">0.38</p>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">5m</p>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div>
                          <p className="text-xl font-bold text-white">0.31</p>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">15m</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="space-y-10">
                <div className="flex justify-between items-center px-2">
                  <h3 className="text-xl font-bold text-white tracking-tight">Active Pools</h3>
                  <motion.button 
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white/40 hover:text-white transition-all"
                  >
                    <Plus size={22} />
                  </motion.button>
                </div>
                
                <div className="space-y-6">
                  {pools.map((pool, i) => (
                    <motion.div
                      key={pool.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 + 0.6 }}
                      className="glass-panel p-8 group cursor-pointer hover:bg-white/[0.05]"
                    >
                      <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-gradient-to-br from-zfs-accent/20 to-zfs-accent/5 rounded-2xl flex items-center justify-center text-zfs-accent group-hover:scale-110 transition-transform duration-500">
                            <Database size={28} />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-white tracking-tight">{pool.name}</p>
                            <span className={`status-badge mt-2 ${pool.health === 'ONLINE' ? 'status-online' : 'status-error'}`}>
                              {pool.health}
                            </span>
                          </div>
                        </div>
                        <button className="text-white/20 hover:text-white p-2">
                          <MoreHorizontal size={20} />
                        </button>
                      </div>
                      
                      <div className="space-y-5">
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-white/40">
                          <span>Usage Intensity</span>
                          <span className="text-white">{pool.cap}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/[0.03] border border-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${pool.cap}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-zfs-accent via-indigo-500 to-purple-600 rounded-full relative"
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                          </motion.div>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                          <span>{pool.alloc} Allocated</span>
                          <span>{pool.free} Available</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'stats':
        return (
          <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-10"
              >
                <div className="flex justify-between items-center mb-12">
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Throughput Velocity</h3>
                    <p className="text-sm font-medium text-white/40 mt-1">Real-time packet transmission metrics</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Read</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Write</span>
                    </div>
                  </div>
                </div>
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats}>
                      <defs>
                        <linearGradient id="colorRead" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorWrite" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700 }} minTickGap={40} dy={15} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700 }} dx={-10} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(2, 6, 23, 0.8)', 
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '1.5rem',
                          padding: '1.25rem',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                        }} 
                      />
                      <Area type="monotone" dataKey="read" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRead)" strokeWidth={3} />
                      <Area type="monotone" dataKey="write" stroke="#10B981" fillOpacity={1} fill="url(#colorWrite)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="glass-panel p-10"
              >
                <div className="flex justify-between items-center mb-12">
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">I/O Consistency</h3>
                    <p className="text-sm font-medium text-white/40 mt-1">Storage operation volume and frequency</p>
                  </div>
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                    <Zap size={24} />
                  </div>
                </div>
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats}>
                      <defs>
                        <linearGradient id="colorIops" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700 }} minTickGap={40} dy={15} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700 }} dx={-10} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(2, 6, 23, 0.8)', 
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '1.5rem',
                          padding: '1.25rem',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                        }} 
                      />
                      <Area type="monotone" dataKey="iops" stroke="#F59E0B" fillOpacity={1} fill="url(#colorIops)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          </div>
        );
      case 'pools':
        return (
          <div className="space-y-12">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-extrabold text-white tracking-tighter">Storage Pools</h2>
                <p className="text-white/40 font-medium mt-2">Architect and monitor your ZFS storage hierarchy</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={fetchData} 
                className="apple-button apple-button-primary px-8"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} /> 
                <span className="ml-1">Refresh Infrastructure</span>
              </motion.button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {pools.map((pool, i) => (
                <motion.div 
                  key={pool.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-panel p-10 group"
                >
                  <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-zfs-accent/10 rounded-[1.5rem] flex items-center justify-center text-zfs-accent border border-zfs-accent/20 group-hover:scale-110 transition-transform duration-500">
                        <Database size={32} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">{pool.name}</h2>
                        <p className="text-sm font-bold text-white/30 tracking-widest uppercase mt-1">{pool.raidType} • {pool.size}</p>
                      </div>
                    </div>
                    <span className={`status-badge ${pool.health === 'ONLINE' ? 'status-online' : 'status-error'}`}>
                      <div className={`w-2 h-2 rounded-full ${pool.health === 'ONLINE' ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`} />
                      {pool.health}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6 mt-8">
                    {[
                      { label: 'Allocated', value: pool.alloc },
                      { label: 'Free Space', value: pool.free },
                      { label: 'Utilization', value: `${pool.cap}%` },
                    ].map((stat, idx) => (
                      <div key={idx} className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl hover:bg-white/[0.04] transition-colors">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                        <p className="text-xl font-bold text-white tracking-tight">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group/row hover:bg-white/[0.04] cursor-pointer transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white/5 rounded-lg text-white/40 group-hover/row:text-zfs-accent transition-colors">
                            <Layers size={18} />
                        </div>
                        <span className="text-sm font-bold text-white/60">View Virtual Devices (vdevs)</span>
                    </div>
                    <ChevronRight size={18} className="text-white/20 group-hover/row:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      case 'datasets':
        return <DatasetList datasets={datasets} />;
      case 'permissions':
        return <ACLManager />;
      case 'snapshots':
        return (
          <div className="space-y-12">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-extrabold text-white tracking-tighter">Snapshots</h2>
                <p className="text-white/40 font-medium mt-2">Point-in-time recovery and automated scheduling</p>
              </div>
              <button className="apple-button apple-button-primary px-8">
                <Camera size={20} /> <span className="ml-1">Capture Instant State</span>
              </button>
            </div>
            <motion.div 
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               className="glass-panel p-24 text-center border-dashed border-2 border-white/10 bg-transparent"
            >
              <div className="w-24 h-24 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5">
                <Camera size={40} className="text-zfs-accent opacity-40" />
              </div>
              <h2 className="text-2xl font-bold mb-3 tracking-tight">No snapshots found</h2>
              <p className="text-white/40 max-w-sm mx-auto text-sm leading-relaxed font-medium">Protect your data by creating periodic snapshots. They occupy zero space until data changes.</p>
              <button className="mt-10 apple-button apple-button-secondary mx-auto">Learn more about ZFS Snapshots</button>
            </motion.div>
          </div>
        );
      case 'replication':
        return (
          <div className="space-y-12">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-extrabold text-white tracking-tighter">Replication</h2>
                <p className="text-white/40 font-medium mt-2">Secure remote dataset synchronization and offsite backups</p>
              </div>
              <button className="apple-button apple-button-primary px-8">
                <RefreshCw size={20} /> <span className="ml-1">Configure Remote Target</span>
              </button>
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-24 text-center border-dashed border-2 border-white/10 bg-transparent"
            >
              <div className="w-24 h-24 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5">
                <RefreshCw size={40} className="text-zfs-accent opacity-40" />
              </div>
              <h2 className="text-2xl font-bold mb-3 tracking-tight">Active Replication Tasks</h2>
              <p className="text-white/40 max-w-sm mx-auto text-sm leading-relaxed font-medium">No active replication tasks configured. Connect a remote ZFS host to begin offsite backups.</p>
            </motion.div>
          </div>
        );
      case 'scrub':
        return (
          <div className="space-y-12">
             <div className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-extrabold text-white tracking-tighter">Scrub & Health</h2>
                <p className="text-white/40 font-medium mt-2">Data integrity verification and drive health diagnostics</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-panel p-10"
              >
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-zfs-accent/10 rounded-2xl text-zfs-accent border border-zfs-accent/20">
                        <ShieldCheck size={24} />
                    </div>
                    <h4 className="text-xl font-bold tracking-tight">Integrity Verification</h4>
                </div>
                
                <div className="space-y-6">
                  {[
                    { label: 'Last Scrub Completed', value: '2026-03-04 12:00', icon: Clock },
                    { label: 'Checksum Errors Found', value: '0', icon: CheckCircle2, color: 'text-emerald-400' },
                    { label: 'Pool Consistency', value: 'Healthy', status: 'online' },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="text-white/20">{row.icon && <row.icon size={16} />}</div>
                        <span className="text-sm font-bold text-white/40 tracking-wide uppercase text-[10px]">{row.label}</span>
                      </div>
                      {row.status ? (
                         <span className="status-badge status-online text-[9px]">Verified</span>
                      ) : (
                        <span className={`text-sm font-bold ${row.color || 'text-white'}`}>{row.value}</span>
                      )}
                    </div>
                  ))}
                </div>
                <button className="mt-10 w-full apple-button apple-button-primary py-4 font-black tracking-widest uppercase text-xs">Execute Data Scrub</button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-panel p-10"
              >
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20">
                        <HardDrive size={24} />
                    </div>
                    <h4 className="text-xl font-bold tracking-tight">S.M.A.R.T. Diagnostics</h4>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {mockSmartData.slice(0, 2).map((smart) => (
                    <div key={smart.device} className="bg-white/[0.02] p-6 rounded-[2rem] border border-white/[0.05] group hover:bg-white/[0.04] transition-all">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/5 rounded-xl text-zfs-accent group-hover:scale-110 transition-transform">
                              <HardDrive size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-white tracking-tight">{smart.device}</p>
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">{smart.model}</p>
                            </div>
                        </div>
                        <span className={`status-badge ${smart.status === 'PASSED' ? 'status-online' : 'status-error'}`}>
                          {smart.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { icon: Thermometer, value: `${smart.temperature}°C`, label: 'Temp' },
                          { icon: Clock, value: `${(smart.powerOnHours / 24).toFixed(0)}d`, label: 'Uptime' },
                          { icon: AlertTriangle, value: smart.reallocatedSectors, label: 'Sectors', color: smart.reallocatedSectors === 0 ? 'text-emerald-400' : 'text-rose-400' },
                        ].map((stat, idx) => (
                          <div key={idx} className="bg-white/5 p-3 rounded-xl text-center">
                            <div className="flex justify-center mb-1 text-white/20"><stat.icon size={12} /></div>
                            <p className={`text-sm font-bold tracking-tight ${stat.color || 'text-white'}`}>{stat.value}</p>
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        );
      case 'logs':
        return (
          <div className="space-y-12">
            <div className="glass-panel p-10">
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">System Event Registry</h3>
                  <p className="text-sm font-medium text-white/40 mt-1">Audit trail of kernel and middleware operations</p>
                </div>
                <div className="flex gap-4">
                    <button className="apple-button apple-button-secondary px-6 text-xs uppercase tracking-widest font-black">Export Audit</button>
                    <button className="apple-button apple-button-primary px-6 text-xs uppercase tracking-widest font-black">Clear Buffer</button>
                </div>
              </div>
              <div className="space-y-4">
                {mockLogs.map((log, i) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-8 p-6 bg-white/[0.01] rounded-3xl border border-white/[0.03] hover:bg-white/[0.03] hover:border-white/10 transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                      log.level === 'error' ? 'bg-rose-500/10 text-rose-400' :
                      log.level === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-zfs-accent/10 text-zfs-accent'
                    }`}>
                      {log.level === 'error' ? <XCircle size={22} /> :
                       log.level === 'warning' ? <AlertTriangle size={22} /> :
                       <Info size={22} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{log.timestamp}</span>
                        {log.pool && (
                            <span className="text-[9px] font-black uppercase px-2.5 py-1 bg-zfs-accent/5 text-zfs-accent rounded-lg border border-zfs-accent/10 tracking-[0.15em]">
                                {log.pool}
                            </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-white/70 tracking-tight leading-relaxed">{log.message}</p>
                    </div>
                    <ChevronRight size={18} className="text-white/10 group-hover:text-white/30 transition-colors" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-10"
            >
              <div className="flex items-center gap-5 mb-12">
                <div className="p-4 bg-zfs-accent/10 rounded-2xl text-zfs-accent border border-zfs-accent/20">
                    <SettingsIcon size={28} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">System Core</h3>
                    <p className="text-sm font-medium text-white/40">Hardware and network configuration</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {[
                  { label: 'System Hostname', value: 'nexus-zfs-node-01', icon: Server, type: 'input' },
                  { label: 'Secure Shell (SSH)', value: 'Enabled (Port 22)', icon: Terminal, type: 'toggle' },
                  { label: 'Administrative Key', value: '••••••••••••', icon: Key, type: 'input' },
                ].map((item, i) => (
                  <div key={i} className="group">
                    <div className="flex justify-between items-center p-6 bg-white/[0.01] border border-white/[0.03] rounded-3xl group-hover:bg-white/[0.03] group-hover:border-white/10 transition-all">
                        <div className="flex items-center gap-5">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/20 group-hover:text-zfs-accent transition-colors">
                                <item.icon size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">{item.label}</p>
                                <p className="text-sm font-bold text-white/80">{item.value}</p>
                            </div>
                        </div>
                        <button className="p-2 text-white/10 hover:text-white transition-colors">
                            <SettingsIcon size={16} />
                        </button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-12 w-full apple-button apple-button-primary py-4 font-black tracking-widest uppercase text-xs">Commit System Changes</button>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel p-10"
            >
              <div className="flex items-center gap-5 mb-12">
                <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck size={28} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Access & Security</h3>
                    <p className="text-sm font-medium text-white/40">Authentication and session management</p>
                </div>
              </div>
              
              <div className="space-y-5">
                {[
                    { title: 'Multi-Factor Auth', desc: 'Hardware-based security keys (YubiKey)', active: true },
                    { title: 'API Management', desc: 'Secure tokens for third-party orchestration', active: false },
                    { title: 'Session Timeout', desc: 'Automatic logout after 30 minutes of inactivity', active: true },
                ].map((sec, i) => (
                    <div key={i} className="p-6 bg-white/[0.01] border border-white/[0.03] rounded-3xl flex justify-between items-center hover:bg-white/[0.03] transition-colors cursor-pointer group">
                        <div>
                            <p className="text-sm font-bold tracking-tight text-white/80">{sec.title}</p>
                            <p className="text-xs font-medium text-white/30 mt-1">{sec.desc}</p>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative transition-colors duration-500 ${sec.active ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-white/5 border border-white/10'}`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-500 ${sec.active ? 'right-1 bg-emerald-400' : 'left-1 bg-white/10'}`} />
                        </div>
                    </div>
                ))}
              </div>
            </motion.div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-zfs-deep relative font-sans overflow-hidden">
      {/* Background Decor */}
      <div className="bg-mesh-glow" />
      <div className="glow-blob top-[-100px] left-[-100px] animate-float" />
      <div className="glow-blob bottom-[-100px] right-[-100px] animate-float" style={{ animationDelay: '-10s' }} />
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-72 p-12 overflow-y-auto h-screen no-scrollbar relative z-10">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-16"
        >
          <div className="flex items-center gap-6 bg-white/[0.03] border border-white/[0.08] rounded-[2rem] px-8 py-4 w-[28rem] focus-within:bg-white/[0.06] focus-within:border-zfs-accent/50 focus-within:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-500 backdrop-blur-md">
            <Search size={20} className="text-white/30" />
            <input 
              type="text" 
              placeholder="Search storage resources..." 
              className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20 w-full font-medium"
            />
          </div>
          
          <div className="flex items-center gap-8">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 flex items-center justify-center rounded-[1.25rem] bg-white/[0.03] text-white/40 hover:text-white border border-white/[0.08] hover:bg-white/[0.06] transition-all relative backdrop-blur-md"
            >
              <Bell size={22} />
              <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-rose-500 rounded-full border-[3px] border-[#0c1327]" />
            </motion.button>
            
            <div className="flex items-center gap-5 pl-8 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white tracking-wide">Admin System</p>
                <p className="text-[10px] font-black text-zfs-accent uppercase tracking-[0.2em] mt-0.5">Primary Node</p>
              </div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-zfs-accent to-indigo-600 flex items-center justify-center shadow-xl cursor-not-allowed"
              >
                <User size={22} className="text-white" />
              </motion.div>
            </div>
          </div>
        </motion.header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -15 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
