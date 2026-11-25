// Small reusable UI pieces
import { Link } from 'react-router-dom';
import { VERDICTS, formatDate } from '../utils/verdicts';

export function Logo() {
  return (
    <Link to="/" className="logo">
      <img src="/favicon.svg" alt="" width="28" height="28" />
      <span>Veri<b>Scope</b></span>
    </Link>
  );
}

/** Circular credibility gauge */
export function ScoreRing({ score, verdict, size = 160 }) {
  const color = VERDICTS[verdict]?.color || '#64748b';
  const r = 42;
  const circumference = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} className="ring-track" />
        <circle
          cx="50" cy="50" r={r}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
          className="ring-value"
        />
      </svg>
      <div className="ring-label">
        <strong style={{ fontSize: size / 4 }}>{score}</strong>
        <span>/ 100</span>
      </div>
    </div>
  );
}

export function VerdictBadge({ verdict }) {
  const v = VERDICTS[verdict] || { label: verdict, color: '#64748b' };
  return (
    <span className="badge" style={{ color: v.color, background: `${v.color}1f`, borderColor: `${v.color}55` }}>
      <i style={{ background: v.color }} /> {v.label}
    </span>
  );
}

export function SignalList({ signals = [] }) {
  if (!signals.length) return <p className="muted">No strong signals found in this text.</p>;
  return (
    <ul className="signals">
      {signals.map((s) => (
        <li key={s.key} className={s.impact >= 0 ? 'good' : 'bad'}>
          <span className="impact">{s.impact > 0 ? `+${s.impact}` : s.impact}</span>
          <div>
            <b>{s.label}</b>
            <small>{s.detail}</small>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CheckCard({ check, onDelete }) {
  return (
    <article className="card check-card">
      <div className="check-top">
        <span className="mini-score" style={{ color: VERDICTS[check.verdict]?.color }}>{check.score}</span>
        <VerdictBadge verdict={check.verdict} />
      </div>
      <Link to={`/checks/${check._id}`} className="check-title">{check.title}</Link>
      <div className="check-meta">
        <span className="chip">{check.category}</span>
        <span>{formatDate(check.createdAt)}</span>
        {check.createdBy?.name && <span>by {check.createdBy.name}</span>}
      </div>
      <div className="check-actions">
        <Link to={`/checks/${check._id}`} className="btn btn-ghost btn-sm">Open</Link>
        {onDelete && <button className="btn btn-danger btn-sm" onClick={() => onDelete(check)}>Delete</button>}
      </div>
    </article>
  );
}

export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="pagination">
      <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>← Prev</button>
      <span>Page {page} of {pages}</span>
      <button className="btn btn-ghost btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next →</button>
    </div>
  );
}

export const Spinner = () => <div className="spinner" role="status" aria-label="Loading" />;

export function Empty({ title, text, action }) {
  return (
    <div className="empty card">
      <div className="empty-icon">🔍</div>
      <h3>{title}</h3>
      <p className="muted">{text}</p>
      {action}
    </div>
  );
}
