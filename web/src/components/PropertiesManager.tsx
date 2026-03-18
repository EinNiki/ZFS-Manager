import React, { useEffect, useState } from 'react';
import { Settings, RefreshCw, Save, RotateCcw, Search } from 'lucide-react';
import { api } from '../api';
import { motion } from 'motion/react';

interface PropertiesManagerProps {
  dataset: string;
}

export default function PropertiesManager({ dataset }: PropertiesManagerProps) {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await api.getProperties(dataset);
      setProperties(res.properties);
    } catch (err) {
      console.error('Failed to fetch properties', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [dataset]);

  const filteredProps = properties.filter(p => 
    p.name.toLowerCase().includes(filter.toLowerCase()) || 
    p.value.toLowerCase().includes(filter.toLowerCase())
  );

  const handleInherit = async (prop: string) => {
    try {
      await api.inheritProperty(dataset, prop);
      fetchProperties();
    } catch (err) {
      alert('Failed to inherit property: ' + err);
    }
  };

  return (
    <div className="glass-panel overflow-hidden">
      <div className="p-8 flex justify-between items-center border-b border-white/[0.05]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Dataset Properties</h2>
          <p className="text-xs text-white/40 mt-1">Managing {dataset}</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-2 w-64 focus-within:bg-white/[0.05] transition-all">
            <Search size={14} className="text-white/20" />
            <input 
              type="text" 
              placeholder="Filter properties..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-white placeholder:text-white/20 w-full"
            />
          </div>
          <button 
            onClick={fetchProperties}
            disabled={loading}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto no-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-zfs-deep/80 backdrop-blur-md z-10 border-b border-white/[0.05]">
            <tr>
              <th className="px-8 py-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">Property</th>
              <th className="px-8 py-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">Value</th>
              <th className="px-8 py-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">Source</th>
              <th className="px-8 py-4 text-[10px] font-bold text-white/20 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProps.map((prop, i) => (
              <motion.tr 
                key={prop.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.01 }}
                className="group hover:bg-white/[0.02] border-b border-white/[0.02]"
              >
                <td className="px-8 py-4">
                  <span className="text-xs font-mono text-white/80">{prop.name}</span>
                </td>
                <td className="px-8 py-4">
                  <span className="text-xs text-white font-bold">{prop.value}</span>
                </td>
                <td className="px-8 py-4">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md tracking-widest ${
                    prop.source === '-' ? 'text-white/20' : 
                    prop.source === 'default' ? 'bg-blue-500/10 text-blue-400' :
                    prop.source === 'local' ? 'bg-emerald-500/10 text-emerald-400' :
                    'bg-amber-500/10 text-amber-400'
                  }`}>
                    {prop.source}
                  </span>
                </td>
                <td className="px-8 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    {prop.source !== 'local' && prop.source !== 'default' && (
                      <button 
                        onClick={() => handleInherit(prop.name)}
                        title="Inherit from parent"
                        className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white transition-all"
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}
                    <button className="p-1.5 rounded-lg bg-zfs-accent/20 text-zfs-accent hover:bg-zfs-accent hover:text-white transition-all">
                      <Save size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        
        {filteredProps.length === 0 && !loading && (
          <div className="py-20 text-center">
            <Settings size={48} className="mx-auto text-white/5 mb-4" />
            <p className="text-sm font-bold text-white/20 uppercase tracking-widest">No properties found</p>
          </div>
        )}
      </div>
    </div>
  );
}
