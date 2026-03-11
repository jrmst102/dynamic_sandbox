# Dynamic Pricing Sandbox — MVP Specifications

---

## 1. Document Purpose

This document defines the scope, requirements, and technical specifications for the Minimum Viable Product (MVP) of the Dynamic Pricing Sandbox. The MVP establishes the core educational simulation experience. Features such as user management, competitor AI, and random market events are explicitly deferred to subsequent releases.

---

## 2. MVP Scope Summary

### 2.1 What Is Included

| Area | Included in MVP |
|------|----------------|
| Scenarios | All 4 (E-Commerce, Ride-Share, Hotel, Event Tickets) |
| Sequential unlocking | Yes — 60% efficiency required to advance |
| Simulation engine | Demand calculation, sales resolution, time system |
| Competitor AI | No — deferred to Release 2 |
| Random market events | No — deferred to Release 2 |
| Customer sentiment | Simplified — based on price position within the scenario's range rather than competitor comparison |
| Visualizations | All 6 (demand curve, revenue chart, sentiment meter, price position indicator, inventory gauge, grade screen) |
| Help page | "What is Dynamic Pricing?" — included |
| Terms and Conditions | Included |
| Privacy Policy | Included |
| User management | No — deferred to Release 2 |
| Authentication | No — the MVP is publicly accessible without login |

### 2.2 What Is Deferred

| Feature | Target Release | Reason for Deferral |
|---------|---------------|---------------------|
| User management module | Release 2 | Requires backend infrastructure, database, and the full UMM package |
| Competitor AI | Release 2 | Adds strategic complexity; the MVP focuses on core price-demand mechanics |
| Random market events | Release 2 | Adds volatility; the MVP teaches fundamentals with predictable demand |
| Self-service password reset (SMTP) | Release 2 | Depends on user management |
| Audit logging | Release 2 | Depends on user management |
| Mobile-optimized layout (<640px) | Future | MVP supports 640px–1440px |
| Tutorial overlay | Future | Nice-to-have guided walkthrough |
| Leaderboard | Future | Requires persistent storage and user accounts |
| AI pricing advisor | Future | Requires API integration |

---

## 3. Functional Requirements

### 3.1 Scenario System

The MVP includes all four industry scenarios with the following configurations:

| # | Scenario | Context | Base Price | Price Range | Inventory | Elasticity | Demand Base |
|---|----------|---------|-----------|-------------|-----------|------------|-------------|
| 1 | E-Commerce | Holiday flash sale on wireless headphones | $79 | $29–$149 | 200 units | 1.4 | 12 |
| 2 | Ride-Share | Friday night surge pricing in a metro area | $15 | $8–$45 | 80 rides | 1.1 | 8 |
| 3 | Hotel | Convention weekend room rate management | $180 | $89–$450 | 60 rooms | 0.9 | 5 |
| 4 | Event Tickets | Summer music festival ticket sales | $120 | $49–$299 | 500 tickets | 1.6 | 25 |

### 3.2 Sequential Unlocking

- Scenario 1 (E-Commerce) is unlocked by default.
- Each subsequent scenario unlocks only when the user achieves a pricing efficiency score of 60% or higher on the preceding scenario.
- Users may replay any previously unlocked scenario at any time.
- The highest score per scenario is retained across replays for the duration of the browser session.
- Scores are held in memory only. Closing the browser resets all progress. Persistent scoring is deferred to Release 2 (requires user accounts).

### 3.3 Simulation Engine

#### 3.3.1 Time System
- Each scenario runs for 30 ticks (rounds).
- Each tick advances automatically every 1.2 seconds while the simulation is running.
- The simulation ends when all ticks are exhausted or inventory reaches zero, whichever comes first.
- Users may pause and resume at any point during the simulation.

#### 3.3.2 Demand Calculation
Demand per tick is computed as:

```
demand = demandBase × (1 / priceRatio)^elasticity × timeFactor
```

Where:
- `priceRatio` = currentPrice / basePrice
- `timeFactor` = 1 + 0.3 × sin((tick / timeLimit) × π), simulating a natural demand wave over the scenario duration

Demand is rounded to the nearest integer and floored at zero.

Note: The `eventMultiplier` parameter documented in the full specification is not applied in the MVP, as random market events are deferred. The formula is structured so that the multiplier can be introduced in Release 2 without modifying existing logic.

