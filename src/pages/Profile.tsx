import { useState } from 'react';
import { useApp } from '../store';
import { Btn, Input, Select } from '../components/ui';
import type { MechanicAvailability } from '../types';

export default function Profile() {
  const { currentUser, borrowings, maintenanceRequests, updateUser, updateMechanicStatus } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: currentUser?.name ?? '', phone: currentUser?.phone ?? '', email: currentUser?.email ?? '' });
  const [saved, setSaved] = useState(false);

  if (!currentUser) return null;

  const myBorrows = borrowings.filter(b => b.borrowerId === currentUser.id);
  const myTasks = maintenanceRequests.filter(m => m.assignedMechanic === currentUser.id);

  const handleSave = () => {
    updateUser(currentUser.id, form);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const ROLE_COLOR: Record<string, string> = { ADMIN: '#f59e0b', EMPLOYEE: '#60a5fa', MECHANIC: '#4ade80' };
  const color = ROLE_COLOR[currentUser.role];

  return (
    <div className="max-w-lg space-y-5">
      <h1 className="text-xl font-bold font-display text-zinc-100">Profile</h1>

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-sm px-4 py-2.5 text-sm text-emerald-400">
          ✓ Profile updated successfully.
        </div>
      )}

      {/* Avatar + info */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-sm flex items-center justify-center text-xl font-bold"
            style={{ background: `${color}15`, color }}>
            {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold font-display text-zinc-100">{currentUser.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded" style={{ background: `${color}15`, color }}>
                {currentUser.role}
              </span>
              <span className="text-xs font-mono text-zinc-500">{currentUser.employeeId}</span>
            </div>
          </div>
        </div>

        {!editing ? (
          <div className="space-y-3">
            {[
              { label: 'Email', value: currentUser.email },
              { label: 'Phone', value: currentUser.phone },
              { label: 'Department', value: currentUser.department },
              { label: 'Status', value: currentUser.status },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-zinc-800/50">
                <span className="text-xs font-mono text-zinc-600 uppercase tracking-widest">{label}</span>
                <span className="text-sm text-zinc-300">{value}</span>
              </div>
            ))}
            <Btn variant="secondary" size="sm" onClick={() => setEditing(true)} className="mt-2">Edit Profile</Btn>
          </div>
        ) : (
          <div className="space-y-4">
            <Input label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <Input label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <div className="flex gap-2">
              <Btn onClick={handleSave}>Save Changes</Btn>
              <Btn variant="secondary" onClick={() => setEditing(false)}>Cancel</Btn>
            </div>
          </div>
        )}
      </div>

      {/* Mechanic status */}
      {currentUser.role === 'MECHANIC' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-4">
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3">Availability Status</p>
          <div className="flex gap-2">
            {(['AVAILABLE', 'BUSY', 'OFF_DUTY'] as MechanicAvailability[]).map(s => (
              <button key={s} onClick={() => updateMechanicStatus(currentUser.id, s)}
                className={`flex-1 py-2 text-xs font-mono rounded-sm border transition-colors ${
                  currentUser.mechanicStatus === s
                    ? s === 'AVAILABLE' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : s === 'BUSY' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-600 hover:border-zinc-600'
                }`}>
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {currentUser.role !== 'MECHANIC' && (
          <>
            <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-4">
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Total Borrows</p>
              <p className="text-2xl font-bold font-display text-zinc-100 mt-1">{myBorrows.length}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-4">
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Active</p>
              <p className="text-2xl font-bold font-display text-zinc-100 mt-1">{myBorrows.filter(b => b.status === 'ACTIVE').length}</p>
            </div>
          </>
        )}
        {currentUser.role === 'MECHANIC' && (
          <>
            <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-4">
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Tasks Completed</p>
              <p className="text-2xl font-bold font-display text-zinc-100 mt-1">{myTasks.filter(t => t.status === 'COMPLETED').length}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-4">
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Active Tasks</p>
              <p className="text-2xl font-bold font-display text-zinc-100 mt-1">{myTasks.filter(t => ['IN_PROGRESS', 'ASSIGNED'].includes(t.status)).length}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
