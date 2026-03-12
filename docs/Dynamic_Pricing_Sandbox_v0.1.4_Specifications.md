# Dynamic Pricing Sandbox — Version 0.1.4 Specifications

---

## 1. Document Purpose

This document defines the scope, requirements, and technical specifications for version 0.1.4 of the Dynamic Pricing Sandbox. This release builds on the MVP (v0.1.x) by introducing competitor pricing visibility, configurable simulation pacing, an expanded decision-support interface, promotional pricing mechanics, scenario briefing screens, and LLM-powered post-scenario feedback. User management, authentication, and random market events remain deferred to Release 2.

---

## 2. Version Context

### 2.1 Relationship to Prior Releases

| Version | Status | Summary |
|---------|--------|---------|
| MVP (v0.1.0–v0.1.3) | Released | Core simulation with 4 scenarios, demand calculation, scoring, sequential unlocking, help/terms/privacy pages. No competitor AI, no market events, no user accounts. |
| **v0.1.4 (This Document)** | **In Development** | Competitor price display, configurable tick pacing, decision-support enhancements, discounts/promotions/bundles, scenario briefing screens, LLM-scored feedback. |
| Release 2 (v0.2.x) | Planned | Full competitor AI with behavioral logic, random market events, user management module, persistent scoring, authentication. |

### 2.2 What Is New in v0.1.4

| Feature | Description |
|---------|-------------|
| Scenario 2 replacement | Ride-Share replaced with Airline Seats — pricing a regional flight as departure approaches, teaching yield management and fare-class strategy. |
| Competitor price display | A simulated competitor price is shown each tick for reference. The competitor follows a simple trajectory (no reactive AI). |
| Configurable tick pacing | Tick interval is configurable, with a default of 5 minutes per tick to allow deliberate decision-making. A fast mode (1.2s per tick) is retained for experienced users. |
| Decision-support panel | An expanded information panel providing demand elasticity indicators, revenue-per-tick trends, price sensitivity hints, and contextual tooltips. |
| Discounts, promotions, and bundles | Students can apply time-limited discounts, activate promotional campaigns, and configure product bundles — each with distinct effects on demand and revenue. |
| Scenario briefing screen | An introductory screen presented before each scenario begins, describing the challenge, objectives, key constraints, and strategic hints. |
| Challenge retake | Students can retake any scenario at any time, with clear access from both the results screen and the level select menu. Highest score is retained. |
| LLM-powered feedback | End-of-scenario scoring includes AI-generated qualitative feedback analyzing the student's pricing strategy, with specific suggestions and an invitation to retry. |

### 2.3 What Remains Deferred

| Feature | Target Release | Notes |
|---------|---------------|-------|
| Reactive competitor AI | Release 2 | v0.1.4 uses a scripted competitor price trajectory, not a reactive AI. Full competitor logic (drift, directional pull toward user price) is deferred. |
| Random market events | Release 2 | Demand remains predictable in v0.1.4 to focus on pricing mechanics with promotional tools. |
| User management / authentication | Release 2 | No login, no persistent accounts. |
| Persistent scoring | Release 2 | Scores remain in-memory for the browser session. |
| Competitor sentiment formula | Release 2 | Sentiment continues to use the simplified price-position formula. |

---

## 3. Functional Requirements

### 3.1 Scenario System

Version 0.1.4 replaces the Ride-Share scenario (MVP Scenario 2) with an Airline Seats scenario. The Airline scenario occupies the same position in the difficulty progression — moderate elasticity with scarcity pressure — but introduces yield management concepts that are central to dynamic pricing education. The remaining three scenarios are unchanged from the MVP.

| # | Scenario | Context | Base Price | Price Range | Inventory | Elasticity | Demand Base |
|---|----------|---------|-----------|-------------|-----------|------------|-------------|
| 1 | E-Commerce | Holiday flash sale on wireless headphones | $79 | $29–$149 | 200 units | 1.4 | 12 |
| 2 | Airline Seats | Pricing a regional flight as departure approaches | $180 | $89–$450 | 90 seats | 1.1 | 6 |
| 3 | Hotel | Convention weekend room rate management | $180 | $89–$450 | 60 rooms | 0.9 | 5 |
| 4 | Event Tickets | Summer music festival ticket sales | $120 | $49–$299 | 500 tickets | 1.6 | 25 |

Sequential unlocking rules remain unchanged: Scenario 1 is unlocked by default, and each subsequent scenario requires 60%+ efficiency on the preceding one.

