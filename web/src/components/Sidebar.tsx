import { 
  LayoutDashboard, 
  Database, 
  Layers, 
  Camera, 
  RefreshCw, 
  ShieldCheck, 
  Settings, 
  Activity,
  LogOut,
  FileText,
  Zap,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, metric: '98%', status: 'optimal' },
  { id: 'stats', label: 'Stats', icon: Activity, metric: '1.2GB/s', status: 'optimal' },
  { id: 'pools', label: 'Storage Pools', icon: Database, metric: '3 Active', status: 'optimal' },
  { id: 'datasets', label: 'Datasets', icon: Layers, metric: '14 Vol', status: 'optimal' },
  { id: 'permissions', label: 'Permissions', icon: ShieldCheck, status: 'secure' },
  { id: 'snapshots', label: 'Snapshots', icon: Camera, metric: '128', status: 'optimal' },
  { id: 'replication', label: 'Replication', icon: RefreshCw, status: 'idle' },
  { id: 'scrub', label: 'Scrub & Health', icon: ShieldCheck, status: 'healthy' },
  { id: 'logs', label: 'Logs', icon: FileText, metric: '2 New', status: 'optimal' },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="glass-sidebar-v2">
      <div className="flex flex-col items-center mb-16">
        <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-[2rem] flex items-center justify-center shadow-[0_20px_40px_rgba(59,130,246,0.4)] border border-white/20 mb-6"
        >
          <Zap className="text-white drop-shadow-lg" size={32} fill="white" />
        </motion.div>
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tighter text-white leading-none">NEXUS</h1>
          <p className="text-[10px] font-black text-blue-400/60 uppercase tracking-[0.4em] mt-2">Storage OS</p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-2 overflow-y-auto no-scrollbar pr-2">
        {menuItems.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setActiveTab(item.id)}
            className={`nav-pill group ${activeTab === item.id ? 'nav-pill-active' : ''}`}
          >
            <div className="relative">
                <item.icon 
                  size={22} 
                  className={`transition-all duration-500 group-hover:scale-110 ${activeTab === item.id ? 'text-blue-400' : 'text-white/20 group-hover:text-white/60'}`} 
                />
                {item.status && (
                    <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border border-black ${item.status === 'optimal' || item.status === 'healthy' || item.status === 'secure' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`} />
                )}
            </div>
            
            <div className="flex-1">
              <span className={`text-sm font-bold tracking-tight block transition-colors duration-500 ${activeTab === item.id ? 'text-white' : 'text-white/30 group-hover:text-white/70'}`}>
                {item.label}
              </span>
              {item.metric && (
                  <span className="text-[9px] font-black tech-font text-white/10 group-hover:text-white/30 uppercase tracking-widest">{item.metric}</span>
              )}
            </div>

            <AnimatePresence>
                {activeTab === item.id && (
                  <motion.div 
                    layoutId="sidebar-pill-glow"
                    className="absolute inset-0 bg-blue-500/[0.03] border border-blue-500/10 -z-10 rounded-3xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
            </AnimatePresence>
          </motion.div>
        ))}
      </nav>

      <div className="mt-10 pt-10 border-t border-white/[0.03] space-y-6">
        <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] rounded-3xl border border-white/[0.03]">
            <div className="flex items-center gap-3">
                <Cpu size={16} className="text-white/20" />
                <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Load</span>
            </div>
            <span className="text-xs font-black tech-font text-emerald-400">12%</span>
        </div>
        
        <motion.button 
          whileHover={{ x: 5, backgroundColor: 'rgba(244, 63, 94, 0.1)' }}
          className="w-full flex items-center gap-4 px-6 py-4 rounded-3xl text-white/20 hover:text-rose-400 transition-all duration-300 group"
        >
          <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="text-sm font-bold tracking-tight">System Exit</span>
        </motion.button>
      </div>
    </aside>
  );
}
