import React from 'react';
import { colors, cardStyle } from '../styles';

export default function HelpPage({ onBack }) {
  return (
    <ContentPage title="What is Dynamic Pricing?" onBack={onBack}>
      <Section title="Definition">
        <p>
          Dynamic pricing is a strategy where businesses adjust the price of a product or service
          in real time based on current market conditions. Instead of setting a single fixed price,
          sellers change prices frequently — sometimes minute by minute — in response to demand,
          supply, competition, and other factors.
        </p>
      </Section>

      <Section title="Core Concepts">
        <h4 style={subheading}>Price Elasticity of Demand</h4>
        <p>
          Elasticity measures how much demand changes when price changes. If a small price increase
          causes a large drop in demand, the product is <em>elastic</em> (e.g., concert tickets).
          If demand barely changes, it is <em>inelastic</em> (e.g., hotel rooms during a major event).
        </p>

        <h4 style={subheading}>The Demand Curve</h4>
        <p>
          The demand curve shows the relationship between price and the quantity consumers are
          willing to buy. Generally, as price increases, demand decreases. The shape and steepness
          of the curve vary by market and product.
        </p>

        <h4 style={subheading}>Revenue Optimization</h4>
        <p>
          The goal of dynamic pricing is to find the price point that maximizes total revenue —
          not necessarily the highest price or the most units sold, but the combination that
          produces the most revenue overall.
        </p>

        <h4 style={subheading}>Inventory &amp; Scarcity</h4>
        <p>
          When inventory is limited, pricing decisions become especially impactful. Selling too
          cheaply can leave revenue on the table; pricing too high can leave unsold inventory.
          Scarcity creates urgency that shifts the demand curve.
        </p>

        <h4 style={subheading}>Competitor Dynamics</h4>
        <p>
          In many markets, competitors' prices influence your demand. If your price is significantly
          above the competition, customers may switch. Dynamic pricing strategies must account for
          the competitive landscape.
        </p>

        <h4 style={subheading}>Customer Sentiment</h4>
        <p>
          How customers <em>feel</em> about your pricing matters. Prices perceived as unfair can
          damage brand perception and reduce future demand. Dynamic pricing must balance short-term
          revenue with long-term customer relationships.
        </p>
      </Section>

      <Section title="Real-World Examples">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Example
            icon="🚗"
            title="Ride-Sharing (Uber, Lyft)"
            text="Surge pricing during peak hours — prices rise when more riders are requesting than drivers are available."
          />
          <Example
            icon="🛒"
            title="E-Commerce (Amazon, Walmart)"
            text="Online retailers change prices thousands of times per day based on demand, competitor prices, and inventory levels."
          />
          <Example
            icon="🏨"
            title="Hotels (Marriott, Hilton)"
            text="Room rates fluctuate based on occupancy, local events, day of week, and booking lead time."
          />
          <Example
            icon="🎵"
            title="Event Tickets (Ticketmaster, StubHub)"
            text="Ticket prices adjust based on artist popularity, seat location, and how quickly tickets are selling."
          />
        </div>
      </Section>

      <Section title="What This Sandbox Teaches">
        <p>
          The Dynamic Pricing Sandbox lets you experience these concepts hands-on through four
          progressively challenging scenarios:
        </p>
        <ol style={{ paddingLeft: 20, lineHeight: 1.8, color: colors.text }}>
          <li><strong>E-Commerce</strong> — Learn the basics: how price changes affect demand and revenue in a high-elasticity market.</li>
          <li><strong>Ride-Share</strong> — Practice surge pricing with moderate elasticity and limited supply.</li>
          <li><strong>Hotel</strong> — Manage inelastic demand where pricing too low means leaving money on the table.</li>
          <li><strong>Event Tickets</strong> — Handle high volume, high elasticity, and the pressure of a large inventory.</li>
        </ol>
      </Section>

      <Section title="Further Reading">
        <p>If you want to explore dynamic pricing beyond the Sandbox, consider these topics:</p>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8, color: colors.text }}>
          <li>Price discrimination and market segmentation</li>
          <li>Auction theory and mechanism design</li>
          <li>Revenue management in airlines and hospitality</li>
          <li>Algorithmic pricing and machine learning applications</li>
          <li>Ethical considerations in automated pricing</li>
          <li>Behavioral economics and pricing psychology</li>
        </ul>
      </Section>
    </ContentPage>
  );
}

// Shared content page wrapper
export function ContentPage({ title, onBack, children }) {
  return (
    <div style={{ minHeight: '100vh', background: colors.background, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
        {/* Back navigation */}
        <button
          onClick={onBack}
          aria-label="Back to level select"
          style={{
            background: 'none',
            border: 'none',
            fontSize: 14,
            color: colors.primary,
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: 24,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ← Back to Level Select
        </button>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <img
              src={process.env.PUBLIC_URL + '/dynamic-pricing-sandbox-icon.svg'}
              alt=""
              style={{ width: 32, height: 32 }}
            />
            <h1 style={{ fontSize: 22, fontWeight: 700, color: colors.text, margin: 0 }}>
              {title}
            </h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: colors.text, marginBottom: 10, marginTop: 0 }}>
        {title}
      </h3>
      <div style={{ fontSize: 13, lineHeight: 1.7, color: colors.text }}>
        {children}
      </div>
    </div>
  );
}

function Example({ icon, title, text }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 14px', background: '#f8fafc', borderRadius: 10 }}>
      <span style={{ fontSize: 24 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, color: colors.text }}>{title}</div>
        <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>{text}</div>
      </div>
    </div>
  );
}

const subheading = {
  fontSize: 14,
  fontWeight: 600,
  color: colors.text,
  marginTop: 16,
  marginBottom: 6,
};