### 3.2 Simulation Engine Updates

#### 3.2.1 Configurable Tick Pacing

The fixed 1.2-second tick interval is replaced with a configurable system:

| Mode | Tick Interval | Total Scenario Duration (30 ticks) | Use Case |
|------|--------------|-------------------------------------|----------|
| **Deliberate** (default) | 5 minutes | 2.5 hours | Classroom exercises, homework assignments, thoughtful analysis |
| **Standard** | 60 seconds | 30 minutes | In-class demonstrations, moderate-paced practice |
| **Fast** | 1.2 seconds | 36 seconds | Quick replays, experienced users, testing |

Implementation details:

- The tick mode is selected on the scenario briefing screen before the simulation starts.
- The selected mode applies for the duration of that scenario run. Changing modes requires restarting the scenario.
- A countdown timer displays the time remaining until the next tick, formatted as `MM:SS` for Deliberate and Standard modes, and as a simple progress bar for Fast mode.
- Pause and resume remain available in all modes.
- The demand formula, scoring, and all game mechanics are identical across modes. Only the wall-clock interval between ticks changes.

#### 3.2.2 Demand Calculation

The core demand formula is unchanged from the MVP:

```
demand = demandBase × (1 / priceRatio)^elasticity × timeFactor × promotionMultiplier
```

Where:

- `priceRatio` = effectivePrice / basePrice (note: `effectivePrice` replaces `currentPrice` — see §3.4 for how discounts, promotions, and bundles modify the effective price)
- `timeFactor` = 1 + 0.3 × sin((tick / timeLimit) × π)
- `promotionMultiplier` = the combined demand effect of any active promotional mechanics (1.0 if none are active; see §3.4)

Demand is rounded to the nearest integer and floored at zero.

#### 3.2.3 Sales Resolution

Unchanged from the MVP:

- Units sold per tick = min(demand, remaining inventory)
- Revenue per tick = units sold × effectivePrice
- Inventory decreases by units sold each tick

#### 3.2.4 Customer Sentiment

The simplified formula from the MVP remains in v0.1.4:

```
sentiment = 100 − ((effectivePrice − minPrice) / (maxPrice − minPrice)) × 80
```

Sentiment is clamped between 0–100. Active promotions use `effectivePrice` (after discount), so running a discount will temporarily improve sentiment. The competitor-relative formula is deferred to Release 2.

### 3.3 Competitor Price Display

#### 3.3.1 Overview

Version 0.1.4 introduces a visible competitor price that students can observe and react to. This is **not** the full reactive competitor AI described in the Release 2 spec. Instead, the competitor follows a pre-scripted price trajectory unique to each scenario.

#### 3.3.2 Competitor Price Trajectory

Each scenario defines a 30-element array of competitor prices, one per tick. These trajectories are deterministic — they do not change in response to the student's pricing decisions. The trajectory is designed to create realistic market pressure and teachable moments.

| Scenario | Competitor Start | Trajectory Behavior | Educational Purpose |
|----------|-----------------|---------------------|---------------------|
| E-Commerce | $75 | Gradually decreases from $75 to $55 over 30 ticks, with a brief spike to $90 around tick 15 | Teaches response to aggressive discounting and flash sales |
| Airline Seats | $170 | Starts at $170, climbs steadily to $350 by tick 25, then plateaus through tick 30 | Illustrates classic airline yield management — prices rise as departure nears and seats become scarce |
| Hotel | $175 | Starts at $175, holds steady through tick 15, then climbs to $280 by tick 30 | Shows convention-weekend rate escalation |
| Event Tickets | $110 | Starts at $110, drops to $70 by tick 10, then rises sharply to $200 by tick 25, and drops to $130 by tick 30 | Demonstrates early-bird vs. last-minute pricing |

#### 3.3.3 Competitor Price Data Structure

```
{
  competitorPrices: number[]   // Array of 30 prices, one per tick (index 0 = tick 1)
}
```

This array is added to each scenario configuration object. The competitor price for the current tick is read directly from the array.

#### 3.3.4 Competitor Visualization

The competitor price is surfaced in two places:

1. **Price Position Indicator** (existing, enhanced): The horizontal bar now shows both the student's price (blue badge, labeled "You") and the competitor's price (gray badge, labeled "Competitor") positioned along the scenario's price range.

