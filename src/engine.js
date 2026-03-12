/**
 * Simulation engine for the Dynamic Pricing Sandbox.
 * Implements demand calculation, sales resolution, sentiment, and scoring.
 * v0.1.4: effectivePrice, promotionMultiplier, scripted competitor prices, simplified sentiment.
 */

/**
 * Calculate the time factor for a given tick.
 * Produces a sine wave that peaks mid-scenario.
 */
export function timeFactor(tick, timeLimit) {
  return 1 + 0.3 * Math.sin((tick / timeLimit) * Math.PI);
}

/**
 * Calculate effective price after discounts and bundles.
 * effectivePrice = (sliderPrice × (1 − discountPercent/100)) + bundlePremium
 * Clamped to scenario min/max bounds.
 */
export function calculateEffectivePrice(scenario, sliderPrice, discountPercent = 0, bundlePremium = 0) {
  const raw = sliderPrice * (1 - discountPercent / 100) + bundlePremium;
  return Math.max(scenario.minPrice, Math.min(scenario.maxPrice, Math.round(raw * 100) / 100));
}

/**
 * Calculate combined promotion multiplier from active promotion and bundle.
 */
export function calculatePromotionMultiplier(activePromotion, activeBundle) {
  const promoMult = activePromotion ? activePromotion.demandMultiplier : 1.0;
  const bundleMult = activeBundle ? activeBundle.demandMultiplier : 1.0;
  return promoMult * bundleMult;
}

/**
 * Calculate competitive pressure factor.
 * When the student's price is above the competitor, demand drops.
 * When below, demand increases. Clamped to [0.5, 1.5].
 * competitiveFactor = 1 + ((compPrice - effectivePrice) / compPrice) × 0.5
 */
export function calculateCompetitiveFactor(effectivePrice, competitorPrice) {
  if (!competitorPrice || competitorPrice <= 0) return 1.0;
  const factor = 1 + ((competitorPrice - effectivePrice) / competitorPrice) * 0.5;
  return Math.max(0.5, Math.min(1.5, factor));
}

/**
 * Calculate demand for a single tick.
 * demand = demandBase × (1 / priceRatio)^elasticity × timeFactor × promotionMultiplier × competitiveFactor
 * Where priceRatio = effectivePrice / basePrice
 */
export function calculateDemand(scenario, effectivePrice, tick, promotionMultiplier = 1.0, competitorPrice = 0) {
  const priceRatio = effectivePrice / scenario.basePrice;
  const tf = timeFactor(tick, scenario.timeLimit);
  const compFactor = calculateCompetitiveFactor(effectivePrice, competitorPrice);
  const raw = scenario.demandBase * Math.pow(1 / priceRatio, scenario.elasticity) * tf * promotionMultiplier * compFactor;
  return Math.max(0, Math.round(raw));
}

/**
 * Resolve sales for a single tick.
 * Returns { sold, revenue, remainingInventory }.
 */
export function resolveSales(demand, effectivePrice, remainingInventory) {
  const sold = Math.min(demand, remainingInventory);
  const revenue = sold * effectivePrice;
  return {
    sold,
    revenue,
    remainingInventory: remainingInventory - sold,
  };
}

/**
 * Calculate customer sentiment (simplified price-position formula).
 * sentiment = 100 − ((effectivePrice − minPrice) / (maxPrice − minPrice)) × 80
 * Clamped 0–100.
 */
export function calculateSentiment(scenario, effectivePrice) {
  const ratio = (effectivePrice - scenario.minPrice) / (scenario.maxPrice - scenario.minPrice);
  return Math.max(0, Math.min(100, 100 - ratio * 80));
}

/**
 * Get the competitor price for a given tick from pre-scripted trajectory.
 * tick is 0-indexed. Returns the price at that tick index.
 */
export function getCompetitorPrice(scenario, tick) {
  if (!scenario.competitorPrices || tick < 0 || tick >= scenario.competitorPrices.length) {
    return scenario.basePrice;
  }
  return scenario.competitorPrices[tick];
}

/**
 * Calculate pricing efficiency and letter grade.
 */
export function calculateGrade(totalRevenue, optimalRevenue) {
  const efficiency = (totalRevenue / optimalRevenue) * 100;

  let grade, passed;
  if (efficiency >= 90) {
    grade = 'A+';
    passed = true;
  } else if (efficiency >= 80) {
    grade = 'A';
    passed = true;
  } else if (efficiency >= 70) {
    grade = 'B+';
    passed = true;
  } else if (efficiency >= 60) {
    grade = 'B';
    passed = true;
  } else if (efficiency >= 45) {
    grade = 'C';
    passed = false;
  } else {
    grade = 'D';
    passed = false;
  }

  return { efficiency, grade, passed };
}

/**
 * Get contextual feedback message based on grade.
 */
export function getGradeMessage(grade) {
  switch (grade) {
    case 'A+':
      return 'Pricing genius! You maximized revenue like a pro.';
    case 'A':
      return 'Excellent work! Your pricing strategy was highly effective.';
    case 'B+':
      return 'Great job! You have a solid grasp of dynamic pricing.';
    case 'B':
      return 'Good effort! You cleared the bar — keep refining your strategy.';
    case 'C':
      return 'Not bad, but there\'s room to improve. Try adjusting your prices more dynamically.';
    case 'D':
      return 'Keep practicing! Watch how price changes affect demand and revenue.';
    default:
      return '';
  }
}

/**
 * Get color for a grade.
 */
export function getGradeColor(grade) {
  switch (grade) {
    case 'A+':
      return '#10b981';
    case 'A':
      return '#34d399';
    case 'B+':
      return '#3b82f6';
    case 'B':
      return '#60a5fa';
    case 'C':
      return '#f59e0b';
    case 'D':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}

/**
 * Generate demand curve data points for visualization.
 * Shows demand at various prices for the current time factor.
 */
export function generateDemandCurve(scenario, tick, steps = 50, competitorPrice = 0) {
  const points = [];
  const priceStep = (scenario.maxPrice - scenario.minPrice) / steps;
  for (let i = 0; i <= steps; i++) {
    const price = scenario.minPrice + i * priceStep;
    const demand = calculateDemand(scenario, price, tick, 1.0, competitorPrice);
    points.push({ price: Math.round(price), demand });
  }
  return points;
}
