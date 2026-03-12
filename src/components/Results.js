import React, { useState, useEffect, useCallback } from 'react';
import { calculateGrade, getGradeMessage, getGradeColor } from '../engine';
import { colors, cardStyle, primaryButton, secondaryButton } from '../styles';

const LLM_PROXY_URL = process.env.REACT_APP_LLM_PROXY_URL || '';

function buildLLMPrompt(scenario, tickHistory) {
  return {
    system: `You are an experienced pricing strategy instructor reviewing a student's performance in a dynamic pricing simulation. Provide constructive, specific feedback.

Respond in this exact format:
**Strategy Summary:** [2-3 sentences characterizing their approach]
**Strengths:**
- [specific strength referencing tick numbers]
- [specific strength]
**Areas for Improvement:**
- [specific suggestion with concrete advice]
- [specific suggestion]
**Key Takeaway:** [one sentence — the most important lesson]
**Try Again:** [one motivating sentence suggesting a specific strategic adjustment]`,
    user: `Scenario: ${scenario.name} (${scenario.subtitle})
Elasticity: ${scenario.elasticity} | Base Price: $${scenario.basePrice} | Inventory: ${scenario.initialInventory} ${scenario.unit}
Optimal Revenue: $${scenario.optimalRevenue.toLocaleString()}

Tick History (${tickHistory.length} ticks):
${tickHistory.map((h) =>
  `Tick ${h.tick}: Price=$${h.effectivePrice?.toFixed(2) || h.price} Demand=${h.demand} Sold=${h.sold} Revenue=$${h.revenue} CompPrice=$${h.compPrice}${h.activePromotion ? ` Promo=${h.activePromotion}` : ''}${h.activeBundle ? ` Bundle=${h.activeBundle}` : ''}${h.discountPercent ? ` Discount=${h.discountPercent}%` : ''}`
).join('\n')}

Competitor Price Trajectory: ${scenario.competitorPrices.join(', ')}
Final Total Revenue: $${tickHistory.reduce((s, h) => s + h.revenue, 0).toLocaleString()}`,
  };
}

async function fetchLLMFeedback(scenario, tickHistory) {
  if (!LLM_PROXY_URL) return null;

  const prompt = buildLLMPrompt(scenario, tickHistory);
  const res = await fetch(LLM_PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.user }],
    }),
  });

  if (!res.ok) throw new Error(`LLM proxy returned ${res.status}`);
  const data = await res.json();
  // Support both direct Anthropic response format and proxy wrapper
  const text = data.content?.[0]?.text || data.text || data.feedback || '';
  return text;
}

export default function Results({ scenario, totalRevenue, tickHistory, onRetry, onNext, canAdvance }) {
  const { efficiency, grade, passed } = calculateGrade(totalRevenue, scenario.optimalRevenue);
  const gradeColor = getGradeColor(grade);
  const message = getGradeMessage(grade);

  const [llmFeedback, setLlmFeedback] = useState(null);
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmError, setLlmError] = useState(false);

  const requestFeedback = useCallback(async () => {
    if (!LLM_PROXY_URL || !tickHistory || tickHistory.length === 0) return;
    setLlmLoading(true);
    setLlmError(false);
    try {
      const feedback = await fetchLLMFeedback(scenario, tickHistory);
      setLlmFeedback(feedback);
    } catch {
      setLlmError(true);
    } finally {
      setLlmLoading(false);
    }
  }, [scenario, tickHistory]);

  useEffect(() => {
    requestFeedback();
  }, [requestFeedback]);

  return (
    <div style={{ minHeight: '100vh', background: colors.background, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        {/* Grade Badge */}
        <div style={{
          width: 100, height: 100, borderRadius: '50%', background: gradeColor, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 34, fontWeight: 800, margin: '0 auto 20px',
          boxShadow: `0 8px 24px ${gradeColor}44`, fontFamily: "'DM Sans', sans-serif",
        }}>
          {grade}
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.text, margin: '0 0 6px' }}>
          {scenario.icon} {scenario.name}
        </h2>
        <p style={{ fontSize: 14, color: colors.textSecondary, margin: '0 0 28px' }}>{message}</p>

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

        {/* LLM Feedback Card */}
        {LLM_PROXY_URL && (
          <div style={{
            ...cardStyle, textAlign: 'left', marginBottom: 24,
            background: '#eff6ff', border: '1px solid #dbeafe',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
              🎓 AI Strategy Feedback
            </div>
            {llmLoading && (
              <div style={{ textAlign: 'center', padding: '20px 0', color: colors.textSecondary }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
                <div style={{ fontSize: 13 }}>Analyzing your pricing strategy...</div>
              </div>
            )}
            {llmError && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 10 }}>
                  Unable to generate feedback at this time.
                </p>
                <button onClick={requestFeedback} style={{ ...secondaryButton, fontSize: 12 }}>
                  Retry Analysis
                </button>
              </div>
            )}
            {llmFeedback && !llmLoading && (
              <div style={{ fontSize: 13, color: colors.text, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {llmFeedback}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onRetry} style={{ ...primaryButton, background: '#e2e8f0', color: colors.text }}>
            🔄 Retry Challenge
          </button>
          {passed && canAdvance && (
            <button onClick={onNext} style={primaryButton}>
              Next Scenario →
            </button>
          )}
        </div>

        {!passed && (
          <p style={{ fontSize: 12, color: colors.textSecondary, marginTop: 16 }}>
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
      <span style={{ fontSize: 13, color: colors.textSecondary }}>{label}</span>
      <span style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: bold ? 18 : 14,
        fontWeight: bold ? 700 : 500,
        color: color || colors.text,
      }}>
        {value}
      </span>
    </div>
  );
}