2. **Revenue Over Time chart** (existing, enhanced): A second line (dashed gray) is added showing the competitor's hypothetical revenue per tick. Competitor revenue is calculated using the same demand formula with the competitor's price substituted for the student's price (for reference only — it does not affect inventory or the student's score).

### 3.4 Discounts, Promotions, and Bundles

#### 3.4.1 Overview

Students can now apply three types of promotional pricing mechanics during a scenario. These tools modify the effective price and/or demand, teaching students how promotional strategies interact with base pricing decisions.

#### 3.4.2 Discount

A percentage reduction applied directly to the current slider price.

| Property | Value |
|----------|-------|
| Discount levels | 5%, 10%, 15%, 20%, 25% |
| Duration | The discount remains active until the student removes it or the scenario ends |
| Effect on price | `effectivePrice = sliderPrice × (1 − discountPercent)` |
| Effect on demand | None beyond the price reduction (demand increases naturally because the effective price is lower) |
| Limit | Only one discount level may be active at a time |
| UI control | Dropdown selector below the price slider, showing the active discount and resulting effective price |

#### 3.4.3 Promotion

A time-limited campaign that boosts demand at a revenue cost. Unlike discounts, promotions have a fixed duration and a direct demand multiplier.

| Property | Value |
|----------|-------|
| Available promotions | See table below |
| Duration | Fixed per promotion type (cannot be extended; must expire before a new one can start) |
| Effect on price | No direct price change |
| Effect on demand | Applies a `promotionMultiplier` to the demand formula |
| Revenue cost | A flat fee is deducted from cumulative revenue when the promotion is activated |
| Limit | Only one promotion may be active at a time |
| UI control | Button group in the promotions panel; disabled while a promotion is active |

| Promotion | Demand Multiplier | Duration (ticks) | Cost | Educational Purpose |
|-----------|-------------------|------------------|------|---------------------|
| Social Media Blast | 1.30× | 3 | $50 | Low cost, moderate short-term boost |
| Email Campaign | 1.20× | 5 | $80 | Sustained but modest lift |
| Influencer Partnership | 1.50× | 2 | $150 | Expensive, high-impact, very short |
| Loyalty Reward | 1.15× | 6 | $60 | Cheap, long, low multiplier — teaches sustained low-cost tactics |

#### 3.4.4 Bundle

A packaging option that increases the effective price per transaction while also boosting demand (perceived value effect).

| Property | Value |
|----------|-------|
| Available bundles | See table below |
| Duration | Remains active until the student removes it or the scenario ends |
| Effect on price | `effectivePrice = sliderPrice + bundlePremium` |
| Effect on demand | Applies a `bundleDemandMultiplier` to the demand formula |
| Inventory effect | Each bundled sale still consumes 1 unit of inventory |
| Limit | Only one bundle may be active at a time |
| UI control | Toggle cards in the promotions panel showing bundle name, premium, and demand effect |

| Bundle | Price Premium | Demand Multiplier | Available In | Educational Purpose |
|--------|--------------|-------------------|-------------|---------------------|
| Accessory Pack | +$15 | 1.10× | E-Commerce | Upselling with add-ons |
| Checked Bag Bundle | +$35 | 1.08× | Airline Seats | Ancillary revenue bundling |
| Breakfast Included | +$25 | 1.12× | Hotel | Hospitality bundling |
| VIP Experience | +$40 | 1.05× | Event Tickets | Premium tier with lower demand lift |

#### 3.4.5 Combined Effects

When multiple mechanics are active simultaneously (e.g., a discount and a bundle), they compose as follows:

```
effectivePrice = (sliderPrice × (1 − discountPercent)) + bundlePremium
promotionMultiplier = activePromotion.demandMultiplier × activeBundle.demandMultiplier
```

If no discount is active, `discountPercent = 0`. If no bundle is active, `bundlePremium = 0` and `bundleDemandMultiplier = 1.0`. If no promotion is active, `promotionDemandMultiplier = 1.0`.

The effective price is clamped to the scenario's min/max bounds after all modifications.

#### 3.4.6 Promotional Pricing Data Model

Added to the tick history record:

```
{
  tick:              number
  revenue:           number
  price:             number    // Slider price (before modifications)
  effectivePrice:    number    // After discount + bundle
  demand:            number
  sold:              number
  discountPercent:   number    // 0 if none
  activePromotion:   string | null
  activeBundle:      string | null
  promotionCost:     number    // Flat fee deducted this tick (0 if no new promotion activated)
}
```

### 3.5 Scenario Briefing Screen

