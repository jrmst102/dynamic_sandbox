import React, { useState } from 'react';
import { colors } from '../styles';
import { promotions } from '../scenarios';
import { Card, Button } from '@jrmst102/ui-kit';

const TICK_MODES = [
  { id: 'deliberate', label: 'Deliberate', interval: 300000, desc: '5 min/tick' },
  { id: 'standard', label: 'Standard', interval: 60000, desc: '60 sec/tick' },
  { id: 'fast', label: 'Fast', interval: 1200, desc: '1.2 sec/tick' },
];

function getElasticityLabel(e) {
  if (e >= 1.5) return { label: 'Very High', desc: 'Demand is extremely sensitive to price changes.' };
  if (e >= 1.2) return { label: 'High', desc: 'Demand is highly sensitive to price changes.' };
  if (e >= 1.0) return { label: 'Medium', desc: 'Demand responds moderately to price changes.' };
  return { label: 'Low', desc: 'Demand is relatively stable despite price changes.' };
}

export default function ScenarioBriefing({ scenario, onStart, onBack }) {
  const [tickMode, setTickMode] = useState('fast');
  const elasticity = getElasticityLabel(scenario.elasticity);

  const handleStart = () => {
    const mode = TICK_MODES.find((m) => m.id === tickMode);
    onStart(mode);
  };

  return (
    <div className="min-h-screen" style={{ background: colors.background, fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-3xl mx-auto px-5 pt-6 pb-12">
        {/* Back button */}
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 !text-sm" aria-label="Back to level select">
          ← Back
        </Button>

        {/* Title */}
        <div className="text-center mb-7">
          <div className="text-5xl mb-2">{scenario.icon}</div>
          <h1 className="text-2xl font-bold m-0" style={{ color: colors.text }}>
            {scenario.name}
          </h1>
          <p className="text-sm mt-1 mb-0" style={{ color: colors.textSecondary }}>
            {scenario.subtitle}
          </p>
        </div>

        {/* Situation Overview */}
        <Card className="mb-4">
          <SectionTitle>Situation Overview</SectionTitle>
          {scenario.briefing.overview.split('\n\n').map((para, i) => (
            <p key={i} className="text-sm leading-relaxed" style={{ color: colors.text, margin: i === 0 ? '8px 0 0' : '12px 0 0' }}>
              {para}
            </p>
          ))}
        </Card>

        {/* Key Metrics */}
        <Card className="mb-4">
          <SectionTitle>Key Metrics</SectionTitle>
          <div className="grid gap-2.5 mt-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
            <MetricCard label="Base Price" value={`$${scenario.basePrice}`} />
            <MetricCard label="Price Range" value={`$${scenario.minPrice}–$${scenario.maxPrice}`} />
            <MetricCard label="Inventory" value={`${scenario.initialInventory} ${scenario.unit}`} />
            <MetricCard label="Elasticity" value={elasticity.label} sub={`(${scenario.elasticity})`} />
            <MetricCard label="Optimal Revenue" value={`$${scenario.optimalRevenue.toLocaleString()}`} />
            <MetricCard label="Rounds" value={`${scenario.timeLimit}`} />
          </div>
        </Card>

        {/* Competitor Intel */}
        <Card className="mb-4">
          <SectionTitle>🔍 Competitor Intelligence</SectionTitle>
          <p className="text-sm leading-relaxed mt-2 mb-0" style={{ color: colors.text }}>
            {scenario.briefing.competitorIntel}
          </p>
        </Card>

        {/* Strategic Hints */}
        <Card className="mb-4">
          <SectionTitle>💡 Strategic Hints</SectionTitle>
          <ul className="mt-2 mb-0 pl-5">
            {scenario.briefing.hints.map((hint, i) => (
              <li key={i} className="text-sm leading-relaxed mb-1.5" style={{ color: colors.text }}>
                {hint}
              </li>
            ))}
          </ul>
        </Card>

        {/* Available Tools */}
        <Card className="mb-4">
          <SectionTitle>🛠 Available Tools</SectionTitle>
          <div className="mt-2.5">
            <MiniTool label="Discounts" desc="Apply 5–25% price reductions to boost demand through lower effective pricing." />
            <MiniTool label="Promotions" desc={`Run time-limited campaigns (${promotions.map(p => p.name).join(', ')}) to temporarily boost demand.`} />
            <MiniTool label="Bundle" desc={`${scenario.availableBundle.name}: +$${scenario.availableBundle.premium} price premium with ${((scenario.availableBundle.demandMultiplier - 1) * 100).toFixed(0)}% demand boost.`} />
          </div>
        </Card>

        {/* Tick Mode Selector */}
        <Card className="mb-6">
          <SectionTitle>⏱ Simulation Pacing</SectionTitle>
          <div className="flex gap-2 mt-3 flex-wrap" role="radiogroup" aria-label="Tick pacing mode">
            {TICK_MODES.map((mode) => (
              <button
                key={mode.id}
                role="radio"
                aria-checked={tickMode === mode.id}
                onClick={() => setTickMode(mode.id)}
                className="flex-1 min-w-[140px] p-3 rounded-lg text-center transition-colors"
                style={{
                  border: tickMode === mode.id ? `2px solid ${colors.primary}` : `2px solid ${colors.border}`,
                  background: tickMode === mode.id ? colors.primaryBg : colors.card,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <div className="font-semibold text-sm" style={{ color: tickMode === mode.id ? colors.primary : colors.text }}>
                  {mode.label}
                </div>
                <div className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                  {mode.desc}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Start Button */}
        <Button variant="primary" size="lg" onClick={handleStart} className="w-full !text-base">
          Begin Challenge
        </Button>

        <div className="text-center mt-6 text-xs" style={{ color: colors.textSecondary }}>
          © 2026 by Dr. Jose Mendoza
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {children}
    </div>
  );
}

function MetricCard({ label, value, sub }) {
  return (
    <div style={{
      background: '#f8fafc', borderRadius: 10, padding: '10px 12px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 700, color: colors.text, marginTop: 4 }}>
        {value}
        {sub && <span style={{ fontSize: 11, fontWeight: 400, color: colors.textSecondary, marginLeft: 4 }}>{sub}</span>}
      </div>
    </div>
  );
}

function MiniTool({ label, desc }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
      <div style={{ fontWeight: 600, fontSize: 13, color: colors.text, minWidth: 90 }}>{label}</div>
      <div style={{ fontSize: 13, color: colors.textSecondary }}>{desc}</div>
    </div>
  );
}