#### 3.3.3 Sales Resolution
- Units sold per tick = min(demand, remaining inventory)
- Revenue per tick = units sold × current price
- Inventory decreases by units sold each tick

#### 3.3.4 Customer Sentiment (Simplified)

In the MVP, with no competitor AI, sentiment is calculated based on the user's price position within the scenario's price range:

```
sentiment = 100 − ((currentPrice − minPrice) / (maxPrice − minPrice)) × 80
```

Sentiment is clamped between 0 and 100. This provides a meaningful feedback signal — pricing high reduces sentiment, pricing low increases it — without requiring a competitor reference point. In Release 2, sentiment will transition to the competitor-relative formula described in the full specification.

### 3.4 Scoring & Grading

At the end of each scenario, the user receives a grade based on pricing efficiency:

```
efficiency = (totalRevenue / optimalRevenue) × 100
```

| Efficiency | Grade | Unlocks Next? |
|-----------|-------|---------------|
| 90–100% | A+ | Yes |
| 80–89% | A | Yes |
| 70–79% | B+ | Yes |
| 60–69% | B | Yes |
| 45–59% | C | No |
| 0–44% | D | No |

Optimal revenue benchmarks per scenario:

| Scenario | Optimal Revenue |
|----------|----------------|
| E-Commerce | $4,200 |
| Ride-Share | $1,800 |
| Hotel | $8,500 |
| Event Tickets | $28,000 |

Note: These benchmarks may require recalibration for the MVP given the absence of competitor AI and random events. Playtesting during development should verify that a skilled user can realistically achieve 90%+ efficiency and a casual user can achieve 60%+ with reasonable effort.

### 3.5 User Controls

| Control | Type | Behavior |
|---------|------|----------|
| Price slider | Range input | Adjustable at any time, including mid-simulation. Immediately affects the next tick's demand calculation. |
| Start button | Action | Begins the simulation from tick 0. |
| Pause / Resume | Toggle | Halts or resumes the tick timer without resetting state. |
| Back arrow | Navigation | Returns to the level select menu (abandons current run). |
| Retry Level | Action (results screen) | Resets and replays the current scenario. |
| Next Scenario | Action (results screen) | Advances to the next scenario (visible only if the user scored 60%+). |

---

## 4. Content Pages

### 4.1 Help Page — "What is Dynamic Pricing?"

A standalone content page accessible from the level select screen. The page provides an educational overview covering:

- A plain-language definition of dynamic pricing.
- Core concepts: price elasticity of demand, the demand curve, revenue optimization, inventory and scarcity, competitor dynamics, and customer sentiment.
- Real-world examples mapped to each of the four Sandbox scenarios (ride-sharing, airlines/e-commerce, hotels, event tickets).
- A description of what the Sandbox teaches and how the four scenarios build on each other.
- Suggested further reading topics for users who want to explore beyond the Sandbox.

The full content for this page is defined in the companion document: `Help_What_is_Dynamic_Pricing.md`.

### 4.2 Terms and Conditions

A standalone content page accessible from the level select screen. The terms establish:

- Dr. Jose Mendoza as the author and rights holder.
- The requirement for express written authorization to use the Application.
- MIT License with attribution requirement.
- Educational and non-commercial use only.
- Disclaimer of all warranties ("as is," no warranty of any kind).
- Zero-dollar liability cap.
- New York governing law.

The full content for this page is defined in the companion document: `Terms_and_Conditions.md`.

Note: In the MVP (no user accounts), the Terms and Conditions page is informational. Users are not required to accept the terms through a clickthrough mechanism. Clickthrough acceptance will be implemented in Release 2 as part of the user account creation flow.

### 4.3 Privacy Policy

A standalone content page accessible from the level select screen. The policy covers:

- Data controller identification (Dr. Jose Mendoza).
- Information collected, purpose of collection, and data storage practices.
- Security measures, data retention, and deletion procedures.
- Third-party disclosure policy.
- User rights regarding their personal information.
- Children's privacy protections.

The full content for this page is defined in the companion document: `Privacy_Policy.md`.

Note: In the MVP, no personal data is collected (there are no user accounts). The Privacy Policy is included to establish the framework in advance of Release 2. The page should include a visible note stating: "The current version of the Dynamic Pricing Sandbox does not require an account and does not collect personal information. This Privacy Policy describes the data practices that will apply when user accounts are introduced in a future release."

### 4.4 Navigation to Content Pages

The level select screen must include clearly visible links to all three content pages. Recommended placement is in the footer area of the level select screen:

