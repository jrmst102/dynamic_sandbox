import React, { useState } from 'react';
import { useAuth } from '../auth';
import { useNavigate } from 'react-router-dom';
import { colors, primaryButton } from '../styles';

export default function LoginPage() {
  const { login, error, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      // error is set by AuthProvider
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: colors.background }}>
        <p style={{ color: colors.textSecondary }}>Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: colors.background, fontFamily: "'DM Sans', sans-serif" }}>
      <div className="w-full max-w-sm px-5">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-center mb-1" style={{ color: colors.primary }}>
            Dynamic Pricing Sandbox
          </h1>
          <p className="text-sm text-center mb-6" style={{ color: colors.textSecondary }}>
            Sign in to continue
          </p>

          <form onSubmit={handleSubmit}>
            <label className="block text-xs font-semibold mb-1" style={{ color: colors.text }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full mb-4 px-3 py-2 rounded-lg text-sm"
              style={{ border: `1px solid ${colors.border}`, outline: 'none', fontFamily: 'inherit' }}
            />

            <label className="block text-xs font-semibold mb-1" style={{ color: colors.text }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full mb-5 px-3 py-2 rounded-lg text-sm"
              style={{ border: `1px solid ${colors.border}`, outline: 'none', fontFamily: 'inherit' }}
            />

            {error && (
              <p className="text-xs mb-4 text-center" style={{ color: colors.danger }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{ ...primaryButton, width: '100%', opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: colors.textSecondary }}>
          v1.2.0 — © 2026 by Dr. Jose Mendoza
        </div>
      </div>
    </div>
  );
}
