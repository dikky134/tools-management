import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import {
  StatusBadge,
  Btn,
  Modal,
  Select,
  Textarea,
  Input,
  fmtDate,
  fmt,
  fmtCurrency,
} from '../components/ui';
import { QRCodeSVG } from 'qrcode.react';
import { getUserFriendlyError } from '../utils/error';
import type { ToolCondition, Priority } from '../types';
import ErrorMessage from '../components/ErrorMessage';

export default function ToolDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    tools,
    categories,
    borrowings,
    maintenanceRequests,
    users,
    currentUser,
    borrowTool,
    returnTool,
    reportDamage,
  } = useApp();

  const tool = tools.find(t => t.id === id);
  const cat = tool
    ? categories.find(c => c.id === tool.categoryId)
    : null;

  const activeBorrow = tool
    ? borrowings.find(
        b =>
          b.toolId === tool.id &&
          b.status === 'ACTIVE'
      )
    : null;

  const borrower = activeBorrow
    ? users.find(u => u.id === activeBorrow.borrowerId)
    : null;

  const activeMaint = tool
    ? maintenanceRequests.find(
        m =>
          m.toolId === tool.id &&
          [
            'PENDING',
            'ASSIGNED',
            'IN_PROGRESS',
            'WAITING_FOR_PARTS',
          ].includes(m.status)
      )
    : null;

  const mechanic = activeMaint?.assignedMechanic
    ? users.find(
        u => u.id === activeMaint.assignedMechanic
      )
    : null;

  const toolHistory = borrowings
    .filter(b => b.toolId === id)
    .sort(
      (a, b) =>
        new Date(b.borrowedAt).getTime() -
        new Date(a.borrowedAt).getTime()
    );

  const [showBorrow, setShowBorrow] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [showDamage, setShowDamage] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState('');

  const [purpose, setPurpose] = useState('');
  const [duration, setDuration] = useState('120');

  const [returnCondition, setReturnCondition] =
    useState<ToolCondition>('GOOD');
  const [returnNotes, setReturnNotes] = useState('');

  const [dmgType, setDmgType] = useState('');
  const [dmgDesc, setDmgDesc] = useState('');
  const [dmgPriority, setDmgPriority] =
    useState<Priority>('MEDIUM');

  const damageSubmittingRef = useRef(false);

  if (!tool) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-display text-zinc-400">
          Tool not found.
        </p>
        <p className="text-sm text-zinc-600 mt-1">
          The QR code may be invalid.
        </p>
        <Btn
          variant="secondary"
          onClick={() => navigate('/tools')}
          className="mt-4"
        >
          Back to Tools
        </Btn>
      </div>
    );
  }

  const handleBorrow = async () => {
    if (!purpose.trim()) {
      setError('Please enter the borrowing purpose.');
      return;
    }

    setError(null);
    setSuccess('');
    setLoading(true);

    try {
      await borrowTool(
        tool.id,
        purpose.trim(),
        Number(duration),
      );

      setShowBorrow(false);
      setPurpose('');
      setDuration('120');

      setSuccess('Tool borrowed successfully.');

      window.setTimeout(() => {
        setSuccess('');
      }, 4000);
    } catch (error) {
      console.error('Failed to borrow tool:', error);
      setError(getUserFriendlyError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!activeBorrow) {
      setError('No active borrowing found for this tool.');
      return;
    }

    setError(null);
    setSuccess('');
    setLoading(true);

    try {
      await returnTool(
        activeBorrow.id,
        returnCondition,
        returnNotes.trim() || undefined,
      );

      setShowReturn(false);
      setReturnCondition('GOOD');
      setReturnNotes('');

      setSuccess(
        returnCondition === 'GOOD'
          ? 'Tool returned successfully.'
          : 'Tool returned and maintenance processing has been started.',
      );

      window.setTimeout(() => {
        setSuccess('');
      }, 4000);
    } catch (error) {
      console.error('Failed to return tool:', error);
      setError(getUserFriendlyError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDamageReport = async () => {
    if (
      !currentUser ||
      !dmgDesc.trim() ||
      damageSubmittingRef.current
    ) {
      return;
    }

    damageSubmittingRef.current = true;
    setError(null);
    setSuccess('');
    setLoading(true);

    try {
      await reportDamage(
        tool.id,
        dmgType.trim() || 'General damage',
        dmgDesc.trim(),
        dmgPriority,
      );

      setShowDamage(false);

      setDmgType('');
      setDmgDesc('');
      setDmgPriority('MEDIUM');

      setSuccess('Damage report submitted successfully.');

      window.setTimeout(() => {
        setSuccess('');
      }, 4000);
    } catch (error) {
      console.error('Failed to report damage:', error);
      setError(getUserFriendlyError(error));
    } finally {
      damageSubmittingRef.current = false;
      setLoading(false);
    }
  };

  const canBorrow = tool.status === 'AVAILABLE' && currentUser?.role !== 'ADMIN';
  const canReturn = activeBorrow?.borrowerId === currentUser?.id || currentUser?.role === 'ADMIN';

  const DURATION_OPTS = [
    { value: '30', label: '30 minutes' }, { value: '60', label: '1 hour' },
    { value: '120', label: '2 hours' }, { value: '240', label: '4 hours' },
    { value: '480', label: '8 hours (1 day)' }, { value: '1440', label: '24 hours' },
  ];

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <button onClick={() => navigate(-1)} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">← Back</button>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-sm px-4 py-3 text-sm text-emerald-400 font-medium">
          ✓ {success}
        </div>
      )}

      {/* Tool Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs font-mono text-amber-400 mb-1">{tool.code}</p>
            <h1 className="text-2xl font-bold font-display text-zinc-100">{tool.name}</h1>
            <p className="text-sm text-zinc-500 mt-1">{tool.brand} {tool.model}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <StatusBadge status={tool.status} className="text-sm px-3 py-1" />
            <StatusBadge status={tool.condition} />
          </div>
        </div>

        {/* Status detail */}
        {activeBorrow && (
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-sm p-3 mb-4">
            <p className="text-xs font-mono text-blue-400 mb-1">CURRENTLY BORROWED</p>
            <p className="text-sm text-zinc-300">Borrowed by <span className="font-semibold text-zinc-200">{borrower?.name}</span></p>
            <p className="text-xs text-zinc-500 mt-1">Since {fmt(activeBorrow.borrowedAt)} · Due {fmt(activeBorrow.expectedReturn)}</p>
            <p className="text-xs text-zinc-600 mt-0.5">Purpose: {activeBorrow.purpose}</p>
            {new Date(activeBorrow.expectedReturn) < new Date() && (
              <p className="text-xs font-mono font-bold text-red-400 mt-1">⚠ OVERDUE</p>
            )}
          </div>
        )}

        {activeMaint && (
          <div className="bg-orange-500/5 border border-orange-500/20 rounded-sm p-3 mb-4">
            <p className="text-xs font-mono text-orange-400 mb-1">UNDER MAINTENANCE</p>
            {mechanic && <p className="text-sm text-zinc-300">Mechanic: <span className="font-semibold text-zinc-200">{mechanic.name}</span></p>}
            <p className="text-xs text-zinc-500 mt-1">{activeMaint.description}</p>
            <div className="flex gap-2 mt-1">
              <StatusBadge status={activeMaint.priority} />
              <StatusBadge status={activeMaint.status} />
            </div>
          </div>
        )}

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-4">
          {[
            { label: 'Category', value: cat?.name },
            { label: 'Location', value: tool.location },
            { label: 'Serial No.', value: tool.serialNumber },
            { label: 'Purchase Date', value: fmtDate(tool.purchaseDate) },
            { label: 'Purchase Price', value: fmtCurrency(tool.purchasePrice) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-zinc-600 uppercase font-mono tracking-widest">{label}</p>
              <p className="text-zinc-300 mt-0.5">{value ?? '—'}</p>
            </div>
          ))}
        </div>

        {tool.description && (
          <p className="text-xs text-zinc-600 border-t border-zinc-800 pt-3">{tool.description}</p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-zinc-800">
          {canBorrow && tool.status === 'AVAILABLE' && (
            <Btn
              onClick={() => {
                setError(null);
                setSuccess('');
                setShowBorrow(true);
              }}
              size="lg"
              className="flex-1"
            >
              Borrow Tool
            </Btn>
          )}
          {tool.status === 'BORROWED' && canReturn && (
            <Btn
              onClick={() => {
                setError(null);
                setSuccess('');
                setShowReturn(true);
              }}
              variant="secondary"
            >
              Return Tool
            </Btn>
          )}
          {['AVAILABLE', 'BORROWED'].includes(tool.status) && currentUser?.role === 'EMPLOYEE' && (
            <Btn
              onClick={() => {
                setError(null);
                setSuccess('');
                setShowDamage(true);
              }}
              variant="danger"
              size="sm"
            >
              Report Damage
            </Btn>
          )}
          <Btn variant="ghost" onClick={() => setShowQR(true)} size="sm">View QR Code</Btn>
        </div>
      </div>

      {/* Borrowing History */}
      {toolHistory.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm">
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Borrowing History</p>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {toolHistory.map(b => {
              const borrower = users.find(u => u.id === b.borrowerId);
              return (
                <div key={b.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-6 h-6 rounded-sm bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 flex-shrink-0">
                    {borrower?.name.split(' ').map(n => n[0]).join('').slice(0, 2) ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-300">{borrower?.name} · {b.purpose}</p>
                    <p className="text-[10px] font-mono text-zinc-600">{fmt(b.borrowedAt)}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Borrow Modal */}
      <Modal open={showBorrow} onClose={() => setShowBorrow(false)} title="Borrow Tool">
        <div className="space-y-4">
          <div className="bg-zinc-800/50 rounded-sm px-3 py-2">
            <p className="text-xs text-zinc-500">Borrowing</p>
            <p className="text-sm font-semibold text-zinc-200">{tool.name} <span className="font-mono text-amber-400 text-xs">({tool.code})</span></p>
          </div>
          <Textarea label="Purpose *" value={purpose} onChange={e => setPurpose(e.target.value)} rows={2} placeholder="Describe why you need this tool..." />
          <Select label="Duration" value={duration} onChange={e => setDuration(e.target.value)} options={DURATION_OPTS} />
          {duration && (
            <p className="text-xs text-zinc-600">
              Expected return: {new Date(
                Date.now() + Number(duration) * 60000
              ).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}

          <ErrorMessage
            message={error}
            onClose={() => setError(null)}
          />

          <div className="flex gap-2 justify-end mt-2">
            <Btn
              variant="secondary"
              onClick={() => setShowBorrow(false)}
            >
              Cancel
            </Btn>

            <Btn
              onClick={() => void handleBorrow()}
              loading={loading}
              disabled={!purpose.trim() || loading}
            >
              Confirm Borrow
            </Btn>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Btn variant="secondary" onClick={() => setShowBorrow(false)}>Cancel</Btn>
            <Btn
              onClick={() => void handleBorrow()}
              loading={loading}
              disabled={!purpose.trim() || loading}
            >
              Confirm Borrow
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Return Modal */}
      <Modal open={showReturn} onClose={() => setShowReturn(false)} title="Return Tool">
        <div className="space-y-4">
          <div className="bg-zinc-800/50 rounded-sm px-3 py-2">
            <p className="text-xs text-zinc-500">Returning</p>
            <p className="text-sm font-semibold text-zinc-200">{tool.name} <span className="font-mono text-amber-400 text-xs">({tool.code})</span></p>
          </div>
          <Select label="Condition *" value={returnCondition}
            onChange={e => setReturnCondition(e.target.value as ToolCondition)}
            options={[
              { value: 'GOOD', label: 'Good — no damage' },
              { value: 'MINOR_DAMAGE', label: 'Minor Damage — still usable' },
              { value: 'DAMAGED', label: 'Damaged — needs repair' },
            ]} />
          {returnCondition === 'DAMAGED' && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-sm p-3 text-xs text-red-400">
              ⚠ Reporting as damaged will automatically create a maintenance request.
            </div>
          )}
          <Textarea label="Notes" value={returnNotes} onChange={e => setReturnNotes(e.target.value)} rows={2} placeholder="Any notes about the tool condition..." />
            <ErrorMessage
              message={error}
              onClose={() => setError(null)}
            />
          <div className="flex gap-2 justify-end mt-2">
            <Btn variant="secondary" onClick={() => setShowReturn(false)}>Cancel</Btn>
            <Btn
              onClick={() => void handleReturn()}
              loading={loading}
              variant={
                returnCondition === 'DAMAGED'
                  ? 'danger'
                  : 'primary'
              }
              disabled={loading}
            >
              Confirm Return
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Damage Report Modal */}
      <Modal open={showDamage} onClose={() => setShowDamage(false)} title="Report Damage">
        <div className="space-y-4">
          <Input label="Damage Type" value={dmgType} onChange={e => setDmgType(e.target.value)} placeholder="e.g. Mechanical failure, Broken part..." />
          <Textarea label="Description *" value={dmgDesc} onChange={e => setDmgDesc(e.target.value)} rows={3} placeholder="Describe the damage in detail..." />
          <Select label="Priority" value={dmgPriority} onChange={e => setDmgPriority(e.target.value as Priority)}
            options={[{ value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HIGH', label: 'High' }, { value: 'CRITICAL', label: 'Critical' }]} />
            <ErrorMessage
              message={error}
              onClose={() => setError(null)}
            />
          <div className="flex gap-2 justify-end mt-2">
            <Btn variant="secondary" onClick={() => setShowDamage(false)}>Cancel</Btn>
            <Btn
              onClick={() => void handleDamageReport()}
              loading={loading}
              variant="danger"
              disabled={!dmgDesc.trim() || loading}
            >
              Submit Report
            </Btn>
          </div>
        </div>
      </Modal>

      {/* QR Modal */}
      <Modal open={showQR} onClose={() => setShowQR(false)} title="QR Code" size="sm">
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="bg-white p-4 rounded-sm">
            <QRCodeSVG value={`TOOLMAN:${tool.code}`} size={180} />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold font-mono text-zinc-100">{tool.code}</p>
            <p className="text-sm text-zinc-500">{tool.name}</p>
          </div>
          <p className="text-xs text-zinc-600 text-center">Print and attach to the physical tool</p>
        </div>
      </Modal>
    </div>
  );
}
