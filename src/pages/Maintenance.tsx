import { useState, useMemo } from 'react';
import { useApp } from '../store';
import {
  PageHeader,
  StatusBadge,
  SearchInput,
  Tabs,
  Btn,
  Modal,
  Select,
  Textarea,
  fmt,
  fmtDate,
  fmtCurrency,
} from '../components/ui';
import type {
  Priority,
  MaintenanceStatus,
  RepairResult,
} from '../types';
import { getUserFriendlyError } from '../utils/error';
import ErrorMessage from '../components/ErrorMessage';

export default function Maintenance() {
  const { maintenanceRequests, tools, users, currentUser, assignMechanic, startTask, updateTaskStatus, completeTask } = useApp();

  const [q, setQ] = useState('');
  const [tab, setTab] = useState('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [assignMechId, setAssignMechId] = useState('');
  const [completeForm, setCompleteForm] = useState({ result: 'REPAIRED' as RepairResult, notes: '', cost: '', parts: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'ADMIN';
  const isMechanic = currentUser?.role === 'MECHANIC';

  const myActiveTasks = maintenanceRequests.filter(
    m =>
      m.assignedMechanic === currentUser?.id &&
      ['ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_PARTS'].includes(m.status)
  ).length;

  const tabs = ['All', 'Pending', 'In Progress', 'Completed'];
  const filtered = useMemo(() => {
    return maintenanceRequests
      .filter(m => {
        // Mekanik hanya melihat task yang ditugaskan kepadanya
        if (isMechanic && m.assignedMechanic !== currentUser?.id) {
          return false;
        }

        const tool = tools.find(t => t.id === m.toolId);

        const matchQ =
          !q ||
          [tool?.name, tool?.code, m.id].some(v =>
            v?.toLowerCase().includes(q.toLowerCase())
          );

        const matchTab =
          tab === 'All' ||
          (tab === 'Pending' && ['PENDING', 'ASSIGNED'].includes(m.status)) ||
          (tab === 'In Progress' && ['IN_PROGRESS', 'WAITING_FOR_PARTS'].includes(m.status)) ||
          (tab === 'Completed' && ['COMPLETED', 'CANCELLED'].includes(m.status));

        return matchQ && matchTab;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  }, [maintenanceRequests, q, tab, tools, currentUser?.id, isMechanic]);

  const selected = selectedId ? maintenanceRequests.find(m => m.id === selectedId) : null;
  const selectedTool = selected ? tools.find(t => t.id === selected.toolId) : null;
  const selectedMech = selected?.assignedMechanic ? users.find(u => u.id === selected.assignedMechanic) : null;
  const availMechanics = users.filter(u => u.role === 'MECHANIC' && u.mechanicStatus === 'AVAILABLE');

  const handleComplete = async () => {
    if (!selectedId) {
      setError('No maintenance task selected.');
      return;
    }

    if (!completeForm.notes.trim()) {
      setError('Please enter repair notes.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await completeTask(
        selectedId,
        completeForm.result,
        completeForm.notes.trim(),
        Number(completeForm.cost) || 0,
        completeForm.parts.trim(),
      );

      setShowComplete(false);
      setSelectedId(null);

      setCompleteForm({
        result: 'REPAIRED',
        notes: '',
        cost: '',
        parts: '',
      });
    } catch (error) {
      console.error('Failed to complete repair:', error);
      setError(getUserFriendlyError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedId) {
      setError('No maintenance task selected.');
      return;
    }

    if (!assignMechId) {
      setError('Please select a mechanic.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await assignMechanic(
        selectedId,
        assignMechId,
      );

      setShowAssign(false);
      setSelectedId(null);
      setAssignMechId('');
    } catch (error) {
      console.error('Failed to assign mechanic:', error);
      setError(getUserFriendlyError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async (
    maintenanceId: string,
  ) => {
    setError(null);
    setLoading(true);

    try {
      await startTask(maintenanceId);
    } catch (error) {
      console.error('Failed to start maintenance:', error);
      setError(getUserFriendlyError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatus = async (
    maintenanceId: string,
    status: MaintenanceStatus,
  ) => {
    setError(null);
    setLoading(true);

    try {
      await updateTaskStatus(
        maintenanceId,
        status,
      );
    } catch (error) {
      console.error(
        'Failed to update maintenance status:',
        error,
      );
      setError(getUserFriendlyError(error));
    } finally {
      setLoading(false);
    }
  };

  const PRIORITY_COLOR: Record<string, string> = { CRITICAL: '#f87171', HIGH: '#fb923c', MEDIUM: '#fbbf24', LOW: '#71717a' };

  return (
    <div className="space-y-5">
      <PageHeader
        title={isMechanic ? 'My Maintenance Tasks' : 'Maintenance Management'}
        subtitle={
          isMechanic
            ? `${myActiveTasks} active task${myActiveTasks !== 1 ? 's' : ''}`
            : `${maintenanceRequests.filter(m =>
                ['PENDING', 'ASSIGNED', 'IN_PROGRESS'].includes(m.status)
              ).length} active requests`
        }
      />

      <div className="flex gap-2">
        <div className="flex-1"><SearchInput value={q} onChange={setQ} placeholder="Search maintenance..." /></div>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <div className="space-y-3">
        {filtered.map(m => {
          const tool = tools.find(t => t.id === m.toolId);
          const mech = m.assignedMechanic ? users.find(u => u.id === m.assignedMechanic) : null;
          const reporter = users.find(u => u.id === m.reportedBy);
          const canAccept = isMechanic && m.assignedMechanic === currentUser?.id && m.status === 'ASSIGNED';
          const canComplete = isMechanic && m.assignedMechanic === currentUser?.id && m.status === 'IN_PROGRESS';
          const isMyTask = isMechanic && m.assignedMechanic === currentUser?.id;

          return (
            <div key={m.id} className={`bg-zinc-900 border rounded-sm p-4 transition-colors ${isMyTask ? 'border-amber-500/20' : 'border-zinc-800'}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-zinc-600">
                      {m.id}
                    </span>

                    <div
                      className="w-1 h-1 rounded-full flex-shrink-0"
                      style={{ background: PRIORITY_COLOR[m.priority] }}
                    />

                    {isMechanic && m.assignedMechanic === currentUser?.id && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono uppercase">
                        My Task
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-amber-400/80">{tool?.code}</p>
                  <p className="text-base font-semibold font-display text-zinc-200">{tool?.name}</p>
                </div>
                <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                  <StatusBadge status={m.priority} />
                  <StatusBadge status={m.status} />
                </div>
              </div>

              <p className="text-xs text-zinc-500 mb-3 leading-relaxed">{m.description}</p>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-3">
                <div><span className="text-zinc-600">Reported by </span><span className="text-zinc-400">{reporter?.name ?? '—'}</span></div>
                <div><span className="text-zinc-600">Mechanic </span><span className="text-zinc-400">{mech?.name ?? 'Unassigned'}</span></div>
                <div><span className="text-zinc-600">Created </span><span className="text-zinc-400 font-mono">{fmtDate(m.createdAt)}</span></div>
                {m.startedAt && <div><span className="text-zinc-600">Started </span><span className="text-zinc-400 font-mono">{fmtDate(m.startedAt)}</span></div>}
                {m.completedAt && <div><span className="text-zinc-600">Completed </span><span className="text-zinc-400 font-mono">{fmtDate(m.completedAt)}</span></div>}
                {m.repairCost && <div><span className="text-zinc-600">Repair cost </span><span className="text-zinc-400">{fmtCurrency(m.repairCost)}</span></div>}
              </div>

              {m.repairNotes && (
                <p className="text-xs text-zinc-600 bg-zinc-800/60 rounded px-2 py-1.5 mb-3 border border-zinc-800">
                  {m.repairNotes}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {isAdmin && m.status === 'PENDING' && (
                  <Btn
                    size="sm"
                    onClick={() => {
                      setError(null);
                      setAssignMechId('');
                      setSelectedId(m.id);
                      setShowAssign(true);
                    }}
                    disabled={availMechanics.length === 0}
                  >
                    Assign Mechanic
                  </Btn>
                )}
                {canAccept && (
                  <Btn
                    size="sm"
                    onClick={() => void handleStartTask(m.id)}
                    loading={loading}
                    disabled={loading}
                  >
                    Accept & Start
                  </Btn>
                )}
                {canComplete && (
                  <Btn
                    size="sm"
                    onClick={() => {
                      setError(null);
                      setSelectedId(m.id);
                      setShowComplete(true);
                    }}
                  >
                    Complete Repair
                  </Btn>
                )}
                {m.status === 'IN_PROGRESS' && isMechanic && m.assignedMechanic === currentUser?.id && (
                  <Btn
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      void handleTaskStatus(
                        m.id,
                        'WAITING_FOR_PARTS',
                      )
                    }
                    loading={loading}
                    disabled={loading}
                  >
                    Waiting for Parts
                  </Btn>
                )}
                {m.status === 'WAITING_FOR_PARTS' && isMechanic && m.assignedMechanic === currentUser?.id && (
                  <Btn
                    size="sm"
                    onClick={() =>
                      void handleTaskStatus(
                        m.id,
                        'IN_PROGRESS',
                      )
                    }
                    loading={loading}
                    disabled={loading}
                  >
                    Resume Repair
                  </Btn>
                )}
                {isAdmin && m.status === 'ASSIGNED' && (
                  <Btn
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setError(null);
                      setAssignMechId('');
                      setSelectedId(m.id);
                      setShowAssign(true);
                    }}
                  >
                    Reassign
                  </Btn>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm py-16 text-center">
            <p className="text-sm text-zinc-600">No maintenance requests found</p>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      <Modal open={showAssign} onClose={() => setShowAssign(false)} title="Assign Mechanic">
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">Assigning maintenance for <span className="font-semibold text-zinc-200">{selectedTool?.name}</span></p>
          {availMechanics.length === 0 ? (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-sm p-3 text-sm text-orange-400">
              No available mechanics. All mechanics are either busy or off duty.
            </div>
          ) : (
            <div className="space-y-2">
              {users.filter(u => u.role === 'MECHANIC').map(m => (
                <label key={m.id} className={`flex items-center gap-3 p-3 rounded-sm border cursor-pointer transition-colors ${
                  assignMechId === m.id ? 'border-amber-500/50 bg-amber-500/5' : 'border-zinc-800 hover:border-zinc-700'
                } ${m.mechanicStatus !== 'AVAILABLE' ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  <input type="radio" name="mech" value={m.id} checked={assignMechId === m.id}
                    onChange={() => setAssignMechId(m.id)} disabled={m.mechanicStatus !== 'AVAILABLE'} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-200">{m.name}</p>
                    <p className="text-xs text-zinc-600 font-mono">{m.employeeId}</p>
                  </div>
                  <StatusBadge status={m.mechanicStatus ?? 'AVAILABLE'} />
                </label>
              ))}
            </div>
          )}
          <ErrorMessage
            message={error}
            onClose={() => setError(null)}
          />
          <ErrorMessage
            message={error}
            onClose={() => setError(null)}
          />
          <div className="flex gap-2 justify-end mt-2">
            <Btn variant="secondary" onClick={() => setShowAssign(false)}>Cancel</Btn>
            <Btn onClick={handleAssign} disabled={!assignMechId}>Assign</Btn>
          </div>
        </div>
      </Modal>

      {/* Complete Modal */}
      <Modal open={showComplete} onClose={() => setShowComplete(false)} title="Complete Repair">
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">Completing repair for <span className="font-semibold text-zinc-200">{selectedTool?.name}</span></p>
          <Select label="Repair Result *" value={completeForm.result}
            onChange={e => setCompleteForm(f => ({ ...f, result: e.target.value as RepairResult }))}
            options={[
              { value: 'REPAIRED', label: 'Repaired — fully functional' },
              { value: 'PARTIALLY_REPAIRED', label: 'Partially Repaired — minor issues remain' },
              { value: 'UNREPAIRABLE', label: 'Unrepairable — tool must be decommissioned' },
            ]} />
          {completeForm.result === 'UNREPAIRABLE' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-sm p-3 text-xs text-red-400">
              ⚠ Tool will be marked as INACTIVE and cannot be borrowed.
            </div>
          )}
          <Textarea label="Repair Notes *" value={completeForm.notes}
            onChange={e => setCompleteForm(f => ({ ...f, notes: e.target.value }))}
            rows={3} placeholder="Describe what was repaired..." />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-1.5 block">Repair Cost (IDR)</label>
              <input type="number" value={completeForm.cost}
                onChange={e => setCompleteForm(f => ({ ...f, cost: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-sm px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-1.5 block">Parts Replaced</label>
              <input value={completeForm.parts}
                onChange={e => setCompleteForm(f => ({ ...f, parts: e.target.value }))}
                placeholder="e.g. Motor capacitor"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-sm px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500" />
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Btn variant="secondary" onClick={() => setShowComplete(false)}>Cancel</Btn>
            <Btn onClick={handleComplete} loading={loading} disabled={!completeForm.notes}>
              Complete Repair
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
