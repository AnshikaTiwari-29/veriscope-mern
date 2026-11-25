import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errorMessage } from '../api/axios';
import { ScoreRing, VerdictBadge, SignalList, Spinner } from '../components/ui';
import { CATEGORIES, formatDate } from '../utils/verdicts';

export default function CheckDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [check, setCheck] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    api
      .get(`/analyses/${id}`)
      .then((res) => setCheck(res.data.data))
      .catch((err) => {
        toast.error(errorMessage(err));
        navigate('/checks');
      });
  }, [id, navigate]);

  if (!check) return <Spinner />;

  const startEdit = () => {
    setForm({ title: check.title, category: check.category, notes: check.notes, content: check.content });
    setEditing(true);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/analyses/${id}`, form);
      setCheck(res.data.data);
      setEditing(false);
      toast.success('Saved');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this check permanently?')) return;
    await api.delete(`/analyses/${id}`);
    toast.success('Check deleted');
    navigate('/checks');
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <>
      <div className="page-head">
        <div>
          <Link to="/checks" className="muted small">← Back to checks</Link>
          <h1>{check.title}</h1>
          <p className="muted">
            <span className="chip">{check.category}</span> · {formatDate(check.createdAt)}
            {check.sourceUrl && <> · <a href={check.sourceUrl} target="_blank" rel="noreferrer">source link</a></>}
          </p>
        </div>
        <div className="actions">
          <button className="btn btn-ghost" onClick={startEdit}>Edit</button>
          <button className="btn btn-danger" onClick={remove}>Delete</button>
        </div>
      </div>

      <div className="detail">
        <div className="card score-card">
          <ScoreRing score={check.score} verdict={check.verdict} />
          <VerdictBadge verdict={check.verdict} />
          <p className="muted">{check.summary}</p>
        </div>

        <div className="card">
          <h3>Why this score?</h3>
          <p className="muted small">Every check starts at 60. Warning signs remove points, trust signs add them.</p>
          <SignalList signals={check.signals} />
        </div>
      </div>

      {editing ? (
        <form className="card form" onSubmit={save}>
          <h3>Edit check</h3>
          <div className="row">
            <label>Title<input value={form.title} onChange={set('title')} /></label>
            <label>
              Category
              <select value={form.category} onChange={set('category')}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
          </div>
          <label>Text (changing it re-runs the analysis)<textarea rows={5} value={form.content} onChange={set('content')} /></label>
          <label>Your notes<textarea rows={3} value={form.notes} onChange={set('notes')} placeholder="e.g. Confirmed false by PIB Fact Check" /></label>
          <div className="actions">
            <button className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="card">
          <h3>Analysed text</h3>
          <p className="content-box">{check.content || <i className="muted">Only the link was analysed.</i>}</p>
          {check.notes && (<><h3>Notes</h3><p>{check.notes}</p></>)}
        </div>
      )}
    </>
  );
}
