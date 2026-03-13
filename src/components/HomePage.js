import React, { useState } from 'react';
import { useAuth } from '@jrmst102/auth-client';
import { useNavigate } from 'react-router-dom';
import { colors } from '../styles';
import { Card, Button } from '@jrmst102/ui-kit';
import QuickStartPage from './QuickStartPage';
import HelpPage from './HelpPage';
import TermsPage from './TermsPage';
import PrivacyPage from './PrivacyPage';

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [subPage, setSubPage] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleBack = () => setSubPage(null);

  if (subPage === 'quickstart') return <QuickStartPage onBack={handleBack} />;
  if (subPage === 'help') return <HelpPage onBack={handleBack} />;
  if (subPage === 'terms') return <TermsPage onBack={handleBack} />;
  if (subPage === 'privacy') return <PrivacyPage onBack={handleBack} />;

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

        {/* Footer links */}
        <div className="flex justify-center gap-5 mt-10 pt-5" style={{ borderTop: `1px solid ${colors.border}` }}>
          <Button variant="ghost" size="sm" onClick={() => setSubPage('quickstart')} className="!text-xs underline">
            Quick Start
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSubPage('help')} className="!text-xs underline">
            What is Dynamic Pricing?
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSubPage('terms')} className="!text-xs underline">
            Terms and Conditions
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSubPage('privacy')} className="!text-xs underline">
            Privacy Policy
          </Button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: colors.textSecondary }}>
          v1.1.1 — © 2026 by Dr. Jose Mendoza
        </div>
      </div>
    </div>
  );
}
