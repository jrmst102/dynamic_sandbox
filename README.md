# Dynamic Pricing Sandbox

An educational browser-based simulation for learning dynamic pricing strategy. Adjust prices in real time, observe demand shifts, apply promotional tactics, and maximize revenue across four progressively challenging industry scenarios.

## Scenarios

| # | Scenario | Context | Elasticity |
|---|----------|---------|------------|
| 1 | **E-Commerce** 🛒 | Holiday flash sale on wireless headphones | 1.4 (High) |
| 2 | **Airline Seats** ✈️ | Pricing a regional flight as departure approaches | 1.1 (Medium) |
| 3 | **Hotel** 🏨 | Convention weekend room rate management | 0.9 (Low) |
| 4 | **Event Tickets** 🎵 | Summer music festival ticket sales | 1.6 (Very High) |

Scenarios unlock sequentially — score 60% pricing efficiency or higher to advance.

## Features (v0.1.4)

- **Scenario Briefing Screens** — Context, objectives, competitor intel, and strategic hints before each challenge
- **Configurable Tick Pacing** — Deliberate (5 min/tick), Standard (60s), or Fast (1.2s) modes
- **Competitor Price Display** — Scripted competitor pricing shown each tick on the price position indicator and revenue chart
- **Competitive Pressure** — Demand shifts based on your price relative to the competitor's
- **Discounts** — Apply 5–25% price reductions to lower effective price
- **Promotions** — Run time-limited campaigns (Social Media Blast, Email Campaign, Influencer Partnership, Loyalty Reward) with demand multipliers and costs
- **Bundles** — Scenario-specific product bundles that add a price premium and boost demand
- **Decision-Support Panel** — Collapsible insights panel with elasticity indicator, revenue trend, price sensitivity, demand forecast, competitor delta, and inventory burn rate
- **LLM-Powered Feedback** — AI-generated post-scenario strategy analysis via Anthropic Claude
- **Challenge Retake** — Replay any unlocked scenario; highest score retained

## Getting Started

**Prerequisites:** Node.js 22.x, npm 10.x

```bash
npm install
npm start
```

The app runs at `http://localhost:3000`.

## Build for Production

```bash
npm run build
```

The build output in `build/` is a static site ready for deployment.

## LLM Feedback Setup

Post-scenario AI feedback requires a proxy endpoint to securely call the Anthropic API without exposing the API key in client-side code.

### 1. Deploy the proxy function (DigitalOcean Functions)

```bash
# Install and authenticate the DigitalOcean CLI
doctl auth init

# Install serverless plugin and connect to your namespace
doctl serverless install
doctl serverless connect

# Deploy the proxy (set your Anthropic API key in api/.env)
doctl serverless deploy api

# Get the function URL
doctl serverless functions get llm/feedback --url
```

The proxy function lives in `api/packages/llm/feedback/index.js`. It forwards requests to the Anthropic API with the key appended server-side.

### 2. Configure the environment variable

Create a `.env` file in the project root:

```
REACT_APP_LLM_PROXY_URL=https://your-function-url-here
```

For DigitalOcean App Platform: add `REACT_APP_LLM_PROXY_URL` as an App-Level Environment Variable in the app settings.

### 3. API key management

Store your Anthropic API key in `api/.env` (gitignored):

```
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

The key is never embedded in client-side code. No personally identifiable information is sent to the API — only scenario configuration and in-session gameplay data.

## Deployment

The application is deployed as a static site on **DigitalOcean App Platform**, with auto-deploy on push to `main`.

| Setting | Value |
|---------|-------|
| Source | GitHub — `jrmst102/dynamic_sandbox` |
| Branch | `main` |
| Type | Static Site |
| Build Command | `npm run build` |
| Output Directory | `build` |

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 (functional components, hooks) |
| Charting | Recharts 3 |
| Styling | Inline styles with design tokens |
| Fonts | DM Sans, DM Mono (Google Fonts CDN) |
| LLM Integration | Anthropic API (Claude Sonnet 4) via serverless proxy |
| Hosting | DigitalOcean App Platform |
| Serverless | DigitalOcean Functions (LLM proxy) |

## Project Structure

```
src/
├── App.js                  # Main app — screen routing, state management
├── engine.js               # Simulation engine — demand, sales, sentiment, scoring
├── scenarios.js            # Scenario configurations, promotions, discount levels
├── styles.js               # Shared design tokens and style constants
├── index.js                # React entry point
└── components/
    ├── LevelSelect.js      # Level select menu with unlock state and best scores
    ├── ScenarioBriefing.js  # Pre-scenario briefing with metrics and tick mode selector
    ├── Gameplay.js          # Gameplay screen with visualizations and promotional controls
    ├── Results.js           # Grade badge, revenue breakdown, LLM feedback, retry
    ├── HelpPage.js          # "What is Dynamic Pricing?" educational content
    ├── TermsPage.js         # Terms and Conditions
    └── PrivacyPage.js       # Privacy Policy
api/
├── project.yml             # DigitalOcean Functions config
└── packages/llm/feedback/
    └── index.js             # Anthropic API proxy function
```

## License

MIT — see [LICENSE](LICENSE) for details.

## Author

Dr. Jose Mendoza
