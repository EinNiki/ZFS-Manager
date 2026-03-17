import { 
  LayoutDashboard, 
  Database, 
  Layers, 
  Camera, 
  RefreshCw, 
  ShieldCheck, 
  Settings, 
  HardDrive,
  Activity,
  LogOut,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'stats', label: 'Stats', icon: Activity },
  { id: 'pools', label: 'Storage Pools', icon: Database },
  { id: 'datasets', label: 'Datasets', icon: Layers },
  { id: 'permissions', label: 'Permissions', icon: ShieldCheck },
  { id: 'snapshots', label: 'Snapshots', icon: Camera },
  { id: 'replication', label: 'Replication', icon: RefreshCw },
  { id: 'scrub', label: 'Scrub & Health', icon: ShieldCheck },
  { id: 'logs', label: 'Logs', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className="glass-sidebar flex flex-col p-8">
      <div className="flex items-center gap-5 px-4 mb-16">
        <div className="w-12 h-12 bg-gradient-to-br from-zfs-accent to-indigo-600 rounded-[1.25rem] flex items-center justify-center shadow-[0_10px_20px_rgba(59,130,246,0.3)]">
          <HardDrive className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white leading-none">ZFS Manager</h1>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-1.5">v2.0 Premium</p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-3">
        {menuItems.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ x: 6 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab(item.id)}
            className={`nav-item group ${activeTab === item.id ? 'nav-item-active' : ''}`}
          >
            <item.icon 
              size={20} 
              className={`transition-colors duration-500 ${activeTab === item.id ? 'text-zfs-accent' : 'text-white/30 group-hover:text-white'}`} 
            />
            <span className={`text-sm font-bold tracking-wide transition-colors duration-500 ${activeTab === item.id ? 'text-white' : 'text-white/40 group-hover:text-white'}`}>
              {item.label}
            </span>
            
            {activeTab === item.id && (
              <motion.div 
                layoutId="active-highlight"
                className="absolute inset-0 bg-white/[0.05] -z-10 rounded-2xl"
                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
              />
            )}
          </motion.div>
        ))}
      </nav>

      <div className="mt-8 pt-8 border-t border-white/10">
        <motion.div 
          whileHover={{ x: 6 }}
          whileTap={{ scale: 0.97 }}
          className="nav-item group text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm font-bold tracking-wide">Logout</span>
        </motion.div>
      </div>
    </div>
  );
}
