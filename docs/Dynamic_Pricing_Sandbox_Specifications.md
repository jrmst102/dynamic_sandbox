# Dynamic Pricing Sandbox — Specifications & Requirements

---

## 1. Project Overview

### 1.1 Purpose
The Dynamic Pricing Sandbox is a browser-based educational simulation that teaches users the fundamentals of dynamic pricing strategy. Users assume the role of a pricing manager across four industry scenarios, adjusting prices in real time while responding to market events, competitor behavior, and shifting demand curves.

### 1.2 Target Audience
- Business and economics students
- Early-career product managers and pricing analysts
- Professionals exploring revenue management concepts
- Educators seeking interactive teaching tools for pricing theory

### 1.3 Core Value Proposition
Unlike static case studies or textbook exercises, the sandbox provides immediate visual feedback on pricing decisions, making abstract economic concepts (elasticity, surplus, price wars) tangible and intuitive through live simulation.

---

## 2. Functional Requirements

### 2.1 Scenario System

The application includes four industry scenarios, each with unique demand dynamics, inventory constraints, and market behavior.

| # | Scenario | Context | Base Price | Price Range | Inventory | Elasticity |
|---|----------|---------|-----------|-------------|-----------|------------|
| 1 | E-Commerce | Holiday flash sale on wireless headphones | $79 | $29–$149 | 200 units | 1.4 |
| 2 | Ride-Share | Friday night surge pricing in a metro area | $15 | $8–$45 | 80 rides | 1.1 |
| 3 | Hotel | Convention weekend room rate management | $180 | $89–$450 | 60 rooms | 0.9 |
| 4 | Event Tickets | Summer music festival ticket sales | $120 | $49–$299 | 500 tickets | 1.6 |

### 2.2 Sequential Unlocking

- Scenario 1 (E-Commerce) is unlocked by default.
- Each subsequent scenario unlocks only when the user achieves a pricing efficiency score of 60% or higher on the preceding scenario.
- Users may replay any previously unlocked scenario at any time.
- The highest score per scenario is retained across replays.

### 2.3 Simulation Engine

#### 2.3.1 Time System
- Each scenario runs for 30 ticks (rounds).
- Each tick advances automatically every 1.2 seconds while the simulation is running.
- The simulation ends when all ticks are exhausted or inventory reaches zero, whichever comes first.
- Users may pause and resume at any point during the simulation.

#### 2.3.2 Demand Calculation
Demand per tick is computed as:

```
demand = demandBase × (1 / priceRatio)^elasticity × timeFactor × eventMultiplier
```

Where:
- `priceRatio` = currentPrice / basePrice
- `timeFactor` = 1 + 0.3 × sin((tick / timeLimit) × π), simulating a natural demand wave over the scenario duration
- `eventMultiplier` = the active event's demand modifier (1.0 if no event is active)

Demand is rounded to the nearest integer and floored at zero.

#### 2.3.3 Sales Resolution
- Units sold per tick = min(demand, remaining inventory)
- Revenue per tick = units sold × current price
- Inventory decreases by units sold each tick

#### 2.3.4 Competitor AI
A simulated competitor adjusts its price each tick using:
- A small random drift: ±3% of the price range
- A directional pull toward the user's price: +$2 if the user is priced higher, −$1 if lower
- Competitor price is clamped within the scenario's min/max price bounds
- Competitor demand and revenue are calculated using the same demand formula for comparison purposes

#### 2.3.5 Random Market Events
- Each tick has a 12% probability of triggering a random event (if no event is currently active).
- Events are drawn from a pool of six:

| Event | Demand Multiplier | Duration (ticks) |
|-------|-------------------|------------------|
| Bad Weather | 0.70× | 4 |
| Local Festival | 1.50× | 3 |
| Viral Review | 1.40× | 3 |
| Road Closure | 0.80× | 3 |
| Celebrity Sighting | 1.60× | 2 |
| Market Dip | 0.75× | 4 |

- Only one event may be active at a time.
- Events display a banner showing the event name, demand impact percentage, and remaining duration.

#### 2.3.6 Customer Sentiment
Sentiment is calculated as:

```
sentiment = sentimentBase − (priceDifference / competitorPrice) × 60
```

Where `priceDifference` = currentPrice − competitorPrice. Sentiment is clamped between 0 and 100.

### 2.4 Scoring & Grading

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

### 2.5 User Controls

