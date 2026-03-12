import React from 'react';
import scenarios from '../scenarios';
import { colors, cardStyle } from '../styles';
import { getGradeColor } from '../engine';

export default function LevelSelect({ scores, onSelectLevel, onNavigate }) {
  const isUnlocked = (index) => {
    if (index === 0) return true;
    const prevScore = scores[index - 1];
    return prevScore !== undefined && prevScore >= 60;
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.background, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src={process.env.PUBLIC_URL + '/dynamic-pricing-sandbox-logo.svg'}
            alt="Dynamic Pricing Sandbox"
            style={{ height: 90, marginBottom: 6 }}
          />
          <p style={{ fontSize: 14, color: colors.textSecondary, marginTop: 0 }}>
            Master the art of dynamic pricing across four industry scenarios
          </p>
        </div>

        {/* Scenario Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {scenarios.map((scenario, index) => {
            const unlocked = isUnlocked(index);
            const score = scores[index];
            const hasScore = score !== undefined;
            const gradeInfo = hasScore ? getGradeForScore(score) : null;

            return (
              <button
                key={scenario.id}
                onClick={() => unlocked && onSelectLevel(index)}
                disabled={!unlocked}
                aria-label={`${scenario.name}: ${unlocked ? 'unlocked' : 'locked'}`}
                style={{
                  ...cardStyle,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  border: 'none',
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  opacity: unlocked ? 1 : 0.5,
                  textAlign: 'left',
                  width: '100%',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={(e) => {
                  if (unlocked) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = cardStyle.boxShadow;
                }}
              >
                {/* Icon */}
                <div style={{
                  fontSize: 36,
                  width: 56,
                  height: 56,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 12,
                  background: unlocked ? '#eff6ff' : '#f1f5f9',
                  flexShrink: 0,
                }}>
                  {unlocked ? scenario.icon : '🔒'}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: colors.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Scenario {index + 1}
                    </span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: colors.text, marginTop: 2 }}>
                    {scenario.name}
                  </div>
                  <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                    {scenario.subtitle}
                  </div>
                </div>

                {/* Score badge and best score */}
                {hasScore && gradeInfo && (
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: getGradeColor(gradeInfo), color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 14,
                    }}>
                      {gradeInfo}
                    </div>
                    <div style={{ fontSize: 9, color: colors.textSecondary, marginTop: 2 }}>
                      {Math.round(score)}%
                    </div>
                  </div>
                )}

                {/* Arrow */}
                {unlocked && !hasScore && (
                  <div style={{ color: colors.textSecondary, fontSize: 20, flexShrink: 0 }}>
                    →
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer links */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 20,
          marginTop: 40,
          paddingTop: 20,
          borderTop: `1px solid ${colors.border}`,
        }}>
          <FooterLink label="What is Dynamic Pricing?" onClick={() => onNavigate('help')} />
          <FooterLink label="Terms and Conditions" onClick={() => onNavigate('terms')} />
          <FooterLink label="Privacy Policy" onClick={() => onNavigate('privacy')} />
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: colors.textSecondary }}>
          © 2026 Dr. Jose Mendoza. All rights reserved.
        </div>
      </div>
    </div>
  );
}

function FooterLink({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        color: colors.primary,
        fontSize: 12,
        cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif",
        padding: 0,
        textDecoration: 'underline',
        textUnderlineOffset: 3,
      }}
    >
      {label}
    </button>
  );
}

function getGradeForScore(efficiency) {
  if (efficiency >= 90) return 'A+';
  if (efficiency >= 80) return 'A';
  if (efficiency >= 70) return 'B+';
  if (efficiency >= 60) return 'B';
  if (efficiency >= 45) return 'C';
  return 'D';
}
