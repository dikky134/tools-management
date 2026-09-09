import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../store';
import { PageHeader, StatusBadge, SearchInput, Table, Tr, Td, Btn, Modal, Input, Select, Textarea, fmtDate, fmtCurrency } from '../components/ui';
import type { Tool, ToolStatus, ToolCondition } from '../types';

const STATUS_OPTS = [
  { value: '', label: 'All Statuses' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'BORROWED', label: 'Borrowed' },
  { value: 'DAMAGED', label: 'Damaged' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const CONDITION_OPTS = [
  { value: 'GOOD', label: 'Good' }, { value: 'MINOR_DAMAGE', label: 'Minor Damage' }, { value: 'DAMAGED', label: 'Damaged' },
];
const STATUS_TOOL_OPTS = [
  { value: 'AVAILABLE', label: 'Available' }, { value: 'BORROWED', label: 'Borrowed' },
  { value: 'DAMAGED', label: 'Damaged' }, { value: 'MAINTENANCE', label: 'Maintenance' }, { value: 'INACTIVE', label: 'Inactive' },
];

interface ToolForm { code: string; name: string; categoryId: string; brand: string; model: string; serialNumber: string; description: string; purchaseDate: string; purchasePrice: string; location: string; condition: ToolCondition; status: ToolStatus; }

const emptyForm: ToolForm = { code: '', name: '', categoryId: '', brand: '', model: '', serialNumber: '', description: '', purchaseDate: '', purchasePrice: '', location: '', condition: 'GOOD', status: 'AVAILABLE' };

export default function Tools() {
  const { tools, categories, currentUser, addTool, updateTool } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [showModal, setShowModal] = useState(searchParams.get('action') === 'add');
  const [editTool, setEditTool] = useState<Tool | null>(null);
  const [form, setForm] = useState<ToolForm>(emptyForm);

  const isAdmin = currentUser?.role === 'ADMIN';

  const filtered = useMemo(() => tools.filter(t => {
    const cat = categories.find(c => c.id === t.categoryId)?.name ?? '';
    const matchQ = !q || [t.name, t.code, t.brand, t.serialNumber, cat].some(v => v.toLowerCase().includes(q.toLowerCase()));
    const matchStatus = !statusFilter || t.status === statusFilter;
    const matchCat = !catFilter || t.categoryId === catFilter;
    return matchQ && matchStatus && matchCat;
  }), [tools, q, statusFilter, catFilter, categories]);

  const openAdd = () => { setEditTool(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (t: Tool) => {
    setEditTool(t);
    setForm({ code: t.code, name: t.name, categoryId: t.categoryId, brand: t.brand, model: t.model, serialNumber: t.serialNumber, description: t.description, purchaseDate: t.purchaseDate, purchasePrice: String(t.purchasePrice), location: t.location, condition: t.condition, status: t.status });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.code) return;

    try {
      const payload = {
        ...form,
        purchasePrice:
          Number(form.purchasePrice) || 0,
      };

      if (editTool) {
        await updateTool(editTool.id, payload);
      } else {
        await addTool(payload);
      }

      setShowModal(false);
    } catch (error) {
      console.error(
        'Failed to save tool:',
        error,
      );
    }
  };

  const catOpts = [{ value: '', label: 'All Categories' }, ...categories.map(c => ({ value: c.id, label: c.name }))];
  const catFormOpts = categories.map(c => ({ value: c.id, label: c.name }));

  const f = (k: keyof ToolForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tool Inventory"
        subtitle={`${filtered.length} tools · ${tools.filter(t => t.status === 'AVAILABLE').length} available`}
        action={isAdmin ? <Btn onClick={openAdd}>+ Add Tool</Btn> : undefined}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-48"><SearchInput value={q} onChange={setQ} placeholder="Search tools..." /></div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-sm px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-amber-500">
          {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-sm px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-amber-500">
          {catOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-sm">
        <Table headers={['Code', 'Tool', 'Category', 'Location', 'Condition', 'Status', '']}>
          {filtered.map(t => {
            const cat = categories.find(c => c.id === t.categoryId);
            return (
              <Tr key={t.id} onClick={() => navigate(`/tools/${t.id}`)}>
                <Td><span className="font-mono text-xs text-amber-400">{t.code}</span></Td>
                <Td>
                  <p className="font-medium text-zinc-200">{t.name}</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">{t.brand} {t.model}</p>
                </Td>
                <Td>
                  <span className="text-xs" style={{ color: cat?.color }}>{cat?.name ?? '—'}</span>
                </Td>
                <Td><span className="text-xs text-zinc-500">{t.location}</span></Td>
                <Td><StatusBadge status={t.condition} /></Td>
                <Td><StatusBadge status={t.status} /></Td>
                <Td>
                  {isAdmin && (
                    <button onClick={e => { e.stopPropagation(); openEdit(t); }}
                      className="text-xs text-zinc-500 hover:text-amber-400 transition-colors">Edit</button>
                  )}
                </Td>
              </Tr>
            );
          })}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={7} className="py-12 text-center text-sm text-zinc-600">No tools found</td>
            </tr>
          )}
        </Table>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editTool ? 'Edit Tool' : 'Add New Tool'} size="xl">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Tool Code *" value={form.code} onChange={f('code')} placeholder="ALT-009" />
          <Input label="Tool Name *" value={form.name} onChange={f('name')} placeholder="Electric Drill" />
          <Select label="Category" value={form.categoryId} onChange={f('categoryId') as any} options={catFormOpts} />
          <Input label="Brand" value={form.brand} onChange={f('brand')} placeholder="Bosch" />
          <Input label="Model" value={form.model} onChange={f('model')} placeholder="GSB 18V" />
          <Input label="Serial Number" value={form.serialNumber} onChange={f('serialNumber')} />
          <Input label="Purchase Date" type="date" value={form.purchaseDate} onChange={f('purchaseDate')} />
          <Input label="Purchase Price (IDR)" type="number" value={form.purchasePrice} onChange={f('purchasePrice')} />
          <Input label="Location" value={form.location} onChange={f('location')} placeholder="Warehouse A - Shelf B3" className="col-span-2" />
          <Select label="Condition" value={form.condition} onChange={f('condition') as any} options={CONDITION_OPTS} />
          <Select label="Status" value={form.status} onChange={f('status') as any} options={STATUS_TOOL_OPTS} />
          <div className="col-span-2">
            <Textarea label="Description" value={form.description} onChange={f('description')} rows={2} placeholder="Brief description of this tool..." />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
          <Btn onClick={handleSave}>{editTool ? 'Save Changes' : 'Add Tool'}</Btn>
        </div>
      </Modal>
    </div>
  );
}