| Control | Type | Behavior |
|---------|------|----------|
| Price slider | Range input | Adjustable at any time, including mid-simulation. Immediately affects the next tick's demand calculation. |
| Start button | Action | Begins the simulation from tick 0. |
| Pause / Resume | Toggle | Halts or resumes the tick timer without resetting state. |
| Back arrow | Navigation | Returns to the level select menu (abandons current run). |
| Retry Level | Action (results screen) | Resets and replays the current scenario. |
| Next Scenario | Action (results screen) | Advances to the next scenario (visible only if the user scored 60%+). |

---

## 3. Visual & UI Requirements

### 3.1 Design Language

- **Style**: Light, clean, minimal
- **Primary font**: DM Sans (loaded via Google Fonts)
- **Monospace font**: DM Mono (for timers and numerical displays)
- **Primary accent color**: #3b82f6 (blue)
- **Background**: #f8fafc (light gray)
- **Card surfaces**: #ffffff with subtle box shadows and 14px border radius
- **Max content width**: 800px, centered

### 3.2 Required Visual Elements

The interface must include all six of the following data visualizations, visible during active gameplay:

#### 3.2.1 Live Demand Curve
- Type: Area chart
- X-axis: Price (from scenario min to max)
- Y-axis: Demand (units)
- Behavior: Recalculates and redraws each tick to reflect time factor and active events
- Highlight: The user's current price point on the curve

#### 3.2.2 Revenue Over Time
- Type: Line chart
- X-axis: Tick number
- Y-axis: Revenue ($)
- Lines: User revenue (solid blue), competitor revenue (dashed gray)
- Accumulates data points as the simulation progresses

#### 3.2.3 Customer Sentiment Meter
- Type: Horizontal progress bar with emoji indicator
- Range: 0–100%
- Visual states: 😊 (>70), 😐 (46–70), 😠 (≤45)
- Color: Green / Yellow / Red corresponding to state
- Updates each tick

#### 3.2.4 Competitor Price Comparison
- Type: Horizontal position indicator
- Shows user price (blue badge) and competitor price (gray badge) positioned along the price range
- Labels: "You" and "Competitor" above respective badges

#### 3.2.5 Inventory / Scarcity Gauge
- Type: Horizontal progress bar
- Shows remaining inventory as a fraction of total (e.g., "142/200 units")
- Color transitions: Blue (>50%) → Amber (21–50%) → Red (≤20%)
- Depletes as sales are made

#### 3.2.6 Pricing Grade / Score
- Displayed on the results screen after each scenario ends
- Large circular badge showing letter grade
- Numerical breakdown: total revenue, optimal revenue, efficiency percentage
- Color-coded to grade tier
- Contextual feedback message (e.g., "Pricing genius!" for A+)

### 3.3 Stat Cards

Three summary stat cards displayed in a row during gameplay:
- **Revenue**: Cumulative dollar total
- **Units Sold**: Count vs. starting inventory
- **Average Price**: Revenue ÷ units sold

### 3.4 Event Banner

- Appears conditionally when a random event is active
- Yellow gradient background with amber text
- Shows event name (with emoji), demand impact (e.g., "+50%"), and remaining duration

### 3.5 Screens

| Screen | Trigger | Key Elements |
|--------|---------|-------------|
| Level Select (Menu) | App launch, back navigation | Title, description, 4 scenario cards with lock/grade state |
| Gameplay | User selects an unlocked scenario | All 6 visualizations, price slider, controls, stat cards, event banner |
| Results | Simulation ends | Grade badge, revenue breakdown, retry/next buttons |

---

## 4. Non-Functional Requirements

### 4.1 Performance
- All chart updates must render within a single animation frame (< 16ms) to maintain smooth 60fps interaction.
- The 1.2-second tick interval must remain stable regardless of chart complexity.
- The application must handle 30 data points in the revenue chart without degradation.

### 4.2 Responsiveness
- The layout must be usable at viewport widths from 640px to 1440px.
- Chart grid (2-column) should collapse to single-column below 640px.
- Stat cards should wrap naturally using flexbox.

### 4.3 Accessibility
- All interactive controls must be keyboard-navigable.
- The price slider must be operable via arrow keys.
- Color is not the sole indicator of state; text labels and emojis supplement all color-coded elements.
- Charts should include tooltips on hover for precise values.

### 4.4 Browser Compatibility
- Must function in the latest versions of Chrome, Firefox, Safari, and Edge.
- No dependencies on browser storage APIs (localStorage, sessionStorage, IndexedDB).
- All state is held in memory for the duration of the session.