#### 3.5.1 Purpose

Before each scenario begins, students are presented with a dedicated briefing screen that sets the context, describes the challenge, and outlines key strategic considerations. This replaces the immediate jump from scenario selection to gameplay.

#### 3.5.2 Briefing Screen Content

Each briefing screen contains the following sections:

| Section | Description |
|---------|-------------|
| **Scenario Title & Icon** | The scenario name and emoji icon, displayed prominently |
| **Situation Overview** | A 2–3 paragraph narrative describing the market context, the student's role, and the business challenge (e.g., "You are the pricing manager for an online electronics retailer. A major holiday flash sale begins in one hour...") |
| **Key Metrics** | A summary card showing: base price, price range, starting inventory, elasticity rating (displayed as a qualitative label: Low / Medium / High / Very High), and the optimal revenue target |
| **Competitor Intel** | A brief description of the competitor's expected behavior ("A major competitor is expected to start at $75 and gradually lower prices throughout the sale period.") without revealing the exact trajectory |
| **Strategic Hints** | 2–3 bullet points offering conceptual guidance without prescriptive answers (e.g., "High elasticity means customers are very price-sensitive — small price changes will have large effects on demand.") |
| **Available Tools** | A summary of which promotional mechanics are available in this scenario (discounts, promotions, bundles) with one-line descriptions |
| **Tick Mode Selector** | Radio buttons for Deliberate (5 min), Standard (60s), or Fast (1.2s) tick pacing |
| **Start Button** | "Begin Challenge" button that transitions to the gameplay screen |

#### 3.5.3 Briefing Content Per Scenario

Briefing narratives should be authored as companion content (not auto-generated). Each scenario briefing should be 150–250 words and written in second person ("You are..."). The briefing tone should be professional but engaging, similar to a case study introduction.

#### 3.5.4 Navigation

- From the level select menu, clicking an unlocked scenario opens the briefing screen (not the gameplay screen directly).
- The briefing screen includes a back arrow to return to the level select menu.
- The "Begin Challenge" button starts the simulation.

### 3.6 Decision-Support Panel

#### 3.6.1 Purpose

To support more deliberate pricing decisions (especially in the 5-minute tick mode), v0.1.4 adds an expandable decision-support panel alongside the existing visualizations.

#### 3.6.2 Information Provided

| Element | Type | Description |
|---------|------|-------------|
| Elasticity Indicator | Qualitative badge | Displays the scenario's elasticity as a labeled badge: "Low (0.9)", "Medium (1.1)", "High (1.4)", "Very High (1.6)". Includes a one-sentence explanation (e.g., "Demand is highly sensitive to price changes.") |
| Revenue-per-Tick Trend | Sparkline or mini chart | Shows the last 5 ticks of revenue in a compact sparkline, with an arrow indicating trend direction (rising, falling, flat) |
| Price Sensitivity Hint | Text | A dynamic sentence that updates each tick: "At your current price, a $5 decrease would increase demand by approximately X units." Calculated from the demand formula using a discrete approximation. |
| Demand Forecast | Text + number | "If you hold your current price, expected demand next tick: ~X units." Based on the next tick's time factor and current price. |
| Competitor Price Delta | Text + badge | "Your price is $X above/below the competitor." Color-coded: green if within 10%, yellow if 10–25% above, red if 25%+ above. |
| Inventory Burn Rate | Text | "At the current sell rate, inventory will be depleted in ~X ticks." Calculated from a rolling 3-tick average of units sold. |
| Promotion ROI Indicator | Text (when promotion active) | "Your active promotion has generated an estimated X additional units sold at a cost of $Y, for a net impact of $Z." Calculated by comparing actual demand to a counterfactual (demand without promotion multiplier). |

#### 3.6.3 Layout

The decision-support panel is displayed as a collapsible sidebar or bottom drawer, depending on viewport width. It defaults to expanded in Deliberate mode and collapsed in Fast mode. Students can toggle it at any time.

### 3.7 Challenge Retake

#### 3.7.1 Retake from Results Screen

The existing "Retry Level" button on the results screen is retained and remains the primary retake path. In v0.1.4, this button is visually emphasized and accompanied by a contextual message from the LLM feedback (see §3.8) encouraging the student to try again with specific suggestions.

#### 3.7.2 Retake from Level Select

Students can click any previously unlocked scenario on the level select menu to replay it. If the scenario has been completed before, the scenario card displays the best score and grade. Clicking it opens the briefing screen, from which the student can start a new run.

