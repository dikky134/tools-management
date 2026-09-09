import { useState } from 'react';
import { useApp } from '../store';
import { PageHeader, SearchInput } from '../components/ui';

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const ACTION_ICON: Record<string, string> = {
  BORROW_TOOL: '📤', RETURN_TOOL: '📥', REPORT_DAMAGE: '⚠️',
  START_MAINTENANCE: '🔧', COMPLETE_MAINTENANCE: '✅', ACCEPT_TASK: '🔑',
  ASSIGN_MECHANIC: '👤', CREATE_TOOL: '➕', UPDATE_STATUS: '🔄',
  CREATE_MAINTENANCE: '🛠', USER_LOGIN: '🔐', USER_CREATED: '👤',
};

export default function ActivityLogs() {
  const { activityLogs, users } = useApp();
  const [q, setQ] = useState('');

  const filtered = activityLogs
    .filter(l => !q || l.description.toLowerCase().includes(q.toLowerCase()) || l.action.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-5">
      <PageHeader title="Activity Logs" subtitle={`${filtered.length} events`} />
      <SearchInput value={q} onChange={setQ} placeholder="Search activity..." />

      <div className="bg-zinc-900 border border-zinc-800 rounded-sm divide-y divide-zinc-800/50">
        {filtered.map(log => {
          const user = users.find(u => u.id === log.userId);
          return (
            <div key={log.id} className="flex items-start gap-3 px-4 py-3">
              <div className="text-base flex-shrink-0 mt-0.5">{ACTION_ICON[log.action] ?? '📋'}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-300 leading-snug">{log.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono text-zinc-600">{log.action}</span>
                  <span className="text-[10px] text-zinc-700">·</span>
                  <span className="text-[10px] text-zinc-600">{user?.name ?? 'System'}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-zinc-700 flex-shrink-0 whitespace-nowrap">{timeAgo(log.createdAt)}</span>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-zinc-600">No activity logs found</div>
        )}
      </div>
    </div>
  );
}