- "What is Dynamic Pricing?" (links to help page)
- "Terms and Conditions" (links to T&C page)
- "Privacy Policy" (links to privacy policy page)

Each content page must include a back navigation element to return to the level select screen.

---

## 5. Visual & UI Requirements

### 5.1 Design Language

- **Style**: Light, clean, minimal
- **Primary font**: DM Sans (loaded via Google Fonts)
- **Monospace font**: DM Mono (for timers and numerical displays)
- **Primary accent color**: #3b82f6 (blue)
- **Background**: #f8fafc (light gray)
- **Card surfaces**: #ffffff with subtle box shadows and 14px border radius
- **Max content width**: 800px, centered

### 5.2 Required Visual Elements

The interface must include all six of the following data visualizations during active gameplay:

#### 5.2.1 Live Demand Curve
- Type: Area chart
- X-axis: Price (from scenario min to max)
- Y-axis: Demand (units)
- Behavior: Recalculates and redraws each tick to reflect the current time factor
- Highlight: The user's current price point on the curve
- MVP note: Without random events, the curve shifts only due to the time factor sine wave. This produces a gentle, predictable oscillation that helps users learn to read demand changes without overwhelming them.

#### 5.2.2 Revenue Over Time
- Type: Line chart
- X-axis: Tick number
- Y-axis: Revenue ($)
- Lines: User revenue (solid blue). In the MVP, only the user's line is displayed. The competitor revenue line (dashed gray) is added in Release 2.
- Accumulates data points as the simulation progresses.

#### 5.2.3 Customer Sentiment Meter
- Type: Horizontal progress bar with emoji indicator
- Range: 0–100%
- Visual states: 😊 (>70), 😐 (46–70), 😠 (≤45)
- Color: Green / Yellow / Red corresponding to state
- Updates each tick based on the simplified sentiment formula (see §3.3.4)

#### 5.2.4 Price Position Indicator
- Type: Horizontal position indicator
- In the MVP (no competitor), this displays the user's price (blue badge) positioned along the scenario's price range, with labeled markers at the min, base, and max price points.
- In Release 2, this will be expanded to include the competitor price badge.

#### 5.2.5 Inventory / Scarcity Gauge
- Type: Horizontal progress bar
- Shows remaining inventory as a fraction of total (e.g., "142/200 units")
- Color transitions: Blue (>50%) → Amber (21–50%) → Red (≤20%)
- Depletes as sales are made

#### 5.2.6 Pricing Grade / Score
- Displayed on the results screen after each scenario ends
- Large circular badge showing letter grade
- Numerical breakdown: total revenue, optimal revenue, efficiency percentage
- Color-coded to grade tier
- Contextual feedback message (e.g., "Pricing genius!" for A+)

### 5.3 Stat Cards

Three summary stat cards displayed in a row during gameplay:
- **Revenue**: Cumulative dollar total
- **Units Sold**: Count vs. starting inventory
- **Average Price**: Revenue ÷ units sold

### 5.4 Screens

| Screen | Trigger | Key Elements |
|--------|---------|-------------|
| Level Select (Menu) | App launch, back navigation | Title, description, 4 scenario cards with lock/grade state, footer links to Help/Terms/Privacy |
| Help Page | User clicks "What is Dynamic Pricing?" | Educational content with back navigation |
| Terms and Conditions | User clicks "Terms and Conditions" | Legal content with back navigation |
| Privacy Policy | User clicks "Privacy Policy" | Policy content with back navigation |
| Gameplay | User selects an unlocked scenario | All 6 visualizations, price slider, controls, stat cards |
| Results | Simulation ends | Grade badge, revenue breakdown, retry/next buttons |

---

## 6. Non-Functional Requirements

### 6.1 Performance
- All chart updates must render within a single animation frame (< 16ms) to maintain smooth 60fps interaction.
- The 1.2-second tick interval must remain stable regardless of chart complexity.
- The application must handle 30 data points in the revenue chart without degradation.

### 6.2 Responsiveness
- The layout must be usable at viewport widths from 640px to 1440px.
- Chart grid (2-column) should collapse to single-column below 640px.
- Stat cards should wrap naturally using flexbox.
- Mobile-optimized layout for screens below 640px is deferred to a future release.

### 6.3 Accessibility
- All interactive controls must be keyboard-navigable.
- The price slider must be operable via arrow keys.
- Color is not the sole indicator of state; text labels and emojis supplement all color-coded elements.
- Charts should include tooltips on hover for precise values.

