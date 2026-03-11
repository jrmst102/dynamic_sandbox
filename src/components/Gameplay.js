import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  calculateDemand, resolveSales, calculateSentiment,
  generateDemandCurve,
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

  const priceRef = useRef(price);
  const inventoryRef = useRef(inventory);
  const tickRef = useRef(tick);
  const runningRef = useRef(running);

  useEffect(() => { priceRef.current = price; }, [price]);
  useEffect(() => { inventoryRef.current = inventory; }, [inventory]);
  useEffect(() => { tickRef.current = tick; }, [tick]);
  useEffect(() => { runningRef.current = running; }, [running]);

  const processTick = useCallback(() => {
    if (!runningRef.current) return;

    const currentTick = tickRef.current;
    const currentPrice = priceRef.current;
    const currentInventory = inventoryRef.current;

    if (currentTick >= scenario.timeLimit || currentInventory <= 0) {
      setRunning(false);
      return;
    }

    const demand = calculateDemand(scenario, currentPrice, currentTick);
    const result = resolveSales(demand, currentPrice, currentInventory);
    const sent = calculateSentiment(scenario, currentPrice);

    const record = {
      tick: currentTick + 1,
      revenue: result.revenue,
      price: currentPrice,
      demand,
      sold: result.sold,
    };

    setHistory((prev) => [...prev, record]);
    setInventory(result.remainingInventory);
    setTotalRevenue((prev) => prev + result.revenue);
    setTotalSold((prev) => prev + result.sold);
    setSentiment(sent);
    setTick(currentTick + 1);

    inventoryRef.current = result.remainingInventory;
    tickRef.current = currentTick + 1;

    // Check end conditions after this tick
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

  // Detect simulation end — fire onFinish
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

  // Cumulative revenue for chart
  const revenueSeries = history.reduce((acc, h) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].cumRevenue : 0;
    acc.push({ tick: h.tick, cumRevenue: prev + h.revenue });
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
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 20px 40px' }}>
        {/* Header bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button
            onClick={onBack}
            aria-label="Back to level select"
            style={{
              background: 'none',
              border: 'none',
              fontSize: 22,
              cursor: 'pointer',
              color: colors.textSecondary,
              padding: '4px 8px',
            }}
          >
            ←
          </button>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 24 }}>{scenario.icon}</span>{' '}
            <span style={{ fontSize: 18, fontWeight: 600, color: colors.text }}>{scenario.name}</span>
            <span style={{ fontSize: 13, color: colors.textSecondary, marginLeft: 8 }}>
              {scenario.subtitle}
            </span>
          </div>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 14,
            color: colors.textSecondary,
            background: colors.card,
            padding: '6px 14px',
            borderRadius: 8,
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
          }}>
            Tick {tick}/{scenario.timeLimit}
          </div>
        </div>

        {/* Price Slider */}
        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Price
            </span>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 28,
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
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: colors.textSecondary, marginTop: 4 }}>
            <span>${scenario.minPrice}</span>
            <span>Base: ${scenario.basePrice}</span>
            <span>${scenario.maxPrice}</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {!started ? (
            <button onClick={handleStart} style={primaryButton}>
              ▶ Start Simulation
            </button>
          ) : (
            <button onClick={handlePauseResume} style={running ? secondaryButton : primaryButton}>
              {running ? '⏸ Pause' : '▶ Resume'}
            </button>
          )}
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <StatCard label="Revenue" value={`$${totalRevenue.toLocaleString()}`} />
          <StatCard label="Units Sold" value={`${totalSold} / ${scenario.initialInventory}`} />
          <StatCard label="Avg Price" value={avgPrice !== '—' ? `$${avgPrice}` : '—'} />
        </div>

        {/* Visualizations Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 16,
          marginBottom: 16,
        }}>
          {/* 5.2.1 Live Demand Curve */}
          <div style={cardStyle}>
            <div style={chartTitle}>Live Demand Curve</div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={demandCurveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="price" tick={{ fontSize: 11 }} label={{ value: 'Price ($)', position: 'insideBottom', offset: -2, style: { fontSize: 11 } }} />
                <YAxis tick={{ fontSize: 11 }} label={{ value: 'Demand', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                <Tooltip formatter={(val) => [val, 'Demand']} labelFormatter={(l) => `$${l}`} />
                <Area type="monotone" dataKey="demand" stroke={colors.primary} fill="#dbeafe" />
                {/* Current price marker */}
                <XAxis dataKey="price" hide />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 11, color: colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
              Your price: <strong style={{ color: colors.primary }}>${price}</strong>
            </div>
          </div>

          {/* 5.2.2 Revenue Over Time */}
          <div style={cardStyle}>
            <div style={chartTitle}>Revenue Over Time</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="tick" tick={{ fontSize: 11 }} label={{ value: 'Tick', position: 'insideBottom', offset: -2, style: { fontSize: 11 } }} />
                <YAxis tick={{ fontSize: 11 }} label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                <Tooltip formatter={(val) => [`$${val.toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="cumRevenue" stroke={colors.primary} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom row: sentiment, price position, inventory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* 5.2.3 Customer Sentiment Meter */}
          <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 28 }}>{sentimentEmoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 6 }}>
                Customer Sentiment
              </div>
              <div style={{ background: '#e2e8f0', borderRadius: 6, height: 12, overflow: 'hidden' }}>
                <div style={{
                  width: `${sentiment}%`,
                  height: '100%',
                  background: sentimentColor,
                  borderRadius: 6,
                  transition: 'width 0.3s, background 0.3s',
                }} />
              </div>
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 600, color: sentimentColor, minWidth: 40, textAlign: 'right' }}>
              {Math.round(sentiment)}%
            </div>
          </div>

          {/* 5.2.4 Price Position Indicator */}
          <div style={cardStyle}>
            <div style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 8 }}>
              Price Position
            </div>
            <div style={{ position: 'relative', height: 32, background: '#f1f5f9', borderRadius: 8, overflow: 'visible' }}>
              {/* Min/Base/Max markers */}
              <PriceMarker value={scenario.minPrice} min={scenario.minPrice} max={scenario.maxPrice} label={`$${scenario.minPrice}`} />
              <PriceMarker value={scenario.basePrice} min={scenario.minPrice} max={scenario.maxPrice} label={`$${scenario.basePrice}`} isBase />
              <PriceMarker value={scenario.maxPrice} min={scenario.minPrice} max={scenario.maxPrice} label={`$${scenario.maxPrice}`} />
              {/* User price badge */}
              <div style={{
                position: 'absolute',
                left: `${((price - scenario.minPrice) / (scenario.maxPrice - scenario.minPrice)) * 100}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                background: colors.primary,
                color: '#fff',
                padding: '3px 10px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "'DM Mono', monospace",
                whiteSpace: 'nowrap',
                zIndex: 2,
              }}>
                ${price}
              </div>
            </div>
          </div>

          {/* 5.2.5 Inventory / Scarcity Gauge */}
          <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 6 }}>
                Inventory
              </div>
              <div style={{ background: '#e2e8f0', borderRadius: 6, height: 12, overflow: 'hidden' }}>
                <div style={{
                  width: `${invPercent}%`,
                  height: '100%',
                  background: invColor,
                  borderRadius: 6,
                  transition: 'width 0.3s, background 0.3s',
                }} />
              </div>
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 600, color: invColor, minWidth: 80, textAlign: 'right' }}>
              {inventory}/{scenario.initialInventory} {scenario.unit}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{
      ...cardStyle,
      flex: '1 1 140px',
      textAlign: 'center',
      padding: '14px 12px',
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 700, color: colors.text, marginTop: 4 }}>
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
      bottom: -18,
      transform: 'translateX(-50%)',
      fontSize: 10,
      color: isBase ? colors.text : colors.textSecondary,
      fontWeight: isBase ? 600 : 400,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </div>
  );
}

const chartTitle = {
  fontSize: 13,
  fontWeight: 600,
  color: colors.textSecondary,
  marginBottom: 8,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};
