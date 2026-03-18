import React, { useState, useEffect } from 'react';
import { 
  Database, 
  HardDrive, 
  Settings, 
  Activity,
  ChevronRight,
  Plus,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Zap,
  MoreHorizontal,
  Camera,
  Trash2,
  AlertTriangle,
  Thermometer,
  CheckCircle2,
  XCircle,
  Info,
  Server,
  Terminal,
  Key,
  Search,
  Bell,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Changed from 'motion/react' to 'framer-motion'
import Sidebar from './components/Sidebar';
import DatasetList from './components/DatasetList';
import PropertiesManager from './components/PropertiesManager';
import { ZFSPool, ZFSDataset, ZFSLog, DiskSmart } from './types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api, formatBytes } from './api';

// Types and constants
// API_BASE_URL removed as it's not used directly here

// No mock data needed here

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pools, setPools] = useState<ZFSPool[]>([]);
  const [datasets, setDatasets] = useState<ZFSDataset[]>([]);
  const [volumes, setVolumes] = useState<any[]>([]);
  const [totalCapacity, setTotalCapacity] = useState<number>(0);
  const [totalUsedStorage, setTotalUsedStorage] = useState<number>(0);
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<ZFSLog[]>([]);
  const [snapshots, setSnapshots] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [poolsRes, snapshotRes] = await Promise.all([
        api.getPools(),
        api.getSnapshots()
      ]);

      const mappedPools: ZFSPool[] = (poolsRes.pools || []).map((p: any) => ({
        name: p.name,
        size: formatBytes(p.size, 2),
        alloc: formatBytes(p.alloc, 2),
        free: formatBytes(p.free, 2),
        cap: parseInt(p.cap),
        health: p.health,
        raidType: 'ZFS Pool',
        vdevs: []
      }));

      const totalCap = (poolsRes.pools || []).reduce((acc: number, p: any) => acc + (Number(p.size) || 0), 0);
      const totalUsed = (poolsRes.pools || []).reduce((acc: number, p: any) => acc + (Number(p.alloc) || 0), 0);

      setPools(mappedPools);
      setTotalCapacity(totalCap);
      setTotalUsedStorage(totalUsed);

      // Fetch Datasets & Volumes
      const [datasetsRes, volumesRes] = await Promise.all([
        api.getDatasets(),
        api.getVolumes()
      ]);

      const mappedDatasets: ZFSDataset[] = (datasetsRes.datasets || []).map((d: any) => ({
        id: d.name,
        name: d.name,
        used: formatBytes(d.used, 2),
        avail: formatBytes(d.available || d.avail, 2),
        refer: formatBytes(d.refer, 2),
        mountpoint: d.mountpoint,
        compression: d.compression || 'on',
        dedup: d.dedup || 'off',
        readonly: d.readonly === 'on' || d.readonly === true
      }));

      const mappedVolumes = (volumesRes.volumes || []).map((v: any) => ({
        ...v,
        used: formatBytes(v.used, 2),
        avail: formatBytes(v.avail, 2),
        volsize: formatBytes(v.volsize, 2),
        refer: formatBytes(v.refer, 2),
      }));

      setDatasets(mappedDatasets);
      setVolumes(mappedVolumes);

      if (mappedDatasets.length > 0 && !selectedDataset) {
        setSelectedDataset(mappedDatasets[0].name);
      }
      setSnapshots(snapshotRes.snapshots || []);
      
      if (mappedPools.length > 0) {
        // Fetch I/O Stats
        const iostatRes = await api.getPoolIoStat(poolsRes.pools[0].name);
        if (iostatRes.iostat && iostatRes.iostat.length > 0) {
          const statsRow = iostatRes.iostat[0];
          // zpool iostat -H -p: name alloc free read write read_iops write_iops
          const read = parseFloat(statsRow[3]) / 1024 / 1024; // MB/s
          const write = parseFloat(statsRow[4]) / 1024 / 1024; // MB/s
          const readIops = parseFloat(statsRow[5]);
          const writeIops = parseFloat(statsRow[6]);
          const time = new Date().toLocaleTimeString();
          setStats(prev => {
            const newStats = [...prev, { 
              name: time, 
              timestamp: time,
              read, 
              write,
              iops: readIops + writeIops,
              arcHit: Math.random() * 20 + 75, // Still mock until backend support
              l2arcHit: Math.random() * 5 + 90,
              latency: Math.random() * 2 + 0.5
            }];
            return newStats.slice(-30);
          });
        }
      }

      setLoading(false);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      const newLog: ZFSLog = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
        level: 'error',
        message: `API Error: ${error instanceof Error ? error.message : 'Unknown'}`
      };
      setLogs(prev => [newLog, ...prev.slice(0, 49)]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    const currentStats = stats[stats.length - 1] || { read: 0, write: 0, iops: 0 };

    const formatSizeLong = (bytes: number) => {
      return formatBytes(bytes, 2);
    };

    const formatSize = (mb: number) => {
      if (mb > 1024) return `${(mb / 1024).toFixed(1)} TB`;
      return `${mb.toFixed(1)} GB`;
    };

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {[
                { label: 'Total Capacity', value: formatSizeLong(totalCapacity), icon: Database, color: 'text-blue-400', trend: 'Live', up: true },
                { label: 'Used Storage', value: formatSizeLong(totalUsedStorage), icon: HardDrive, color: 'text-emerald-400', trend: `${totalCapacity > 0 ? ((totalUsedStorage / totalCapacity) * 100).toFixed(2) : 0}%`, up: false },
                { label: 'System Health', value: pools.every(p => p.health === 'ONLINE') ? 'Optimal' : 'Degraded', icon: ShieldCheck, color: 'text-indigo-400', trend: 'Stable', up: true },
                { label: 'IOPS', value: `${(currentStats.iops / 1000).toFixed(2)}k`, icon: Zap, color: 'text-amber-400', trend: '+12%', up: true },
                { label: 'Read Speed', value: `${currentStats.read.toFixed(2)} MB/s`, icon: ArrowDownRight, color: 'text-blue-500', trend: 'Live', up: true },
                { label: 'Write Speed', value: `${currentStats.write.toFixed(2)} MB/s`, icon: ArrowUpRight, color: 'text-emerald-500', trend: 'Live', up: true },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-panel p-6 flex flex-col gap-4"
                >
                  <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                      <stat.icon size={24} />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-bold ${stat.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {stat.trend}
                    </div>
                  </div>
                  <div>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="glass-panel p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-white">System Overview</h3>
                      <p className="text-sm text-white/40">Nexus ZFS Node-01 Status</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="status-badge status-online">Operational</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                      <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Uptime</h4>
                      <p className="text-2xl font-bold text-white">12d 4h 32m</p>
                      <p className="text-[10px] text-white/20 mt-1">Last reboot: 2026-02-22</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                      <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Load Average</h4>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-lg font-bold text-white">0.42</p>
                          <p className="text-[10px] text-white/20 mt-1">1 min</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-white">0.38</p>
                          <p className="text-[10px] text-white/20 mt-1">5 min</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-white">0.31</p>
                          <p className="text-[10px] text-white/20 mt-1">15 min</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">Active Pools</h3>
                  <button className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-all">
                    <Plus size={20} />
                  </button>
                </div>
                <div className="space-y-6">
                  {pools.map((pool, i) => (
                    <motion.div
                      key={pool.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass-panel p-6 group cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-zfs-accent group-hover:bg-zfs-accent group-hover:text-white transition-all">
                            <Database size={24} />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-white">{pool.name}</p>
                            <span className={`status-badge ${pool.health === 'ONLINE' ? 'status-online' : 'status-offline'}`}>
                              {pool.health}
                            </span>
                          </div>
                        </div>
                        <button className="text-white/20 hover:text-white">
                          <MoreHorizontal size={20} />
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/40 font-bold uppercase tracking-widest">Usage</span>
                          <span className="text-white font-bold">{pool.cap}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${pool.cap}%` }}
                            className="h-full bg-gradient-to-r from-zfs-accent to-indigo-500 rounded-full"
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-white/20 uppercase tracking-widest">
                          <span>{pool.alloc} Used</span>
                          <span>{pool.free} Free</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="glass-panel p-6 bg-zfs-accent/5 border-zfs-accent/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-zfs-accent/20 rounded-xl flex items-center justify-center text-zfs-accent">
                      <ShieldCheck size={20} />
                    </div>
                    <h4 className="font-bold text-white">Scrub Status</h4>
                  </div>
                  <p className="text-sm text-white/60 mb-4">Last scrub finished successfully. No data errors detected.</p>
                  <button className="w-full apple-button apple-button-primary !py-2 text-xs">
                    Start New Scrub
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'stats':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Throughput */}
              <div className="glass-panel p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-white">Throughput</h3>
                    <p className="text-sm text-white/40">Real-time I/O performance monitoring</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-zfs-accent" />
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Read</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Write</span>
                    </div>
                  </div>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats}>
                      <defs>
                        <linearGradient id="colorRead" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorWrite" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} minTickGap={30} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0C1327', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        formatter={(value: number) => [value.toFixed(2), ""]}
                      />
                      <Area type="monotone" dataKey="read" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRead)" strokeWidth={2} />
                      <Area type="monotone" dataKey="write" stroke="#10B981" fillOpacity={1} fill="url(#colorWrite)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* IOPS */}
              <div className="glass-panel p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-white">IOPS</h3>
                    <p className="text-sm text-white/40">Input/Output operations per second</p>
                  </div>
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                    <Zap size={20} />
                  </div>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats}>
                      <defs>
                        <linearGradient id="colorIops" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} minTickGap={30} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0C1327', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        formatter={(value: number) => [value.toFixed(2), ""]}
                      />
                      <Area type="monotone" dataKey="iops" stroke="#F59E0B" fillOpacity={1} fill="url(#colorIops)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Cache Performance */}
              <div className="glass-panel p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-white">Cache Performance</h3>
                    <p className="text-sm text-white/40">ARC and L2ARC hit rates</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">ARC Hit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-violet-400" />
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">L2ARC Hit</span>
                    </div>
                  </div>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats}>
                      <defs>
                        <linearGradient id="colorArc" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#818CF8" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorL2arc" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#A78BFA" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} minTickGap={30} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0C1327', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        formatter={(value: number) => [value.toFixed(2), ""]}
                      />
                      <Area type="monotone" dataKey="arcHit" stroke="#818CF8" fillOpacity={1} fill="url(#colorArc)" strokeWidth={2} />
                      <Area type="monotone" dataKey="l2arcHit" stroke="#A78BFA" fillOpacity={1} fill="url(#colorL2arc)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Latency */}
              <div className="glass-panel p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-white">Latency</h3>
                    <p className="text-sm text-white/40">Average I/O response time (ms)</p>
                  </div>
                  <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                    <Clock size={20} />
                  </div>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats}>
                      <defs>
                        <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FB7185" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#FB7185" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} minTickGap={30} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0C1327', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        formatter={(value: number) => [value.toFixed(2), "ms"]}
                      />
                      <Area type="monotone" dataKey="latency" stroke="#FB7185" fillOpacity={1} fill="url(#colorLatency)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        );
      case 'pools':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-white">Storage Pools</h2>
                <p className="text-white/40">Manage your ZFS storage pools and vdevs</p>
              </div>
              <button className="apple-button apple-button-primary">
                <Plus size={20} /> Create New Pool
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {pools.map((pool) => (
              <div key={pool.name} className="glass-panel p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-zfs-accent/10 rounded-2xl flex items-center justify-center text-zfs-accent">
                      <Database size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{pool.name}</h2>
                      <p className="text-sm text-white/40">{pool.raidType} • {pool.size}</p>
                    </div>
                  </div>
                  <span className={`status-badge ${pool.health === 'ONLINE' ? 'status-online' : 'status-offline'}`}>
                    {pool.health}
                  </span>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Used</p>
                      <p className="text-lg font-bold text-white">{pool.alloc}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Free</p>
                      <p className="text-lg font-bold text-white">{pool.free}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Cap</p>
                      <p className="text-lg font-bold text-white">{pool.cap}%</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest">Topology</h4>
                    {pool.vdevs.map((vdev: any) => (
                      <div key={vdev.id} className="bg-white/5 p-4 rounded-2xl flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <HardDrive size={16} className="text-white/40" />
                          <span className="text-sm font-medium">{vdev.name}</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase">{vdev.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        );
      case 'datasets':
        return (
          <div className="space-y-8">
            <DatasetList datasets={datasets} />
            {volumes.length > 0 && (
              <div className="glass-panel overflow-hidden mt-8">
                <div className="p-8 border-b border-white/[0.05]">
                  <h2 className="text-xl font-bold text-white tracking-tight">ZFS Volumes (zvols)</h2>
                  <p className="text-xs text-white/40 mt-1">Block devices and virtual drives</p>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 gap-3">
                    {volumes.map((vol, i) => (
                      <div key={vol.name} className="flex items-center justify-between p-6 bg-white/[0.02] rounded-2xl border border-white/[0.05]">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white/40">
                            <Database size={20} />
                          </div>
                          <div>
                            <p className="text-base font-bold text-white">{vol.name}</p>
                            <p className="text-[10px] text-white/30 font-mono mt-0.5">Size: {vol.volsize}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-white/80">Used: {vol.used}</p>
                          <p className="text-[10px] text-white/40">Available: {vol.avail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'snapshots':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-white">Snapshots</h2>
                <p className="text-white/40">Point-in-time recovery and scheduling</p>
              </div>
              <button className="apple-button apple-button-primary">
                <Camera size={20} /> Create Snapshot
              </button>
            </div>
            
            {snapshots.length === 0 ? (
              <div className="glass-panel p-12 text-center">
                <Camera size={64} className="mx-auto text-zfs-accent mb-6 opacity-20" />
                <h2 className="text-3xl font-bold mb-2">No Snapshots</h2>
                <p className="text-white/40 max-w-md mx-auto">You haven't created any snapshots yet. Point-in-time recovery and snapshot scheduling will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {snapshots.map((snap, i) => (
                  <motion.div 
                    key={snap.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-panel p-6 border border-white/5"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="p-2 rounded-lg bg-zfs-accent/10 text-zfs-accent">
                        <Camera size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{snap.creation || 'Recently'}</span>
                    </div>
                    <p className="font-bold text-white truncate" title={snap.name}>{snap.name}</p>
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="text-white/40">Used: {snap.used || '0 B'}</span>
                      <span className="text-white/40">Ref: {snap.refer || '0 B'}</span>
                    </div>
                    <div className="mt-6 flex gap-2">
                      <button className="flex-1 apple-button apple-button-secondary !py-2 text-xs">Rollback</button>
                      <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );
      case 'replication':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-white">Replication</h2>
                <p className="text-white/40">Remote dataset replication and backups</p>
              </div>
              <button className="apple-button apple-button-primary">
                <RefreshCw size={20} /> New Replication Task
              </button>
            </div>
            <div className="glass-panel p-12 text-center">
              <RefreshCw size={64} className="mx-auto text-zfs-accent mb-6 opacity-20" />
              <h2 className="text-3xl font-bold mb-2">Replication</h2>
              <p className="text-white/40 max-w-md mx-auto">Remote dataset replication, incremental send/receive, and backup synchronization.</p>
              <div className="mt-8 space-y-4 text-left">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                      <RefreshCw size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-white">tank/data → remote-backup/data</p>
                      <p className="text-xs text-white/40 mt-1">Status: Syncing (84%) • Last run: 5m ago</p>
                    </div>
                  </div>
                  <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[84%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'scrub':
        return (
          <div className="space-y-8">
            <div className="glass-panel p-12 text-center">
              <ShieldCheck size={64} className="mx-auto text-zfs-accent mb-6 opacity-20" />
              <h2 className="text-3xl font-bold mb-2">Scrub & Health</h2>
              <p className="text-white/40 max-w-md mx-auto">Data integrity verification, resilvering status, and pool health diagnostics.</p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                  <h4 className="text-lg font-bold mb-6">Integrity Check</h4>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/60">Last Scrub</span>
                      <span className="text-sm font-bold">2026-03-04 12:00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/60">Errors Found</span>
                      <span className="text-sm font-bold text-emerald-400">0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/60">Status</span>
                      <span className="status-badge status-online">Healthy</span>
                    </div>
                  </div>
                  <button className="mt-8 w-full apple-button apple-button-primary">Start Scrub</button>
                </div>
                <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                  <h4 className="text-lg font-bold mb-6">Pool Devices</h4>
                  <div className="space-y-4">
                    {pools.length > 0 ? (
                      pools[0].vdevs && pools[0].vdevs.length > 0 ? (
                        pools[0].vdevs.map((vdev: any) => (
                          <div key={vdev.name} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                              <HardDrive size={16} className="text-white/40" />
                              <span className="text-sm font-medium">{vdev.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold text-emerald-400 uppercase">Online</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-white/20 text-xs">No vdev information available</div>
                      )
                    ) : (
                      <div className="text-center py-4 text-white/20 text-xs">No pools configured</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-8 text-center bg-amber-500/5 border-amber-500/10">
              <AlertTriangle size={32} className="mx-auto text-amber-500/40 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">SMART Diagnostics</h3>
              <p className="text-sm text-white/40 max-w-sm mx-auto">SMART monitoring is currently unavailable as it requires elevated permissions on the host system.</p>
            </div>
          </div>
        );
      case 'properties':
        return (
          <div className="space-y-8">
            <div className="flex gap-4 p-2 bg-white/5 rounded-2xl w-fit">
              {datasets.slice(0, 5).map(ds => (
                <button 
                  key={ds.name}
                  onClick={() => setSelectedDataset(ds.name)}
                  className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedDataset === ds.name ? 'bg-zfs-accent text-white shadow-lg' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {ds.name.split('/').pop()}
                </button>
              ))}
            </div>
            <PropertiesManager dataset={selectedDataset || datasets[0]?.name} />
          </div>
        );
      case 'settings':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-8">
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <Settings size={24} className="text-zfs-accent" />
                System Settings
              </h3>
              <div className="space-y-6">
                {[
                  { label: 'Hostname', value: 'nexus-zfs-node-01', icon: Server },
                  { label: 'SSH Access', value: 'Enabled (Port 22)', icon: Terminal },
                  { label: 'Root Password', value: '••••••••••••', icon: Key },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="text-white/40"><Icon size={18} /></div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <span className="text-sm font-bold text-white/60">{item.value}</span>
                    </div>
                  );
                })}
              </div>
              <button className="mt-8 w-full apple-button apple-button-primary">Save Changes</button>
            </div>
            <div className="glass-panel p-8">
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <ShieldCheck size={24} className="text-emerald-400" />
                Security
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold">Two-Factor Authentication</p>
                    <p className="text-xs text-white/40">Secure your account with 2FA</p>
                  </div>
                  <div className="w-12 h-6 bg-emerald-500/20 rounded-full relative p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full ml-auto" />
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold">API Access</p>
                    <p className="text-xs text-white/40">Manage API keys for automation</p>
                  </div>
                  <ChevronRight size={16} className="text-white/20" />
                </div>
              </div>
            </div>
          </div>
        );
      case 'logs':
        return (
          <div className="space-y-8">
            <div className="glass-panel p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white">System Logs</h3>
                  <p className="text-sm text-white/40">Recent ZFS operations and system events</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white/5 rounded-xl text-xs font-bold text-white/60 hover:bg-white/10 transition-all">Export</button>
                  <button className="px-4 py-2 bg-white/5 rounded-xl text-xs font-bold text-white/60 hover:bg-white/10 transition-all">Clear</button>
                </div>
              </div>
              <div className="space-y-3">
                {logs.map((log, i) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-6 p-4 bg-white/[0.02] rounded-2xl border border-white/[0.05] hover:bg-white/[0.04] transition-all"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      log.level === 'error' ? 'bg-rose-500/10 text-rose-400' :
                      log.level === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-zfs-accent/10 text-zfs-accent'
                    }`}>
                      {log.level === 'error' ? <XCircle size={18} /> :
                       log.level === 'warning' ? <AlertTriangle size={18} /> :
                       <Info size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-mono text-white/20">{log.timestamp}</span>
                        {log.pool && <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-white/5 text-white/40 rounded-md tracking-widest">{log.pool}</span>}
                      </div>
                      <p className="text-sm text-white/80 truncate">{log.message}</p>
                    </div>
                  </motion.div>
                ))}
                {logs.length === 0 && (
                  <div className="py-20 text-center text-white/20 font-bold uppercase tracking-widest">
                    No logs recorded
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-zfs-deep">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-72 p-12 overflow-y-auto h-screen no-scrollbar relative">
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-zfs-deep/80 backdrop-blur-xl flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-zfs-accent/20 border-t-zfs-accent rounded-full animate-spin" />
                <p className="text-xs font-bold text-white/40 uppercase tracking-[0.3em] animate-pulse">Initializing Nexus API...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-6 bg-white/[0.03] border border-white/[0.05] rounded-2xl px-6 py-3 w-96 focus-within:bg-white/[0.05] focus-within:border-zfs-accent/50 transition-all">
            <Search size={18} className="text-white/30" />
            <input 
              type="text" 
              placeholder="Search pools, datasets, or snapshots..." 
              className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20 w-full"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.03] text-white/40 hover:text-white border border-white/[0.05] transition-all relative">
              <Bell size={20} />
              <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-zfs-deep" />
            </button>
            <div className="flex items-center gap-4 pl-6 border-l border-white/10">
              <div className="text-right">
                <p className="text-sm font-bold text-white">Admin User</p>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Superuser</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zfs-accent to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <User size={20} className="text-white" />
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
