import { useApp } from '../store';
import { PageHeader, StatCard, fmtCurrency } from '../components/ui';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const chart = { backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 2, fontSize: 11 };

export default function Reports() {
  const { tools, borrowings, maintenanceRequests, users } = useApp();

  // Tool usage
  const toolUsage = tools.map(t => ({
    name: t.code, fullName: t.name,
    borrows: borrowings.filter(b => b.toolId === t.id).length,
    damage: maintenanceRequests.filter(m => m.toolId === t.id).length,
  })).sort((a, b) => b.borrows - a.borrows);

  // Borrowing stats
  const borrowStats = {
    total: borrowings.length,
    active: borrowings.filter(b => b.status === 'ACTIVE').length,
    returned: borrowings.filter(b => b.status === 'RETURNED').length,
    overdue: borrowings.filter(b => b.status === 'ACTIVE' && new Date(b.expectedReturn) < new Date()).length,
  };

  // Damage stats
  const dmgByCategory = tools.reduce<Record<string, number>>((acc, t) => {
    const cat = t.categoryId;
    const dmgs = maintenanceRequests.filter(m => m.toolId === t.id).length;
    acc[cat] = (acc[cat] ?? 0) + dmgs;
    return acc;
  }, {});

  // Maintenance stats
  const maintStats = {
    total: maintenanceRequests.length,
    completed: maintenanceRequests.filter(m => m.status === 'COMPLETED').length,
    pending: maintenanceRequests.filter(m => ['PENDING', 'ASSIGNED'].includes(m.status)).length,
    inProgress: maintenanceRequests.filter(m => ['IN_PROGRESS', 'WAITING_FOR_PARTS'].includes(m.status)).length,
    totalCost: maintenanceRequests.reduce((sum, m) => sum + (m.repairCost ?? 0), 0),
  };

  // Mechanic performance
  const mechanicStats = users.filter(u => u.role === 'MECHANIC').map(m => {
    const assigned = maintenanceRequests.filter(r => r.assignedMechanic === m.id);
    const completed = assigned.filter(r => r.status === 'COMPLETED');
    const completedWithTimes = completed.filter(r => r.startedAt && r.completedAt);
    const avgDuration = completedWithTimes.length === 0 ? 0 :
      completedWithTimes.reduce((sum, r) => {
        return sum + (new Date(r.completedAt!).getTime() - new Date(r.startedAt!).getTime());
      }, 0) / completedWithTimes.length / 3600000; // hours
    return {
      name: m.name.split(' ')[0],
      fullName: m.name,
      assigned: assigned.length,
      completed: completed.length,
      avgHours: Math.round(avgDuration * 10) / 10,
      status: m.mechanicStatus,
    };
  });

  const borrowPie = [
    { name: 'Active', value: borrowStats.active, color: '#60a5fa' },
    { name: 'Returned', value: borrowStats.returned, color: '#4ade80' },
    { name: 'Overdue', value: borrowStats.overdue, color: '#f87171' },
  ].filter(d => d.value > 0);

  const maintPie = [
    { name: 'Pending/Assigned', value: maintStats.pending, color: '#fbbf24' },
    { name: 'In Progress', value: maintStats.inProgress, color: '#60a5fa' },
    { name: 'Completed', value: maintStats.completed, color: '#4ade80' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-7">
      <PageHeader title="Reports & Analytics" subtitle="Warehouse tool management metrics" />

      {/* Overview */}
      <section>
        <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest mb-3">Overview</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Tools" value={tools.length} color="#f59e0b" />
          <StatCard label="Total Borrowings" value={borrowStats.total} color="#60a5fa" />
          <StatCard label="Maintenance Tasks" value={maintStats.total} color="#fb923c" />
          <StatCard label="Total Repair Cost" value={fmtCurrency(maintStats.totalCost)} color="#4ade80" />
        </div>
      </section>

      {/* Borrowing Report */}
      <section>
        <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest mb-3">Borrowing Report</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-4">
            <p className="text-xs text-zinc-500 mb-4">Borrowing Status Distribution</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={borrowPie} cx="50%" cy="50%" outerRadius={70} dataKey="value" paddingAngle={3}>
                  {borrowPie.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={chart} />
                <Legend iconSize={8} formatter={(v) => <span style={{ color: '#a1a1aa', fontSize: 10, fontFamily: 'JetBrains Mono' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 content-start">
            <StatCard label="Active" value={borrowStats.active} color="#60a5fa" />
            <StatCard label="Returned" value={borrowStats.returned} color="#4ade80" />
            <StatCard label="Overdue" value={borrowStats.overdue} color="#f87171" />
            <StatCard label="Total" value={borrowStats.total} color="#a78bfa" />
          </div>
        </div>
      </section>

      {/* Tool Usage */}
      <section>
        <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest mb-3">Tool Usage</p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-4">
          <p className="text-xs text-zinc-500 mb-4">Borrowings per tool (most used first)</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={toolUsage} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chart} formatter={(v, n) => [v, 'Borrowings']} />
              <Bar dataKey="borrows" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Maintenance Report */}
      <section>
        <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest mb-3">Maintenance Report</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-4">
            <p className="text-xs text-zinc-500 mb-4">Maintenance Status</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={maintPie} cx="50%" cy="50%" outerRadius={70} dataKey="value" paddingAngle={3}>
                  {maintPie.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={chart} />
                <Legend iconSize={8} formatter={(v) => <span style={{ color: '#a1a1aa', fontSize: 10, fontFamily: 'JetBrains Mono' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 content-start">
            <StatCard label="Total Tasks" value={maintStats.total} color="#f59e0b" />
            <StatCard label="Completed" value={maintStats.completed} color="#4ade80" />
            <StatCard label="Pending" value={maintStats.pending} color="#fbbf24" />
            <StatCard label="In Progress" value={maintStats.inProgress} color="#60a5fa" />
          </div>
        </div>
      </section>

      {/* Mechanic Performance */}
      <section>
        <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest mb-3">Mechanic Performance</p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm">
          <div className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-zinc-800 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            <span>Mechanic</span><span>Assigned</span><span>Completed</span><span>Avg. Duration</span><span>Status</span>
          </div>
          {mechanicStats.map(m => (
            <div key={m.fullName} className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-zinc-800/50 items-center">
              <p className="text-sm font-medium text-zinc-200">{m.fullName}</p>
              <p className="text-sm font-mono text-zinc-400">{m.assigned}</p>
              <p className="text-sm font-mono text-zinc-400">{m.completed}</p>
              <p className="text-sm font-mono text-zinc-400">{m.avgHours > 0 ? `${m.avgHours}h` : '—'}</p>
              <span className={`text-xs font-mono font-bold ${m.status === 'AVAILABLE' ? 'text-emerald-400' : m.status === 'BUSY' ? 'text-orange-400' : 'text-zinc-600'}`}>
                {m.status?.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
