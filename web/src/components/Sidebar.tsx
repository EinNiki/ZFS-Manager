import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Database, 
  Layers, 
  Camera, 
  Settings, 
  HardDrive,
  Activity,
  LogOut,
  FileText,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'stats', label: 'Performance', icon: Activity, path: '/stats' },
  { id: 'pools', label: 'Storage Pools', icon: Database, path: '/pools' },
  { id: 'datasets', label: 'Datasets & Volumes', icon: Layers, path: '/datasets' },
  { id: 'snapshots', label: 'Snapshots', icon: Camera, path: '/snapshots' },
  { id: 'logs', label: 'System Logs', icon: FileText, path: '/logs' },
  { id: 'settings', label: 'App Settings', icon: Settings, path: '/settings' },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('zfs_access_token');
    window.location.href = '/login';
  };

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? 90 : 280 }}
      className={`glass-sidebar h-full flex flex-col relative transition-all duration-500 ${isCollapsed ? 'px-4' : 'px-6'} py-8 border-r border-white/[0.03] z-[100]`}
    >
      {/* Mobile Close Button */}
      <button 
        onClick={onClose}
        className="lg:hidden absolute top-8 right-8 p-2.5 text-slate-500 hover:text-white transition-colors"
      >
        <X size={22} />
      </button>

      {/* Collapse Toggle (Desktop Only) */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute top-10 -right-3.5 w-7 h-7 bg-zfs-accent rounded-full items-center justify-center text-zfs-deep border-4 border-zfs-deep hover:bg-white hover:scale-110 transition-all z-[110] shadow-[0_0_20px_rgba(34,211,238,0.3)]"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar scroll-smooth">
        {/* Brand Section */}
        <div className={`flex items-center gap-4 ${isCollapsed ? 'justify-center mb-14' : 'px-4 mb-14'}`}>
          <div className="relative group">
            <div className="absolute inset-0 bg-zfs-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative flex-shrink-0 w-11 h-11 bg-gradient-to-br from-zfs-accent to-zfs-secondary rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(34,211,238,0.25)] border border-white/20">
              <HardDrive className="text-zfs-deep" size={26} strokeWidth={2.5} />
            </div>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <h1 className="text-xl font-black tracking-tight text-white flex flex-col leading-none">
                  <span>ZFS</span>
                  <span className="text-[10px] text-zfs-accent uppercase tracking-[0.4em] mt-1 font-black">Manager</span>
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1.5 px-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => 
                `nav-item group flex items-center gap-3.5 ${isCollapsed ? 'justify-center' : ''} ${
                  isActive ? 'nav-item-active' : 'text-slate-500 hover:text-slate-200'
                }`
              }
              title={isCollapsed ? item.label : ''}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} className={isActive ? 'text-zfs-accent drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-inherit group-hover:text-white transition-colors'} strokeWidth={isActive ? 2.5 : 2} />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`text-[13px] font-bold tracking-tight whitespace-nowrap ${isActive ? 'text-white' : ''}`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && !isCollapsed && (
                    <motion.div 
                      layoutId="active-nav-glow"
                      className="ml-auto w-1 h-1 rounded-full bg-zfs-accent shadow-[0_0_10px_#22D3EE]"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className={`mt-auto pt-8 border-t border-white/[0.03] space-y-2 pb-2 ${isCollapsed ? 'px-1' : 'px-1'}`}>
          <button 
            onClick={handleLogout}
            className={`w-full nav-item group text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut size={20} strokeWidth={2} />
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-[13px] font-bold"
                >
                  Terminate Session
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
