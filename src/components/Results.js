import React from 'react';
import { calculateGrade, getGradeMessage, getGradeColor } from '../engine';
import { colors, cardStyle, primaryButton, secondaryButton } from '../styles';

export default function Results({ scenario, totalRevenue, onRetry, onNext, canAdvance }) {
  const { efficiency, grade, passed } = calculateGrade(totalRevenue, scenario.optimalRevenue);
  const gradeColor = getGradeColor(grade);
  const message = getGradeMessage(grade);

  return (
    <div style={{ minHeight: '100vh', background: colors.background, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        {/* Grade Badge */}
        <div style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: gradeColor,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 40,
          fontWeight: 800,
          margin: '0 auto 24px',
          boxShadow: `0 8px 24px ${gradeColor}44`,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {grade}
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 700, color: colors.text, margin: '0 0 8px' }}>
          {scenario.icon} {scenario.name}
        </h2>
        <p style={{ fontSize: 16, color: colors.textSecondary, margin: '0 0 32px' }}>
          {message}
        </p>

        {/* Revenue Breakdown */}
        <div style={{ ...cardStyle, textAlign: 'left', marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <BreakdownRow label="Your Revenue" value={`$${totalRevenue.toLocaleString()}`} bold />
            <BreakdownRow label="Optimal Revenue" value={`$${scenario.optimalRevenue.toLocaleString()}`} />
            <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 14 }}>
              <BreakdownRow
                label="Pricing Efficiency"
                value={`${efficiency.toFixed(1)}%`}
                color={gradeColor}
                bold
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onRetry} style={secondaryButton}>
            🔄 Retry Level
          </button>
          {passed && canAdvance && (
            <button onClick={onNext} style={primaryButton}>
              Next Scenario →
            </button>
          )}
        </div>

        {!passed && (
          <p style={{ fontSize: 13, color: colors.textSecondary, marginTop: 20 }}>
            Score 60% or higher to unlock the next scenario.
          </p>
        )}
      </div>
    </div>
  );
}

function BreakdownRow({ label, value, color, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 14, color: colors.textSecondary }}>{label}</span>
      <span style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: bold ? 20 : 16,
        fontWeight: bold ? 700 : 500,
        color: color || colors.text,
      }}>
        {value}
      </span>
    </div>
  );
}
