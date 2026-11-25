import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Spinner, VerdictBadge, Empty } from '../components/ui';
import { VERDICTS, formatDate } from '../utils/verdicts';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/stats').then((res) => setStats(res.data.data)).catch(() => setError('Could not load stats'));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!stats) return <Spinner />;

  const max = Math.max(...stats.byVerdict.map((v) => v.count), 1);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Hi, {user.name.split(' ')[0]} 👋</h1>
          <p className="muted">{user.role === 'admin' ? 'Platform-wide overview' : 'Here is your fact-checking overview'}</p>
        </div>
        <Link to="/checks/new" className="btn btn-primary">+ New Check</Link>
      </div>

      <div className="stats">
        <div className="card stat"><span>Total checks</span><b>{stats.total}</b></div>
        <div className="card stat"><span>Average score</span><b>{stats.avgScore}</b></div>
        <div className="card stat"><span>Flagged as fake / misleading</span><b className="red">{stats.flagged}</b></div>
      </div>

      {stats.total === 0 ? (
        <Empty title="No checks yet" text="Run your first check to see stats here." action={<Link to="/checks/new" className="btn btn-primary">Run a check</Link>} />
      ) : (
        <div className="grid-2">
          <div className="card">
            <h3>Verdict breakdown</h3>
            <div className="bars">
              {stats.byVerdict.map((v) => (
                <div key={v.verdict} className="bar-row">
                  <span>{VERDICTS[v.verdict].label}</span>
                  <div className="bar"><div style={{ width: `${(v.count / max) * 100}%`, background: VERDICTS[v.verdict].color }} /></div>
                  <b>{v.count}</b>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3>Recent checks</h3>
            <ul className="recent">
              {stats.recent.map((c) => (
                <li key={c._id}>
                  <Link to={`/checks/${c._id}`}>{c.title}</Link>
                  <div><VerdictBadge verdict={c.verdict} /> <small className="muted">{formatDate(c.createdAt)}</small></div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
