import React from 'react';
import { ContentPage } from './HelpPage';
import { colors } from '../styles';

export default function QuickStartPage({ onBack }) {
  return (
    <ContentPage title="Quick Start: How The Simulation Works" onBack={onBack}>
      <p style={intro}>
        Each challenge runs for 30 ticks. Your goal is to maximize total revenue by making smart,
        timely price decisions while reacting to competitor moves, demand shifts, and inventory.
      </p>

      <Step
        number="1"
        title="Choose a Scenario"
        text="Start with Scenario 1 and unlock the next scenario by scoring at least 60% pricing efficiency."
      />

      <Step
        number="2"
        title="Read the Briefing"
        text="Review elasticity, inventory, competitor trajectory, and strategic hints before starting."
      />

      <Step
        number="3"
        title="Pick Tick Pacing"
        text="Choose Deliberate, Standard, or Fast mode based on how much decision time you want per tick."
      />

      <Step
        number="4"
        title="Adjust Price Continuously"
        text="Use the slider to set your base price. Effective price can also change with discounts and bundles."
      />

      <Step
        number="5"
        title="Use Promotions and Bundles"
        text="Activate campaigns and optional bundles strategically to boost demand without eroding margin too much."
      />

      <Step
        number="6"
        title="Track The Dashboard"
        text="Watch demand, sold units, competitor price, inventory burn, sentiment, and revenue trend each tick."
      />

      <Step
        number="7"
        title="Finish and Review Results"
        text="At the end, review your efficiency grade and AI strategy feedback, then retry to improve."
      />

      <div style={tipCard}>
        <h3 style={tipTitle}>Quick Strategy Tips</h3>
        <ul style={tipList}>
          <li>High elasticity: small price increases can sharply reduce demand.</li>
          <li>Do not optimize only for units sold; optimize for revenue.</li>
          <li>Monitor competitor gaps every few ticks, not just once.</li>
          <li>Use promotions as timed boosts, not permanent crutches.</li>
        </ul>
      </div>
    </ContentPage>
  );
}

function Step({ number, title, text }) {
  return (
    <div style={stepCard}>
      <div style={badge}>{number}</div>
      <div>
        <div style={stepTitle}>{title}</div>
        <p style={stepText}>{text}</p>
      </div>
    </div>
  );
}

const intro = {
  fontSize: 14,
  lineHeight: 1.7,
  color: colors.text,
  marginBottom: 18,
};

const stepCard = {
  display: 'grid',
  gridTemplateColumns: '36px 1fr',
  gap: 12,
  alignItems: 'start',
  background: '#f8fafc',
  border: `1px solid ${colors.border}`,
  borderRadius: 12,
  padding: '10px 12px',
  marginBottom: 10,
};

const badge = {
  width: 28,
  height: 28,
  borderRadius: 999,
  background: colors.primary,
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  fontWeight: 700,
  fontFamily: "'DM Mono', monospace",
};

const stepTitle = {
  fontSize: 14,
  fontWeight: 700,
  color: colors.text,
  marginBottom: 2,
};

const stepText = {
  fontSize: 13,
  lineHeight: 1.55,
  color: colors.textSecondary,
  margin: 0,
};

const tipCard = {
  marginTop: 20,
  background: colors.primaryBg,
  border: `1px solid ${colors.primaryLight}`,
  borderRadius: 12,
  padding: '12px 14px',
};

const tipTitle = {
  fontSize: 14,
  fontWeight: 700,
  color: colors.text,
  margin: '0 0 8px',
};

const tipList = {
  margin: 0,
  paddingLeft: 18,
  color: colors.text,
  fontSize: 13,
  lineHeight: 1.7,
};
