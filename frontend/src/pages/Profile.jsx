import { useState } from 'react';
import toast from 'react-hot-toast';
import api, { errorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/verdicts';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/auth/profile', { name });
      setUser(res.data.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/change-password', pw);
      setPw({ currentPassword: '', newPassword: '' });
      toast.success('Password changed');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <>
      <div className="page-head"><div><h1>Profile</h1><p className="muted">Manage your account</p></div></div>

      <div className="grid-2">
        <form className="card form" onSubmit={saveProfile}>
          <div className="profile-top">
            <div className="avatar avatar-lg">{user.name[0]}</div>
            <div>
              <b>{user.email}</b>
              <p className="muted small">Role: {user.role} · Joined {formatDate(user.createdAt)}</p>
            </div>
          </div>
          <label>Name<input value={name} onChange={(e) => setName(e.target.value)} /></label>
          <button className="btn btn-primary">Save profile</button>
        </form>

        <form className="card form" onSubmit={changePassword}>
          <h3>Change password</h3>
          <label>Current password<input type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></label>
          <label>New password<input type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} placeholder="At least 8 characters" /></label>
          <button className="btn btn-primary">Update password</button>
        </form>
      </div>
    </>
  );
}
