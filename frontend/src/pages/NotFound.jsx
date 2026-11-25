import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="center-page">
      <h1 className="gradient big">404</h1>
      <p className="muted">This page doesn't exist — that one's definitely fake.</p>
      <Link to="/" className="btn btn-primary">Go home</Link>
    </div>
  );
}
