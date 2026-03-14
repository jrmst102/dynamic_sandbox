import React, { useState, useEffect, useCallback } from 'react';
import { calculateGrade, getGradeMessage, getGradeColor } from '../engine';
import { colors } from '../styles';
import { Button, Card, Spinner } from '@jrmst102/ui-kit';

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

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const errorMessage = data?.error || data?.message || `LLM proxy returned ${res.status}`;
    throw new Error(errorMessage);
  }

  const parsedBody = typeof data.body === 'string'
    ? (() => {
      try {
        return JSON.parse(data.body);
      } catch {
        return {};
      }
    })()
    : null;

  const source = parsedBody || data;
  // Support both direct Anthropic response format and proxy wrapper
  const text = source.content?.[0]?.text || source.text || source.feedback || '';

  if (!text || !text.trim()) {
    throw new Error('The feedback service returned an empty response.');
  }

  return text;
}

export default function Results({ scenario, totalRevenue, tickHistory, onRetry, onNext, canAdvance }) {
  const { efficiency, grade, passed } = calculateGrade(totalRevenue, scenario.optimalRevenue);
  const gradeColor = getGradeColor(grade);
  const message = getGradeMessage(grade);

  const [llmFeedback, setLlmFeedback] = useState(null);
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmError, setLlmError] = useState('');

  const requestFeedback = useCallback(async () => {
    if (!LLM_PROXY_URL || !tickHistory || tickHistory.length === 0) return;
    setLlmLoading(true);
    setLlmError('');
    try {
      const feedback = await fetchLLMFeedback(scenario, tickHistory);
      setLlmFeedback(feedback);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to generate feedback at this time.';
      setLlmError(message);
    } finally {
      setLlmLoading(false);
    }
  }, [scenario, tickHistory]);

  useEffect(() => {
    requestFeedback();
  }, [requestFeedback]);

  return (
    <div className="min-h-screen" style={{ background: colors.background, fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-lg mx-auto text-center" style={{ padding: '60px 20px' }}>
        {/* Grade Badge */}
        <div
          className="flex items-center justify-center rounded-full text-white mx-auto mb-5"
          style={{
            width: 100, height: 100, background: gradeColor,
            fontSize: 34, fontWeight: 800,
            boxShadow: `0 8px 24px ${gradeColor}44`, fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {grade}
        </div>

        <h2 className="text-xl font-bold mb-1" style={{ color: colors.text, margin: '0 0 6px' }}>
          {scenario.icon} {scenario.name}
        </h2>
        <p className="text-sm mb-7" style={{ color: colors.textSecondary, margin: '0 0 28px' }}>{message}</p>

        {/* Revenue Breakdown */}
        <Card className="text-left mb-6">
          <div className="flex flex-col gap-3.5">
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
        </Card>

        {/* LLM Feedback Card */}
        {LLM_PROXY_URL && (
          <Card className="text-left mb-6" style={{ background: colors.primaryBg, border: `1px solid ${colors.primaryLight}` }}>
            <div className="text-xs font-bold uppercase tracking-wide mb-2.5" style={{ color: colors.textSecondary }}>
              🎓 AI Strategy Feedback
            </div>
            {llmLoading && (
              <div className="text-center py-5">
                <Spinner size="sm" className="mx-auto mb-2" />
                <div className="text-sm" style={{ color: colors.textSecondary }}>Analyzing your pricing strategy...</div>
              </div>
            )}
            {llmError && (
              <div className="text-center py-4">
                <p className="text-sm mb-2.5" style={{ color: colors.textSecondary }}>
                  Unable to generate feedback at this time.
                </p>
                <p className="text-xs mb-2.5" style={{ color: colors.textSecondary }}>
                  {llmError}
                </p>
                <Button variant="secondary" size="sm" onClick={requestFeedback}>
                  Retry Analysis
                </Button>
              </div>
            )}
            {llmFeedback && !llmLoading && (
              <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: colors.text }}>
                {llmFeedback}
              </div>
            )}
            {llmFeedback && !llmLoading && (
              <div className="text-xs mt-3 pt-2 text-right" style={{ color: colors.textSecondary, borderTop: `1px solid ${colors.primaryLight}` }}>
                Note: This Strategy Feedback is AI-generated
              </div>
            )}
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center flex-wrap">
          <Button variant="secondary" onClick={onRetry}>
            🔄 Retry Challenge
          </Button>
          {passed && canAdvance && (
            <Button variant="primary" onClick={onNext}>
              Next Scenario →
            </Button>
          )}
        </div>

        {!passed && (
          <p className="text-xs mt-4" style={{ color: colors.textSecondary }}>
            Score 60% or higher to unlock the next scenario.
          </p>
        )}

        <div className="text-center mt-6 text-xs" style={{ color: colors.textSecondary }}>
          v1.2.0 — © 2026 by Dr. Jose Mendoza
        </div>
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