#### 3.7.3 Score Retention

The highest efficiency score per scenario is retained across all retakes within the browser session. A lower score on a retake does not overwrite a previous higher score.

### 3.8 LLM-Powered Feedback

#### 3.8.1 Overview

At the end of each scenario, the student's pricing history is submitted to an LLM (Claude via the Anthropic API) for qualitative analysis. The LLM generates a personalized feedback report that appears on the results screen alongside the existing grade badge and numerical breakdown.

#### 3.8.2 Feedback Prompt Design

The LLM receives a structured prompt containing:

- The scenario configuration (name, elasticity, base price, inventory, optimal revenue)
- The complete tick history (30 entries with price, effective price, demand, units sold, revenue, active promotions/discounts/bundles)
- The competitor price trajectory
- The final efficiency score and grade
- The student's promotional actions timeline

The system prompt instructs the LLM to respond as an experienced pricing strategy instructor, providing:

1. **Strategy Summary** (2–3 sentences): A high-level characterization of the student's approach (e.g., "You adopted a premium pricing strategy in the first half, then pivoted to aggressive discounting.")
2. **Strengths** (2–3 bullets): Specific moments where the student made effective decisions, referencing tick numbers and outcomes.
3. **Areas for Improvement** (2–3 bullets): Specific missed opportunities or suboptimal decisions, with concrete suggestions.
4. **Key Takeaway** (1 sentence): The single most important lesson from this run.
5. **Retake Prompt** (1 sentence): A motivating suggestion to retry with a specific strategic adjustment.

#### 3.8.3 API Integration

| Property | Value |
|----------|-------|
| Model | `claude-sonnet-4-20250514` |
| Max tokens | 1,000 |
| Request timing | Triggered when the simulation ends (tick 30 or inventory depleted) |
| Error handling | If the API call fails, the results screen displays the standard numerical feedback without the LLM analysis, plus a "Retry Analysis" button |
| Rate considerations | One API call per completed scenario run |

#### 3.8.4 Feedback Display

The LLM feedback is rendered in a card on the results screen, below the grade badge and numerical breakdown. The card uses a distinct background color (light blue, `#eff6ff`) to visually separate it from the quantitative results. A loading spinner is shown while the API response is pending.

#### 3.8.5 Privacy Note

No personally identifiable information is sent to the API. The prompt contains only scenario configuration data and in-session gameplay data (prices, demand, revenue). This is consistent with the MVP's no-data-collection policy.

---

## 4. Visual & UI Requirements

### 4.1 Design Language

Unchanged from the MVP:

- **Style**: Light, clean, minimal
- **Primary font**: DM Sans (Google Fonts)
- **Monospace font**: DM Mono (timers, numerical displays)
- **Primary accent color**: #3b82f6 (blue)
- **Background**: #f8fafc (light gray)
- **Card surfaces**: #ffffff with subtle box shadows and 14px border radius
- **Max content width**: 800px, centered

### 4.2 Updated Visual Elements

All six existing visualizations are retained. The following modifications apply:

| Visualization | Change in v0.1.4 |
|---------------|-------------------|
| Live Demand Curve | No change |
| Revenue Over Time | Add dashed gray competitor revenue line |
| Customer Sentiment Meter | No change (still uses simplified formula with `effectivePrice`) |
| Price Position Indicator | Add competitor price badge (gray) alongside student price badge (blue) |
| Inventory / Scarcity Gauge | No change |
| Pricing Grade / Score | Add LLM feedback card below numerical breakdown |

### 4.3 New Visual Elements

#### 4.3.1 Tick Countdown Timer

- Displayed prominently during gameplay, adjacent to the tick counter
- Format: `MM:SS` for Deliberate and Standard modes; progress bar for Fast mode
- Font: DM Mono
- Color: Neutral gray, transitioning to amber in the final 20% of the interval

#### 4.3.2 Promotional Controls Panel

- Positioned below the price slider
- Three sections: Discounts (dropdown), Promotions (button group), Bundles (toggle cards)
- Active items are highlighted with the primary accent color
- Cost and effect summaries shown inline
- Disabled states for unavailable actions (e.g., promotion already active)

#### 4.3.3 Effective Price Display

- Shown directly below the price slider, between the slider and the promotional controls
- Format: "Effective Price: $XX.XX" (reflects discount and bundle modifications)
- If no modifications are active, displays "Effective Price: $XX.XX (no modifiers)"
- Font: DM Mono, slightly larger than body text

