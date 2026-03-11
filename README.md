# Dynamic Pricing Sandbox

An educational browser-based simulation for learning dynamic pricing strategy. Adjust prices in real time, observe demand shifts, and maximize revenue across four progressively challenging industry scenarios.

## Scenarios

| # | Scenario | Context | Elasticity |
|---|----------|---------|------------|
| 1 | **E-Commerce** | Holiday flash sale on wireless headphones | 1.4 |
| 2 | **Ride-Share** | Friday night surge pricing in a metro area | 1.1 |
| 3 | **Hotel** | Convention weekend room rate management | 0.9 |
| 4 | **Event Tickets** | Summer music festival ticket sales | 1.6 |

Scenarios unlock sequentially — score 60% pricing efficiency or higher to advance.

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
| Hosting | DigitalOcean App Platform |

## Project Structure

```
src/
├── App.js                  # Main app — screen routing, state management
├── engine.js               # Simulation engine — demand, sales, sentiment, scoring
├── scenarios.js            # Scenario configurations (all 4 industries)
├── styles.js               # Shared design tokens and style constants
├── index.js                # React entry point
└── components/
    ├── LevelSelect.js      # Level select menu with unlock state
    ├── Gameplay.js          # Gameplay screen with 6 visualizations
    ├── Results.js           # Grade badge, revenue breakdown, retry/next
    ├── HelpPage.js          # "What is Dynamic Pricing?" educational content
    ├── TermsPage.js         # Terms and Conditions
    └── PrivacyPage.js       # Privacy Policy
```

## License

MIT — see [LICENSE](LICENSE) for details.

## Author

Dr. Jose Mendoza
