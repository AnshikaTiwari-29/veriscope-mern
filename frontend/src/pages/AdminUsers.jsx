import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Pagination, Spinner } from '../components/ui';
import { formatDate } from '../utils/verdicts';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [result, setResult] = useState(null);

  const load = () =>
    api.get('/users', { params: { page, search } }).then((res) => setResult(res.data)).catch((err) => toast.error(errorMessage(err)));

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [page, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = async (u, changes) => {
    try {
      await api.patch(`/users/${u._id}`, changes);
      toast.success('User updated');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name} and all their checks?`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      toast.success('User deleted');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <>
      <div className="page-head"><div><h1>Manage users</h1><p className="muted">Admin only</p></div></div>
      <div className="card filters">
        <input placeholder="Search name or email…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      {!result ? <Spinner /> : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th /></tr>
            </thead>
            <tbody>
              {result.data.map((u) => {
                const self = u._id === me._id;
                return (
                  <tr key={u._id}>
                    <td><b>{u.name}</b><br /><small className="muted">{u.email}</small></td>
                    <td>
                      <select value={u.role} disabled={self} onChange={(e) => update(u, { role: e.target.value })}>
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>
                      <button className={`chip chip-btn ${u.isActive ? 'ok' : 'off'}`} disabled={self} onClick={() => update(u, { isActive: !u.isActive })}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>{!self && <button className="btn btn-danger btn-sm" onClick={() => remove(u)}>Delete</button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination page={result.pagination.page} pages={result.pagination.pages} onChange={setPage} />
        </div>
      )}
    </>
  );
}
