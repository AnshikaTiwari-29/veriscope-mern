import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import Landing from './pages/Landing';
import { Login, Register } from './pages/Auth';
import Dashboard from './pages/Dashboard';
import NewCheck from './pages/NewCheck';
import Checks from './pages/Checks';
import CheckDetail from './pages/CheckDetail';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* logged-in users */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/checks" element={<Checks />} />
          <Route path="/checks/new" element={<NewCheck />} />
          <Route path="/checks/:id" element={<CheckDetail />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* admin only */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route element={<AppLayout />}>
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
