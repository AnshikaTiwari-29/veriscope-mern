import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/axios';
import { Logo } from '../components/ui';

function PasswordInput({ value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div className="password">
      <input type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder="••••••••" />
      <button type="button" className="icon-btn" onClick={() => setShow(!show)} aria-label="Show password">
        {show ? <FiEyeOff /> : <FiEye />}
      </button>
    </div>
  );
}

// One component for both login and register
function AuthForm({ mode }) {
  const isLogin = mode === 'login';
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // basic client-side validation (server validates again)
  const validate = () => {
    const e = {};
    if (!isLogin && form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (form.password.length < (isLogin ? 1 : 8)) e.password = isLogin ? 'Password is required' : 'At least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form);
      toast.success(isLogin ? 'Welcome back!' : 'Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit} noValidate>
        <Logo />
        <h1>{isLogin ? 'Welcome back' : 'Create your account'}</h1>
        <p className="muted">{isLogin ? 'Log in to continue checking facts.' : 'Start detecting misinformation in seconds.'}</p>

        {!isLogin && (
          <label>
            Name
            <input value={form.name} onChange={set('name')} placeholder="Riya Sharma" />
            {errors.name && <small className="error">{errors.name}</small>}
          </label>
        )}
        <label>
          Email
          <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
          {errors.email && <small className="error">{errors.email}</small>}
        </label>
        <label>
          Password
          <PasswordInput value={form.password} onChange={set('password')} />
          {errors.password && <small className="error">{errors.password}</small>}
        </label>

        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Please wait…' : isLogin ? 'Log in' : 'Sign up'}
        </button>

        <p className="muted center">
          {isLogin ? "Don't have an account? " : 'Already registered? '}
          <Link to={isLogin ? '/register' : '/login'}>{isLogin ? 'Sign up' : 'Log in'}</Link>
        </p>
        {isLogin && <p className="hint">Demo: demo@veriscope.dev / Demo@12345</p>}
      </form>
    </div>
  );
}

export const Login = () => <AuthForm mode="login" />;
export const Register = () => <AuthForm mode="register" />;
