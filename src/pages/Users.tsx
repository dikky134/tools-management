import { useState, useMemo } from 'react';
import { useApp } from '../store';
import { PageHeader, StatusBadge, SearchInput, Table, Tr, Td, Btn, Modal, Input, Select, ConfirmDialog } from '../components/ui';
import type { Role, User } from '../types';

const ROLE_OPTS = [{ value: 'EMPLOYEE', label: 'Employee' }, { value: 'MECHANIC', label: 'Mechanic' }, { value: 'ADMIN', label: 'Admin' }];
const DEPT_OPTS = [
  { value: 'Production Line A', label: 'Production Line A' },
  { value: 'Production Line B', label: 'Production Line B' },
  { value: 'Assembly', label: 'Assembly' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Warehouse Management', label: 'Warehouse Management' },
  { value: 'Quality Control', label: 'Quality Control' },
];

interface UserForm { name: string; employeeId: string; email: string; phone: string; department: string; role: Role; }
const emptyForm: UserForm = { name: '', employeeId: '', email: '', phone: '', department: 'Production Line A', role: 'EMPLOYEE' };

export default function Users() {
  const { users, borrowings, addUser, updateUser, updateUserStatus } = useApp();
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [confirmDeactivate, setConfirmDeactivate] = useState<User | null>(null);

  const filtered = useMemo(() => users.filter(u => {
    const matchQ = !q || [u.name, u.employeeId, u.email, u.department].some(v => v.toLowerCase().includes(q.toLowerCase()));
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchQ && matchRole;
  }), [users, q, roleFilter]);

  const openAdd = () => { setEditUser(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (u: User) => {
    setEditUser(u);
    setForm({ name: u.name, employeeId: u.employeeId, email: u.email, phone: u.phone, department: u.department, role: u.role });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.employeeId) {
      return;
    }

    try {
      if (editUser) {
        await updateUser(
          editUser.id,
          form,
        );
      } else {
        await addUser({
          ...form,
          status: 'ACTIVE',
        });
      }

      setShowModal(false);
    } catch (error) {
      console.error(
        'Failed to save user:',
        error,
      );
    }
  };

  const f = (k: keyof UserForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const roleColors: Record<string, string> = { ADMIN: '#f59e0b', EMPLOYEE: '#60a5fa', MECHANIC: '#4ade80' };

  return (
    <div className="space-y-5">
      <PageHeader title="User Management" subtitle={`${users.length} users`}
        action={<Btn onClick={openAdd}>+ Add User</Btn>} />

      <div className="flex gap-2">
        <div className="flex-1"><SearchInput value={q} onChange={setQ} placeholder="Search users..." /></div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-sm px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-amber-500">
          <option value="">All Roles</option>
          {ROLE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-sm">
        <Table headers={['Employee', 'ID', 'Department', 'Role', 'Status', 'Borrows', '']}>
          {filtered.map(u => {
            const borrows = borrowings.filter(b => b.borrowerId === u.id && b.status === 'ACTIVE').length;
            return (
              <Tr key={u.id}>
                <Td>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-sm flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: `${roleColors[u.role]}15`, color: roleColors[u.role] }}>
                      {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{u.name}</p>
                      <p className="text-[10px] text-zinc-600">{u.email}</p>
                    </div>
                  </div>
                </Td>
                <Td><span className="font-mono text-xs text-zinc-500">{u.employeeId}</span></Td>
                <Td><span className="text-xs text-zinc-500">{u.department}</span></Td>
                <Td>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded" style={{ background: `${roleColors[u.role]}15`, color: roleColors[u.role] }}>
                    {u.role}
                  </span>
                </Td>
                <Td><StatusBadge status={u.status} /></Td>
                <Td><span className="text-xs font-mono text-zinc-500">{borrows}</span></Td>
                <Td>
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(u)} className="text-xs text-zinc-500 hover:text-amber-400 transition-colors">Edit</button>
                    {u.status === 'ACTIVE' && (
                      <button onClick={() => setConfirmDeactivate(u)} className="text-xs text-zinc-500 hover:text-red-400 transition-colors">Deactivate</button>
                    )}
                    {u.status === 'INACTIVE' && (
                      <button
                        onClick={async () => {
                          try {
                            await updateUserStatus(
                              u.id,
                              'ACTIVE',
                            );
                          } catch (error) {
                            console.error(
                              'Failed to activate user:',
                              error,
                            );
                          }
                        }}
                        className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors"
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </Td>
              </Tr>
            );
          })}
        </Table>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editUser ? 'Edit User' : 'Add User'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Full Name *" value={form.name} onChange={f('name')} placeholder="Budi Santoso" className="col-span-2" />
          <Input label="Employee ID *" value={form.employeeId} onChange={f('employeeId')} placeholder="EMP-007" />
          <Input label="Email" type="email" value={form.email} onChange={f('email')} placeholder="budi@factory.com" />
          <Input label="Phone" value={form.phone} onChange={f('phone')} placeholder="+62-812-..." />
          <Select label="Role" value={form.role} onChange={f('role') as any} options={ROLE_OPTS} />
          <Select label="Department" value={form.department} onChange={f('department') as any} options={DEPT_OPTS} />
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
          <Btn onClick={handleSave}>{editUser ? 'Save Changes' : 'Add User'}</Btn>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDeactivate !== null}
        onClose={() => setConfirmDeactivate(null)}
        onConfirm={async () => {
          if (!confirmDeactivate) {
            return;
          }

          try {
            await updateUserStatus(
              confirmDeactivate.id,
              'INACTIVE',
            );

            setConfirmDeactivate(null);
          } catch (error) {
            console.error(
              'Failed to deactivate user:',
              error,
            );
          }
        }}
        title="Deactivate User"
        message={`Are you sure you want to deactivate ${confirmDeactivate?.name}? They will no longer be able to access the system.`}
        confirmLabel="Deactivate"
        danger
      />
    </div>
  );
}
