import React, { useState } from 'react';
import { colors, cardStyle, primaryButton } from '../styles';
import { promotions } from '../scenarios';

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
    <div style={{ minHeight: '100vh', background: colors.background, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px 48px' }}>
        {/* Back button */}
        <button
          onClick={onBack}
          aria-label="Back to level select"
          style={{
            background: 'none', border: 'none', fontSize: 18, cursor: 'pointer',
            color: colors.textSecondary, padding: '2px 6px', marginBottom: 16,
          }}
        >
          ← Back
        </button>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{scenario.icon}</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: colors.text, margin: '0 0 4px' }}>
            {scenario.name}
          </h1>
          <p style={{ fontSize: 14, color: colors.textSecondary, margin: 0 }}>
            {scenario.subtitle}
          </p>
        </div>

        {/* Situation Overview */}
        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <SectionTitle>Situation Overview</SectionTitle>
          {scenario.briefing.overview.split('\n\n').map((para, i) => (
            <p key={i} style={{ fontSize: 14, color: colors.text, lineHeight: 1.7, margin: i === 0 ? '8px 0 0' : '12px 0 0' }}>
              {para}
            </p>
          ))}
        </div>

        {/* Key Metrics */}
        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <SectionTitle>Key Metrics</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginTop: 12 }}>
            <MetricCard label="Base Price" value={`$${scenario.basePrice}`} />
            <MetricCard label="Price Range" value={`$${scenario.minPrice}–$${scenario.maxPrice}`} />
            <MetricCard label="Inventory" value={`${scenario.initialInventory} ${scenario.unit}`} />
            <MetricCard label="Elasticity" value={elasticity.label} sub={`(${scenario.elasticity})`} />
            <MetricCard label="Optimal Revenue" value={`$${scenario.optimalRevenue.toLocaleString()}`} />
            <MetricCard label="Rounds" value={`${scenario.timeLimit}`} />
          </div>
        </div>

        {/* Competitor Intel */}
        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <SectionTitle>🔍 Competitor Intelligence</SectionTitle>
          <p style={{ fontSize: 14, color: colors.text, lineHeight: 1.7, margin: '8px 0 0' }}>
            {scenario.briefing.competitorIntel}
          </p>
        </div>

        {/* Strategic Hints */}
        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <SectionTitle>💡 Strategic Hints</SectionTitle>
          <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
            {scenario.briefing.hints.map((hint, i) => (
              <li key={i} style={{ fontSize: 14, color: colors.text, lineHeight: 1.7, marginBottom: 6 }}>
                {hint}
              </li>
            ))}
          </ul>
        </div>

        {/* Available Tools */}
        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <SectionTitle>🛠 Available Tools</SectionTitle>
          <div style={{ marginTop: 10 }}>
            <MiniTool label="Discounts" desc="Apply 5–25% price reductions to boost demand through lower effective pricing." />
            <MiniTool label="Promotions" desc={`Run time-limited campaigns (${promotions.map(p => p.name).join(', ')}) to temporarily boost demand.`} />
            <MiniTool label="Bundle" desc={`${scenario.availableBundle.name}: +$${scenario.availableBundle.premium} price premium with ${((scenario.availableBundle.demandMultiplier - 1) * 100).toFixed(0)}% demand boost.`} />
          </div>
        </div>

        {/* Tick Mode Selector */}
        <div style={{ ...cardStyle, marginBottom: 24 }}>
          <SectionTitle>⏱ Simulation Pacing</SectionTitle>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }} role="radiogroup" aria-label="Tick pacing mode">
            {TICK_MODES.map((mode) => (
              <button
                key={mode.id}
                role="radio"
                aria-checked={tickMode === mode.id}
                onClick={() => setTickMode(mode.id)}
                style={{
                  flex: '1 1 140px',
                  padding: '12px 14px',
                  border: tickMode === mode.id ? `2px solid ${colors.primary}` : `2px solid ${colors.border}`,
                  borderRadius: 10,
                  background: tickMode === mode.id ? '#eff6ff' : colors.card,
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14, color: tickMode === mode.id ? colors.primary : colors.text }}>
                  {mode.label}
                </div>
                <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                  {mode.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          style={{ ...primaryButton, width: '100%', padding: '14px 24px', fontSize: 16 }}
        >
          Begin Challenge
        </button>
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
