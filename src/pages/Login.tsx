import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#f59e0b', EMPLOYEE: '#60a5fa', MECHANIC: '#4ade80',
};

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Invalid email or password.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 bg-zinc-900 border-r border-zinc-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #f59e0b 0, #f59e0b 1px, transparent 0, transparent 50%), repeating-linear-gradient(90deg, #f59e0b 0, #f59e0b 1px, transparent 0, transparent 50%)',
          backgroundSize: '60px 60px',
        }} />
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 bg-amber-500 rounded-sm flex items-center justify-center">
              <svg className="w-5 h-5 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold font-mono text-zinc-100">TOOLMAN</p>
              <p className="text-[10px] font-mono text-zinc-600">WAREHOUSE MANAGEMENT SYSTEM</p>
            </div>
          </div>
          <h1 className="text-4xl font-bold font-display text-zinc-100 leading-tight mb-4">
            Manage your<br />warehouse tools<br /><span className="text-amber-400">with precision.</span>
          </h1>
          <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
            Track borrowing, maintenance, and availability of all warehouse equipment in real time.
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-3">
          {[
            { label: 'Total Tools', value: '8', color: '#f59e0b' },
            { label: 'Available Now', value: '4', color: '#4ade80' },
            { label: 'Active Mechanics', value: '2', color: '#60a5fa' },
          ].map(s => (
            <div key={s.label} className="bg-zinc-950/60 border border-zinc-800 rounded-sm p-3">
              <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-2xl font-bold font-display" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <p className="text-sm font-bold font-mono text-amber-400">TOOLMAN</p>
            <p className="text-[10px] font-mono text-zinc-600">WAREHOUSE MANAGEMENT SYSTEM</p>
          </div>
          <h2 className="text-xl font-bold font-display text-zinc-100 mb-1">Sign in to your account</h2>
          <p className="text-sm text-zinc-500 mb-8">Use your Employee ID or select a demo account below.</p>

          <form onSubmit={e => { e.preventDefault();void handleLogin(); }} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="employee@company.com" required
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-amber-500 rounded-sm px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1.5 block">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-amber-500 rounded-sm px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors" />
            </div>
            {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold text-sm py-2.5 rounded-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <span className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />}
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
