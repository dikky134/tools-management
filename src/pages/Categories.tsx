import { useState } from 'react';
import { useApp } from '../store';
import {
  PageHeader,
  Btn,
  Modal,
  Input,
  Textarea,
  ConfirmDialog,
} from '../components/ui';
import type { ToolCategory } from '../types';
import { getUserFriendlyError } from '../utils/error';
import ErrorMessage from '../components/ErrorMessage';

const PRESET_COLORS = ['#f59e0b', '#60a5fa', '#4ade80', '#fb923c', '#a78bfa', '#f87171', '#94a3b8', '#71717a'];

export default function Categories() {
  const { categories, tools, addCategory, updateCategory, deleteCategory } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState<ToolCategory | null>(null);
  const [form, setForm] = useState({ name: '', description: '', color: '#f59e0b' });
  const [confirmDelete, setConfirmDelete] = useState<ToolCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openAdd = () => {
    setEdit(null);
    setForm({
      name: '',
      description: '',
      color: '#f59e0b',
    });
    setError(null);
    setShowModal(true);
  };

  const openEdit = (c: ToolCategory) => {
    setEdit(c);
    setForm({
      name: c.name,
      description: c.description,
      color: c.color,
    });
    setError(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Category name is required.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
      };

      if (edit) {
        await updateCategory(edit.id, payload);
      } else {
        await addCategory(payload);
      }

      setShowModal(false);
      setEdit(null);
      setForm({
        name: '',
        description: '',
        color: '#f59e0b',
      });
    } catch (error) {
      console.error('Failed to save category:', error);
      setError(getUserFriendlyError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Tool Categories" subtitle={`${categories.length} categories`}
        action={<Btn onClick={openAdd}>+ Add Category</Btn>} />
      <ErrorMessage
        message={error}
        onClose={() => setError(null)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map(c => {
          const count = tools.filter(t => t.categoryId === c.id).length;
          const hasTools = count > 0;
          return (
            <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-sm p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <h3 className="text-sm font-semibold font-display text-zinc-200">{c.name}</h3>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full" style={{ background: `${c.color}18`, color: c.color }}>
                  {count}
                </span>
              </div>
              <p className="text-xs text-zinc-600 mb-4">{c.description}</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="text-xs text-zinc-500 hover:text-amber-400 transition-colors">Edit</button>
                <button onClick={() => !hasTools && setConfirmDelete(c)}
                  className={`text-xs transition-colors ${hasTools ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-500 hover:text-red-400'}`}
                  title={hasTools ? 'Cannot delete: category has tools' : undefined}>
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={edit ? 'Edit Category' : 'Add Category'}>
        <div className="space-y-4">
          <Input label="Category Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Power Tools" />
          <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-2 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-sm transition-transform ${form.color === c ? 'scale-110 ring-2 ring-white/30' : 'hover:scale-105'}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>
          <ErrorMessage
            message={error}
            onClose={() => setError(null)}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Btn
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                setError(null);
              }}
            >
              Cancel
            </Btn>

            <Btn
              onClick={() => void handleSave()}
              loading={loading}
              disabled={loading || !form.name.trim()}
            >
              {edit ? 'Save' : 'Add Category'}
            </Btn>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Category"
        message={
          confirmDelete
            ? `Are you sure you want to delete "${confirmDelete.name}"?`
            : ''
        }
        onClose={() => {
          if (deleteLoading) return;
          setConfirmDelete(null);
        }}
        onConfirm={() => {
          void (async () => {
            if (!confirmDelete) return;

            setError(null);
            setDeleteLoading(true);

            try {
              await deleteCategory(confirmDelete.id);
              setConfirmDelete(null);
            } catch (error) {
              console.error('Failed to delete category:', error);
              setError(getUserFriendlyError(error));
            } finally {
              setDeleteLoading(false);
            }
          })();
        }}
        danger
      />
    </div>
  );
}
