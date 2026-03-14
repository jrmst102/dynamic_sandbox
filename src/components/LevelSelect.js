import React from 'react';
import scenarios from '../scenarios';
import { colors } from '../styles';
import { getGradeColor } from '../engine';
import { Card, Button } from '@jrmst102/ui-kit';

export default function LevelSelect({ scores, onSelectLevel, onNavigate }) {
  const isUnlocked = (index) => {
    if (index === 0) return true;
    const prevScore = scores[index - 1];
    return prevScore !== undefined && prevScore >= 60;
  };

  return (
    <div className="min-h-screen" style={{ background: colors.background, fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-3xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm mt-0" style={{ color: colors.textSecondary }}>
            Master the art of dynamic pricing across four industry scenarios
          </p>
          <div className="mt-3">
            <Button variant="primary" size="sm" onClick={() => onNavigate('quickstart')}>
              Quick Start Guide
            </Button>
          </div>
        </div>

        {/* Scenario Cards */}
        <div className="flex flex-col gap-3">
          {scenarios.map((scenario, index) => {
            const unlocked = isUnlocked(index);
            const score = scores[index];
            const hasScore = score !== undefined;
            const gradeInfo = hasScore ? getGradeForScore(score) : null;

            return (
              <Card
                key={scenario.id}
                className={`!p-4 transition-all duration-150 ${unlocked ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : 'cursor-not-allowed'}`}
                style={{ opacity: unlocked ? 1 : 0.5 }}
                onClick={() => unlocked && onSelectLevel(index)}
                role="button"
                aria-label={`${scenario.name}: ${unlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className="flex items-center justify-center rounded-xl flex-shrink-0"
                    style={{
                      fontSize: 36, width: 56, height: 56,
                      background: unlocked ? colors.primaryBg : colors.border,
                    }}
                  >
                    {unlocked ? scenario.icon : '🔒'}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textSecondary }}>
                      Scenario {index + 1}
                    </span>
                    <div className="text-sm font-semibold mt-0.5" style={{ color: colors.text }}>
                      {scenario.name}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                      {scenario.subtitle}
                    </div>
                  </div>

                  {/* Score badge */}
                  {hasScore && gradeInfo && (
                    <div className="text-center flex-shrink-0">
                      <div
                        className="flex items-center justify-center rounded-full text-white font-bold text-sm"
                        style={{ width: 44, height: 44, background: getGradeColor(gradeInfo) }}
                      >
                        {gradeInfo}
                      </div>
                      <div className="mt-0.5" style={{ fontSize: 9, color: colors.textSecondary }}>
                        {Math.round(score)}%
                      </div>
                    </div>
                  )}

                  {/* Arrow */}
                  {unlocked && !hasScore && (
                    <div className="text-xl flex-shrink-0" style={{ color: colors.textSecondary }}>→</div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Footer links */}
        <div className="flex justify-center gap-5 mt-10 pt-5" style={{ borderTop: `1px solid ${colors.border}` }}>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('quickstart')} className="!text-xs underline">
            Quick Start
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('help')} className="!text-xs underline">
            What is Dynamic Pricing?
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('terms')} className="!text-xs underline">
            Terms and Conditions
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('privacy')} className="!text-xs underline">
            Privacy Policy
          </Button>
        </div>

        <div className="text-center mt-4 text-xs" style={{ color: colors.textSecondary }}>
          v1.2.0 — © 2026 by Dr. Jose Mendoza
        </div>
      </div>
    </div>
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
