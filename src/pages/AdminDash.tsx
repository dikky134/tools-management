import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { StatCard, StatusBadge, timeAgo } from '../components/ui';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from 'recharts';

const chartTooltipStyle = { backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 2, fontSize: 12 };

export default function AdminDash() {
  const { 
    currentUser,
    tools, 
    users, 
    borrowings, 
    maintenanceRequests, 
    mechanics, 
    notifications, 
    activityLogs,
    damageReports,
  } = useApp();
  const navigate = useNavigate();

  const monthlyData = Array.from(
    { length: 6 },
    (_, index) => {
      const date = new Date();

      date.setMonth(date.getMonth() - (5 - index));

      const year = date.getFullYear();
      const month = date.getMonth();

      const borrowingsCount = borrowings.filter(b => {
        const d = new Date(b.borrowedAt);

        return (
          d.getFullYear() === year &&
          d.getMonth() === month
        );
      }).length;

      const returnsCount = borrowings.filter(b => {
        if (!b.returnedAt) return false;

        const d = new Date(b.returnedAt);

        return (
          d.getFullYear() === year &&
          d.getMonth() === month
        );
      }).length;

      const damageCount = damageReports.filter(d => {
        const created =
          new Date(d.reportedAt);

        return (
          created.getFullYear() === year &&
          created.getMonth() === month
        );
      }).length;

      return {
        month: date.toLocaleDateString('en-US', {
          month: 'short',
        }),
        borrowings: borrowingsCount,
        returns: returnsCount,
        damage: damageCount,
      };
    }
  );

  const stats = {
    total: tools.length,
    available: tools.filter(t => t.status === 'AVAILABLE').length,
    borrowed: tools.filter(t => t.status === 'BORROWED').length,
    damaged: tools.filter(t => t.status === 'DAMAGED').length,
    maintenance: tools.filter(t => t.status === 'MAINTENANCE').length,
    inactive: tools.filter(t => t.status === 'INACTIVE').length,

    employees: users.filter(u => u.role === 'EMPLOYEE').length,

    mechanics: mechanics.length,

    mechAvail: mechanics.filter(
      m => m.mechanic_status === 'AVAILABLE'
    ).length,

    mechBusy: mechanics.filter(
      m => m.mechanic_status === 'BUSY'
    ).length,

    mechOffDuty: mechanics.filter(
      m => m.mechanic_status === 'OFF_DUTY'
    ).length,

    activeBorrowings: borrowings.filter(
      b => b.status === 'ACTIVE'
    ).length,

    overdue: borrowings.filter(
      b =>
        b.status === 'ACTIVE' &&
        new Date(b.expectedReturn) < new Date()
    ).length,

    pendingMaintenance: maintenanceRequests.filter(
      m => m.status === 'PENDING'
    ).length,

    inProgressMaintenance: maintenanceRequests.filter(
      m =>
        m.status === 'IN_PROGRESS' ||
        m.status === 'WAITING_FOR_PARTS'
    ).length,
  };

  const pieData = [
    { name: 'Available', value: stats.available, color: '#4ade80' },
    { name: 'Borrowed', value: stats.borrowed, color: '#60a5fa' },
    { name: 'Damaged', value: stats.damaged, color: '#f87171' },
    { name: 'Maintenance', value: stats.maintenance, color: '#fb923c' },
    { name: 'Inactive', value: stats.inactive, color: '#52525b' },
  ].filter(d => d.value > 0);

  const toolUsageData = tools.map(t => ({
    name: t.code,
    borrows: borrowings.filter(b => b.toolId === t.id).length,
  })).sort((a, b) => b.borrows - a.borrows).slice(0, 6);

  const recentActivity = activityLogs.slice(0, 8);
  const usersMap = Object.fromEntries(users.map(u => [u.id, u]));

  const ACTION_LABELS: Record<string, string> = {
    BORROW_TOOL: '📤 Borrowed', RETURN_TOOL: '📥 Returned', REPORT_DAMAGE: '⚠️ Damage Reported',
    START_MAINTENANCE: '🔧 Started Maintenance', COMPLETE_MAINTENANCE: '✅ Completed Maintenance',
    ASSIGN_MECHANIC: '👤 Mechanic Assigned', CREATE_TOOL: '➕ Tool Added',
    ACCEPT_TASK: '🔑 Task Accepted', UPDATE_STATUS: '🔄 Status Updated',
  };

  const unreadNotifications = notifications.filter(
    n =>
      n.userId === currentUser?.id &&
      !n.read
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-display text-zinc-100">Admin Dashboard</h1>
        <p className="text-xs text-zinc-500 font-mono mt-0.5">{new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {[
          {
            label: '+ Add Tool',
            to: '/tools?action=add',
            color: 'bg-amber-500 hover:bg-amber-400 text-zinc-900',
          },
          {
            label: 'Scan Tool',
            to: '/scan',
            color: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200',
          },
          {
            label: 'Maintenance',
            to: '/maintenance',
            color: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200',
          },
          {
            label: 'Borrowings',
            to: '/borrowings',
            color: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200',
          },
          {
            label: 'Reports',
            to: '/reports',
            color: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200',
          },
        ].map(a => (
          <button
            key={a.to}
            onClick={() => navigate(a.to)}
            className={`px-3 py-1.5 text-xs font-medium font-mono rounded-sm transition-colors ${a.color}`}
          >
            {a.label}
          </button>
        ))}

        <button
          onClick={() => navigate('/notifications')}
          className="px-3 py-1.5 text-xs font-medium font-mono rounded-sm transition-colors bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
        >
          Notifications
          {unreadNotifications > 0 && (
            <span className="ml-2 text-amber-400">
              {unreadNotifications}
            </span>
          )}
        </button>
      </div>

      {/* Tool Stats */}
      <div>
        <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest mb-3">Tool Inventory</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard label="Total Tools" value={stats.total} color="#f59e0b" />
          <StatCard label="Available" value={stats.available} color="#4ade80" />
          <StatCard label="Borrowed" value={stats.borrowed} color="#60a5fa" />
          <StatCard label="Damaged" value={stats.damaged} color="#f87171" />
          <StatCard label="Maintenance" value={stats.maintenance} color="#fb923c" />
        </div>
      </div>

      {/* People + Transactions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Employees"
          value={stats.employees}
          color="#a78bfa"
        />

        <StatCard
          label="Avail. Mechanics"
          value={`${stats.mechAvail}/${stats.mechanics}`}
          color="#4ade80"
          sub="mechanics available"
        />

        <StatCard
          label="Active Borrowings"
          value={stats.activeBorrowings}
          color="#60a5fa"
        />

        <StatCard
          label="Pending Maint."
          value={stats.pendingMaintenance}
          color="#fbbf24"
        />
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard
          label="In Progress"
          value={stats.inProgressMaintenance}
          color="#fb923c"
        />

        <StatCard
          label="Overdue"
          value={stats.overdue}
          color="#f87171"
        />

        <StatCard
          label="Off Duty Mechanics"
          value={stats.mechOffDuty}
          color="#71717a"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Borrowings */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-sm p-4">
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Monthly Borrowing Trend</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="gradBorrow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: '#e4e4e7' }} itemStyle={{ color: '#a1a1aa' }} />
              <Area type="monotone" dataKey="borrowings" stroke="#f59e0b" strokeWidth={2} fill="url(#gradBorrow)" name="Borrowings" />
              <Area type="monotone" dataKey="returns" stroke="#4ade80" strokeWidth={1.5} fill="none" strokeDasharray="4 2" name="Returns" />
              <Area type="monotone" dataKey="damage" stroke="#f87171" strokeWidth={1.5} fill="none" strokeDasharray="2 2" name="Damage Reports" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-4">
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Tool Status</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                dataKey="value" paddingAngle={2}>
                {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ color: '#a1a1aa', fontSize: 10, fontFamily: 'JetBrains Mono' }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tool Usage */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-4">
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Tool Usage — Total Borrowings</p>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={toolUsageData} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Bar dataKey="borrows" fill="#f59e0b" radius={[2, 2, 0, 0]} name="Total Borrows" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Alerts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Alerts */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm">
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Active Alerts</p>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {stats.overdue > 0 && (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                <p className="text-sm text-zinc-300">{stats.overdue} overdue borrowing{stats.overdue > 1 ? 's' : ''}</p>
                <button onClick={() => navigate('/borrowings')} className="ml-auto text-xs text-amber-500 hover:text-amber-400">View</button>
              </div>
            )}
            {stats.pendingMaintenance > 0 && (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                <p className="text-sm text-zinc-300">{stats.pendingMaintenance} pending maintenance request{stats.pendingMaintenance > 1 ? 's' : ''}</p>
                <button onClick={() => navigate('/maintenance')} className="ml-auto text-xs text-amber-500 hover:text-amber-400">View</button>
              </div>
            )}
            {stats.damaged > 0 && (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                <p className="text-sm text-zinc-300">{stats.damaged} tool{stats.damaged > 1 ? 's' : ''} damaged and awaiting maintenance</p>
                <button onClick={() => navigate('/tools')} className="ml-auto text-xs text-amber-500 hover:text-amber-400">View</button>
              </div>
            )}
            {stats.inProgressMaintenance > 0 && (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />

                <p className="text-sm text-zinc-300">
                  {stats.inProgressMaintenance} maintenance task
                  {stats.inProgressMaintenance > 1 ? 's' : ''}
                  {' '}in progress
                </p>

                <button
                  onClick={() => navigate('/maintenance')}
                  className="ml-auto text-xs text-amber-500 hover:text-amber-400"
                >
                  View
                </button>
              </div>
            )}
            {stats.overdue === 0 &&
              stats.pendingMaintenance === 0 &&
              stats.inProgressMaintenance === 0 &&
              stats.damaged === 0 && (
                <div className="px-4 py-6 text-center text-sm text-zinc-600">
                  No active alerts
                </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Recent Activity</p>
            <button onClick={() => navigate('/activity-logs')} className="text-xs text-amber-500 hover:text-amber-400">View All</button>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {recentActivity.map(log => {
              const user = usersMap[log.userId];
              return (
                <div key={log.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="w-6 h-6 rounded-sm bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 flex-shrink-0 mt-0.5">
                    {user?.name.split(' ').map(n => n[0]).join('').slice(0, 2) ?? '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-zinc-300 leading-snug">{log.description}</p>
                  </div>
                  <span className="text-[10px] text-zinc-600 font-mono flex-shrink-0">{timeAgo(log.createdAt)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
