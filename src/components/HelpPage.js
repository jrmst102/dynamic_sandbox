import React from 'react';
import { colors } from '../styles';
import { Card, Button } from '@jrmst102/ui-kit';

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
            title="E-Commerce (Amazon, Walmart)"
            text="Online retailers change prices thousands of times per day based on demand, competitor prices, and inventory levels."
          />
          <Example
            title="Airlines (Delta, United)"
            text="Ticket prices shift based on seat availability, booking window, and route demand — a textbook case of yield management."
          />
          <Example
            title="Hotels (Marriott, Hilton)"
            text="Room rates fluctuate based on occupancy, local events, day of week, and booking lead time."
          />
          <Example
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
          <li><strong>Airline Seats</strong> — Price a regional flight as departure approaches with moderate elasticity and limited seats.</li>
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
    <div className="min-h-screen" style={{ background: colors.background, fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-3xl mx-auto px-5 py-10">
        {/* Back navigation */}
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-6 !text-sm" aria-label="Back to level select">
          ← Back to Level Select
        </Button>

        <Card>
          <div className="flex items-center gap-2.5 mb-5">
            <img
              src={process.env.PUBLIC_URL + '/dynamic-pricing-sandbox-icon.svg'}
              alt=""
              style={{ width: 32, height: 32 }}
            />
            <h1 className="text-xl font-bold m-0" style={{ color: colors.text }}>
              {title}
            </h1>
          </div>
          {children}
        </Card>

        <div className="text-center mt-6 text-xs" style={{ color: colors.textSecondary }}>
          v1.2.0 — © 2026 by Dr. Jose Mendoza
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
      {icon && <span style={{ fontSize: 24 }}>{icon}</span>}
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
