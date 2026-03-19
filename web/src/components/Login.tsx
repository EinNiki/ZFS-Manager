import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HardDrive, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (password: string) => Promise<void>;
}

export default function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsError(false);
    
    try {
      await onLogin(password);
      // If success, App.tsx will re-render and Login will unmount
    } catch (err) {
      setIsError(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#070B14] overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-zfs-accent/10 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-zfs-secondary/10 blur-[150px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="relative z-10 w-full max-w-lg p-16 glass-panel border-white/[0.03] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]"
      >
        <div className="flex flex-col items-center text-center mb-12">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="w-24 h-24 bg-gradient-to-br from-zfs-accent to-zfs-secondary rounded-[32px] flex items-center justify-center shadow-[0_25px_50px_-12px_rgba(34,211,238,0.4)] mb-10 relative group"
          >
            <div className="absolute inset-0 bg-white/20 rounded-[32px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <HardDrive className="text-white relative z-10" size={48} strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-4 leading-none">
            ZFS <span className="text-transparent bg-clip-text bg-gradient-to-r from-zfs-accent to-zfs-secondary">Manager</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Infrastructure Control Plane</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <div className={`relative flex items-center bg-white/[0.02] border ${isError ? 'border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'border-white/[0.05]'} rounded-2xl px-6 py-5 focus-within:bg-white/[0.04] focus-within:border-zfs-accent/30 transition-all group`}>
              <Lock className={`mr-5 ${isError ? 'text-rose-400' : 'text-slate-600 group-focus-within:text-zfs-accent'} transition-colors`} size={22} strokeWidth={2.5} />
              <input 
                type="password"
                placeholder="Access Token"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-none outline-none text-white placeholder:text-slate-700 w-full font-black tracking-widest text-lg"
                autoFocus
              />
            </div>
            <AnimatePresence>
              {isError && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-2 px-2 text-rose-500"
                >
                  <AlertCircle size={14} strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Unauthorized Access Denied</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full apple-button apple-button-primary !py-5 flex items-center justify-center gap-4 active:scale-[0.97] transition-all disabled:opacity-50 relative overflow-hidden group/btn shadow-[0_20px_40px_-10px_rgba(34,211,238,0.3)]"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="font-black uppercase tracking-[0.2em] text-xs">Authorize Terminal</span>
                <ArrowRight size={20} strokeWidth={3} className="group-hover/btn:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-14 pt-10 border-t border-white/[0.03] flex justify-center items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Mainframe Link Active</span>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-10 flex flex-col items-center gap-2">
        <div className="text-[10px] font-black text-slate-800 uppercase tracking-[0.5em] mb-1">
          Secure Node Access • v1.1.0
        </div>
        <div className="h-0.5 w-12 bg-white/[0.03] rounded-full" />
      </div>
    </div>
  );
}