#### 4.3.4 Decision-Support Panel

- Collapsible panel (sidebar on wide viewports, bottom drawer on narrow viewports)
- Toggle button labeled "Strategy Insights" with a lightbulb icon
- Content as described in §3.6.2
- Subtle background: `#f0f9ff`

#### 4.3.5 Scenario Briefing Screen

- Full-screen card layout within the 800px max width
- Scenario icon and title at the top (large)
- Narrative text in body font with comfortable line height
- Key metrics displayed in a grid of small stat cards
- Tick mode selector as a segmented control
- "Begin Challenge" button: primary accent color, full width, bottom of card

### 4.4 Updated Screens

| Screen | Trigger | Key Elements |
|--------|---------|-------------|
| Level Select (Menu) | App launch, back navigation | Title, description, 4 scenario cards with lock/grade/best-score state, footer links to Help/Terms/Privacy |
| **Scenario Briefing** (new) | User selects an unlocked scenario | Situation narrative, key metrics, competitor intel, strategic hints, available tools, tick mode selector, "Begin Challenge" button |
| Help Page | User clicks "What is Dynamic Pricing?" | Educational content with back navigation |
| Terms and Conditions | User clicks "Terms and Conditions" | Legal content with back navigation |
| Privacy Policy | User clicks "Privacy Policy" | Policy content with back navigation |
| Gameplay | User clicks "Begin Challenge" on briefing screen | All 6 visualizations (with competitor enhancements), price slider, effective price display, promotional controls, decision-support panel, tick countdown timer, stat cards |
| Results | Simulation ends | Grade badge, revenue breakdown, LLM feedback card, "Retry Challenge" button, "Next Scenario" button (if unlocked) |

---

## 5. Non-Functional Requirements

### 5.1 Performance

- All chart updates must render within a single animation frame (< 16ms).
- The tick countdown timer must update smoothly (at least once per second in Deliberate/Standard modes).
- The LLM API call on the results screen should complete within 10 seconds. A loading indicator must be shown during the request.
- The application must handle 30 data points per chart line (60 total with competitor line) without degradation.

### 5.2 Responsiveness

Unchanged from MVP: usable at 640px–1440px. The decision-support panel adapts from sidebar (≥900px) to bottom drawer (<900px). Mobile layout (<640px) remains deferred.

### 5.3 Accessibility

Unchanged from MVP, with the following additions:

- Promotional controls must be keyboard-navigable.
- The tick mode selector must be operable via arrow keys.
- The LLM feedback card must be readable by screen readers.
- The decision-support panel toggle must have an accessible label.

### 5.4 Browser Compatibility

Unchanged from MVP: latest Chrome, Firefox, Safari, Edge. No browser storage APIs.

---

## 6. Technology Stack

| Layer | Technology | Details |
|-------|-----------|---------|
| Framework | React | Functional components with hooks |
| Charting | Recharts | All visualizations including new competitor lines |
| Styling | Inline styles with CSS variables | Consistent theming |
| Fonts | Google Fonts CDN | DM Sans, DM Mono |
| LLM Integration | Anthropic API | Claude Sonnet 4 (`claude-sonnet-4-20250514`) for post-scenario feedback |
| Build target | Single-file JSX component | No build step required in sandbox environments |
| Source control | GitHub | Repository hosting, branching, pull requests |
| Hosting | DigitalOcean App Platform | Static site deployment from GitHub repository |
| CI/CD | DigitalOcean App Platform auto-deploy | Triggered on push to `main` branch |
| Backend | None | Client-side only; LLM calls made directly from the browser |
| Database | None | All state held in memory; no persistence |
| Authentication | None | Publicly accessible; no login required |

### 6.1 Dependencies

- `react` (core framework)
- `recharts` (charting library)
- Google Fonts CDN (DM Sans, DM Mono)
- Anthropic API (LLM feedback; called client-side)
- No additional backend services, databases, or npm packages required beyond the MVP.

### 6.2 API Key Handling

The Anthropic API key required for LLM feedback must not be embedded in client-side code. Two acceptable approaches:

1. **Proxy endpoint** (recommended): A lightweight serverless function (e.g., DigitalOcean Functions) that receives the prompt payload from the client, appends the API key server-side, forwards the request to the Anthropic API, and returns the response. The function is deployed alongside the static site.

