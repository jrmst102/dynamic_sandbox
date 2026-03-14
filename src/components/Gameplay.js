import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  calculateDemand, resolveSales, calculateSentiment,
  getCompetitorPrice, generateDemandCurve,
  calculateEffectivePrice, calculatePromotionMultiplier,
} from '../engine';
import { colors, cardStyle } from '../styles';
import { promotions, discountLevels } from '../scenarios';
import { Button, Select } from '@jrmst102/ui-kit';

export default function Gameplay({ scenario, tickMode, onFinish, onBack }) {
  const tickInterval = tickMode ? tickMode.interval : 2000;
  const isFastMode = tickMode && tickMode.id === 'fast';
  const isDeliberateMode = tickMode && tickMode.id === 'deliberate';

  const [tick, setTick] = useState(0);
  const [price, setPrice] = useState(scenario.basePrice);
  const [inventory, setInventory] = useState(scenario.initialInventory);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSold, setTotalSold] = useState(0);
  const [history, setHistory] = useState([]);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [sentiment, setSentiment] = useState(70);

  // Competitor state (from scripted trajectory)
  const [compPrice, setCompPrice] = useState(getCompetitorPrice(scenario, 0));
  const [compRevenue, setCompRevenue] = useState(0);

  // Promotional state
  const [discountPercent, setDiscountPercent] = useState(0);
  const [activePromotion, setActivePromotion] = useState(null);
  const [activeBundle, setActiveBundle] = useState(null);
  const [totalPromotionCost, setTotalPromotionCost] = useState(0);

  // Decision-support panel
  const [showInsights, setShowInsights] = useState(!isFastMode);

  // Countdown timer
  const [countdown, setCountdown] = useState(tickInterval);
  const countdownRef = useRef(null);

  // Effective price and promotion multiplier (computed)
  const bundlePremium = activeBundle ? activeBundle.premium : 0;
  const effectivePrice = calculateEffectivePrice(scenario, price, discountPercent, bundlePremium);
  const promoMultiplier = calculatePromotionMultiplier(activePromotion, activeBundle);

  // Refs for closure-safe access in processTick
  const priceRef = useRef(price);
  const inventoryRef = useRef(inventory);
  const tickRef = useRef(tick);
  const runningRef = useRef(running);
  const discountRef = useRef(discountPercent);
  const promoBundleRef = useRef({ activePromotion, activeBundle });
  const totalRevenueRef = useRef(totalRevenue);
  const totalPromoCostRef = useRef(totalPromotionCost);

  useEffect(() => { priceRef.current = price; }, [price]);
  useEffect(() => { inventoryRef.current = inventory; }, [inventory]);
  useEffect(() => { tickRef.current = tick; }, [tick]);
  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { discountRef.current = discountPercent; }, [discountPercent]);
  useEffect(() => { promoBundleRef.current = { activePromotion, activeBundle }; }, [activePromotion, activeBundle]);
  useEffect(() => { totalRevenueRef.current = totalRevenue; }, [totalRevenue]);
  useEffect(() => { totalPromoCostRef.current = totalPromotionCost; }, [totalPromotionCost]);

  const processTick = useCallback(() => {
    if (!runningRef.current) return;

    const currentTick = tickRef.current;
    const currentPrice = priceRef.current;
    const currentInventory = inventoryRef.current;
    const currentDiscount = discountRef.current;
    const { activePromotion: curPromo, activeBundle: curBundle } = promoBundleRef.current;

    if (currentTick >= scenario.timeLimit || currentInventory <= 0) {
      setRunning(false);
      return;
    }

    // Get competitor price from scripted trajectory
    const currentCompPrice = getCompetitorPrice(scenario, currentTick);
    setCompPrice(currentCompPrice);

    // Calculate effective price and multiplier
    const bPremium = curBundle ? curBundle.premium : 0;
    const effPrice = calculateEffectivePrice(scenario, currentPrice, currentDiscount, bPremium);
    const promoMult = calculatePromotionMultiplier(curPromo, curBundle);

    // User demand & sales (competitive pressure from competitor price)
    const demand = calculateDemand(scenario, effPrice, currentTick, promoMult, currentCompPrice);
    const result = resolveSales(demand, effPrice, currentInventory);
    const sent = calculateSentiment(scenario, effPrice);

    // Competitor hypothetical revenue (for comparison — competitor faces pressure from user price)
    const compDemand = calculateDemand(scenario, currentCompPrice, currentTick, 1.0, effPrice);
    const compTickRevenue = compDemand * currentCompPrice;

    const record = {
      tick: currentTick + 1,
      revenue: result.revenue,
      sliderPrice: currentPrice,
      effectivePrice: effPrice,
      price: effPrice,
      demand,
      sold: result.sold,
      compPrice: currentCompPrice,
      compRevenue: compTickRevenue,
      discountPercent: currentDiscount,
      activePromotion: curPromo ? curPromo.name : null,
      activeBundle: curBundle ? curBundle.name : null,
      promotionMultiplier: promoMult,
      promotionCost: 0,
    };

    setHistory((prev) => [...prev, record]);
    setInventory(result.remainingInventory);
    setTotalRevenue((prev) => prev + result.revenue);
    setTotalSold((prev) => prev + result.sold);
    setSentiment(sent);
    setTick(currentTick + 1);
    setCompRevenue((prev) => prev + compTickRevenue);

    // Decrement promotion timer
    if (curPromo) {
      if (curPromo.ticksRemaining <= 1) {
        setActivePromotion(null);
      } else {
        setActivePromotion((p) => p ? { ...p, ticksRemaining: p.ticksRemaining - 1 } : null);
      }
    }

    inventoryRef.current = result.remainingInventory;
    tickRef.current = currentTick + 1;

    if (currentTick + 1 >= scenario.timeLimit || result.remainingInventory <= 0) {
      setRunning(false);
    }

    // Reset countdown
    setCountdown(tickInterval);
  }, [scenario, tickInterval]);

  // Tick timer
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(processTick, tickInterval);
    return () => clearInterval(timer);
  }, [running, processTick, tickInterval]);

  // Countdown timer (updates every second for Deliberate/Standard, not needed for Fast)
  useEffect(() => {
    if (!running || isFastMode) return;
    setCountdown(tickInterval);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [running, tick, isFastMode, tickInterval]);

  // Detect simulation end - pass history for LLM feedback
  useEffect(() => {
    if (started && !running && (tick >= scenario.timeLimit || inventory <= 0)) {
      const netRevenue = totalRevenueRef.current - totalPromoCostRef.current;
      onFinish(netRevenue, history);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, started, tick, inventory, scenario.timeLimit]);

  const handleStart = () => {
    setStarted(true);
    setRunning(true);
  };

  const handlePauseResume = () => setRunning((r) => !r);

  const handleActivatePromotion = (promo) => {
    if (activePromotion) return;
    setActivePromotion({ ...promo, ticksRemaining: promo.duration });
    setTotalPromotionCost((prev) => prev + promo.cost);
    setTotalRevenue((prev) => prev - promo.cost);
  };

  const handleToggleBundle = () => {
    if (activeBundle) {
      setActiveBundle(null);
    } else {
      setActiveBundle(scenario.availableBundle);
    }
  };

  // Demand curve data
  const demandCurveData = generateDemandCurve(scenario, tick, 50, compPrice);

  // Cumulative revenue for chart
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
  const sentimentEmoji = sentiment > 70 ? '😊' : sentiment > 45 ? '😐' : '😠';
  const sentimentColor = sentiment > 70 ? colors.success : sentiment > 45 ? colors.warning : colors.danger;
  const invPercent = (inventory / scenario.initialInventory) * 100;
  const invColor = invPercent > 50 ? colors.primary : invPercent > 20 ? colors.warning : colors.danger;

  // Decision-support calculations
  const last5 = history.slice(-5);
  const revenuesTrend = last5.map((h) => h.revenue);
  const trendDir = revenuesTrend.length >= 2
    ? (revenuesTrend[revenuesTrend.length - 1] > revenuesTrend[revenuesTrend.length - 2] ? '↑' : revenuesTrend[revenuesTrend.length - 1] < revenuesTrend[revenuesTrend.length - 2] ? '↓' : '→')
    : '→';

  // Price sensitivity hint
  const priceDelta = 5;
  const currentDemandEst = calculateDemand(scenario, effectivePrice, tick, promoMultiplier, compPrice);
  const lowerDemandEst = calculateDemand(scenario, Math.max(scenario.minPrice, effectivePrice - priceDelta), tick, promoMultiplier, compPrice);
  const demandIncrease = lowerDemandEst - currentDemandEst;

  // Demand forecast
  const nextTick = Math.min(tick + 1, scenario.timeLimit - 1);
  const forecastDemand = calculateDemand(scenario, effectivePrice, nextTick, promoMultiplier, compPrice);

  // Competitor delta
  const priceDiff = effectivePrice - compPrice;
  const priceDiffPct = compPrice > 0 ? Math.abs(priceDiff) / compPrice * 100 : 0;
  const deltaColor = priceDiff <= 0 ? colors.success : priceDiffPct <= 10 ? colors.success : priceDiffPct <= 25 ? colors.warning : colors.danger;

  // Inventory burn rate
  const rollingAvgSold = last5.length > 0 ? last5.reduce((s, h) => s + h.sold, 0) / last5.length : 0;
  const ticksUntilDepleted = rollingAvgSold > 0 ? Math.ceil(inventory / rollingAvgSold) : '∞';

  // Countdown display
  const countdownSec = Math.ceil(countdown / 1000);
  const countdownMin = Math.floor(countdownSec / 60);
  const countdownRemSec = countdownSec % 60;
  const countdownDisplay = `${String(countdownMin).padStart(2, '0')}:${String(countdownRemSec).padStart(2, '0')}`;
  const countdownProgress = tickInterval > 0 ? ((tickInterval - countdown) / tickInterval) * 100 : 0;

  return (
    <div style={{ minHeight: '100vh', background: colors.background, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px 16px 32px' }}>
        {/* Header bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <button
            onClick={onBack}
            aria-label="Back to level select"
            style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: colors.textSecondary, padding: '2px 6px' }}
          >
            ←
          </button>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 18 }}>{scenario.icon}</span>{' '}
            <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{scenario.name}</span>
            <span style={{ fontSize: 11, color: colors.textSecondary, marginLeft: 6 }}>{scenario.subtitle}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Countdown timer */}
            {started && running && (
              isFastMode ? (
                <div style={{ width: 60, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${countdownProgress}%`, height: '100%', background: countdownProgress > 80 ? colors.warning : colors.primary, borderRadius: 3, transition: 'width 0.1s' }} />
                </div>
              ) : (
                <div style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 12,
                  color: countdownSec <= Math.ceil(tickInterval / 5000) ? colors.warning : colors.textSecondary,
                  background: colors.card, padding: '4px 8px', borderRadius: 6,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                }}>
                  {countdownDisplay}
                </div>
              )
            )}
            <div style={{
              fontFamily: "'DM Mono', monospace", fontSize: 12, color: colors.textSecondary,
              background: colors.card, padding: '4px 10px', borderRadius: 6,
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
            }}>
              Tick {tick}/{scenario.timeLimit}
            </div>
          </div>
        </div>

        {/* Price Slider */}
        <div style={{ ...cardStyle, padding: 14, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Price
            </span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 700, color: colors.primary }}>
              ${price}
            </span>
          </div>
          <input
            type="range" min={scenario.minPrice} max={scenario.maxPrice} step={1} value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            aria-label="Price slider"
            style={{ width: '100%', accentColor: colors.primary }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: colors.textSecondary, marginTop: 2 }}>
            <span>${scenario.minPrice}</span>
            <span>Base: ${scenario.basePrice}</span>
            <span>${scenario.maxPrice}</span>
          </div>

          {/* Effective Price Display */}
          <div style={{
            marginTop: 10, padding: '8px 12px', background: '#f8fafc', borderRadius: 8,
            fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 600, color: colors.text, textAlign: 'center',
          }}>
            Effective Price: ${effectivePrice.toFixed(2)}
            {discountPercent === 0 && !activeBundle && (
              <span style={{ fontSize: 11, fontWeight: 400, color: colors.textSecondary, marginLeft: 6 }}>(no modifiers)</span>
            )}
          </div>
        </div>

        {/* Price Position Indicator with competitor badge */}
        <div style={{ ...cardStyle, padding: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: colors.textSecondary, marginBottom: 6 }}>Price Position</div>
          <div style={{ position: 'relative', height: 36, background: '#f1f5f9', borderRadius: 8, overflow: 'visible' }}>
            <PriceMarker value={scenario.minPrice} min={scenario.minPrice} max={scenario.maxPrice} label={`$${scenario.minPrice}`} />
            <PriceMarker value={scenario.basePrice} min={scenario.minPrice} max={scenario.maxPrice} label={`$${scenario.basePrice}`} isBase />
            <PriceMarker value={scenario.maxPrice} min={scenario.minPrice} max={scenario.maxPrice} label={`$${scenario.maxPrice}`} />
            {/* Competitor badge */}
            <div style={{
              position: 'absolute',
              left: `${((compPrice - scenario.minPrice) / (scenario.maxPrice - scenario.minPrice)) * 100}%`,
              top: '50%', transform: 'translate(-50%, -50%)',
              background: '#94a3b8', color: '#fff', padding: '2px 7px', borderRadius: 10,
              fontSize: 10, fontWeight: 600, fontFamily: "'DM Mono', monospace", whiteSpace: 'nowrap', zIndex: 1,
            }}>
              ${compPrice}
            </div>
            {/* User effective price badge */}
            <div style={{
              position: 'absolute',
              left: `${((effectivePrice - scenario.minPrice) / (scenario.maxPrice - scenario.minPrice)) * 100}%`,
              top: '50%', transform: 'translate(-50%, -50%)',
              background: colors.primary, color: '#fff', padding: '2px 8px', borderRadius: 10,
              fontSize: 10, fontWeight: 700, fontFamily: "'DM Mono', monospace", whiteSpace: 'nowrap', zIndex: 2,
            }}>
              ${effectivePrice.toFixed(0)}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 20, fontSize: 10, color: colors.textSecondary }}>
            <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: colors.primary, marginRight: 4, verticalAlign: 'middle' }} />You</span>
            <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#94a3b8', marginRight: 4, verticalAlign: 'middle' }} />Competitor</span>
          </div>
        </div>

        {/* Promotional Controls Panel */}
        <div style={{ ...cardStyle, padding: 14, marginBottom: 12 }}>
          {/* Discounts */}
          <div style={{ marginBottom: 14 }}>
            <div style={sectionLabel}>Discount</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Select
                value={String(discountPercent)}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                aria-label="Discount percentage"
                options={discountLevels.map((d) => ({
                  value: String(d),
                  label: d === 0 ? 'No discount' : `${d}% off`,
                }))}
                className="!w-auto !py-1.5 !text-sm"
              />
              {discountPercent > 0 && (
                <span style={{ fontSize: 12, color: colors.textSecondary }}>
                  Saves customer ${(price * discountPercent / 100).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Promotions */}
          <div style={{ marginBottom: 14 }}>
            <div style={sectionLabel}>Promotions</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {promotions.map((promo) => (
                <button
                  key={promo.id}
                  onClick={() => handleActivatePromotion(promo)}
                  disabled={!!activePromotion}
                  style={{
                    padding: '6px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif", cursor: activePromotion ? 'not-allowed' : 'pointer',
                    border: activePromotion && activePromotion.id === promo.id ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                    background: activePromotion && activePromotion.id === promo.id ? '#eff6ff' : colors.card,
                    color: activePromotion && activePromotion.id !== promo.id ? colors.locked : colors.text,
                    opacity: activePromotion && activePromotion.id !== promo.id ? 0.5 : 1,
                  }}
                >
                  {promo.name}
                  <div style={{ fontSize: 9, fontWeight: 400, color: colors.textSecondary, marginTop: 2 }}>
                    {((promo.demandMultiplier - 1) * 100).toFixed(0)}% boost · {promo.duration} ticks · ${promo.cost}
                  </div>
                </button>
              ))}
            </div>
            {activePromotion && (
              <div style={{ fontSize: 11, color: colors.primary, marginTop: 6, fontWeight: 600 }}>
                Active: {activePromotion.name} — {activePromotion.ticksRemaining} tick{activePromotion.ticksRemaining !== 1 ? 's' : ''} remaining
              </div>
            )}
          </div>

          {/* Bundle */}
          <div>
            <div style={sectionLabel}>Bundle</div>
            <button
              onClick={handleToggleBundle}
              style={{
                padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
                border: activeBundle ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                background: activeBundle ? '#eff6ff' : colors.card,
                fontFamily: "'DM Sans', sans-serif", textAlign: 'left', width: '100%',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13, color: colors.text }}>
                {scenario.availableBundle.name}
                {activeBundle && <span style={{ color: colors.primary, marginLeft: 8 }}>✓ Active</span>}
              </div>
              <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
                +${scenario.availableBundle.premium} premium · {((scenario.availableBundle.demandMultiplier - 1) * 100).toFixed(0)}% demand boost
              </div>
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 mb-3">
          {!started ? (
            <Button variant="primary" size="sm" onClick={handleStart}>
              ▶ Start Simulation
            </Button>
          ) : (
            <Button variant={running ? 'secondary' : 'primary'} size="sm" onClick={handlePauseResume}>
              {running ? '⏸ Pause' : '▶ Resume'}
            </Button>
          )}
          {isDeliberateMode && started && running && (
            <Button variant="primary" size="sm" onClick={processTick}>
              ⏭ Next Tick
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowInsights((s) => !s)}
            aria-label="Toggle strategy insights panel"
          >
            💡 {showInsights ? 'Hide' : 'Show'} Insights
          </Button>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <StatCard label="Your Revenue" value={`$${totalRevenue.toLocaleString()}`} />
          <StatCard label="Comp. Revenue" value={`$${compRevenue.toLocaleString()}`} muted />
          <StatCard label="Units Sold" value={`${totalSold} / ${scenario.initialInventory}`} />
          <StatCard label="Avg Price" value={avgPrice !== '—' ? `$${avgPrice}` : '—'} />
        </div>

        {/* Decision-Support Panel */}
        {showInsights && (
          <div style={{ ...cardStyle, padding: 14, marginBottom: 12, background: '#f0f9ff' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
              💡 Strategy Insights
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              {/* Elasticity Indicator */}
              <InsightItem
                label="Elasticity"
                value={scenario.elasticity >= 1.5 ? 'Very High' : scenario.elasticity >= 1.2 ? 'High' : scenario.elasticity >= 1.0 ? 'Medium' : 'Low'}
                detail={`(${scenario.elasticity}) — ${scenario.elasticity >= 1.2 ? 'Demand is highly sensitive to price changes.' : 'Demand is relatively stable.'}`}
              />
              {/* Revenue Trend */}
              <InsightItem
                label="Revenue Trend"
                value={`${trendDir} ${revenuesTrend.length > 0 ? `$${revenuesTrend[revenuesTrend.length - 1]?.toLocaleString() || 0}` : '—'}`}
                detail={`Last ${last5.length} ticks`}
              />
              {/* Price Sensitivity */}
              <InsightItem
                label="Price Sensitivity"
                value={demandIncrease > 0 ? `+${demandIncrease} units` : `${demandIncrease} units`}
                detail={`A $${priceDelta} decrease would change demand by this amount`}
              />
              {/* Demand Forecast */}
              <InsightItem
                label="Demand Forecast"
                value={`~${forecastDemand} ${scenario.unit}`}
                detail="Expected demand next tick at current price"
              />
              {/* Competitor Delta */}
              <InsightItem
                label="Competitor Delta"
                value={`$${Math.abs(priceDiff)} ${priceDiff >= 0 ? 'above' : 'below'}`}
                detail={`Your effective price vs. competitor`}
                color={deltaColor}
              />
              {/* Inventory Burn Rate */}
              <InsightItem
                label="Inventory Burn Rate"
                value={`~${ticksUntilDepleted} ticks`}
                detail="Until inventory depleted at current pace"
              />
              {/* Promotion ROI */}
              {activePromotion && (
                <InsightItem
                  label="Promotion Status"
                  value={activePromotion.name}
                  detail={`${activePromotion.ticksRemaining} ticks left · ${((activePromotion.demandMultiplier - 1) * 100).toFixed(0)}% demand boost · Cost $${totalPromotionCost}`}
                />
              )}
            </div>
          </div>
        )}

        {/* Visualizations Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12, marginBottom: 12,
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
              You: <strong style={{ color: colors.primary }}>${effectivePrice.toFixed(2)}</strong>
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
              <div style={{ fontSize: 10, fontWeight: 600, color: colors.textSecondary, marginBottom: 4 }}>Customer Sentiment</div>
              <div style={{ background: '#e2e8f0', borderRadius: 5, height: 10, overflow: 'hidden' }}>
                <div style={{ width: `${sentiment}%`, height: '100%', background: sentimentColor, borderRadius: 5, transition: 'width 0.3s, background 0.3s' }} />
              </div>
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600, color: sentimentColor, minWidth: 36, textAlign: 'right' }}>
              {Math.round(sentiment)}%
            </div>
          </div>

          {/* Inventory / Scarcity Gauge */}
          <div style={{ ...cardStyle, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: colors.textSecondary, marginBottom: 4 }}>Inventory</div>
              <div style={{ background: '#e2e8f0', borderRadius: 5, height: 10, overflow: 'hidden' }}>
                <div style={{ width: `${invPercent}%`, height: '100%', background: invColor, borderRadius: 5, transition: 'width 0.3s, background 0.3s' }} />
              </div>
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600, color: invColor, minWidth: 70, textAlign: 'right' }}>
              {inventory}/{scenario.initialInventory} {scenario.unit}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: colors.textSecondary }}>
          v1.2.0 — © 2026 by Dr. Jose Mendoza
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, muted }) {
  return (
    <div style={{ ...cardStyle, flex: '1 1 120px', textAlign: 'center', padding: '10px 8px' }}>
      <div style={{ fontSize: 9, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 700, color: muted ? '#94a3b8' : colors.text, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function InsightItem({ label, value, detail, color }) {
  return (
    <div style={{ padding: '6px 0' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700, color: color || colors.text, marginTop: 2 }}>{value}</div>
      {detail && <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>{detail}</div>}
    </div>
  );
}

function PriceMarker({ value, min, max, label, isBase }) {
  const pos = ((value - min) / (max - min)) * 100;
  return (
    <div style={{
      position: 'absolute', left: `${pos}%`, bottom: -16, transform: 'translateX(-50%)',
      fontSize: 9, color: isBase ? colors.text : colors.textSecondary,
      fontWeight: isBase ? 600 : 400, whiteSpace: 'nowrap',
    }}>
      {label}
    </div>
  );
}

const sectionLabel = {
  fontSize: 10, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase',
  letterSpacing: '0.05em', marginBottom: 6,
};

const chartTitle = {
  fontSize: 11, fontWeight: 600, color: colors.textSecondary,
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em',
};
