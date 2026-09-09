import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import {
  StatusBadge,
  Btn,
  EmptyState,
  fmt,
  Modal,
  Select,
  Textarea,
} from '../components/ui';

export default function MyTools() {
  const { 
    currentUser, 
    borrowings, 
    tools,
    returnTool,
  } = useApp();

  const navigate = useNavigate();

  const [returnId, setReturnId] = useState<string | null>(null);
  const [returnCondition, setReturnCondition] = useState<
    'GOOD' | 'MINOR_DAMAGE' | 'DAMAGED'
  >('GOOD');
  const [returnNotes, setReturnNotes] = useState('');
  const [returnLoading, setReturnLoading] = useState(false);

  if (!currentUser) return null;

  const active = borrowings.filter(b => b.borrowerId === currentUser.id && b.status === 'ACTIVE')
    .sort((a, b) => new Date(b.borrowedAt).getTime() - new Date(a.borrowedAt).getTime());

  const selectedBorrowing = returnId
    ? borrowings.find(b => b.id === returnId)
    : null;

  const selectedReturnTool = selectedBorrowing
    ? tools.find(t => t.id === selectedBorrowing.toolId)
    : null;

  const handleReturn = async () => {
    if (!returnId) return;

    if (
      returnCondition !== 'GOOD' &&
      !returnNotes.trim()
    ) {
      console.error('Please describe the damage.');
      return;
    }

    try {
      setReturnLoading(true);

      await returnTool(
        returnId,
        returnCondition,
        returnNotes.trim() || undefined,
      );

      setReturnId(null);
      setReturnCondition('GOOD');
      setReturnNotes('');
    } catch (error) {
      console.error('Failed to return tool:', error);
    } finally {
      setReturnLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold font-display text-zinc-100">My Borrowed Tools</h1>
        <p className="text-xs text-zinc-500 mt-0.5">{active.length} currently borrowed</p>
      </div>

      {active.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No borrowed tools"
          message="You currently have no active borrowing transactions."
          action={{ label: 'Scan QR to Borrow', onClick: () => navigate('/scan') }}
        />
      ) : (
        <div className="space-y-3">
          {active.map(b => {
            const tool = tools.find(t => t.id === b.toolId);
            const isOverdue = new Date(b.expectedReturn) < new Date();
            return (
              <div key={b.id} className={`bg-zinc-900 border rounded-sm p-4 ${isOverdue ? 'border-red-500/30' : 'border-zinc-800'}`}>
                {isOverdue && (
                  <div className="flex items-center gap-2 mb-3 bg-red-500/10 border border-red-500/20 rounded-sm px-3 py-2">
                    <span className="text-xs font-mono font-bold text-red-400">⚠ OVERDUE</span>
                    <span className="text-xs text-red-400/70">Please return this tool immediately</span>
                  </div>
                )}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs font-mono text-amber-400/80 mb-0.5">{tool?.code}</p>
                    <p className="text-lg font-bold font-display text-zinc-100">{tool?.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{tool?.brand} {tool?.model}</p>
                  </div>
                  <StatusBadge status={tool?.status ?? 'BORROWED'} />
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-4">
                  <div><p className="text-zinc-600">Borrowed At</p><p className="text-zinc-400 font-mono">{fmt(b.borrowedAt)}</p></div>
                  <div><p className="text-zinc-600">Expected Return</p><p className={`font-mono ${isOverdue ? 'text-red-400' : 'text-zinc-400'}`}>{fmt(b.expectedReturn)}</p></div>
                  <div className="col-span-2"><p className="text-zinc-600">Purpose</p><p className="text-zinc-400">{b.purpose}</p></div>
                </div>
                <div className="flex gap-2">
                  <Btn onClick={() => setReturnId(b.id)} variant="primary" size="sm">Return Tool</Btn>
                  <Btn onClick={() => navigate(`/tools/${tool?.id}`)} variant="ghost" size="sm">View Details</Btn>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Modal
        open={!!returnId}
        onClose={() => {
          if (!returnLoading) {
            setReturnId(null);
          }
        }}
        title="Return Tool"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-zinc-200">
              {selectedReturnTool?.name}
            </p>

            <p className="text-xs text-amber-400/80 font-mono mt-0.5">
              {selectedReturnTool?.code}
            </p>
          </div>

          <Select
            label="Tool Condition"
            value={returnCondition}
            onChange={e =>
              setReturnCondition(
                e.target.value as
                  | 'GOOD'
                  | 'MINOR_DAMAGE'
                  | 'DAMAGED',
              )
            }
            options={[
              {
                value: 'GOOD',
                label: 'Good — No damage',
              },
              {
                value: 'MINOR_DAMAGE',
                label: 'Minor Damage',
              },
              {
                value: 'DAMAGED',
                label: 'Damaged',
              },
            ]}
          />

          {returnCondition === 'DAMAGED' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-sm p-3 text-xs text-red-400">
              Tool will be marked as damaged and may require maintenance.
            </div>
          )}

          {returnCondition === 'MINOR_DAMAGE' && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-sm p-3 text-xs text-orange-400">
              Please describe the damage in the notes below.
            </div>
          )}

          <Textarea
            label="Return Notes"
            value={returnNotes}
            onChange={e => setReturnNotes(e.target.value)}
            rows={3}
            placeholder="Describe the tool condition or any damage..."
          />

          <div className="flex gap-2 justify-end">
            <Btn
              variant="secondary"
              onClick={() => setReturnId(null)}
              disabled={returnLoading}
            >
              Cancel
            </Btn>

            <Btn
              onClick={() => void handleReturn()}
              loading={returnLoading}
              disabled={
                returnLoading ||
                (returnCondition !== 'GOOD' && !returnNotes.trim())
              }
            >
              Confirm Return
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
