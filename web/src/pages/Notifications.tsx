import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Bell, Trash2, Plus, Save } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);

  // Modals state
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);

  // Form state
  const [newChannel, setNewChannel] = useState({ name: '', ctype: 'webhook', config: '{\n  "url": "https://..."\n}' });
  const [newRule, setNewRule] = useState<{name: string, trigger_type: string, threshold_value: string, channel_ids: number[], is_active: boolean}>({ name: '', trigger_type: 'pool_unhealthy', threshold_value: '', channel_ids: [], is_active: true });

  const fetchData = async () => {
      try {
        const [nRes, cRes, rRes] = await Promise.all([
          fetch('/api/v1/notifications', { headers: { 'Authorization': `Bearer ${localStorage.getItem('zfs_access_token')}` } }).then(r => r.json()),
          fetch('/api/v1/notifications/channels', { headers: { 'Authorization': `Bearer ${localStorage.getItem('zfs_access_token')}` } }).then(r => r.json()),
          fetch('/api/v1/notifications/rules', { headers: { 'Authorization': `Bearer ${localStorage.getItem('zfs_access_token')}` } }).then(r => r.json()),
        ]);
        setNotifications(nRes || []);
        setChannels(cRes || []);
        setRules(rRes || []);
      } catch (e) {
        console.error("Failed to fetch notifications data", e);
      }
    };
  useEffect(() => {
    fetchData();
  }, []);

  const createChannel = async () => {
    try {
      const configJson = JSON.parse(newChannel.config);
      await fetch('/api/v1/notifications/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('zfs_access_token')}` },
        body: JSON.stringify({ ...newChannel, config: configJson })
      });
      setShowChannelModal(false);
      setNewChannel({ name: '', ctype: 'webhook', config: '{\n  "url": "https://..."\n}' });
      fetchData();
    } catch (e) {
      alert("Invalid JSON in config or network error.");
    }
  };

  const deleteChannel = async (id: number) => {
    if (!confirm("Delete this channel?")) return;
    await fetch(`/api/v1/notifications/channels/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('zfs_access_token')}` } });
    fetchData();
  };

  const createRule = async () => {
    try {
      const threshold = newRule.threshold_value ? parseFloat(newRule.threshold_value) : null;
      await fetch('/api/v1/notifications/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('zfs_access_token')}` },
        body: JSON.stringify({ ...newRule, threshold_value: threshold })
      });
      setShowRuleModal(false);
      setNewRule({ name: '', trigger_type: 'pool_unhealthy', threshold_value: '', channel_ids: [], is_active: true });
      fetchData();
    } catch (e) {
      alert("Failed to create rule.");
    }
  };

  const deleteRule = async (id: number) => {
    if (!confirm("Delete this rule?")) return;
    await fetch(`/api/v1/notifications/rules/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('zfs_access_token')}` } });
    fetchData();
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Bell size={24} style={{ color: 'var(--accent)' }} />
          Notifications
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Configure alerts and integrations.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Rules Section */}
        <div className="panel" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Active Rules</h2>
            <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setShowRuleModal(true)}><Plus size={14} /> New Rule</button>
          </div>
          <div style={{ padding: 20 }}>
            {rules.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>No rules configured.</div>
            ) : (
              rules.map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Trigger: {r.trigger_type}</div>
                  </div>
                  <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => deleteRule(r.id)}><Trash2 size={14} /></button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Channels Section */}
        <div className="panel" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Notification Channels</h2>
            <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setShowChannelModal(true)}><Plus size={14} /> New Channel</button>
          </div>
          <div style={{ padding: 20 }}>
            {channels.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>No channels configured.</div>
            ) : (
              channels.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Type: {c.ctype}</div>
                  </div>
                  <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => deleteChannel(c.id)}><Trash2 size={14} /></button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 24, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Notification History</h2>
        </div>
        <div style={{ padding: 20 }}>
          {notifications.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>No recent notifications.</div>
          ) : (
            notifications.map(n => (
              <div key={n.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.is_read ? 'var(--text-muted)' : 'var(--danger)', marginTop: 6 }} />
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{new Date(n.created_at).toLocaleString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {showChannelModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-surface)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', width: 400 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>New Channel</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Name</label>
                <input className="input" value={newChannel.name} onChange={e => setNewChannel({...newChannel, name: e.target.value})} placeholder="e.g. Discord Alerts" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Type</label>
                <select className="input" value={newChannel.ctype} onChange={e => setNewChannel({...newChannel, ctype: e.target.value})} style={{ width: '100%' }}>
                  <option value="webhook">Webhook</option>
                  <option value="discord">Discord</option>
                  <option value="gotify">Gotify</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Config (JSON)</label>
                <textarea className="input" value={newChannel.config} onChange={e => setNewChannel({...newChannel, config: e.target.value})} style={{ width: '100%', height: 80, fontFamily: 'monospace', fontSize: 12 }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button className="btn btn-secondary" onClick={() => setShowChannelModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={createChannel}>Save Channel</button>
            </div>
          </div>
        </div>
      )}

      {showRuleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-surface)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', width: 400 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>New Rule</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Name</label>
                <input className="input" value={newRule.name} onChange={e => setNewRule({...newRule, name: e.target.value})} placeholder="e.g. High Temp Warning" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Trigger</label>
                <select className="input" value={newRule.trigger_type} onChange={e => setNewRule({...newRule, trigger_type: e.target.value})} style={{ width: '100%' }}>
                  <option value="pool_unhealthy">Pool Unhealthy (Degraded/Faulted)</option>
                  <option value="hdd_temp">HDD Temperature {'>'} Threshold</option>
                  <option value="capacity">Pool Capacity {'>'} Threshold</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Threshold (Optional)</label>
                <input className="input" type="number" value={newRule.threshold_value} onChange={e => setNewRule({...newRule, threshold_value: e.target.value})} placeholder="e.g. 80" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Notify Channels</label>
                <select multiple className="input" style={{ width: '100%', height: 80 }} value={newRule.channel_ids.map(String)} onChange={e => {
                  const selected = Array.from(e.target.selectedOptions, o => parseInt(o.value));
                  setNewRule({...newRule, channel_ids: selected});
                }}>
                  {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Hold Ctrl/Cmd to select multiple</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button className="btn btn-secondary" onClick={() => setShowRuleModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={createRule}>Save Rule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
