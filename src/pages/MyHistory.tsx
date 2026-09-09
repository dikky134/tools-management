import { useApp } from '../store';
import { PageHeader, StatusBadge, Table, Tr, Td, fmt } from '../components/ui';

export default function MyHistory() {
  const { currentUser, borrowings, tools } = useApp();
  if (!currentUser) return null;

  const history = borrowings
    .filter(b => b.borrowerId === currentUser.id)
    .sort((a, b) => new Date(b.borrowedAt).getTime() - new Date(a.borrowedAt).getTime());

  const getDuration = (start: string, end?: string) => {
    if (!end) return '—';
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Borrowing History" subtitle={`${history.length} total records`} />
      <div className="bg-zinc-900 border border-zinc-800 rounded-sm">
        <Table headers={['Tool', 'Purpose', 'Borrowed At', 'Expected', 'Returned', 'Duration', 'Status']}>
          {history.map(b => {
            const tool = tools.find(t => t.id === b.toolId);
            const isOverdue = b.status === 'ACTIVE' && new Date(b.expectedReturn) < new Date();
            return (
              <Tr key={b.id}>
                <Td>
                  <p className="font-medium text-zinc-200 text-xs">{tool?.name}</p>
                  <p className="text-[10px] font-mono text-amber-400/70">{tool?.code}</p>
                </Td>
                <Td><span className="text-xs text-zinc-500 max-w-32 block truncate">{b.purpose}</span></Td>
                <Td><span className="text-xs font-mono text-zinc-500">{fmt(b.borrowedAt)}</span></Td>
                <Td><span className={`text-xs font-mono ${isOverdue ? 'text-red-400' : 'text-zinc-500'}`}>{fmt(b.expectedReturn)}</span></Td>
                <Td><span className="text-xs font-mono text-zinc-600">{b.returnedAt ? fmt(b.returnedAt) : '—'}</span></Td>
                <Td><span className="text-xs font-mono text-zinc-500">{getDuration(b.borrowedAt, b.returnedAt ?? (b.status === 'RETURNED' ? b.expectedReturn : undefined))}</span></Td>
                <Td><StatusBadge status={isOverdue ? 'OVERDUE' : b.status} /></Td>
              </Tr>
            );
          })}
          {history.length === 0 && (
            <tr><td colSpan={7} className="py-12 text-center text-sm text-zinc-600">No borrowing history</td></tr>
          )}
        </Table>
      </div>
    </div>
  );
}