### 6.4 Browser Compatibility
- Must function in the latest versions of Chrome, Firefox, Safari, and Edge.
- No dependencies on browser storage APIs (localStorage, sessionStorage, IndexedDB).
- All state is held in memory for the duration of the session.

---

## 7. Technology Stack

| Layer | Technology | Details |
|-------|-----------|---------|
| Framework | React | Functional components with hooks |
| Charting | Recharts | All 6 visualizations |
| Styling | Inline styles with CSS variables | Consistent theming |
| Fonts | Google Fonts CDN | DM Sans, DM Mono |
| Build target | Single-file JSX component | No build step required in sandbox environments |
| Source control | GitHub | Repository hosting, branching, pull requests |
| Hosting | DigitalOcean App Platform | Static site deployment from GitHub repository |
| CI/CD | DigitalOcean App Platform auto-deploy | Triggered on push to `main` branch |
| Backend | None | The MVP is entirely client-side |
| Database | None | All state held in memory; no persistence |
| Authentication | None | Publicly accessible; no login required |

### 7.1 Dependencies

- `react` (core framework)
- `recharts` (charting library)
- Google Fonts CDN (external stylesheet for DM Sans and DM Mono)
- No backend services, APIs, or databases required for the MVP.

### 7.2 Deployment Architecture

```
GitHub Repository (main branch)
        │
        ▼
DigitalOcean App Platform
   ┌────────────────────────┐
   │   Static Site Deploy   │
   │                        │
   │   ┌──────────────┐     │
   │   │  index.html   │     │
   │   │  app.jsx      │     │
   │   │  /help        │     │
   │   │  /terms       │     │
   │   │  /privacy     │     │
   │   └──────────────┘     │
   │                        │
   │   CDN-backed delivery  │
   └────────────────────────┘
```

- The application is deployed as a static site on DigitalOcean App Platform.
- Auto-deploy is enabled on the `main` branch of the GitHub repository.
- No server-side processing, database connections, or environment variables are required for the MVP.
- DigitalOcean App Platform provides HTTPS by default.

---

## 8. Data Model (In-Memory Only)

All data structures exist in React state for the duration of the browser session. Nothing is persisted to disk, database, or browser storage.

### 8.1 Scenario Configuration Object

```
{
  id:              string      // Unique identifier (e.g., "ecommerce")
  name:            string      // Display name
  icon:            string      // Emoji icon
  subtitle:        string      // Scenario tagline
  description:     string      // Brief context paragraph
  basePrice:       number      // Default starting price
  minPrice:        number      // Slider minimum
  maxPrice:        number      // Slider maximum
  initialInventory:number      // Starting stock
  elasticity:      number      // Price elasticity of demand
  timeLimit:        number      // Total ticks in scenario (30)
  optimalRevenue:  number      // Benchmark for grading
  sentimentBase:   number      // Starting sentiment score
  demandBase:      number      // Base demand per tick
  unit:            string      // Label for inventory (e.g., "units", "rides")
}
```

### 8.2 Tick History Record

```
{
  tick:        number    // Tick number
  revenue:     number    // Revenue this tick
  price:       number    // User price at this tick
  demand:      number    // Calculated demand
  sold:        number    // Actual units sold
}
```

### 8.3 Application State

```
{
  screen:       "menu" | "help" | "terms" | "privacy" | "playing" | "results"
  currentLevel: number              // Index of active scenario (0–3)
  scores:       { [level]: number } // Best efficiency % per scenario (in-memory only)
  gameKey:      number              // Increment to force re-mount on retry
  finalRevenue: number              // Revenue from most recent completed run
}
```

Note: The `competitorBase` field from the full specification is omitted from the MVP scenario config, as competitor AI is deferred. The `eventMultiplier` field from the tick history is similarly omitted. Both will be added in Release 2.

---

## 9. Release Plan

### 9.1 MVP (This Document)

| Milestone | Description |
|-----------|-------------|
| Core simulation | 4 scenarios, demand calculation, sales resolution, 30-tick time system |
| Visualizations | All 6 charts and indicators |
| Scoring | Efficiency-based grading with sequential unlocking |
| Content pages | Help page, Terms and Conditions, Privacy Policy |
| Deployment | Static site on DigitalOcean App Platform via GitHub |

### 9.2 Release 2 — User Management & Market Dynamics

