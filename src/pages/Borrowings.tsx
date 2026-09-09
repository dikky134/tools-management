import { useState, useMemo } from 'react';
import { useApp } from '../store';
import { PageHeader, StatusBadge, SearchInput, Table, Tr, Td, fmt, Tabs } from '../components/ui';

export default function Borrowings() {
  const { borrowings, tools, users, currentUser } = useApp();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('All');

  const tabs = ['All', 'Active', 'Overdue', 'Returned'];
  const isAdmin = currentUser?.role === 'ADMIN';

  const filtered = useMemo(() => {
    return borrowings.filter(b => {
      if (!isAdmin && b.borrowerId !== currentUser?.id) return false;
      const tool = tools.find(t => t.id === b.toolId);
      const borrower = users.find(u => u.id === b.borrowerId);
      const matchQ = !q || [tool?.name, tool?.code, borrower?.name].some(v => v?.toLowerCase().includes(q.toLowerCase()));
      const isOverdue = b.status === 'ACTIVE' && new Date(b.expectedReturn) < new Date();
      const matchTab = tab === 'All' ||
        (tab === 'Active' && b.status === 'ACTIVE' && !isOverdue) ||
        (tab === 'Overdue' && isOverdue) ||
        (tab === 'Returned' && b.status === 'RETURNED');
      return matchQ && matchTab;
    }).sort((a, b) => new Date(b.borrowedAt).getTime() - new Date(a.borrowedAt).getTime());
  }, [borrowings, q, tab, tools, users, currentUser, isAdmin]);

  const counts = useMemo(() => ({
    All: borrowings.filter(b => isAdmin || b.borrowerId === currentUser?.id).length,
    Active: borrowings.filter(b => (isAdmin || b.borrowerId === currentUser?.id) && b.status === 'ACTIVE' && new Date(b.expectedReturn) >= new Date()).length,
    Overdue: borrowings.filter(b => (isAdmin || b.borrowerId === currentUser?.id) && b.status === 'ACTIVE' && new Date(b.expectedReturn) < new Date()).length,
    Returned: borrowings.filter(b => (isAdmin || b.borrowerId === currentUser?.id) && b.status === 'RETURNED').length,
  }), [borrowings, currentUser, isAdmin]);

  return (
    <div className="space-y-5">
      <PageHeader title={isAdmin ? 'All Borrowings' : 'My History'}
        subtitle={`${filtered.length} records`} />

      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-48">
          <SearchInput value={q} onChange={setQ} placeholder="Search tool, borrower..." />
        </div>
      </div>

      <Tabs tabs={tabs.map(t => `${t} (${counts[t as keyof typeof counts]})`)}
        active={tab === 'All' ? `All (${counts.All})` : `${tab} (${counts[tab as keyof typeof counts]})`}
        onChange={v => setTab(v.split(' (')[0])} />

      <div className="bg-zinc-900 border border-zinc-800 rounded-sm">
        <Table headers={['Tool', 'Borrower', 'Purpose', 'Borrowed At', 'Due', 'Returned', 'Status']}>
          {filtered.map(b => {
            const tool = tools.find(t => t.id === b.toolId);
            const borrower = users.find(u => u.id === b.borrowerId);
            const isOverdue = b.status === 'ACTIVE' && new Date(b.expectedReturn) < new Date();
            const displayStatus = isOverdue ? 'OVERDUE' : b.status;
            return (
              <Tr key={b.id}>
                <Td>
                  <p className="font-medium text-zinc-200 text-xs">{tool?.name}</p>
                  <p className="text-[10px] font-mono text-amber-400/80">{tool?.code}</p>
                </Td>
                <Td><span className="text-xs">{borrower?.name}</span></Td>
                <Td><span className="text-xs text-zinc-500 max-w-32 block truncate">{b.purpose}</span></Td>
                <Td><span className="text-xs font-mono text-zinc-500">{fmt(b.borrowedAt)}</span></Td>
                <Td>
                  <span className={`text-xs font-mono ${isOverdue ? 'text-red-400' : 'text-zinc-500'}`}>
                    {fmt(b.expectedReturn)}
                  </span>
                </Td>
                <Td><span className="text-xs font-mono text-zinc-600">{b.returnedAt ? fmt(b.returnedAt) : '—'}</span></Td>
                <Td><StatusBadge status={displayStatus} /></Td>
              </Tr>
            );
          })}
          {filtered.length === 0 && (
            <tr><td colSpan={7} className="py-12 text-center text-sm text-zinc-600">No records found</td></tr>
          )}
        </Table>
      </div>
    </div>
  );
}
