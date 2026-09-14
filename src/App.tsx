import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider, useApp } from './store';
import Layout from './components/Layout';

import Login from './pages/Login';
import AdminDash from './pages/AdminDash';
import EmployeeDash from './pages/EmployeeDash';
import MechanicDash from './pages/MechanicDash';
import Tools from './pages/Tools';
import ToolDetail from './pages/ToolDetail';
import Borrowings from './pages/Borrowings';
import Maintenance from './pages/Maintenance';
import MyTools from './pages/MyTools';
import MyHistory from './pages/MyHistory';
import Notifications from './pages/Notifications';
import Users from './pages/Users';
import Categories from './pages/Categories';
import Reports from './pages/Reports';
import ActivityLogs from './pages/ActivityLogs';
import Profile from './pages/Profile';
import Scan from './pages/Scan';

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />

        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
          Loading session...
        </p>
      </div>
    </div>
  );
}

function Dashboard() {
  const { currentUser } = useApp();
  if (currentUser?.role === 'ADMIN') return <AdminDash />;
  if (currentUser?.role === 'MECHANIC') return <MechanicDash />;
  return <EmployeeDash />;
}

function ProtectedLayout() {
  const { currentUser, authLoading } = useApp();

  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function AdminOnly() {
  const { currentUser } = useApp();
  if (currentUser?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function AppRoutes() {
  const { currentUser, authLoading } = useApp();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          authLoading ? (
            <AuthLoadingScreen />
          ) : currentUser ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login />
          )
        }
      />

      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/tools/:id" element={<ToolDetail />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/my-tools" element={<MyTools />} />
        <Route path="/my-history" element={<MyHistory />} />
        <Route path="/borrowings" element={<Borrowings />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/my-tasks" element={<Maintenance />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />

        <Route element={<AdminOnly />}>
          <Route path="/users" element={<Users />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/activity-logs" element={<ActivityLogs />} />
          <Route path="/mechanics" element={<Users />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
}
