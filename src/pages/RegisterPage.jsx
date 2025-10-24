import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function RegisterPage({ onNavigate }) {
  const { register, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setLoading(true);

    if (!email || !password || !confirmPassword) {
      setRegisterError('All fields are required');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setRegisterError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setRegisterError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = await register(email, password);
    setLoading(false);

    if (result.success) {
      onNavigate('app');
    } else {
      setRegisterError(result.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>
          <FileText size={32} style={{ display: 'inline', marginRight: '12px', verticalAlign: 'middle' }} />
          Prompt Manager
        </h1>
        <h2>Create Account</h2>

        {registerError && <div className="error-message">{registerError}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="link-button"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}
