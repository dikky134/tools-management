import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { StatusBadge, Btn, StatCard, fmtDate } from '../components/ui';
import type { MechanicAvailability, MaintenanceRequest } from '../types';

export default function MechanicDash() {
  const { currentUser, maintenanceRequests, tools, acceptTask, startTask, updateMechanicStatus } = useApp();
  const navigate = useNavigate();
  const [statusError, setStatusError] = useState<string | null>(null);

  if (!currentUser) return null;

  const myTasks = maintenanceRequests.filter(m => m.assignedMechanic === currentUser.id);
  const pending = myTasks.filter(m => m.status === 'ASSIGNED');
  const inProgress = myTasks.filter(m => ['IN_PROGRESS', 'WAITING_FOR_PARTS'].includes(m.status));
  const completed = myTasks.filter(m => m.status === 'COMPLETED').slice(0, 5);

  const damagedTools = tools.filter(
    tool =>
      tool.status === 'DAMAGED' ||
      tool.status === 'MAINTENANCE',
  );

  const mechStatus = currentUser.mechanicStatus ?? 'AVAILABLE';

  const statusColor: Record<MechanicAvailability, string> = {
    AVAILABLE: '#4ade80', BUSY: '#fb923c', OFF_DUTY: '#71717a',
  };

  function TaskCard({ task }: { task: MaintenanceRequest }) {
    const tool = tools.find(t => t.id === task.toolId);
    return (
      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-sm p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-mono text-zinc-500">{tool?.code}</p>
            <p className="text-sm font-semibold text-zinc-200">{tool?.name}</p>
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            <StatusBadge status={task.priority} />
            <StatusBadge status={task.status} />
          </div>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">{task.description}</p>
        {task.repairNotes && (
          <p className="text-xs text-zinc-600 bg-zinc-900 rounded px-2 py-1.5 border border-zinc-800">{task.repairNotes}</p>
        )}
        <div className="flex gap-2">
          {task.status === 'ASSIGNED' && (
            <Btn size="sm" onClick={() => startTask(task.id)}>
              Accept & Start
            </Btn>
          )}
          {task.status === 'IN_PROGRESS' && (
            <Btn size="sm" onClick={() => navigate(`/maintenance/${task.id}`)}>Update Progress</Btn>
          )}
          {task.status === 'WAITING_FOR_PARTS' && (
            <Btn size="sm" variant="secondary" onClick={() => navigate(`/maintenance/${task.id}`)}>View Details</Btn>
          )}
        </div>
        <p className="text-[10px] font-mono text-zinc-700">Created {fmtDate(task.createdAt)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Availability */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-zinc-100">
            Mechanic Dashboard
          </h1>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">{currentUser.name} · {currentUser.employeeId}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusColor[mechStatus] }} />
          <span className="text-xs font-mono font-bold" style={{ color: statusColor[mechStatus] }}>{mechStatus}</span>
        </div>
      </div>

      {/* Availability toggle */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-4">
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3">My Availability</p>
        <div className="flex gap-2">
          {(['AVAILABLE', 'OFF_DUTY'] as MechanicAvailability[]).map(s => (
            <button 
              key={s} 
              onClick={async () => {
                if (mechStatus === s) return;

                try {
                  await updateMechanicStatus(
                    currentUser.id,
                    s,
                  );
                } catch (error) {
                  console.error(
                    'Failed to update mechanic status:',
                    error,
                  );
                }
              }}
              disabled={mechStatus === s}
              className={`flex-1 py-2 text-xs font-mono font-bold rounded-sm border transition-all disabled:cursor-default ${
                mechStatus === s
                  ? s === 'AVAILABLE' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : s === 'BUSY' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400'
              }`}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Pending" value={pending.length} color="#fbbf24" />
        <StatCard label="In Progress" value={inProgress.length} color="#60a5fa" />
        <StatCard label="Completed" value={completed.length} color="#4ade80" />
      </div>

      {/* Damaged Tools */}
      {damagedTools.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                Damaged Tools
              </p>

              <p className="text-[10px] text-zinc-700 mt-1">
                Tools requiring inspection or repair
              </p>
            </div>

            <span className="text-[10px] font-mono text-red-400">
              {damagedTools.length}
            </span>
          </div>

          <div className="divide-y divide-zinc-800/50">
            {damagedTools.map(tool => {
              const maintenance = maintenanceRequests.find(
                m =>
                  m.toolId === tool.id &&
                  [
                    'PENDING',
                    'ASSIGNED',
                    'IN_PROGRESS',
                    'WAITING_FOR_PARTS',
                  ].includes(m.status),
              );

              return (
                <div
                  key={tool.id}
                  className="px-4 py-3 flex items-center gap-3"
                >
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      tool.status === 'MAINTENANCE'
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                    }`}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-300 truncate">
                      {tool.name}
                    </p>

                    <p className="text-[10px] font-mono text-zinc-600">
                      {tool.code}
                      {tool.location
                        ? ` · ${tool.location}`
                        : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={tool.status} />

                    {maintenance && (
                      <StatusBadge status={maintenance.status} />
                    )}

                    <button
                      onClick={() =>
                        navigate(`/tools/${tool.id}`)
                      }
                      className="text-xs text-amber-500 hover:text-amber-400"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending Tasks */}
      {pending.length > 0 && (
        <div>
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3">New Assignments</p>
          <div className="space-y-3">
            {pending.map(t => <TaskCard key={t.id} task={t} />)}
          </div>
        </div>
      )}

      {/* In Progress */}
      {inProgress.length > 0 && (
        <div>
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3">In Progress</p>
          <div className="space-y-3">
            {inProgress.map(t => <TaskCard key={t.id} task={t} />)}
          </div>
        </div>
      )}

      {/* No tasks */}
      {pending.length === 0 && inProgress.length === 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm py-12 text-center">
          <p className="text-3xl mb-3">✅</p>
          <p className="text-sm font-semibold text-zinc-400 font-display">No Active Tasks</p>
          <p className="text-xs text-zinc-600 mt-1">You have no assigned maintenance tasks.</p>
        </div>
      )}

      {/* Recent completions */}
      {completed.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm">
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Recently Completed</p>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {completed.map(t => {
              const tool = tools.find(x => x.id === t.toolId);
              return (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-300">{tool?.name}</p>
                    <p className="text-[10px] font-mono text-zinc-600">{tool?.code} · {fmtDate(t.completedAt)}</p>
                  </div>
                  <StatusBadge status={t.repairResult ?? 'COMPLETED'} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {statusError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-sm px-4 py-3">
          <p className="text-xs text-red-400 font-mono">
            {statusError}
          </p>
        </div>
      )}
    </div>
  );
}
