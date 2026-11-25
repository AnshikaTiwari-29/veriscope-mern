import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './ui';

// Guests -> /login. Wrong role -> /dashboard.
export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-page"><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