| Feature | Description |
|---------|-------------|
| User management module | Full UMM integration — accounts, login, logout, admin GUI, audit logging |
| Authentication | Login required to access the Application; express authorization enforced |
| Competitor AI | Simulated competitor with drift and directional pull |
| Random market events | 6 events with demand multipliers and durations |
| Competitor sentiment formula | Sentiment recalculated relative to competitor price |
| Competitor revenue line | Added to the revenue-over-time chart |
| Competitor price badge | Added to the price position indicator |
| Persistent scoring | Scores stored in the database per user account |
| Terms acceptance | Clickthrough acceptance during account creation |
| Account expiration | 120-day default with admin extension |

### 9.3 Future Releases

| Feature | Description |
|---------|-------------|
| Difficulty modes | Easy / Normal / Hard adjusting tick speed and event frequency |
| Tutorial overlay | Guided first-run walkthrough |
| Historical replay | Scrub through past simulation ticks |
| AI pricing advisor | Claude-powered suggestions and explanations |
| Custom scenario builder | User-defined market parameters |
| Leaderboard | Persistent cross-session scoring |
| Export results | PDF report with charts and analysis |
| Mobile layout | Optimized for screens below 640px |

---

## 10. Acceptance Criteria

The MVP is considered complete when all of the following conditions are met:

### 10.1 Simulation
- [ ] All 4 scenarios are playable from start to finish.
- [ ] Demand calculation produces correct results per the formula in §3.3.2.
- [ ] Sales resolution correctly deducts inventory and accumulates revenue.
- [ ] The simulation ends at tick 30 or when inventory reaches zero, whichever comes first.
- [ ] Pause and resume function correctly without resetting state.

### 10.2 Scoring & Progression
- [ ] Efficiency is calculated correctly per §3.4.
- [ ] The correct letter grade is displayed based on efficiency thresholds.
- [ ] Scenario 2 unlocks only after Scenario 1 is completed with 60%+ efficiency.
- [ ] Scenario 3 unlocks only after Scenario 2 is completed with 60%+ efficiency.
- [ ] Scenario 4 unlocks only after Scenario 3 is completed with 60%+ efficiency.
- [ ] The highest score per scenario is retained across replays within the same session.

### 10.3 Visualizations
- [ ] Live demand curve updates each tick and reflects the user's current price point.
- [ ] Revenue-over-time chart accumulates and displays correctly across all 30 ticks.
- [ ] Customer sentiment meter updates each tick with correct emoji and color state.
- [ ] Price position indicator shows the user's price within the scenario range.
- [ ] Inventory gauge depletes correctly and transitions color at 50% and 20% thresholds.
- [ ] Results screen displays the correct grade badge, revenue breakdown, and contextual message.

### 10.4 Content Pages
- [ ] "What is Dynamic Pricing?" help page is accessible from the level select screen.
- [ ] Terms and Conditions page is accessible from the level select screen.
- [ ] Privacy Policy page is accessible from the level select screen and includes the MVP-specific note about no data collection.
- [ ] All three content pages have back navigation to the level select screen.

### 10.5 Deployment
- [ ] The application is deployed and accessible via a public URL on DigitalOcean App Platform.
- [ ] HTTPS is enabled.
- [ ] Auto-deploy from the GitHub `main` branch is configured and functional.
- [ ] The application loads and runs correctly in the latest versions of Chrome, Firefox, Safari, and Edge.

---

## 11. Glossary

| Term | Definition |
|------|-----------|
| **MVP** | Minimum Viable Product; the smallest set of features that delivers the core educational value |
| **Tick** | A single simulation round (1.2 seconds of real time) |
| **Elasticity** | A measure of how sensitive demand is to price changes; higher values mean more sensitivity |
| **Demand curve** | A visualization showing the relationship between price and quantity demanded at a given moment |
| **Pricing efficiency** | The ratio of actual revenue to theoretical optimal revenue, expressed as a percentage |
| **Sentiment** | A proxy for customer satisfaction; in the MVP, based on price position within the range; in Release 2, based on competitor comparison |
| **Optimal revenue** | A pre-calculated benchmark representing the maximum achievable revenue under ideal pricing strategy |
| **UMM** | User Management Module; the reusable authentication and admin package, deferred to Release 2 |
| **Release 2** | The second release, which introduces user accounts, competitor AI, and random market events |

---

*Document version: 1.0*
*Last updated: March 2026*
*Author: Dr. Jose Mendoza*
