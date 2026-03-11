import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  calculateDemand, resolveSales, calculateSentiment,
  updateCompetitorPrice, generateDemandCurve,
} from '../engine';
import { colors, cardStyle, primaryButton, secondaryButton } from '../styles';

const TICK_INTERVAL = 1200; // 1.2 seconds

export default function Gameplay({ scenario, onFinish, onBack }) {
  const [tick, setTick] = useState(0);
  const [price, setPrice] = useState(scenario.basePrice);
  const [inventory, setInventory] = useState(scenario.initialInventory);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSold, setTotalSold] = useState(0);
  const [history, setHistory] = useState([]);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [sentiment, setSentiment] = useState(scenario.sentimentBase);

  // Competitor state
  const [compPrice, setCompPrice] = useState(scenario.competitorBase);
  const [compRevenue, setCompRevenue] = useState(0);

  const priceRef = useRef(price);
  const inventoryRef = useRef(inventory);
  const tickRef = useRef(tick);
  const runningRef = useRef(running);
  const compPriceRef = useRef(compPrice);

  useEffect(() => { priceRef.current = price; }, [price]);
  useEffect(() => { inventoryRef.current = inventory; }, [inventory]);
  useEffect(() => { tickRef.current = tick; }, [tick]);
  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { compPriceRef.current = compPrice; }, [compPrice]);

  const processTick = useCallback(() => {
    if (!runningRef.current) return;

    const currentTick = tickRef.current;
    const currentPrice = priceRef.current;
    const currentInventory = inventoryRef.current;
    const currentCompPrice = compPriceRef.current;

    if (currentTick >= scenario.timeLimit || currentInventory <= 0) {
      setRunning(false);
      return;
    }

    // User demand & sales
    const demand = calculateDemand(scenario, currentPrice, currentTick);
    const result = resolveSales(demand, currentPrice, currentInventory);
    const sent = calculateSentiment(scenario, currentPrice, currentCompPrice);

    // Competitor demand & revenue (for comparison — competitor has unlimited inventory)
    const compDemand = calculateDemand(scenario, currentCompPrice, currentTick);
    const compTickRevenue = compDemand * currentCompPrice;

    // Update competitor price for next tick
    const nextCompPrice = updateCompetitorPrice(scenario, currentCompPrice, currentPrice);

    const record = {
      tick: currentTick + 1,
      revenue: result.revenue,
      price: currentPrice,
      demand,
      sold: result.sold,
      compPrice: currentCompPrice,
      compRevenue: compTickRevenue,
    };

    setHistory((prev) => [...prev, record]);
    setInventory(result.remainingInventory);
    setTotalRevenue((prev) => prev + result.revenue);
    setTotalSold((prev) => prev + result.sold);
    setSentiment(sent);
    setTick(currentTick + 1);
    setCompPrice(nextCompPrice);
    setCompRevenue((prev) => prev + compTickRevenue);

    inventoryRef.current = result.remainingInventory;
    tickRef.current = currentTick + 1;
    compPriceRef.current = nextCompPrice;

    if (currentTick + 1 >= scenario.timeLimit || result.remainingInventory <= 0) {
      setRunning(false);
    }
  }, [scenario]);

  // Tick timer
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(processTick, TICK_INTERVAL);
    return () => clearInterval(timer);
  }, [running, processTick]);

  // Detect simulation end
  useEffect(() => {
    if (started && !running && (tick >= scenario.timeLimit || inventory <= 0)) {
      onFinish(totalRevenue);
    }
  }, [running, started, tick, inventory, scenario.timeLimit, totalRevenue, onFinish]);

  const handleStart = () => {
    setStarted(true);
    setRunning(true);
  };

  const handlePauseResume = () => {
    setRunning((r) => !r);
  };

  // Demand curve data
  const demandCurveData = generateDemandCurve(scenario, tick);

  // Cumulative revenue for chart (user + competitor)
  const revenueSeries = history.reduce((acc, h) => {
    const prevUser = acc.length > 0 ? acc[acc.length - 1].cumRevenue : 0;
    const prevComp = acc.length > 0 ? acc[acc.length - 1].cumCompRevenue : 0;
    acc.push({
      tick: h.tick,
      cumRevenue: prevUser + h.revenue,
      cumCompRevenue: prevComp + h.compRevenue,
    });
    return acc;
  }, []);

  const avgPrice = totalSold > 0 ? (totalRevenue / totalSold).toFixed(2) : '—';

  // Sentiment emoji and color
  const sentimentEmoji = sentiment > 70 ? '😊' : sentiment > 45 ? '😐' : '😠';
  const sentimentColor = sentiment > 70 ? colors.success : sentiment > 45 ? colors.warning : colors.danger;

  // Inventory color
  const invPercent = (inventory / scenario.initialInventory) * 100;
  const invColor = invPercent > 50 ? colors.primary : invPercent > 20 ? colors.warning : colors.danger;

  return (
    <div style={{ minHeight: '100vh', background: colors.background, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px 16px 32px' }}>
        {/* Header bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <button
            onClick={onBack}
            aria-label="Back to level select"
            style={{
              background: 'none',
              border: 'none',
              fontSize: 18,
              cursor: 'pointer',
              color: colors.textSecondary,
              padding: '2px 6px',
            }}
          >
            ←
          </button>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 18 }}>{scenario.icon}</span>{' '}
            <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{scenario.name}</span>
            <span style={{ fontSize: 11, color: colors.textSecondary, marginLeft: 6 }}>
              {scenario.subtitle}
            </span>
          </div>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            color: colors.textSecondary,
            background: colors.card,
            padding: '4px 10px',
            borderRadius: 6,
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
          }}>
            Tick {tick}/{scenario.timeLimit}
          </div>
        </div>

        {/* Price Slider */}
        <div style={{ ...cardStyle, padding: 14, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Price
            </span>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 22,
              fontWeight: 700,
              color: colors.primary,
            }}>
              ${price}
            </span>
          </div>
          <input
            type="range"
            min={scenario.minPrice}
            max={scenario.maxPrice}
            step={1}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            aria-label="Price slider"
            style={{ width: '100%', accentColor: colors.primary }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: colors.textSecondary, marginTop: 2 }}>
            <span>${scenario.minPrice}</span>
            <span>Base: ${scenario.basePrice}</span>
            <span>${scenario.maxPrice}</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {!started ? (
            <button onClick={handleStart} style={{ ...primaryButton, fontSize: 13, padding: '10px 22px' }}>
              ▶ Start Simulation
            </button>
          ) : (
            <button onClick={handlePauseResume} style={{ ...(running ? secondaryButton : primaryButton), fontSize: 13, padding: '10px 22px' }}>
              {running ? '⏸ Pause' : '▶ Resume'}
            </button>
          )}
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <StatCard label="Your Revenue" value={`$${totalRevenue.toLocaleString()}`} />
          <StatCard label="Comp. Revenue" value={`$${compRevenue.toLocaleString()}`} muted />
          <StatCard label="Units Sold" value={`${totalSold} / ${scenario.initialInventory}`} />
          <StatCard label="Avg Price" value={avgPrice !== '—' ? `$${avgPrice}` : '—'} />
        </div>

        {/* Visualizations Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 12,
          marginBottom: 12,
        }}>
          {/* Live Demand Curve */}
          <div style={{ ...cardStyle, padding: 14 }}>
            <div style={chartTitle}>Live Demand Curve</div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={demandCurveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="price" tick={{ fontSize: 9 }} label={{ value: 'Price ($)', position: 'insideBottom', offset: -2, style: { fontSize: 9 } }} />
                <YAxis tick={{ fontSize: 9 }} label={{ value: 'Demand', angle: -90, position: 'insideLeft', style: { fontSize: 9 } }} />
                <Tooltip formatter={(val) => [val, 'Demand']} labelFormatter={(l) => `$${l}`} />
                <Area type="monotone" dataKey="demand" stroke={colors.primary} fill="#dbeafe" />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 10, color: colors.textSecondary, textAlign: 'center', marginTop: 2 }}>
              You: <strong style={{ color: colors.primary }}>${price}</strong>
              {' · '}
              Competitor: <strong style={{ color: '#94a3b8' }}>${compPrice}</strong>
            </div>
          </div>

          {/* Revenue Over Time */}
          <div style={{ ...cardStyle, padding: 14 }}>
            <div style={chartTitle}>Revenue Over Time</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="tick" tick={{ fontSize: 9 }} label={{ value: 'Tick', position: 'insideBottom', offset: -2, style: { fontSize: 9 } }} />
                <YAxis tick={{ fontSize: 9 }} label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft', style: { fontSize: 9 } }} />
                <Tooltip formatter={(val) => [`$${val.toLocaleString()}`, '']} />
                <Line type="monotone" dataKey="cumRevenue" stroke={colors.primary} strokeWidth={2} dot={false} name="You" />
                <Line type="monotone" dataKey="cumCompRevenue" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="Competitor" />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 4, fontSize: 10, color: colors.textSecondary }}>
              <span><span style={{ color: colors.primary }}>—</span> You</span>
              <span><span style={{ color: '#94a3b8' }}>- -</span> Competitor</span>
            </div>
          </div>
        </div>

        {/* Bottom row: sentiment, price position, inventory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Customer Sentiment Meter */}
          <div style={{ ...cardStyle, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 22 }}>{sentimentEmoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: colors.textSecondary, marginBottom: 4 }}>
                Customer Sentiment
              </div>
              <div style={{ background: '#e2e8f0', borderRadius: 5, height: 10, overflow: 'hidden' }}>
                <div style={{
                  width: `${sentiment}%`,
                  height: '100%',
                  background: sentimentColor,
                  borderRadius: 5,
                  transition: 'width 0.3s, background 0.3s',
                }} />
              </div>
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600, color: sentimentColor, minWidth: 36, textAlign: 'right' }}>
              {Math.round(sentiment)}%
            </div>
          </div>

          {/* Price Position Indicator — now with competitor badge */}
          <div style={{ ...cardStyle, padding: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: colors.textSecondary, marginBottom: 6 }}>
              Price Position
            </div>
            <div style={{ position: 'relative', height: 36, background: '#f1f5f9', borderRadius: 8, overflow: 'visible' }}>
              {/* Min/Base/Max markers */}
              <PriceMarker value={scenario.minPrice} min={scenario.minPrice} max={scenario.maxPrice} label={`$${scenario.minPrice}`} />
              <PriceMarker value={scenario.basePrice} min={scenario.minPrice} max={scenario.maxPrice} label={`$${scenario.basePrice}`} isBase />
              <PriceMarker value={scenario.maxPrice} min={scenario.minPrice} max={scenario.maxPrice} label={`$${scenario.maxPrice}`} />
              {/* Competitor price badge */}
              <div style={{
                position: 'absolute',
                left: `${((compPrice - scenario.minPrice) / (scenario.maxPrice - scenario.minPrice)) * 100}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                background: '#94a3b8',
                color: '#fff',
                padding: '2px 7px',
                borderRadius: 10,
                fontSize: 10,
                fontWeight: 600,
                fontFamily: "'DM Mono', monospace",
                whiteSpace: 'nowrap',
                zIndex: 1,
              }}>
                ${compPrice}
              </div>
              {/* User price badge */}
              <div style={{
                position: 'absolute',
                left: `${((price - scenario.minPrice) / (scenario.maxPrice - scenario.minPrice)) * 100}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                background: colors.primary,
                color: '#fff',
                padding: '2px 8px',
                borderRadius: 10,
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "'DM Mono', monospace",
                whiteSpace: 'nowrap',
                zIndex: 2,
              }}>
                ${price}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 20, fontSize: 10, color: colors.textSecondary }}>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: colors.primary, marginRight: 4, verticalAlign: 'middle' }} />You</span>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#94a3b8', marginRight: 4, verticalAlign: 'middle' }} />Competitor</span>
            </div>
          </div>

          {/* Inventory / Scarcity Gauge */}
          <div style={{ ...cardStyle, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: colors.textSecondary, marginBottom: 4 }}>
                Inventory
              </div>
              <div style={{ background: '#e2e8f0', borderRadius: 5, height: 10, overflow: 'hidden' }}>
                <div style={{
                  width: `${invPercent}%`,
                  height: '100%',
                  background: invColor,
                  borderRadius: 5,
                  transition: 'width 0.3s, background 0.3s',
                }} />
              </div>
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600, color: invColor, minWidth: 70, textAlign: 'right' }}>
              {inventory}/{scenario.initialInventory} {scenario.unit}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, muted }) {
  return (
    <div style={{
      ...cardStyle,
      flex: '1 1 120px',
      textAlign: 'center',
      padding: '10px 8px',
    }}>
      <div style={{ fontSize: 9, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 700, color: muted ? '#94a3b8' : colors.text, marginTop: 2 }}>
        {value}
      </div>
    </div>
  );
}

function PriceMarker({ value, min, max, label, isBase }) {
  const pos = ((value - min) / (max - min)) * 100;
  return (
    <div style={{
      position: 'absolute',
      left: `${pos}%`,
      bottom: -16,
      transform: 'translateX(-50%)',
      fontSize: 9,
      color: isBase ? colors.text : colors.textSecondary,
      fontWeight: isBase ? 600 : 400,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </div>
  );
}

const chartTitle = {
  fontSize: 11,
  fontWeight: 600,
  color: colors.textSecondary,
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};
