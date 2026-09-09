import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { StatCard, StatusBadge, fmt, fmtTime } from '../components/ui';

export default function EmployeeDash() {
   const {
    currentUser,
    tools,
    borrowings,
    notifications,
    mechanics,
  } = useApp();

  const navigate = useNavigate();

  if (!currentUser) return null;

  const myActive = borrowings.filter(
    b =>
      b.borrowerId === currentUser.id &&
      b.status === 'ACTIVE',
  );

  const myHistory = borrowings.filter(
    b =>
      b.borrowerId === currentUser.id &&
      b.status !== 'ACTIVE',
  );

  const myNotifs = notifications.filter(
    n =>
      n.userId === currentUser.id &&
      !n.read,
  );

  const isOverdue = (b: typeof borrowings[0]) =>
    new Date(b.expectedReturn) < new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-display text-zinc-100">
          Welcome back, <span className="text-amber-400">{currentUser.name.split(' ')[0]}</span>
        </h1>
        <p className="text-xs text-zinc-500 font-mono mt-0.5">{currentUser.department} · {currentUser.employeeId}</p>
      </div>

      {/* Big Scan button */}
      <button onClick={() => navigate('/scan')}
        className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold text-base py-5 rounded-sm transition-colors flex items-center justify-center gap-3">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3a2 2 0 00-2 2v10a2 2 0 002 2h3.5M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
        SCAN QR CODE
      </button>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Currently Borrowed" value={myActive.length} color="#60a5fa" />
        <StatCard label="Unread Alerts" value={myNotifs.length} color="#fbbf24" />
        <StatCard label="Total Borrows" value={myActive.length + myHistory.length} color="#a78bfa" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'My Borrowed Tools', to: '/my-tools', color: '#60a5fa' },
          { label: 'Borrowing History', to: '/my-history', color: '#a78bfa' },
          { label: 'Notifications', to: '/notifications', color: '#fbbf24' },
        ].map(a => (
          <button key={a.to} onClick={() => navigate(a.to)}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-sm py-3 px-3 text-center transition-colors">
            <p className="text-xs font-medium text-zinc-300">{a.label}</p>
          </button>
        ))}
      </div>

      {/* Mechanics list */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-sm">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
              Mechanic Availability
            </p>

            <p className="text-[10px] text-zinc-700 mt-1">
              Current maintenance team status
            </p>
          </div>

          <span className="text-[10px] font-mono text-zinc-600">
            {mechanics.length} mechanics
          </span>
        </div>

        {mechanics.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-zinc-600">
              No active mechanics
            </p>

            <p className="text-xs text-zinc-700 mt-1">
              There are currently no active mechanics.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {mechanics.map(mechanic => {
              const status =
                mechanic.mechanic_status ?? 'AVAILABLE';

              const config = {
                AVAILABLE: {
                  label: 'AVAILABLE',
                  dot: 'bg-emerald-500',
                  text: 'text-emerald-400',
                  bg: 'bg-emerald-500/10',
                  border: 'border-emerald-500/20',
                },

                BUSY: {
                  label: 'BUSY',
                  dot: 'bg-orange-500',
                  text: 'text-orange-400',
                  bg: 'bg-orange-500/10',
                  border: 'border-orange-500/20',
                },

                OFF_DUTY: {
                  label: 'OFF DUTY',
                  dot: 'bg-zinc-500',
                  text: 'text-zinc-500',
                  bg: 'bg-zinc-800',
                  border: 'border-zinc-700',
                },
              }[status];

              return (
                <div
                  key={mechanic.id}
                  className="px-4 py-3 flex items-center gap-3"
                >
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot}`}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-300 truncate">
                      {mechanic.full_name}
                    </p>

                    <p className="text-[10px] font-mono text-zinc-600 truncate">
                      {mechanic.employee_id}
                      {mechanic.department
                        ? ` · ${mechanic.department}`
                        : ''}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-1 rounded border ${config.text} ${config.bg} ${config.border}`}
                  >
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My active borrowings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-sm">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Currently Borrowed</p>
          <button onClick={() => navigate('/my-tools')} className="text-xs text-amber-500 hover:text-amber-400">View All</button>
        </div>
        {myActive.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-zinc-600">No active borrowings</p>
            <p className="text-xs text-zinc-700 mt-1">Scan a QR code to borrow a tool</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {myActive.map(b => {
              const tool = tools.find(t => t.id === b.toolId);
              const overdue = isOverdue(b);
              return (
                <div key={b.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 bg-zinc-800 rounded-sm flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-200 truncate">{tool?.name}</p>
                    <p className="text-[10px] font-mono text-zinc-600">
                      Due {fmtTime(b.expectedReturn)} · {tool?.code}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {overdue ? (
                      <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">OVERDUE</span>
                    ) : (
                      <StatusBadge status="ACTIVE" />
                    )}
                    <button onClick={() => navigate('/my-tools')} className="text-xs text-amber-500 hover:text-amber-400">Return</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Unread notifications */}
      {myNotifs.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Notifications</p>
            <button onClick={() => navigate('/notifications')} className="text-xs text-amber-500 hover:text-amber-400">View All</button>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {myNotifs.slice(0, 3).map(n => (
              <div key={n.id} className="px-4 py-3 flex items-start gap-3">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                  n.type === 'SUCCESS' ? 'bg-emerald-500' : n.type === 'WARNING' ? 'bg-amber-500' : n.type === 'ERROR' ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <div>
                  <p className="text-xs font-semibold text-zinc-300">{n.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
