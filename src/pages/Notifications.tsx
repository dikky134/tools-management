import { useApp } from '../store';
import { PageHeader, Btn } from '../components/ui';

const TYPE_STYLES = {
  INFO: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  SUCCESS: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  WARNING: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  ERROR: 'bg-red-500/10 border-red-500/20 text-red-400',
};

const TYPE_DOT = {
  INFO: 'bg-blue-500', SUCCESS: 'bg-emerald-500', WARNING: 'bg-amber-500', ERROR: 'bg-red-500',
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Notifications() {
  const { currentUser, notifications, markNotificationRead, markAllRead } = useApp();

  if (!currentUser) return null;

  const myNotifs = notifications
    .filter(n => n.userId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
  const unreadCount = myNotifs.filter(n => !n.read).length;

  return (
    <div className="max-w-xl space-y-5">
      <PageHeader title="Notifications"
        subtitle={`${unreadCount} unread`}
        action={unreadCount > 0 ? <Btn variant="ghost" size="sm" onClick={() => markAllRead(currentUser.id)}>Mark all read</Btn> : undefined} />

      {myNotifs.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm py-16 text-center">
          <p className="text-3xl mb-3">🔔</p>
          <p className="text-sm text-zinc-500 font-display">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {myNotifs.map(n => (
            <div key={n.id}
              onClick={() => !n.read && markNotificationRead(n.id)}
              className={`border rounded-sm p-4 transition-colors cursor-pointer ${n.read ? 'bg-zinc-900 border-zinc-800' : `${TYPE_STYLES[n.type]} border`}`}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${n.read ? 'bg-zinc-700' : TYPE_DOT[n.type]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className={`text-sm font-semibold ${n.read ? 'text-zinc-400' : 'text-zinc-200'}`}>{n.title}</p>
                    <span className="text-[10px] font-mono text-zinc-600 flex-shrink-0">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${n.read ? 'text-zinc-600' : 'text-zinc-400'}`}>{n.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