### 4.5 Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | React (functional components with hooks) |
| Charting | Recharts |
| Styling | Inline styles with CSS variables for theming |
| Fonts | Google Fonts (DM Sans, DM Mono) |
| Build target | Single-file JSX component (no build step required in sandbox environments) |

### 4.6 Dependencies
- `react` (core)
- `recharts` (charting library)
- Google Fonts CDN (external stylesheet)
- No backend services required; the application is entirely client-side.

---

## 5. Data Model

### 5.1 Scenario Configuration Object

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
  timeLimit:       number      // Total ticks in scenario
  optimalRevenue:  number      // Benchmark for grading
  competitorBase:  number      // Competitor starting price
  sentimentBase:   number      // Starting sentiment score
  demandBase:      number      // Base demand per tick
  unit:            string      // Label for inventory (e.g., "units", "rides")
}
```

### 5.2 Tick History Record

```
{
  tick:        number    // Tick number
  revenue:     number    // User revenue this tick
  compRevenue: number    // Competitor revenue this tick
  price:       number    // User price at this tick
  demand:      number    // Calculated demand
  sold:        number    // Actual units sold
}
```

### 5.3 Event Object

```
{
  name:        string    // Display name with emoji
  demandMult:  number    // Multiplier applied to demand
  duration:    number    // Number of ticks the event lasts
}
```

### 5.4 Application State

```
{
  screen:       "menu" | "playing" | "results"
  currentLevel: number              // Index of active scenario (0–3)
  scores:       { [level]: number } // Best efficiency % per scenario
  gameKey:      number              // Increment to force re-mount on retry
  finalRevenue: number              // Revenue from most recent completed run
}
```

---

## 6. Educational Design Notes

### 6.1 Key Learning Objectives
- **Price elasticity**: Users observe that small price changes cause large demand shifts in high-elasticity scenarios (e-commerce, events) vs. small shifts in low-elasticity scenarios (hotels).
- **Revenue optimization**: Users learn that maximizing revenue is not the same as maximizing volume or price — it's the product of both.
- **Market responsiveness**: Random events teach users to adjust strategy dynamically rather than setting a fixed price.
- **Competitive dynamics**: The competitor AI demonstrates how pricing decisions exist in a market context, not in isolation.
- **Customer perception**: The sentiment meter introduces the concept that pricing affects brand perception and long-term value, not just immediate revenue.

### 6.2 Difficulty Progression
The four scenarios are ordered by increasing strategic complexity:
1. **E-Commerce** (high elasticity, large inventory) — forgiving; teaches basic slider interaction and demand curves.
2. **Ride-Share** (moderate elasticity, small inventory) — introduces scarcity pressure and surge dynamics.
3. **Hotel** (low elasticity, small inventory) — rewards patience and precision; price changes have subtle effects.
4. **Event Tickets** (very high elasticity, large inventory) — the most volatile; requires rapid adaptation to events and competitor shifts.

---

## 7. Future Enhancements (Out of Scope)

The following features are not included in the current specification but are candidates for future iterations:

- **Difficulty modes** (Easy / Normal / Hard) adjusting tick speed and event frequency
- **Tutorial overlay** with guided first-run walkthrough
- **Historical replay** allowing users to scrub through past simulation ticks
- **Multi-player mode** where two users compete on pricing in the same market
- **AI pricing advisor** powered by Claude that suggests optimal prices and explains its reasoning
- **Custom scenario builder** allowing users to define their own market parameters
- **Leaderboard** with persistent scoring across sessions
- **Export results** as PDF report with charts and analysis
- **Mobile-optimized layout** for screens below 640px

---

## 8. Glossary

| Term | Definition |
|------|-----------|
| **Tick** | A single simulation round (1.2 seconds of real time) |
| **Elasticity** | A measure of how sensitive demand is to price changes; higher values mean more sensitivity |
| **Demand curve** | A visualization showing the relationship between price and quantity demanded at a given moment |
| **Surge pricing** | Temporarily increasing prices during periods of high demand |
| **Pricing efficiency** | The ratio of actual revenue to theoretical optimal revenue, expressed as a percentage |
| **Sentiment** | A proxy for customer satisfaction, influenced by how the user's price compares to the competitor |
| **Optimal revenue** | A pre-calculated benchmark representing the maximum achievable revenue under ideal pricing strategy |

---

*Document version: 1.0*
*Last updated: March 2026*
