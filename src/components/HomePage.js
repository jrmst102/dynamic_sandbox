import React from 'react';
import { useAuth } from '@jrmst102/auth-client';
import { useNavigate } from 'react-router-dom';
import { colors } from '../styles';
import { Card, Button } from '@jrmst102/ui-kit';

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen" style={{ background: colors.background, fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-3xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.primary }}>
              Dynamic Pricing Sandbox
            </h1>
            <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
              Welcome back, {user?.name || 'User'}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>

        {/* App Card */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="text-4xl">📊</div>
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-1" style={{ color: colors.text }}>
                Dynamic Pricing Simulator
              </h2>
              <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
                Master the art of dynamic pricing across four industry scenarios.
                Adjust prices in real time, observe demand shifts, and maximize revenue.
              </p>
              <Button variant="primary" size="sm" onClick={() => navigate('/pricing')}>
                Launch
              </Button>
            </div>
          </div>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: colors.textSecondary }}>
          © 2026 by Dr. Jose Mendoza
        </div>
      </div>
    </div>
  );
}
