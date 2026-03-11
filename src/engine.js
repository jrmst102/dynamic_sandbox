/**
 * Simulation engine for the Dynamic Pricing Sandbox MVP.
 * Implements demand calculation, sales resolution, sentiment, and scoring.
 */

/**
 * Calculate the time factor for a given tick.
 * Produces a sine wave that peaks mid-scenario.
 */
export function timeFactor(tick, timeLimit) {
  return 1 + 0.3 * Math.sin((tick / timeLimit) * Math.PI);
}

/**
 * Calculate demand for a single tick.
 * demand = demandBase × (1 / priceRatio)^elasticity × timeFactor
 */
export function calculateDemand(scenario, currentPrice, tick) {
  const priceRatio = currentPrice / scenario.basePrice;
  const tf = timeFactor(tick, scenario.timeLimit);
  const raw = scenario.demandBase * Math.pow(1 / priceRatio, scenario.elasticity) * tf;
  return Math.max(0, Math.round(raw));
}

/**
 * Resolve sales for a single tick.
 * Returns { sold, revenue, remainingInventory }.
 */
export function resolveSales(demand, currentPrice, remainingInventory) {
  const sold = Math.min(demand, remainingInventory);
  const revenue = sold * currentPrice;
  return {
    sold,
    revenue,
    remainingInventory: remainingInventory - sold,
  };
}

/**
 * Calculate customer sentiment (MVP simplified formula).
 * Based on price position within scenario range.
 * sentiment = 100 - ((currentPrice - minPrice) / (maxPrice - minPrice)) × 80
 */
export function calculateSentiment(scenario, currentPrice) {
  const ratio = (currentPrice - scenario.minPrice) / (scenario.maxPrice - scenario.minPrice);
  const sentiment = 100 - ratio * 80;
  return Math.max(0, Math.min(100, sentiment));
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
export function generateDemandCurve(scenario, tick, steps = 50) {
  const points = [];
  const priceStep = (scenario.maxPrice - scenario.minPrice) / steps;
  for (let i = 0; i <= steps; i++) {
    const price = scenario.minPrice + i * priceStep;
    const demand = calculateDemand(scenario, price, tick);
    points.push({ price: Math.round(price), demand });
  }
  return points;
}