2. **Environment-injected key**: If the application is deployed in a controlled classroom environment, the API key may be injected at build time via an environment variable and bundled into the static asset. This approach is acceptable only for non-public deployments.

The selected approach must be documented in the repository README.

---

## 7. Data Model (In-Memory Only)

### 7.1 Scenario Configuration Object (Updated)

```
{
  id:                string        // Unique identifier
  name:              string        // Display name
  icon:              string        // Emoji icon
  subtitle:          string        // Scenario tagline
  description:       string        // Brief context paragraph
  briefing:          string        // Full briefing narrative (150–250 words, see §3.5)
  competitorIntel:   string        // Brief competitor description for briefing screen
  strategicHints:    string[]      // 2–3 hint strings for briefing screen
  basePrice:         number        // Default starting price
  minPrice:          number        // Slider minimum
  maxPrice:          number        // Slider maximum
  initialInventory:  number        // Starting stock
  elasticity:        number        // Price elasticity of demand
  timeLimit:         number        // Total ticks (30)
  optimalRevenue:    number        // Benchmark for grading
  sentimentBase:     number        // Starting sentiment score
  demandBase:        number        // Base demand per tick
  unit:              string        // Label for inventory
  competitorPrices:  number[]      // Array of 30 competitor prices
  availableBundle:   BundleConfig  // The bundle option for this scenario
}
```

### 7.2 Tick History Record (Updated)

```
{
  tick:              number
  revenue:           number
  compRevenue:       number        // Competitor hypothetical revenue
  price:             number        // Slider price
  effectivePrice:    number        // After discount + bundle
  demand:            number
  sold:              number
  discountPercent:   number
  activePromotion:   string | null
  activeBundle:      string | null
  promotionCost:     number
  competitorPrice:   number
}
```

### 7.3 Application State (Updated)

```
{
  screen:       "menu" | "briefing" | "help" | "terms" | "privacy" | "playing" | "results"
  currentLevel: number
  scores:       { [level]: number }
  gameKey:      number
  finalRevenue: number
  tickMode:     "deliberate" | "standard" | "fast"
  llmFeedback:  string | null       // LLM response text, null while loading or on error
  llmLoading:   boolean             // True while API request is in flight
}
```

---

## 8. Scoring & Grading

### 8.1 Efficiency Calculation

Unchanged from MVP:

```
efficiency = (totalRevenue / optimalRevenue) × 100
```

Where `totalRevenue` = sum of all tick revenues minus sum of all promotion costs.

### 8.2 Grade Thresholds

Unchanged from MVP:

| Efficiency | Grade | Unlocks Next? |
|-----------|-------|---------------|
| 90–100% | A+ | Yes |
| 80–89% | A | Yes |
| 70–79% | B+ | Yes |
| 60–69% | B | Yes |
| 45–59% | C | No |
| 0–44% | D | No |

### 8.3 Optimal Revenue Benchmarks

The optimal revenue benchmarks may require recalibration given the introduction of promotional mechanics. Playtesting should verify that:

- A skilled student using promotions effectively can achieve 90%+ efficiency.
- A student using only the price slider (no promotions) can still achieve 60%+ with reasonable effort.
- Promotions provide upside but are not required to pass.

Current benchmarks (subject to calibration):

| Scenario | Optimal Revenue |
|----------|----------------|
| E-Commerce | $4,200 |
| Airline Seats | $9,500 |
| Hotel | $8,500 |
| Event Tickets | $28,000 |

### 8.4 LLM Feedback

See §3.8 for full specification. The LLM feedback is a qualitative supplement to the numerical grade. It does not affect the grade calculation or scenario unlocking.

---

## 9. Release Plan

### 9.1 Version 0.1.4 Milestones

| Milestone | Description |
|-----------|-------------|
| M1: Configurable tick pacing | Implement tick mode selector and countdown timer |
| M2: Competitor price display | Add scripted competitor trajectories and update visualizations |
| M3: Promotional mechanics | Implement discounts, promotions, bundles with combined effects |
| M4: Scenario briefing screens | Author briefing content and implement the briefing screen |
| M5: Decision-support panel | Build the collapsible panel with all 7 information elements |
| M6: LLM feedback integration | Integrate Anthropic API, design prompt, render feedback card |
| M7: Calibration & testing | Playtest all scenarios across tick modes, calibrate optimal revenue benchmarks |

### 9.2 Release 2 Preview (Unchanged)

