import React, { useState } from 'react';
import type { ToolStatus, BorrowingStatus, MaintenanceStatus, MechanicAvailability, Priority, ToolCondition } from '../types';

// ── Status Badge ─────────────────────────────────────────────────────────────

type BadgeVariant = ToolStatus | BorrowingStatus | MaintenanceStatus | MechanicAvailability | Priority | ToolCondition | 'ACTIVE' | 'INACTIVE' | 'REPAIRED' | 'PARTIALLY_REPAIRED' | 'UNREPAIRABLE' | string;

const BADGE_MAP: Record<string, string> = {
  AVAILABLE: 'status-available', BORROWED: 'status-borrowed',
  DAMAGED: 'status-damaged', MAINTENANCE: 'status-maintenance',
  INACTIVE: 'status-inactive', OVERDUE: 'status-overdue',
  RETURNED: 'status-returned', ACTIVE: 'status-active',
  PENDING: 'status-pending', ASSIGNED: 'status-assigned',
  IN_PROGRESS: 'status-in-progress', WAITING_FOR_PARTS: 'status-waiting',
  COMPLETED: 'status-completed', CANCELLED: 'status-cancelled',
  BUSY: 'status-busy', OFF_DUTY: 'status-off-duty',
  CRITICAL: 'status-critical', HIGH: 'status-high',
  MEDIUM: 'status-medium', LOW: 'status-low',
  GOOD: 'status-good', MINOR_DAMAGE: 'status-minor-damage',
  REPAIRED: 'status-completed', PARTIALLY_REPAIRED: 'status-warning',
  UNREPAIRABLE: 'status-damaged',
};

const BADGE_LABELS: Record<string, string> = {
  AVAILABLE: 'Available', BORROWED: 'Borrowed', DAMAGED: 'Damaged',
  MAINTENANCE: 'Maintenance', INACTIVE: 'Inactive', OVERDUE: 'Overdue',
  RETURNED: 'Returned', ACTIVE: 'Active', PENDING: 'Pending',
  ASSIGNED: 'Assigned', IN_PROGRESS: 'In Progress', WAITING_FOR_PARTS: 'Waiting Parts',
  COMPLETED: 'Completed', CANCELLED: 'Cancelled', BUSY: 'Busy',
  OFF_DUTY: 'Off Duty', CRITICAL: 'Critical', HIGH: 'High',
  MEDIUM: 'Medium', LOW: 'Low', GOOD: 'Good', MINOR_DAMAGE: 'Minor Damage',
  REPAIRED: 'Repaired', PARTIALLY_REPAIRED: 'Partially Repaired', UNREPAIRABLE: 'Unrepairable',
};

export function StatusBadge({ status, className = '' }: { status: BadgeVariant; className?: string }) {
  const cls = BADGE_MAP[status] ?? 'status-inactive';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-mono font-medium tracking-wide uppercase ${cls} ${className}`}>
      {BADGE_LABELS[status] ?? status}
    </span>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────

export function StatCard({
  label, value, sub, color = '#f59e0b', icon,
}: { label: string; value: string | number; sub?: string; color?: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-4 flex items-start gap-3">
      {icon && (
        <div className="mt-0.5 w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
          <span style={{ color }}>{icon}</span>
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-1">{label}</p>
        <p className="text-2xl font-bold font-display text-zinc-100">{value}</p>
        {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────

export function Modal({ open, onClose, title, children, size = 'md' }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-zinc-900 border border-zinc-700 rounded-sm shadow-2xl`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold font-display text-zinc-100 uppercase tracking-wider">{title}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors text-xl leading-none">&times;</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ── Confirm Dialog ───────────────────────────────────────────────────────────

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string;
  confirmLabel?: string; danger?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-zinc-400 mb-5">{message}</p>
      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-sm transition-colors">Cancel</button>
        <button onClick={() => { onConfirm(); onClose(); }}
          className={`px-4 py-2 text-sm rounded-sm transition-colors font-medium ${danger ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-zinc-900'}`}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// ── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({ icon, title, message, action }: {
  icon?: React.ReactNode; title: string; message: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-zinc-700 mb-4 text-4xl">{icon}</div>}
      <h3 className="text-base font-semibold font-display text-zinc-400 mb-1">{title}</h3>
      <p className="text-sm text-zinc-600 max-w-xs">{message}</p>
      {action && (
        <button onClick={action.onClick} className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 text-sm font-medium rounded-sm transition-colors">
          {action.label}
        </button>
      )}
    </div>
  );
}

// ── Input / Select / Textarea ─────────────────────────────────────────────────

const inputCls = 'w-full bg-zinc-800 border border-zinc-700 rounded-sm px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const { label, className, ...rest } = props;
  return (
    <label className="block">
      {label && <span className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-1.5 block">{label}</span>}
      <input className={`${inputCls} ${className ?? ''}`} {...rest} />
    </label>
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; options: { value: string; label: string }[] }) {
  const { label, options, className, ...rest } = props;
  return (
    <label className="block">
      {label && <span className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-1.5 block">{label}</span>}
      <select className={`${inputCls} ${className ?? ''}`} {...rest}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  const { label, className, ...rest } = props;
  return (
    <label className="block">
      {label && <span className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-1.5 block">{label}</span>}
      <textarea className={`${inputCls} resize-none ${className ?? ''}`} {...rest} />
    </label>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────

export function Btn({ variant = 'primary', size = 'md', loading, children, className, ...props }: {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg'; loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    primary: 'bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold',
    secondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200',
    danger: 'bg-red-600 hover:bg-red-500 text-white font-semibold',
    ghost: 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button className={`inline-flex items-center justify-center gap-2 rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className ?? ''}`}
      disabled={loading || props.disabled} {...props}>
      {loading && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────

export function Table({ headers, children, empty }: { headers: string[]; children: React.ReactNode; empty?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800">
            {headers.map(h => (
              <th key={h} className="text-left text-xs text-zinc-500 uppercase tracking-widest font-mono py-3 px-4 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Tr({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <tr onClick={onClick} className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${onClick ? 'cursor-pointer' : ''}`}>
      {children}
    </tr>
  );
}

export function Td({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <td className={`py-3 px-4 text-zinc-300 ${className}`}>{children}</td>;
}

// ── Page Shell ────────────────────────────────────────────────────────────────

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold font-display text-zinc-100 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// ── Search ────────────────────────────────────────────────────────────────────

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? 'Search...'}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-sm pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors" />
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

export function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex gap-1 border-b border-zinc-800 mb-5">
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${active === t ? 'border-amber-500 text-amber-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
          {t}
        </button>
      ))}
    </div>
  );
}

// ── Badge / Pill ──────────────────────────────────────────────────────────────

export function Pill({ children, color = '#f59e0b' }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: `${color}20`, color }}>
      {children}
    </span>
  );
}

// ── Loading ───────────────────────────────────────────────────────────────────

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-zinc-700 border-t-amber-500 rounded-full animate-spin" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr className="border-b border-zinc-800/50">
      {[1,2,3,4,5].map(i => (
        <td key={i} className="py-3 px-4">
          <div className="h-4 bg-zinc-800 rounded animate-pulse" style={{ width: `${60 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ── Tooltip ────────────────────────────────────────────────────────────────────

export function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 rounded whitespace-nowrap z-50 pointer-events-none">
          {text}
        </span>
      )}
    </span>
  );
}

// ── Format helpers ─────────────────────────────────────────────────────────────

export function fmt(date?: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function fmtDate(date?: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtTime(date?: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function fmtCurrency(v?: number) {
  if (v == null) return '—';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);
}
