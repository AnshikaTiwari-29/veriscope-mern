import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiShield, FiZap, FiBarChart2, FiLock, FiSearch, FiCheckCircle } from 'react-icons/fi';
import api, { errorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Logo, ScoreRing, VerdictBadge, SignalList } from '../components/ui';

const SAMPLES = [
  { label: 'Viral WhatsApp forward', text: "SHOCKING!!! Doctors don't want you to know this MIRACLE drink that cures diabetes overnight. Share this before it gets deleted!!!" },
  { label: 'News report', text: 'According to data from the Ministry of Statistics, GDP grew 7.8 percent this quarter. However, economists said rural demand remains uneven.' },
];

const FEATURES = [
  { icon: <FiZap />, title: 'Instant analysis', text: 'Paste any text or link and get a credibility score in under a second.' },
  { icon: <FiSearch />, title: 'Explainable results', text: 'Every point added or removed is shown, so you know exactly why.' },
  { icon: <FiShield />, title: 'Source reputation', text: 'Recognises trusted publishers, official domains and satire sites.' },
  { icon: <FiBarChart2 />, title: 'Personal dashboard', text: 'Track every check you run with charts and verdict breakdowns.' },
  { icon: <FiLock />, title: 'Secure accounts', text: 'JWT authentication, hashed passwords and role-based admin access.' },
  { icon: <FiCheckCircle />, title: 'Organised history', text: 'Search, filter and revisit past checks with your own notes.' },
];

export default function Landing() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runDemo = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/public/analyze', { content: text });
      setResult(res.data.data);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing">
      <header className="topnav">
        <Logo />
        <nav>
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">Dashboard</Link>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
            </>
          )}
        </nav>
      </header>

      <section className="hero">
        <div className="hero-text">
          <span className="pill">● AI-style misinformation detector</span>
          <h1>See through the <span className="gradient">noise.</span></h1>
          <p>
            VeriScope scans news, forwards and posts for the warning signs of fake news — and explains
            every result in plain language.
          </p>
          <div className="hero-cta">
            <Link to={user ? '/checks/new' : '/register'} className="btn btn-primary">Start checking — free</Link>
            <a href="#demo" className="btn btn-ghost">Try the demo</a>
          </div>
        </div>

        <form id="demo" className="card demo" onSubmit={runDemo}>
          <div className="demo-head">
            <b>Quick check</b>
            <div className="samples">
              {SAMPLES.map((s) => (
                <button type="button" key={s.label} className="chip chip-btn" onClick={() => { setText(s.text); setResult(null); }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <textarea rows={5} placeholder="Paste a headline, message or paragraph…" value={text} onChange={(e) => setText(e.target.value)} />
          <button className="btn btn-primary btn-block" disabled={loading || text.trim().length < 10}>
            {loading ? 'Scanning…' : 'Analyze'}
          </button>

          {result && (
            <div className="demo-result">
              <ScoreRing score={result.score} verdict={result.verdict} size={110} />
              <div>
                <VerdictBadge verdict={result.verdict} />
                <p className="muted small">{result.summary}</p>
                <SignalList signals={result.signals.slice(0, 3)} />
              </div>
            </div>
          )}
        </form>
      </section>

      <section id="features" className="section">
        <h2>Everything you need to verify before you share</h2>
        <div className="grid-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card feature">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p className="muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="section">
        <h2>How it works</h2>
        <div className="grid-3 steps">
          <div className="card"><span className="step">1</span><h3>Paste</h3><p className="muted">Add text or a news link.</p></div>
          <div className="card"><span className="step">2</span><h3>Scan</h3><p className="muted">We check wording, style and source reputation.</p></div>
          <div className="card"><span className="step">3</span><h3>Decide</h3><p className="muted">Get a 0–100 score with clear reasons.</p></div>
        </div>
      </section>

      <footer className="footer">© {new Date().getFullYear()} VeriScope · Built with MongoDB, Express, React & Node.js</footer>
    </div>
  );
}
