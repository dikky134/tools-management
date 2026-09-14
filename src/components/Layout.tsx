import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../store';

type NavItem = { to: string; label: string; icon: React.ReactNode };

const iconCls = 'w-4 h-4 flex-shrink-0';

function Icon({ d, ...rest }: { d: string } & React.SVGProps<SVGSVGElement>) {
  return <svg className={iconCls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} {...rest}><path strokeLinecap="round" strokeLinejoin="round" d={d} /></svg>;
}

const ICONS = {
  dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  tools: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z',
  categories: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
  borrowings: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  maintenance: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  mechanics: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  reports: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  logs: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  notifications: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  scan: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3a2 2 0 00-2 2v10a2 2 0 002 2h3.5M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3',
  mytools: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  history: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  profile: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  tasks: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'M6 18L18 6M6 6l12 12',
};

function NavIcon({ name }: { name: keyof typeof ICONS }) {
  return <Icon d={ICONS[name]} />;
}

const ADMIN_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <NavIcon name="dashboard" /> },
  { to: '/tools', label: 'Tools', icon: <NavIcon name="tools" /> },
  { to: '/categories', label: 'Categories', icon: <NavIcon name="categories" /> },
  { to: '/borrowings', label: 'Borrowings', icon: <NavIcon name="borrowings" /> },
  { to: '/maintenance', label: 'Maintenance', icon: <NavIcon name="maintenance" /> },
  { to: '/mechanics', label: 'Mechanics', icon: <NavIcon name="mechanics" /> },
  { to: '/users', label: 'Users', icon: <NavIcon name="users" /> },
  { to: '/reports', label: 'Reports', icon: <NavIcon name="reports" /> },
  { to: '/activity-logs', label: 'Activity Logs', icon: <NavIcon name="logs" /> },
];

const EMPLOYEE_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <NavIcon name="dashboard" /> },
  { to: '/scan', label: 'Scan QR', icon: <NavIcon name="scan" /> },
  { to: '/my-tools', label: 'My Borrowed Tools', icon: <NavIcon name="mytools" /> },
  { to: '/my-history', label: 'History', icon: <NavIcon name="history" /> },
];

const MECHANIC_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <NavIcon name="dashboard" /> },
  { to: '/my-tasks', label: 'My Tasks', icon: <NavIcon name="tasks" /> },
  { to: '/maintenance', label: 'All Maintenance', icon: <NavIcon name="maintenance" /> },
];

const COMMON_NAV: NavItem[] = [
  { to: '/notifications', label: 'Notifications', icon: <NavIcon name="notifications" /> },
  { to: '/profile', label: 'Profile', icon: <NavIcon name="profile" /> },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser, notifications, logout } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!currentUser) return null;

  const primaryNav = currentUser.role === 'ADMIN' ? ADMIN_NAV : currentUser.role === 'EMPLOYEE' ? EMPLOYEE_NAV : MECHANIC_NAV;
  const unread = notifications.filter(n => n.userId === currentUser.id && !n.read).length;

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm transition-all ${isActive
      ? 'bg-amber-500/10 text-amber-400 border-l-2 border-amber-500 pl-2.5'
      : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 border-l-2 border-transparent'}`;

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-amber-500 rounded-sm flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold font-mono text-zinc-100 leading-none">TOOLMAN</p>
            <p className="text-[10px] text-zinc-600 font-mono leading-none mt-0.5">WAREHOUSE SYSTEM</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-200 flex-shrink-0">
            {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-zinc-200 truncate">{currentUser.name}</p>
            <p className="text-[10px] text-zinc-500 font-mono">{currentUser.role} · {currentUser.employeeId}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {primaryNav.map(item => (
          <NavLink key={item.to} to={item.to} className={navLinkCls} onClick={() => setOpen(false)}>
            {item.icon}
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
        <div className="border-t border-zinc-800 my-2" />
        {COMMON_NAV.map(item => (
          <NavLink key={item.to} to={item.to} className={navLinkCls} onClick={() => setOpen(false)}>
            {item.icon}
            <span className="truncate">{item.label}</span>
            {item.to === '/notifications' && unread > 0 && (
              <span className="ml-auto bg-amber-500 text-zinc-900 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-full">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-4 border-t border-zinc-800 pt-2">
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-zinc-500 hover:text-red-400 hover:bg-zinc-800/60 rounded-sm transition-all">
          <NavIcon name="logout" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-full bg-zinc-950">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-56 flex-col flex-shrink-0 border-r border-zinc-800 bg-zinc-950">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-zinc-950 border-r border-zinc-800 flex flex-col">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Topbar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-950">
          <button onClick={() => setOpen(true)} className="text-zinc-400 hover:text-zinc-200">
            <Icon d={ICONS.menu} />
          </button>
          <span className="text-sm font-bold font-mono text-zinc-100">TOOLMAN</span>
          <div className="ml-auto relative">
            <NavLink to="/notifications">
              <Icon d={ICONS.notifications} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-3.5 h-3.5 px-0.5 bg-amber-500 rounded-full text-[9px] font-bold text-zinc-900 flex items-center justify-center">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </NavLink>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
