import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errorMessage } from '../api/axios';
import { CATEGORIES } from '../utils/verdicts';

export default function NewCheck() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ inputType: 'text', title: '', content: '', sourceUrl: '', category: 'other' });
  const [loading, setLoading] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/analyses', form);
      toast.success('Analysis complete');
      navigate(`/checks/${res.data.data._id}`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>New check</h1>
          <p className="muted">Paste news text or a link. We'll score it and explain why.</p>
        </div>
      </div>

      <form className="card form" onSubmit={submit}>
        <div className="tabs">
          {['text', 'url'].map((t) => (
            <button type="button" key={t} className={form.inputType === t ? 'active' : ''} onClick={() => setForm({ ...form, inputType: t })}>
              {t === 'text' ? 'Text / Message' : 'News link'}
            </button>
          ))}
        </div>

        {form.inputType === 'url' && (
          <label>
            Article URL
            <input value={form.sourceUrl} onChange={set('sourceUrl')} placeholder="https://www.example.com/news/..." />
          </label>
        )}

        <label>
          {form.inputType === 'url' ? 'Headline or excerpt (recommended)' : 'Text to analyse'}
          <textarea rows={7} value={form.content} onChange={set('content')} maxLength={5000} placeholder="Paste the message, headline or paragraph here…" />
          <small className="muted">{form.content.length} / 5000</small>
        </label>

        <div className="row">
          <label>
            Title (optional)
            <input value={form.title} onChange={set('title')} placeholder="Auto-generated if empty" />
          </label>
          <label>
            Category
            <select value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <button className="btn btn-primary" disabled={loading}>
          {loading ? 'Scanning…' : 'Analyze now'}
        </button>
      </form>
    </>
  );
}