| Feature | Description |
|---------|-------------|
| Full reactive competitor AI | Competitor responds to student pricing with drift and directional pull |
| Random market events | 6 events with demand multipliers and durations |
| User management module | Accounts, login, logout, admin GUI, audit logging |
| Persistent scoring | Scores stored per user account |

---

## 10. Acceptance Criteria

### 10.1 Competitor Price Display

- [ ] Each scenario displays a competitor price on every tick.
- [ ] The price position indicator shows both student and competitor price badges.
- [ ] The revenue-over-time chart displays both student and competitor revenue lines.
- [ ] Competitor prices follow the pre-scripted trajectory and do not react to student input.

### 10.2 Configurable Tick Pacing

- [ ] The briefing screen presents three tick mode options (Deliberate, Standard, Fast).
- [ ] The selected mode determines the tick interval for the entire scenario run.
- [ ] The countdown timer displays correctly in each mode.
- [ ] Pause and resume work correctly in all modes.
- [ ] Scoring and demand calculations are identical across modes.

### 10.3 Promotional Mechanics

- [ ] Students can apply a discount (5–25%) that modifies the effective price.
- [ ] Students can activate one promotion at a time with correct duration, cost, and demand multiplier.
- [ ] Students can enable one bundle per scenario with correct price premium and demand multiplier.
- [ ] Combined effects (discount + bundle + promotion) calculate correctly per §3.4.5.
- [ ] Effective price is clamped to scenario min/max bounds.
- [ ] Promotion costs are deducted from total revenue.
- [ ] Tick history records all promotional state accurately.

### 10.4 Scenario Briefing Screen

- [ ] Clicking an unlocked scenario on the level select menu opens the briefing screen.
- [ ] The briefing screen displays all sections described in §3.5.2.
- [ ] The tick mode selector defaults to Deliberate.
- [ ] "Begin Challenge" transitions to the gameplay screen.
- [ ] Back navigation returns to the level select menu.

### 10.5 Decision-Support Panel

- [ ] The panel is toggleable and displays all 7 information elements from §3.6.2.
- [ ] The panel defaults to expanded in Deliberate mode and collapsed in Fast mode.
- [ ] All dynamic values (sensitivity hint, demand forecast, burn rate, etc.) update each tick.
- [ ] The panel adapts to sidebar or bottom drawer based on viewport width.

### 10.6 LLM Feedback

- [ ] On scenario completion, an API call is made to Claude Sonnet with the structured prompt.
- [ ] The feedback card renders on the results screen with strategy summary, strengths, improvements, takeaway, and retake prompt.
- [ ] A loading spinner is shown while the API response is pending.
- [ ] If the API call fails, the results screen still displays numerical results with a "Retry Analysis" option.
- [ ] No PII is included in the API request.

### 10.7 Challenge Retake

- [ ] The "Retry Challenge" button on the results screen resets and replays the current scenario.
- [ ] Previously unlocked scenarios can be replayed from the level select menu.
- [ ] The highest score per scenario is retained across retakes.

### 10.8 Regression

- [ ] All MVP acceptance criteria from the original specification continue to pass.
- [ ] Help, Terms, and Privacy pages remain accessible and functional.
- [ ] Sequential unlocking logic is unchanged.

---

## 11. Glossary

Additions to the MVP glossary:

| Term | Definition |
|------|-----------|
| **Effective price** | The price used for demand calculation after applying discounts and bundle premiums to the slider price |
| **Promotion** | A time-limited campaign that boosts demand at a flat revenue cost |
| **Bundle** | A packaging option that adds a price premium while providing a modest demand boost |
| **Discount** | A percentage reduction applied to the slider price, lowering the effective price |
| **Tick mode** | The pacing configuration for a scenario run: Deliberate (5 min), Standard (60s), or Fast (1.2s) per tick |
| **Briefing screen** | A pre-scenario introduction that provides context, metrics, competitor intelligence, and strategic hints |
| **Decision-support panel** | A collapsible interface element providing real-time analytical insights to aid pricing decisions |
| **Competitor trajectory** | A pre-scripted sequence of 30 competitor prices, one per tick, that does not react to the student's actions |
| **Yield management** | A pricing strategy originating in the airline industry, where prices are adjusted based on remaining inventory and time until a deadline (e.g., departure), typically increasing as scarcity grows |
| **Promotion ROI** | The net revenue impact of an active promotion, calculated as additional revenue generated minus the promotion's flat cost |

---

*Document version: 0.1.4*
*Last updated: March 2026*
*Author: Dr. Jose Mendoza*
