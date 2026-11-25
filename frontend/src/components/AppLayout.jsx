import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiGrid, FiPlusCircle, FiList, FiUser, FiUsers, FiLogOut, FiMenu } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { Logo } from './ui';

// Sidebar + content area used by every logged-in page
export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/dashboard', icon: <FiGrid />, label: 'Dashboard' },
    { to: '/checks/new', icon: <FiPlusCircle />, label: 'New Check' },
    { to: '/checks', icon: <FiList />, label: user.role === 'admin' ? 'All Checks' : 'My Checks', end: true },
    { to: '/profile', icon: <FiUser />, label: 'Profile' },
  ];
  if (user.role === 'admin') links.push({ to: '/admin/users', icon: <FiUsers />, label: 'Manage Users' });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <Logo />
        <nav onClick={() => setOpen(false)}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.icon} {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="avatar">{user.name[0]}</div>
          <div>
            <b>{user.name}</b>
            <small>{user.role}</small>
          </div>
          <button className="icon-btn" title="Log out" onClick={handleLogout}><FiLogOut /></button>
        </div>
      </aside>
      {open && <div className="backdrop" onClick={() => setOpen(false)} />}

      <main className="content">
        <button className="icon-btn menu-btn" onClick={() => setOpen(true)} aria-label="Open menu"><FiMenu /></button>
        <Outlet />
      </main>
    </div>
  );
}
